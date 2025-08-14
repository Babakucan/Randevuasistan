'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Users, Mail, Phone, Briefcase, Clock, Star, Wrench } from 'lucide-react'
import { auth, employees, db } from '@/lib/supabase'

export default function EmployeeEditPage() {
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [employee, setEmployee] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [employeeServices, setEmployeeServices] = useState<string[]>([])
  const [updatingService, setUpdatingService] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user && employeeId) {
      loadEmployee()
      loadServices()
    }
  }, [user, employeeId])

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
    }
  }

  const loadEmployee = async () => {
    try {
      const { data, error } = await employees.getEmployeeById(user.id, employeeId)
      
      if (error) {
        console.error('Error loading employee:', error)
        setLoading(false)
        return
      }
      
      if (data) {
        setEmployee(data)
        // Çalışanın mevcut hizmetlerini yükle
        await loadEmployeeServices(data.id)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading employee:', error)
      setLoading(false)
    }
  }

  const loadServices = async () => {
    try {
      const { data, error } = await db.getServices(user.id)
      
      if (error) {
        console.error('Error loading services:', error)
        return
      }
      
      if (data) {
        setServices(data)
      }
    } catch (error) {
      console.error('Error loading services:', error)
    }
  }

  const loadEmployeeServices = async (empId: string) => {
    try {
      console.log('Loading employee services for employee:', empId)
      const { data, error } = await employees.getEmployeeServices(user.id, empId)
      
      if (error) {
        console.error('Error loading employee services:', error)
        setEmployeeServices([])
        return
      }
      
      console.log('Employee services data:', data)
      
      if (data && data.length > 0) {
        // Tüm mevcut hizmetleri al (artık hepsi is_available: true)
        const serviceIds = data.map((item: any) => item.service_id)
        console.log('Assigned service IDs:', serviceIds)
        setEmployeeServices(serviceIds)
      } else {
        console.log('No employee services found')
        setEmployeeServices([])
      }
    } catch (error) {
      console.error('Error loading employee services:', error)
      setEmployeeServices([])
    }
  }

  const handleServiceToggle = async (serviceId: string) => {
    if (!user || !employee) return
    
    if (updatingService === serviceId) return
    
    setUpdatingService(serviceId)
    
    const isCurrentlyAssigned = employeeServices.includes(serviceId)
    
    try {
      if (isCurrentlyAssigned) {
        // Hizmeti kaldır
        const result = await employees.removeServiceFromEmployee(user.id, employee.id, serviceId)
        if (result.error) {
          console.error('Error removing service:', result.error)
          const errorMessage = typeof result.error === 'string' 
            ? result.error 
            : (result.error as any)?.message || (result.error as any)?.details || 'Bilinmeyen hata'
          alert(`Hizmet kaldırılırken hata oluştu: ${errorMessage}`)
          return
        }
        console.log('Service removed successfully:', result.data)
      } else {
        // Hizmeti ekle
        const result = await employees.assignServiceToEmployee(user.id, employee.id, serviceId)
        if (result.error) {
          console.error('Error assigning service:', result.error)
          const errorMessage = typeof result.error === 'string' 
            ? result.error 
            : (result.error as any)?.message || (result.error as any)?.details || 'Bilinmeyen hata'
          alert(`Hizmet eklenirken hata oluştu: ${errorMessage}`)
          return
        }
        console.log('Service assigned successfully:', result.data)
      }
      
      // İşlem tamamlandıktan sonra hizmetleri tekrar yükle
      await loadEmployeeServices(employee.id)
      
    } catch (error) {
      console.error('Error toggling service:', error)
      alert('Hizmet güncellenirken hata oluştu')
    } finally {
      setUpdatingService(null)
    }
  }

  const handleSave = async () => {
    if (!user || !employee) return
    
    setSaving(true)
    
    try {
      const result = await employees.updateEmployee(user.id, employee.id, {
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        specialties: employee.specialties || [],
        working_hours: employee.working_hours,
        leave_days: employee.leave_days,
        bio: employee.bio,
        experience_years: employee.experience_years,
        hourly_rate: employee.hourly_rate
      })

      if (result.data) {
        // Çalışan güncellendikten sonra hizmetleri tekrar yükle
        await loadEmployeeServices(employee.id)
        alert('Çalışan başarıyla güncellendi!')
        router.push(`/employees/${employee.id}`)
      } else {
        alert('Güncelleme sırasında hata oluştu!')
      }
    } catch (error) {
      console.error('Error updating employee:', error)
      alert('Güncelleme sırasında hata oluştu!')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Çalışan bulunamadı</p>
          <button
            onClick={() => router.push('/employees')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Geri Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/employees/${employee.id}`)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Çalışan Düzenle</h1>
              <p className="text-gray-600">{employee.name}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save size={16} />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temel Bilgiler */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users size={20} />
                Temel Bilgiler
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={employee.name || ''}
                    onChange={(e) => setEmployee({...employee, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={employee.email || ''}
                    onChange={(e) => setEmployee({...employee, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={employee.phone || ''}
                    onChange={(e) => setEmployee({...employee, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pozisyon
                  </label>
                  <input
                    type="text"
                    value={employee.position || ''}
                    onChange={(e) => setEmployee({...employee, position: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deneyim (Yıl)
                  </label>
                  <input
                    type="number"
                    value={employee.experience_years || 0}
                    onChange={(e) => setEmployee({...employee, experience_years: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saatlik Ücret (TL)
                  </label>
                  <input
                    type="number"
                    value={employee.hourly_rate || 0}
                    onChange={(e) => setEmployee({...employee, hourly_rate: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hakkında
                  </label>
                  <textarea
                    value={employee.bio || ''}
                    onChange={(e) => setEmployee({...employee, bio: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Çalışan hakkında bilgi..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hizmetler */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wrench size={20} />
                Hizmetler
              </h2>
              
              {services.length > 0 ? (
                <div className="space-y-3">
                  {services.map((service) => {
                    const isAssigned = employeeServices.includes(service.id)
                    const isUpdating = updatingService === service.id
                    
                    return (
                      <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 transition-all duration-200 hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            isAssigned ? 'bg-blue-500' : 'bg-gray-400'
                          }`}></div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{service.name}</p>
                            <p className="text-sm text-gray-600">{service.duration} dk - {service.price} TL</p>
                            {service.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{service.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleServiceToggle(service.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleServiceToggle(service.id)
                              }
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                              isAssigned ? 'bg-blue-600' : 'bg-gray-300'
                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ${
                                isAssigned ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </div>
                          
                          {isUpdating && (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-xs text-gray-500">Güncelleniyor...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                  <Wrench size={40} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">Henüz hizmet bulunmuyor</p>
                  <p className="text-sm text-gray-500 mt-1">Hizmetler sayfasından hizmet ekleyebilirsiniz</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
