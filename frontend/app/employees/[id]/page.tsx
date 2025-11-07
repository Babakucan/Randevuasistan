'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Users, Mail, Phone, Briefcase, Clock, Calendar, Star } from 'lucide-react'
import { authApi, employeesApi, getToken, removeToken } from '@/lib/api'

export default function EmployeeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState<any>(null)
  const [updatingLeaveDay, setUpdatingLeaveDay] = useState<string | null>(null)
  const [updatingTime, setUpdatingTime] = useState<string | null>(null)
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  const normalizeNumber = (value: unknown): number | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined
    }

    const numericValue = Number(value)
    return Number.isNaN(numericValue) ? undefined : numericValue
  }

  const loadTeamMembers = async () => {
    try {
      const employeesList = await employeesApi.getAll()
      if (employeesList && Array.isArray(employeesList)) {
        const filtered = employeesList
          .filter((emp: any) => emp.id !== employeeId)
          .sort((a: any, b: any) => a.name.localeCompare(b.name))
          .slice(0, 6)
        setTeamMembers(filtered)
      }
    } catch (error) {
      console.error('Error loading team members:', error)
      setTeamMembers([])
    }
  }

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user && employeeId) {
      console.log('useEffect triggered:', { user: user?.id, employeeId })
      loadEmployee()
      loadTeamMembers()
    }
  }, [user, employeeId])

  const checkUser = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push('/login');
        setLoading(false);
        return;
      }

      const user = await authApi.getCurrentUser();
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth error:', error);
      removeToken();
      router.push('/login');
      setLoading(false);
    }
  }

  const loadEmployee = async () => {
    try {
      const employeeData = await employeesApi.getById(employeeId);
      
      if (employeeData) {
        // Çalışma saatleri yoksa varsayılan değerler oluştur
        if (!employeeData.workingHours || Object.keys(employeeData.workingHours).length === 0) {
          employeeData.workingHours = {
            monday: { available: true, start: '09:00', end: '18:00' },
            tuesday: { available: true, start: '09:00', end: '18:00' },
            wednesday: { available: true, start: '09:00', end: '18:00' },
            thursday: { available: true, start: '09:00', end: '18:00' },
            friday: { available: true, start: '09:00', end: '18:00' },
            saturday: { available: true, start: '09:00', end: '16:00' },
            sunday: { available: true, start: '10:00', end: '16:00' }
          };
        }
        
        // Alan adları uyumluluğu için normalize et
        const normalizedEmployee = {
          ...employeeData,
          workingHours: employeeData.workingHours || employeeData.working_hours || {},
          leaveDays: employeeData.leaveDays || employeeData.leave_days || [],
          experienceYears: employeeData.experienceYears || employeeData.experience_years,
          hourlyRate: employeeData.hourlyRate || employeeData.hourly_rate,
          appointments: employeeData.appointments || []
        };
        
        // İzin günleri yoksa boş array oluştur
        if (!normalizedEmployee.leaveDays || !Array.isArray(normalizedEmployee.leaveDays)) {
          normalizedEmployee.leaveDays = [];
        }
        
        setEmployee(normalizedEmployee);
        setNotes(normalizedEmployee.bio || '');

        const now = new Date();
        const upcoming = (normalizedEmployee.appointments || [])
          .map((appointment: any) => ({
            ...appointment,
            startTime: appointment.startTime || appointment.start_time,
            endTime: appointment.endTime || appointment.end_time,
          }))
          .filter((appointment: any) => {
            if (!appointment.startTime) return false
            return new Date(appointment.startTime) >= now
          })
          .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          .slice(0, 5)

        setUpcomingAppointments(upcoming)
      }
    } catch (error) {
      console.error('Error loading employee:', error);
      router.push('/employees');
    } finally {
      setLoading(false);
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

  const getShortDayLabel = (date: Date) => {
    const labels = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
    return labels[date.getDay()] || ''
  }

  const formatAppointmentDate = (isoDate: string) => {
    const date = new Date(isoDate)
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatAppointmentTimeRange = (start?: string, end?: string) => {
    if (!start || !end) return 'Saat bilgisi yok'
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return 'Saat bilgisi yok'
    }
    return `${startDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
  }

  const generateSchedulePreview = (daysCount = 14) => {
    if (!employee) return []

    const workingHours = employee.workingHours || employee.working_hours || {}
    const leaveDays = (Array.isArray(employee.leaveDays) ? employee.leaveDays : (Array.isArray(employee.leave_days) ? employee.leave_days : [])).map((d: string) => d.toLowerCase())

    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return Array.from({ length: daysCount }, (_, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() + index)
      const dayKey = dayKeys[date.getDay()]
      const dayConfig = workingHours[dayKey] || { available: false, start: '09:00', end: '18:00' }
      const isLeave = leaveDays.includes(dayKey)
      const isWorking = dayConfig.available && !isLeave

      return {
        date,
        dayKey,
        isLeave,
        isWorking,
        start: dayConfig.start,
        end: dayConfig.end
      }
    })
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
    const currentWorkingHours = employee.workingHours || employee.working_hours || {}
    let workingHoursToUpdate = { ...currentWorkingHours }
    
    // Eğer workingHours boşsa veya gün yoksa varsayılan değerler oluştur
    if (!workingHoursToUpdate || Object.keys(workingHoursToUpdate).length === 0) {
      console.log('Creating default working hours for time change')
      workingHoursToUpdate = {
        monday: { available: true, start: '09:00', end: '18:00' },
        tuesday: { available: true, start: '09:00', end: '18:00' },
        wednesday: { available: true, start: '09:00', end: '18:00' },
        thursday: { available: true, start: '09:00', end: '18:00' },
        friday: { available: true, start: '09:00', end: '18:00' },
        saturday: { available: true, start: '09:00', end: '16:00' },
        sunday: { available: false, start: '09:00', end: '18:00' }
      }
    }
    
    // Gün adının doğru formatta olduğundan emin ol (lowercase İngilizce)
    const normalizedDay = day.toLowerCase()
    
    // Önce local state'i güncelle (anında görünüm için)
    const updatedWorkingHours = {
      ...workingHoursToUpdate,
      [normalizedDay]: {
        ...(workingHoursToUpdate[normalizedDay] || { available: true, start: '09:00', end: '18:00' }),
        [field]: value
      }
    }
    
    console.log('Updated working hours:', updatedWorkingHours)
    
    // Local state'i hemen güncelle
    setEmployee({
      ...employee,
      workingHours: updatedWorkingHours
    })
    
    try {
      console.log('Calling updateEmployee...')
      const currentLeaveDays = Array.isArray(employee.leaveDays) 
        ? employee.leaveDays 
        : (Array.isArray(employee.leave_days) ? employee.leave_days : [])
      
      const result = await employeesApi.update(employee.id, {
        name: employee.name,
        email: employee.email || undefined,
        phone: employee.phone || undefined,
        position: employee.position || undefined,
        specialties: Array.isArray(employee.specialties) ? employee.specialties : (employee.specialties ? [employee.specialties] : []),
        workingHours: updatedWorkingHours,
        leaveDays: currentLeaveDays,
        bio: employee.bio || undefined,
        experienceYears: normalizeNumber(employee.experienceYears ?? employee.experience_years),
        hourlyRate: normalizeNumber(employee.hourlyRate ?? employee.hourly_rate)
      })

      console.log('Update result:', result)

      if (result) {
        console.log('Time updated successfully')
        // Güncel veriyi tekrar yükle
        await loadEmployee();
      } else {
        console.error('Failed to update time')
        // Hata durumunda eski veriyi geri yükle
        await loadEmployee();
      }
    } catch (error: any) {
      console.error('Error updating time:', error)
      // Daha detaylı hata mesajı göster
      let errorMessage = 'Çalışma saati güncellenirken hata oluştu.'
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.errors && Array.isArray(error.errors)) {
        const validationErrors = error.errors.map((err: any) => 
          `${err.path?.join('.') || 'field'}: ${err.message}`
        ).join(', ')
        errorMessage = `Validation error: ${validationErrors}`
      }
      alert(errorMessage)
      // Hata durumunda eski veriyi geri yükle
      await loadEmployee();
    } finally {
      setUpdatingTime(null)
    }
  }

  const handleLeaveDayToggle = async (day: string) => {
    if (!user || !employee) {
      return
    }
    if (updatingLeaveDay === day) {
      return
    }

    setUpdatingLeaveDay(day)

    const normalizedDay = day.toLowerCase()
    const currentWorkingHours = employee.workingHours || employee.working_hours || {}
    const dayConfig = currentWorkingHours[normalizedDay] || { available: true, start: '09:00', end: '18:00' }
    const willBeAvailable = !dayConfig.available

    const updatedWorkingHours = {
      ...currentWorkingHours,
      [normalizedDay]: {
        ...dayConfig,
        available: willBeAvailable
      }
    }

    const currentLeaveDays = Array.isArray(employee.leaveDays)
      ? employee.leaveDays
      : (Array.isArray(employee.leave_days) ? employee.leave_days : [])

    const filteredLeaveDays = currentLeaveDays.filter((date: string) => date.toLowerCase() !== normalizedDay)
    const updatedLeaveDays = willBeAvailable ? filteredLeaveDays : [...filteredLeaveDays, normalizedDay]

    const updatedEmployee = {
      ...employee,
      workingHours: updatedWorkingHours,
      leaveDays: updatedLeaveDays
    }

    setEmployee(updatedEmployee)

    try {
      console.log('Updating employee payload:', {
        workingHours: updatedWorkingHours,
        leaveDays: updatedLeaveDays
      })
      await employeesApi.update(employee.id, {
        name: employee.name,
        email: employee.email || undefined,
        phone: employee.phone || undefined,
        position: employee.position || undefined,
        specialties: Array.isArray(employee.specialties) ? employee.specialties : (employee.specialties ? [employee.specialties] : []),
        workingHours: updatedWorkingHours,
        leaveDays: updatedLeaveDays,
        bio: employee.bio || undefined,
        experienceYears: normalizeNumber(employee.experienceYears ?? employee.experience_years),
        hourlyRate: normalizeNumber(employee.hourlyRate ?? employee.hourly_rate)
      })
      await loadEmployee()
    } catch (error: any) {
      let errorMessage = 'Çalışma günü güncellenirken hata oluştu.'
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.errors && Array.isArray(error.errors)) {
        const validationErrors = error.errors.map((err: any) => `${err.path?.join('.') || 'field'}: ${err.message}`).join(', ')
        errorMessage = `Validation error: ${validationErrors}`
      }
      alert(errorMessage)
      await loadEmployee()
    } finally {
      setUpdatingLeaveDay(null)
    }
  }

  const handleNotesSave = async () => {
    if (!user || !employee) return
    setSavingNotes(true)

    try {
      await employeesApi.update(employee.id, {
        bio: notes || null
      })
      await loadEmployee()
    } catch (error: any) {
      const message = error?.message || 'Notlar kaydedilirken bir hata oluştu.'
      alert(message)
    } finally {
      setSavingNotes(false)
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

  const schedulePreview = generateSchedulePreview()

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

            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock size={20} />
                Çalışma Günleri
              </h2>
              
                             <div className="space-y-4">
                 {employee.workingHours && Object.keys(employee.workingHours).length > 0 ? (
                   Object.entries(employee.workingHours)
                     .sort(([a], [b]) => getDayOrder(a) - getDayOrder(b))
                     .map(([day, hours]: [string, any]) => {
                       const currentLeaveDays = Array.isArray(employee.leaveDays) 
                         ? employee.leaveDays 
                         : (Array.isArray(employee.leave_days) ? employee.leave_days : [])
                       // Gün adını normalize et ve kontrol et
                       const normalizedDay = day.toLowerCase()
                       const normalizedLeaveDays = currentLeaveDays.map((d: string) => d.toLowerCase())
                       const isOnLeave = normalizedLeaveDays.includes(normalizedDay)
                       
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
                     <p className="text-sm text-gray-400 mt-2">Debug: {JSON.stringify(employee.workingHours)}</p>
                   </div>
                 )}
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Yaklaşan Randevular
              </h2>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment: any) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {appointment.customer?.name || 'Müşteri bilgisi yok'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.service?.name || 'Hizmet bilgisi yok'}
                          </p>
                          <span className={`mt-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' : appointment.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}>
                            {appointment.status || 'beklemede'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600">
                            {formatAppointmentDate(appointment.startTime)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatAppointmentTimeRange(appointment.startTime, appointment.endTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-600 font-medium">Önümüzdeki 30 günde planlanmış randevu bulunmuyor.</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Önümüzdeki 14 Gün</h2>
              <div className="grid grid-cols-7 gap-2">
                {schedulePreview.map((dayInfo, index) => (
                  <div
                    key={index}
                    className={`rounded-xl p-3 text-center border transition-all ${
                      dayInfo.isWorking
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : dayInfo.isLeave
                          ? 'border-red-200 bg-red-50 text-red-600'
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1">{getShortDayLabel(dayInfo.date)}</p>
                    <p className="text-sm font-semibold">
                      {dayInfo.date.getDate().toString().padStart(2, '0')}
                    </p>
                    <p className="text-[10px] mt-1">
                      {dayInfo.isWorking
                        ? `${dayInfo.start || '??'} - ${dayInfo.end || '??'}`
                        : dayInfo.isLeave
                          ? 'İzinli'
                          : 'Kapalı'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">İç Notlar</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Takım içi notları buraya kaydedin..."
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleNotesSave}
                  disabled={savingNotes}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center gap-2 text-sm"
                >
                  {savingNotes ? 'Kaydediliyor...' : 'Notları Kaydet'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} />
                İzin Günleri
              </h2>
              {employee.leaveDays && employee.leaveDays.length > 0 ? (
                <div className="space-y-3">
                  {employee.leaveDays.map((day: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-red-700">{getDayName(day)}</p>
                        <p className="text-xs text-red-500">{getNextOccurrence(day)}</p>
                      </div>
                      <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">İzinli</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
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

            {teamMembers.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Takım Arkadaşları</h2>
                <div className="space-y-3">
                  {teamMembers.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.position || 'Pozisyon belirtilmemiş'}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${member.isActive === false || member.is_active === false ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                        {member.isActive === false || member.is_active === false ? 'Pasif' : 'Aktif'}
                      </span>
                    </div>
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
