'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, ArrowLeft, Save, Calendar, Check } from 'lucide-react'
import { auth, db, employees } from '@/lib/supabase'
import { capitalizeName } from '@/lib/utils'

export default function NewEmployeePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [services, setServices] = useState<any[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    specialties: '',
    hourly_rate: '',
    bio: '',
    experience_years: ''
  })

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadServices()
    }
  }, [user])

  const checkUser = async () => {
    try {
      const { data: { user } } = await auth.getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadServices = async () => {
    try {
      if (!user) return
      const { data: salonProfile } = await db.getSalonProfile(user.id)
      if (salonProfile) {
        const { data: servicesData } = await db.getServices(user.id)
        setServices(servicesData || [])
      }
    } catch (error) {
      console.error('Error loading services:', error)
    }
  }

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const capitalizedValue = capitalizeName(value);
    setFormData(prev => ({ ...prev, name: capitalizedValue }));
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const capitalizedValue = capitalizeName(value);
    setFormData(prev => ({ ...prev, position: capitalizedValue }));
  };

  const handleSpecialtiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const capitalizedValue = capitalizeName(value);
    setFormData(prev => ({ ...prev, specialties: capitalizedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      // Get salon profile or create if not exists
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
        
        if (!salonProfile) {
          alert('Salon profili oluşturulamadı.')
          return
        }
      }

      const result = await db.createEmployee(user.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
        working_hours: {
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '18:00' },
          friday: { start: '09:00', end: '18:00' },
          saturday: { start: '09:00', end: '17:00' },
          sunday: { start: '', end: '' }
        },
        bio: formData.bio,
        experience_years: parseInt(formData.experience_years) || 0,
        hourly_rate: parseFloat(formData.hourly_rate) || 0
      })

      // Seçilen hizmetleri çalışana ata
      if (result.data && selectedServices.length > 0) {
        const employeeId = result.data[0].id
        for (const serviceId of selectedServices) {
          await employees.assignServiceToEmployee(user.id, employeeId, serviceId)
        }
      }

      if (result.data) {
        alert('Çalışan başarıyla oluşturuldu!')
        router.push('/employees')
      } else {
        alert('Çalışan oluşturulurken hata oluştu.')
      }
    } catch (error) {
      console.error('Error creating employee:', error)
      alert('Çalışan oluşturulurken hata oluştu.')
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
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/employees')}
              className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Yeni Çalışan</h1>
                <p className="text-white/80">Çalışan bilgilerini girin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Ad Soyad
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="Çalışan adı ve soyadı"
                    required
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  E-posta
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="calisan@salon.com"
                    required
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Telefon
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="+90 555 123 4567"
                    required
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Pozisyon
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.position}
                    onChange={handlePositionChange}
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="Örn: Kuaför, Manikürcü"
                    required
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Uzmanlık Alanları
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.specialties}
                    onChange={handleSpecialtiesChange}
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="Saç kesimi, saç boyama, manikür (virgülle ayırın)"
                    required
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Saatlik Ücret (TL)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="100"
                    min="0"
                    step="0.01"
                    required
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Deneyim (Yıl)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="5"
                    min="0"
                    required
                  />
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Hakkında
              </label>
              <div className="relative">
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
                  placeholder="Çalışan hakkında kısa bilgi..."
                />
                <svg className="absolute left-4 top-4 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>

            {/* Services */}
            {services.length > 0 && (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Hizmetler
                </label>
                <div className="max-h-64 overflow-y-auto border-2 border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm shadow-inner">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => handleServiceToggle(service.id)}
                        className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                          selectedServices.includes(service.id)
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25'
                            : 'bg-white/80 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 border-2 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {/* Background Pattern */}
                        <div className={`absolute inset-0 opacity-5 ${
                          selectedServices.includes(service.id) ? 'bg-white' : 'bg-blue-500'
                        }`} style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}></div>
                        
                        {/* Content */}
                        <div className="relative p-4">
                          {/* Checkbox */}
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 mb-3 ${
                            selectedServices.includes(service.id)
                              ? 'border-white bg-white/20 scale-110'
                              : 'border-gray-300 group-hover:border-blue-400'
                          }`}>
                            {selectedServices.includes(service.id) && (
                              <Check size={14} className="text-blue-600 font-bold" />
                            )}
                          </div>
                          
                          {/* Service Info */}
                          <div className="space-y-1">
                            <div className={`font-bold text-sm ${
                              selectedServices.includes(service.id) ? 'text-white' : 'text-gray-900'
                            }`}>
                              {service.name}
                            </div>
                            <div className={`text-xs font-semibold ${
                              selectedServices.includes(service.id) ? 'text-blue-100' : 'text-blue-600'
                            }`}>
                              {service.price} TL
                            </div>
                          </div>
                          
                          {/* Hover Effect */}
                          <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                            selectedServices.includes(service.id)
                              ? 'bg-gradient-to-br from-blue-600/20 to-blue-700/20'
                              : 'bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:to-blue-600/10'
                          }`}></div>
                          
                          {/* Selection Indicator */}
                          {selectedServices.includes(service.id) && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                              <Check size={10} className="text-blue-600 font-bold" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Selection Summary */}
                {selectedServices.length > 0 && (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 shadow-xl">
                    <div className="absolute inset-0 bg-white/10"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <Check size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">
                            {selectedServices.length} Hizmet Seçildi
                          </p>
                          <p className="text-blue-100 text-sm">
                            Çalışan bu hizmetleri sunabilecek
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-2xl">
                          {selectedServices.length}
                        </div>
                        <div className="text-blue-100 text-xs">
                          Hizmet
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}



            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/employees')}
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
                    Çalışan Oluştur
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
