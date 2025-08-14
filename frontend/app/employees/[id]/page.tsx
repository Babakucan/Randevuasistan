'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Users, Mail, Phone, Briefcase, Clock, Calendar, Star } from 'lucide-react'
import { auth, employees } from '@/lib/supabase'

export default function EmployeeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState<any>(null)
  const [updatingLeaveDay, setUpdatingLeaveDay] = useState<string | null>(null)
  const [updatingTime, setUpdatingTime] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user && employeeId) {
      console.log('useEffect triggered:', { user: user?.id, employeeId })
      loadEmployee()
    }
  }, [user, employeeId])

  const checkUser = async () => {
    try {
      console.log('Checking user authentication...')
      const { data: { user } } = await auth.getCurrentUser()
      
      if (!user) {
        console.log('No user found, redirecting to login')
        router.push('/login')
        return
      }
      
      console.log('User authenticated:', user.id)
      setUser(user)
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    }
  }

  const loadEmployee = async () => {
    try {
      console.log('Loading employee with ID:', employeeId)
      console.log('User ID:', user.id)
      
      const { data, error } = await employees.getEmployeeById(user.id, employeeId)
      
      console.log('API Response:', { data, error })
      
      if (error) {
        console.error('Error loading employee:', error)
        setLoading(false)
        return
      }
      
      if (data) {
        console.log('Employee data loaded:', data)
        console.log('Working hours before:', data.working_hours)
        
        // Çalışma saatleri yoksa varsayılan değerler oluştur
        if (!data.working_hours || Object.keys(data.working_hours).length === 0) {
          console.log('Creating default working hours')
          data.working_hours = {
            monday: { available: true, start: '09:00', end: '18:00' },
            tuesday: { available: true, start: '09:00', end: '18:00' },
            wednesday: { available: true, start: '09:00', end: '18:00' },
            thursday: { available: true, start: '09:00', end: '18:00' },
            friday: { available: true, start: '09:00', end: '18:00' },
            saturday: { available: true, start: '09:00', end: '16:00' },
            sunday: { available: false, start: '09:00', end: '18:00' }
          }
        }
        
        console.log('Working hours after:', data.working_hours)
        
        // İzin günleri yoksa boş array oluştur
        if (!data.leave_days) {
          data.leave_days = []
        }
        
        console.log('Final employee data:', data)
        setEmployee(data)
        setLoading(false)
      } else {
        console.log('No employee data found')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error loading employee:', error)
      setLoading(false)
    }
  }

  const getDayName = (day: string) => {
    const days: { [key: string]: string } = {
      monday: 'Pazartesi',
      tuesday: 'Salı',
      wednesday: 'Çarşamba',
      thursday: 'Perşembe',
      friday: 'Cuma',
      saturday: 'Cumartesi',
      sunday: 'Pazar'
    }
    return days[day] || day
  }

  const getDayOrder = (day: string) => {
    const order: { [key: string]: number } = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 7
    }
    return order[day] || 0
  }

  const getNextOccurrence = (dayName: string) => {
    const dayMap: { [key: string]: number } = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 0
    }
    
    const today = new Date()
    const currentDay = today.getDay()
    const targetDay = dayMap[dayName]
    
    let daysUntilTarget = targetDay - currentDay
    if (daysUntilTarget < 0) {
      daysUntilTarget += 7
    }
    
    const nextDate = new Date(today)
    nextDate.setDate(today.getDate() + daysUntilTarget)
    
    return nextDate.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleTimeChange = async (day: string, field: 'start' | 'end', value: string) => {
    if (!user || !employee) {
      console.log('Missing user or employee:', { user: !!user, employee: !!employee })
      return
    }
    
    const timeKey = `${day}-${field}`
    if (updatingTime === timeKey) {
      console.log('Already updating this time field, ignoring change')
      return
    }
    
    console.log('Updating time:', { day, field, value })
    setUpdatingTime(timeKey)
    
    // Çalışma saatleri yoksa varsayılan değerler oluştur
    if (!employee.working_hours || Object.keys(employee.working_hours).length === 0) {
      console.log('Creating default working hours for time change')
      employee.working_hours = {
        monday: { available: true, start: '09:00', end: '18:00' },
        tuesday: { available: true, start: '09:00', end: '18:00' },
        wednesday: { available: true, start: '09:00', end: '18:00' },
        thursday: { available: true, start: '09:00', end: '18:00' },
        friday: { available: true, start: '09:00', end: '18:00' },
        saturday: { available: true, start: '09:00', end: '16:00' },
        sunday: { available: false, start: '09:00', end: '18:00' }
      }
    }
    
    // Önce local state'i güncelle (anında görünüm için)
    const updatedWorkingHours = {
      ...employee.working_hours,
      [day]: {
        ...employee.working_hours[day],
        [field]: value
      }
    }
    
    console.log('Updated working hours:', updatedWorkingHours)
    
    // Local state'i hemen güncelle
    setEmployee({
      ...employee,
      working_hours: updatedWorkingHours
    })
    
    try {
      console.log('Calling updateEmployee...')
      const result = await employees.updateEmployee(user.id, employee.id, {
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        specialties: employee.specialties || [],
        working_hours: updatedWorkingHours,
        leave_days: employee.leave_days || [],
        bio: employee.bio,
        experience_years: employee.experience_years,
        hourly_rate: employee.hourly_rate
      })

      console.log('Update result:', result)

             if (result.data && result.data.length > 0) {
         console.log('Time updated successfully:', result.data[0])
         // Server'dan gelen güncel veriyi set et
         setEmployee(result.data[0])
       } else {
         console.error('Failed to update time:', result.error)
         // Hata durumunda eski veriyi geri yükle
         setEmployee(employee)
       }
         } catch (error) {
       console.error('Error updating time:', error)
       // Hata durumunda eski veriyi geri yükle
       setEmployee(employee)
     } finally {
       setUpdatingTime(null)
     }
  }

  const handleLeaveDayToggle = async (day: string) => {
    if (!user || !employee) {
      console.log('Missing user or employee in handleLeaveDayToggle')
      return
    }
    
    if (updatingLeaveDay === day) {
      console.log('Already updating this day, ignoring click')
      return
    }
    
    console.log('handleLeaveDayToggle called for day:', day)
    console.log('Current employee:', employee)
    
    setUpdatingLeaveDay(day)
    
    const currentLeaveDays = employee.leave_days || []
    const isCurrentlyOnLeave = currentLeaveDays.includes(day)
    
    let updatedLeaveDays
    if (isCurrentlyOnLeave) {
      updatedLeaveDays = currentLeaveDays.filter((date: string) => date !== day)
    } else {
      updatedLeaveDays = [...currentLeaveDays, day]
    }
    
    console.log('Updated leave days:', updatedLeaveDays)
    
    // Önce local state'i güncelle (anında görünüm için)
    const updatedEmployee = {
      ...employee,
      leave_days: updatedLeaveDays
    }
    
    setEmployee(updatedEmployee)
    
    try {
      console.log('Calling updateEmployee for leave days...')
      const result = await employees.updateEmployee(user.id, employee.id, {
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        specialties: employee.specialties || [],
        working_hours: employee.working_hours,
        leave_days: updatedLeaveDays,
        bio: employee.bio,
        experience_years: employee.experience_years,
        hourly_rate: employee.hourly_rate
      })

      console.log('Leave update result:', result)

      if (result.data && result.data.length > 0) {
        console.log('Employee updated successfully:', result.data[0])
        // Server'dan gelen güncel veriyi set et
        setEmployee(result.data[0])
      } else {
        console.error('Failed to update employee:', result.error)
        // Hata durumunda eski veriyi geri yükle
        setEmployee(employee)
      }
    } catch (error) {
      console.error('Error updating leave day:', error)
      // Hata durumunda eski veriyi geri yükle
      setEmployee(employee)
    } finally {
      setUpdatingLeaveDay(null)
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
              onClick={() => router.push('/employees')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
              <p className="text-gray-600">{employee.position}</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/employees/${employee.id}/edit`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Edit size={16} />
            Düzenle
          </button>
        </div>

                 

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users size={20} />
                Temel Bilgiler
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">E-posta</p>
                    <p className="font-semibold text-gray-800">{employee.email || 'Belirtilmemiş'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Phone size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Telefon</p>
                    <p className="font-semibold text-gray-800">{employee.phone || 'Belirtilmemiş'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Briefcase size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pozisyon</p>
                    <p className="font-semibold text-gray-800">{employee.position || 'Belirtilmemiş'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star size={20} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Deneyim</p>
                    <p className="font-semibold text-gray-800">{employee.experience_years || 0} yıl</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Clock size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Saatlik Ücret</p>
                    <p className="font-semibold text-gray-800">{employee.hourly_rate || 0} TL</p>
                  </div>
                </div>
              </div>

              {employee.bio && (
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-2">Hakkında</p>
                  <p className="text-gray-900">{employee.bio}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock size={20} />
                Çalışma Günleri
              </h2>
              
                             <div className="space-y-4">
                 {employee.working_hours && Object.keys(employee.working_hours).length > 0 ? (
                   Object.entries(employee.working_hours)
                     .sort(([a], [b]) => getDayOrder(a) - getDayOrder(b))
                     .map(([day, hours]: [string, any]) => {
                       const isOnLeave = (employee.leave_days || []).includes(day)
                       
                       return (
                         <div key={day} className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                           isOnLeave 
                             ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                             : hours.available 
                               ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                               : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                         }`}>
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                               <div className={`w-3 h-3 rounded-full ${
                                 isOnLeave ? 'bg-red-500' : hours.available ? 'bg-green-500' : 'bg-gray-400'
                               }`}></div>
                               <span className="font-semibold text-gray-800 min-w-[100px]">{getDayName(day)}</span>
                             </div>
                             
                                                           <div className="flex items-center gap-4">
                                {hours.available ? (
                                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500 font-medium">Başlangıç</span>
                                                                             <input
                                         type="time"
                                         value={hours.start || '09:00'}
                                         onChange={(e) => {
                                           e.preventDefault()
                                           e.stopPropagation()
                                           console.log('Start time changed:', e.target.value)
                                           handleTimeChange(day, 'start', e.target.value)
                                         }}
                                         onKeyDown={(e) => {
                                           if (e.key === 'Enter') {
                                             e.preventDefault()
                                             e.stopPropagation()
                                           }
                                         }}
                                         onBlur={(e) => {
                                           e.preventDefault()
                                           e.stopPropagation()
                                         }}
                                         disabled={updatingTime === `${day}-start`}
                                         className={`text-sm border-0 bg-transparent focus:ring-0 text-gray-800 font-medium ${
                                           updatingTime === `${day}-start` ? 'opacity-50 cursor-not-allowed' : ''
                                         }`}
                                       />
                                    </div>
                                    <div className="w-px h-4 bg-gray-300"></div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500 font-medium">Bitiş</span>
                                                                             <input
                                         type="time"
                                         value={hours.end || '18:00'}
                                         onChange={(e) => {
                                           e.preventDefault()
                                           e.stopPropagation()
                                           console.log('End time changed:', e.target.value)
                                           handleTimeChange(day, 'end', e.target.value)
                                         }}
                                         onKeyDown={(e) => {
                                           if (e.key === 'Enter') {
                                             e.preventDefault()
                                             e.stopPropagation()
                                           }
                                         }}
                                         onBlur={(e) => {
                                           e.preventDefault()
                                           e.stopPropagation()
                                         }}
                                         disabled={updatingTime === `${day}-end`}
                                         className={`text-sm border-0 bg-transparent focus:ring-0 text-gray-800 font-medium ${
                                           updatingTime === `${day}-end` ? 'opacity-50 cursor-not-allowed' : ''
                                         }`}
                                       />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                                    <span className="text-sm text-gray-500 font-medium">Kapalı</span>
                                  </div>
                                )}
                                
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    e.nativeEvent.stopImmediatePropagation()
                                    console.log('Toggle button clicked for day:', day)
                                    handleLeaveDayToggle(day)
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      handleLeaveDayToggle(day)
                                    }
                                  }}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                                    isOnLeave ? 'bg-blue-600' : 'bg-gray-300'
                                  } ${updatingLeaveDay === day ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ${
                                      isOnLeave ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </div>
                                                                 {(updatingLeaveDay === day || updatingTime?.startsWith(day)) && (
                                   <div className="flex items-center gap-1">
                                     <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                     <span className="text-xs text-gray-500">Güncelleniyor...</span>
                                   </div>
                                 )}
                              </div>
                           </div>
                         </div>
                       )
                     })
                 ) : (
                   <div className="text-center py-8">
                     <p className="text-gray-500">Çalışma saatleri yükleniyor...</p>
                     <p className="text-sm text-gray-400 mt-2">Debug: {JSON.stringify(employee.working_hours)}</p>
                   </div>
                 )}
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} />
                İzin Günleri
              </h2>
              
                             {(employee.leave_days && employee.leave_days.length > 0) ? (
                 <div className="space-y-3">
                   {employee.leave_days.map((day: string, index: number) => (
                     <div key={index} className="flex items-center justify-between p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                       <div className="flex items-center gap-3">
                         <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                         <div>
                           <p className="text-sm font-medium text-red-800">{getDayName(day)}</p>
                           <p className="text-xs text-red-600">{getNextOccurrence(day)}</p>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                  <Calendar size={40} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">Henüz izin günü belirtilmemiş</p>
                </div>
              )}
            </div>

            {employee.specialties && employee.specialties.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Uzmanlık Alanları</h2>
                <div className="flex flex-wrap gap-2">
                  {employee.specialties.map((specialty: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
