'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Calendar, Users, Clock, ArrowLeft, Save } from 'lucide-react'
import { auth, db, employees, supabase } from '@/lib/supabase'

export default function EditAppointmentPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id as string
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [appointment, setAppointment] = useState<any>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    customer_id: '',
    service_id: '',
    employee_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
    status: 'scheduled'
  })
  
  // Available data
  const [customers, setCustomers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await auth.getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      await loadData(user.id)
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadData = async (userId: string) => {
    try {
      // Load appointment
      const { data: appointmentData } = await db.getAppointmentById(userId, appointmentId)
      if (appointmentData) {
        setAppointment(appointmentData)
        const appointmentDate = new Date(appointmentData.start_time)
        setFormData({
          customer_id: appointmentData.customer_id,
          service_id: appointmentData.service_id,
          employee_id: appointmentData.employee_id,
          appointment_date: appointmentDate.toISOString().split('T')[0],
          appointment_time: appointmentDate.toTimeString().slice(0, 5),
          notes: appointmentData.notes || '',
          status: appointmentData.status || 'scheduled'
        })
      }

      // Load customers
      const { data: customersData } = await db.getCustomers(userId)
      setCustomers(customersData || [])

      // Load services
      const { data: servicesData } = await db.getServices(userId)
      setServices(servicesData || [])
      
      // Load employees for the selected service
      if (appointmentData?.service_id) {
        await handleServiceChangeWithDate(appointmentData.service_id, appointmentDate.toISOString().split('T')[0])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleServiceChange = async (serviceId: string) => {
    console.log('🔄 handleServiceChange called with serviceId:', serviceId)
    
    if (serviceId) {
      await handleServiceChangeWithDate(serviceId, formData.appointment_date)
    } else {
      console.log('⚠️ Service selection cleared, clearing employees')
      setAvailableEmployees([])
    }
  }

  const handleDateTimeChange = async (newDate?: string, newTime?: string) => {
    console.log('🔄 handleDateTimeChange called with:', { newDate, newTime })
    
    setFormData(prev => ({ ...prev, employee_id: '' }))
    
    const currentDate = newDate || formData.appointment_date
    const currentTime = newTime || formData.appointment_time
    
    console.log('📅 Current form data:', { 
      service_id: formData.service_id, 
      date: currentDate, 
      time: currentTime 
    })
    
    if (formData.service_id) {
      console.log('✅ Service selected, checking employees with leave days')
      await handleServiceChangeWithDate(formData.service_id, currentDate)
    } else {
      console.log('⚠️ No service selected, clearing employees')
      setAvailableEmployees([])
    }
  }

  const getDayNameFromDate = (dateString: string): string => {
    const date = new Date(dateString)
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return dayNames[date.getDay()]
  }

  const handleServiceChangeWithDate = async (serviceId: string, appointmentDate?: string) => {
    console.log('🔄 handleServiceChangeWithDate called with serviceId:', serviceId, 'date:', appointmentDate)
    
    setFormData(prev => ({ ...prev, service_id: serviceId, employee_id: '' }))
    
    if (serviceId) {
      try {
        console.log('🚀 Getting all employees...')
        const { data: allEmployees } = await employees.getEmployees(user.id)
        console.log('✅ All employees:', allEmployees)
        
        const { data: employeeServices } = await supabase
          .from('employee_services')
          .select('employee_id')
          .eq('service_id', serviceId)
        
        console.log('✅ Employee services for this service:', employeeServices)
        
        let filteredEmployees = []
        
        if (employeeServices && employeeServices.length > 0) {
          const serviceEmployeeIds = employeeServices.map((item: any) => item.employee_id)
          filteredEmployees = allEmployees?.filter((emp: any) => 
            serviceEmployeeIds.includes(emp.id) && emp.is_active !== false
          ) || []
          console.log('✅ Filtered by service assignment:', filteredEmployees)
        } else {
          filteredEmployees = []
          console.log('❌ No employees assigned to this service')
        }
        
        const checkDate = appointmentDate || formData.appointment_date
        if (checkDate && filteredEmployees.length > 0) {
          console.log('🔍 Checking leave days for date:', checkDate)
          
          const dayName = getDayNameFromDate(checkDate)
          console.log('📅 Converted date to day name:', dayName)
          
          const employeesWithoutLeave = filteredEmployees.filter((employee: any) => {
            const leaveDays = employee.leave_days || []
            console.log(`📋 Employee ${employee.name} leave_days:`, leaveDays)
            
            return !leaveDays.includes(dayName)
          })
          
          console.log('✅ Employees without leave:', employeesWithoutLeave)
          setAvailableEmployees(employeesWithoutLeave)
        } else {
          console.log('⚠️ No date selected or no filtered employees, showing all filtered employees')
          setAvailableEmployees(filteredEmployees)
        }
      } catch (error) {
        console.error('❌ Error loading employees:', error)
        setAvailableEmployees([])
      }
    } else {
      console.log('⚠️ No service selected')
      setAvailableEmployees([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      const appointmentDateTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`)
      
              const result = await supabase
          .from('appointments')
          .update({
            customer_id: formData.customer_id,
            service_id: formData.service_id,
            employee_id: formData.employee_id,
            start_time: appointmentDateTime.toISOString(),
            notes: formData.notes,
            status: formData.status
          })
          .eq('id', appointmentId)
          .select()

      if (result.data) {
        alert('Randevu başarıyla güncellendi!')
        router.push('/appointments')
      } else {
        alert('Randevu güncellenirken hata oluştu.')
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      alert('Randevu güncellenirken hata oluştu.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Randevu Bulunamadı</h1>
          <p className="text-gray-600 mb-4">Aradığınız randevu bulunamadı veya erişim izniniz yok.</p>
          <button
            onClick={() => router.push('/appointments')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Randevulara Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/appointments')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Randevu Düzenle</h1>
              <p className="text-gray-600">Randevu bilgilerini güncelleyin</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Müşteri
              </label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Müşteri seçin</option>
                {customers.map((customer: any) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hizmet
              </label>
              <select
                value={formData.service_id}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Hizmet seçin</option>
                {services.map((service: any) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.duration} dk - {service.price} TL
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarih
                </label>
                <input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => {
                    const newDate = e.target.value
                    setFormData(prev => ({ ...prev, appointment_date: newDate }))
                    handleDateTimeChange(newDate, formData.appointment_time)
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saat
                </label>
                <input
                  type="time"
                  value={formData.appointment_time}
                  onChange={(e) => {
                    const newTime = e.target.value
                    setFormData(prev => ({ ...prev, appointment_time: newTime }))
                    handleDateTimeChange(formData.appointment_date, newTime)
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çalışan
              </label>
              <select
                value={formData.employee_id}
                onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Çalışan seçin</option>
                {availableEmployees.map((employee: any) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.position || 'Pozisyon belirtilmemiş'}
                  </option>
                ))}
              </select>
              {availableEmployees.length === 0 && formData.service_id && (
                <p className="text-sm text-red-600 mt-1">
                  Bu hizmet için uygun çalışan bulunamadı. Çalışan düzenleme sayfasından hizmet ataması yapın.
                </p>
              )}
              {!formData.service_id && (
                <p className="text-sm text-gray-500 mt-1">
                  Önce bir hizmet seçin
                </p>
              )}
              {formData.service_id && availableEmployees.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {availableEmployees.length} çalışan bulundu
                </p>
              )}
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="scheduled">Planlandı</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
              <div className="mt-2 flex gap-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  formData.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  Planlandı
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  formData.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  Tamamlandı
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  formData.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  İptal Edildi
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notlar
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Randevu ile ilgili notlar..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/appointments')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Randevu Güncelle
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
