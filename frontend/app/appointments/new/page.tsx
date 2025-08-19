'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, Clock, ArrowLeft, Save, User } from 'lucide-react'
import { auth, db, employees, supabase } from '@/lib/supabase'
import { capitalizeName } from '@/lib/utils'

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
    notes: '',
    status: 'scheduled'
  })
  
  // Available data
  const [customers, setCustomers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([])
  
  // Customer search
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  // Dropdown dışına tıklandığında kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCustomerDropdown) {
        setShowCustomerDropdown(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showCustomerDropdown])

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

  // Müşteri arama fonksiyonları
  const filteredCustomers = customers.filter(customer =>
    capitalizeName(customer.name).toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phone?.includes(customerSearchTerm) ||
    customer.email?.toLowerCase().includes(customerSearchTerm.toLowerCase())
  )

  const handleCustomerSelect = (customer: any) => {
    setFormData(prev => ({ ...prev, customer_id: customer.id }))
    setCustomerSearchTerm(capitalizeName(customer.name))
    setSelectedCustomer(customer)
    setShowCustomerDropdown(false)
  }

  const handleCustomerSearchChange = (value: string) => {
    setCustomerSearchTerm(value)
    setShowCustomerDropdown(true)
    
    // Eğer arama temizlendiyse, seçimi de temizle
    if (!value) {
      setFormData(prev => ({ ...prev, customer_id: '' }))
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
        notes: formData.notes,
        status: formData.status
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/appointments')}
              className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Yeni Randevu</h1>
                <p className="text-white/80">Randevu bilgilerini girin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Müşteri
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Müşteri ara veya seçin..."
                  value={customerSearchTerm}
                  onChange={(e) => handleCustomerSearchChange(e.target.value)}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                
                {/* Search Icon */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Dropdown */}
                {showCustomerDropdown && customerSearchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">
                        Müşteri bulunamadı
                      </div>
                    ) : (
                      filteredCustomers.map((customer: any) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => handleCustomerSelect(customer)}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">
                            {capitalizeName(customer.name)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.phone} {customer.email && `• ${customer.email}`}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              {/* Alternative: Dropdown for quick selection */}
              <div className="mt-2">
                <select
                  value={formData.customer_id}
                  onChange={(e) => {
                    const selectedCustomer = customers.find(c => c.id === e.target.value)
                    if (selectedCustomer) {
                      handleCustomerSelect(selectedCustomer)
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Veya listeden seçin</option>
                  {customers.map((customer: any) => (
                    <option key={customer.id} value={customer.id}>
                      {capitalizeName(customer.name)} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Customer Info */}
              {selectedCustomer && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Seçili Müşteri Bilgileri</span>
                  </div>
                  <div className="space-y-1 text-sm text-blue-700">
                    <div><strong>Ad:</strong> {capitalizeName(selectedCustomer.name)}</div>
                    {selectedCustomer.phone && <div><strong>Telefon:</strong> {selectedCustomer.phone}</div>}
                    {selectedCustomer.email && <div><strong>E-posta:</strong> {selectedCustomer.email}</div>}
                    {selectedCustomer.notes && <div><strong>Notlar:</strong> {selectedCustomer.notes}</div>}
                  </div>
                </div>
              )}
            </div>

                        {/* Service Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Hizmet
              </label>
              <div className="relative">
                <select
                  value={formData.service_id}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm appearance-none"
                  required
                >
                  <option value="">Hizmet seçin</option>
                  {services.map((service: any) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.duration} dk - {service.price} TL
                    </option>
                  ))}
                </select>
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Tarih
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => {
                      const newDate = e.target.value
                      setFormData(prev => ({ ...prev, appointment_date: newDate }))
                      handleDateTimeChange(newDate, formData.appointment_time)
                    }}
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    required
                  />
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Saat
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => {
                      const newTime = e.target.value
                      setFormData(prev => ({ ...prev, appointment_time: newTime }))
                      handleDateTimeChange(formData.appointment_date, newTime)
                    }}
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    required
                  />
                  <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Employee Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Çalışan
              </label>
              <div className="relative">
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm appearance-none"
                  required
                >
                  <option value="">Çalışan seçin</option>
                  {availableEmployees.map((employee: any) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.position || 'Pozisyon belirtilmemiş'}
                    </option>
                  ))}
                </select>
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {availableEmployees.length === 0 && formData.service_id && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">
                    ⚠️ Bu hizmet için uygun çalışan bulunamadı. Çalışan düzenleme sayfasından hizmet ataması yapın.
                  </p>
                </div>
              )}
              {!formData.service_id && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-600 font-medium">
                    ℹ️ Önce bir hizmet seçin
                  </p>
                </div>
              )}
              {formData.service_id && availableEmployees.length > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">
                    ✅ {availableEmployees.length} çalışan bulundu
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Notlar
              </label>
              <div className="relative">
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
                  placeholder="Randevu ile ilgili notlar..."
                />
                <svg className="absolute left-4 top-4 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/appointments')}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Save size={18} />
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
