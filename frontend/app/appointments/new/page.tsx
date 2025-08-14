'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, Clock, ArrowLeft, Save } from 'lucide-react'
import { auth, db, employees, supabase } from '@/lib/supabase'

export default function NewAppointmentPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    customer_id: '',
    service_id: '',
    employee_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
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
      // Load customers
      const { data: customersData } = await db.getCustomers(userId)
      setCustomers(customersData || [])

      // Load services
      const { data: servicesData } = await db.getServices(userId)
      setServices(servicesData || [])
      
      // Başlangıçta çalışanları yükleme - sadece hizmet seçildiğinde yüklenecek
      setAvailableEmployees([])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

    const handleServiceChange = async (serviceId: string) => {
    console.log('🔄 handleServiceChange called with serviceId:', serviceId)
    
    if (serviceId) {
      await handleServiceChangeWithDate(serviceId, formData.appointment_date)
    } else {
      // Hizmet seçimi temizlendiyse, çalışanları da temizle
      console.log('⚠️ Service selection cleared, clearing employees')
      setAvailableEmployees([])
    }
  }

  const handleDateTimeChange = async (newDate?: string, newTime?: string) => {
    console.log('🔄 handleDateTimeChange called with:', { newDate, newTime })
    
    setFormData(prev => ({ ...prev, employee_id: '' })) // Çalışan seçimini sıfırla
    
    // Güncel tarih ve saat değerlerini kullan
    const currentDate = newDate || formData.appointment_date
    const currentTime = newTime || formData.appointment_time
    
    console.log('📅 Current form data:', { 
      service_id: formData.service_id, 
      date: currentDate, 
      time: currentTime 
    })
    
    // Eğer hizmet seçiliyse, izin kontrolü ile çalışanları getir
    if (formData.service_id) {
      console.log('✅ Service selected, checking employees with leave days')
      await handleServiceChangeWithDate(formData.service_id, currentDate)
    } else {
      console.log('⚠️ No service selected, clearing employees')
      // Hizmet seçili değilse, çalışanları temizle
      setAvailableEmployees([])
    }
  }

  // Tarihi gün adına çeviren fonksiyon
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
        // Doğrudan tüm çalışanları getir
        console.log('🚀 Getting all employees...')
        const { data: allEmployees } = await employees.getEmployees(user.id)
        console.log('✅ All employees:', allEmployees)
        
                 // Şimdi employee_services tablosundan bu hizmeti yapabilen çalışanları kontrol et
         const { data: employeeServices } = await supabase
           .from('employee_services')
           .select('employee_id')
           .eq('service_id', serviceId)
         
         console.log('✅ Employee services for this service:', employeeServices)
         console.log('🔍 Service ID being searched:', serviceId)
         
         // Tüm employee_services kayıtlarını kontrol et
         const { data: allEmployeeServices } = await supabase.from('employee_services').select('*')
         console.log('🔍 All employee_services records:', allEmployeeServices)
        
        let filteredEmployees = []
        
                 // Hizmet filtreleme - sadece bu hizmeti yapabilen çalışanları göster
         if (employeeServices && employeeServices.length > 0) {
           const serviceEmployeeIds = employeeServices.map((item: any) => item.employee_id)
           filteredEmployees = allEmployees?.filter((emp: any) => 
             serviceEmployeeIds.includes(emp.id) && emp.is_active !== false
           ) || []
           console.log('✅ Filtered by service assignment:', filteredEmployees)
         } else {
           // Bu hizmet için hiç çalışan atanmamış
           filteredEmployees = []
           console.log('❌ No employees assigned to this service')
         }
         
         // Şimdi izin günlerini kontrol et
         const checkDate = appointmentDate || formData.appointment_date
         if (checkDate && filteredEmployees.length > 0) {
           console.log('🔍 Checking leave days for date:', checkDate)
           
           // Tarihi gün adına çevir
           const dayName = getDayNameFromDate(checkDate)
           console.log('📅 Converted date to day name:', dayName)
           
           const employeesWithoutLeave = filteredEmployees.filter((employee: any) => {
             const leaveDays = employee.leave_days || []
             console.log(`📋 Employee ${employee.name} leave_days:`, leaveDays)
             
             // İzin günlerinde değilse true döndür
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
      // Check if salon profile exists, create if not
      let { data: salonProfile } = await db.getSalonProfile(user.id)
      
      if (!salonProfile) {
        // Create default salon profile
        const { data: newProfile } = await db.createSalonProfile(user.id, {
          salonName: 'Güzellik Salonu',
          name: user.email?.split('@')[0] || 'Salon Sahibi',
          phone: '+90 555 000 0000',
          email: user.email || 'salon@example.com'
        })
        salonProfile = newProfile?.[0]
      }

      const appointmentDateTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`)
      
      const result = await db.createAppointment(user.id, {
        customer_id: formData.customer_id,
        service_id: formData.service_id,
        employee_id: formData.employee_id,
        appointment_date: appointmentDateTime.toISOString(),
        notes: formData.notes
      })

      if (result.data) {
        alert('Randevu başarıyla oluşturuldu!')
        router.push('/appointments')
      } else {
        alert('Randevu oluşturulurken hata oluştu.')
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('Randevu oluşturulurken hata oluştu.')
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
              <h1 className="text-2xl font-bold text-gray-900">Yeni Randevu</h1>
              <p className="text-gray-600">Yeni randevu oluşturun</p>
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
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Randevu Oluştur
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
