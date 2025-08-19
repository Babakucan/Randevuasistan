import { createClient } from '@supabase/supabase-js'

// Yardımcı fonksiyon: İsimleri baş harfi büyük yapar
const capitalizeName = (name: string | null | undefined): string => {
  if (!name) return ''
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jsffwpsldfrtlyezeezc.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzZmZ3cHNsZGZydGx5ZXplZXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNDE3NDcsImV4cCI6MjA3MDYxNzc0N30.1r7KTob1ismyIUCDnhiyzqvIVhz7YWK8lsrw1WpDIdA'

console.log('Creating Supabase client with URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Basit auth functions
export const auth = {
  signIn: async (email: string, password: string) => {
    console.log('Attempting sign in...')
    return await supabase.auth.signInWithPassword({ email, password })
  },
  
  signUp: async (email: string, password: string, userData: any) => {
    console.log('Attempting sign up...')
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    })
  },
  
  signOut: async () => {
    return await supabase.auth.signOut()
  },

  getCurrentUser: async () => {
    return await supabase.auth.getUser()
  },

  getSession: async () => {
    return await supabase.auth.getSession()
  }
}

export const db = {
  // Salon profili
  createSalonProfile: async (userId: string, salonData: any) => {
    return await supabase
      .from('salon_profiles')
      .insert([{
        user_id: userId,
        name: salonData.salonName,
        owner_name: salonData.name,
        phone: salonData.phone,
        email: salonData.email,
        created_at: new Date().toISOString()
      }])
      .select()
  },
  
  getSalonProfile: async (userId: string) => {
    return await supabase
      .from('salon_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
  },

  // İstatistikler
  getDashboardStats: async (userId: string) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        return {
          appointmentCount: 0,
          customerCount: 0,
          whatsappCount: 0,
          phoneCount: 0
        }
      }

      // Toplam randevu sayısı
      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('salon_id', salonProfile.id)

      // Toplam müşteri sayısı
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('salon_id', salonProfile.id)

      // WhatsApp mesaj sayısı
      const { count: whatsappCount } = await supabase
        .from('whatsapp_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Telefon arama sayısı
      const { count: phoneCount } = await supabase
        .from('phone_calls')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      return {
        appointmentCount: appointmentCount || 0,
        customerCount: customerCount || 0,
        whatsappCount: whatsappCount || 0,
        phoneCount: phoneCount || 0
      }
    } catch (error) {
      console.error('Error getting dashboard stats:', error)
      return {
        appointmentCount: 0,
        customerCount: 0,
        whatsappCount: 0,
        phoneCount: 0
      }
    }
  },

  // Son aktiviteler
  getRecentActivities: async (userId: string) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        return { data: [], error: null }
      }

      // Son randevular - müşteri bilgileriyle birlikte
      const { data: recentAppointments } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          status,
          created_at,
          customer_id,
          customers(name),
          services(name),
          employees(name)
        `)
        .eq('salon_id', salonProfile.id)
        .order('created_at', { ascending: false })
        .limit(10)

      // Son müşteriler
      const { data: recentCustomers } = await supabase
        .from('customers')
        .select('id, name, created_at')
        .eq('salon_id', salonProfile.id)
        .order('created_at', { ascending: false })
        .limit(3)

      // Son çalışanlar
      const { data: recentEmployees } = await supabase
        .from('employees')
        .select('id, name, created_at')
        .eq('salon_id', salonProfile.id)
        .order('created_at', { ascending: false })
        .limit(3)

      // Aktiviteleri birleştir ve sırala
      const activities: any[] = []

      // Randevuları ekle - müşterinin kaçıncı randevusu olduğunu hesapla
      if (recentAppointments) {
        for (const appointment of recentAppointments) {
          if (appointment.customer_id) {
            // Bu müşterinin toplam randevu sayısını hesapla
            const { data: customerAppointments } = await supabase
              .from('appointments')
              .select('id')
              .eq('customer_id', appointment.customer_id)
              .eq('salon_id', salonProfile.id)
              .order('created_at', { ascending: true })

            const appointmentNumber = (customerAppointments?.findIndex((a: any) => a.id === appointment.id) ?? -1) + 1
            const totalAppointments = customerAppointments?.length || 1

            let title = ''
            if (appointmentNumber === 1) {
              title = `${capitalizeName((appointment.customers as any)?.name) || 'Müşteri'} ilk randevusunu aldı`
            } else {
              title = `${capitalizeName((appointment.customers as any)?.name) || 'Müşteri'} ${appointmentNumber}. randevusunu aldı`
            }

            activities.push({
              id: appointment.id,
              type: 'appointment',
              title: title,
              description: `${capitalizeName((appointment.services as any)?.name) || 'Hizmet'} - ${capitalizeName((appointment.employees as any)?.name) || 'Atanmamış'}`,
              date: appointment.created_at,
              status: appointment.status,
              appointmentNumber: appointmentNumber,
              totalAppointments: totalAppointments
            })
          }
        }
      }

      // Müşterileri ekle
      if (recentCustomers) {
        recentCustomers.forEach((customer: any) => {
          activities.push({
            id: customer.id,
            type: 'customer',
            title: `Yeni müşteri eklendi`,
            description: capitalizeName(customer.name),
            date: customer.created_at
          })
        })
      }

      // Çalışanları ekle
      if (recentEmployees) {
        recentEmployees.forEach((employee: any) => {
          activities.push({
            id: employee.id,
            type: 'employee',
            title: `Yeni çalışan eklendi`,
            description: capitalizeName(employee.name),
            date: employee.created_at
          })
        })
      }

      // Tarihe göre sırala (en yeni önce)
      activities.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

      return { data: activities.slice(0, 5), error: null }
    } catch (error) {
      console.error('Error getting recent activities:', error)
      return { data: [], error }
    }
  },

  // Müşteriler
  getCustomers: async (userId: string) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        return { data: [], error: null }
      }
      
      return await supabase
        .from('customers')
        .select('*')
        .eq('salon_id', salonProfile.id)
        .order('created_at', { ascending: false })
    } catch (error) {
      console.error('Error getting customers:', error)
      return { data: [], error }
    }
  },

  createCustomer: async (userId: string, customerData: any) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        throw new Error('Salon profili bulunamadı')
      }
      
      return await supabase
        .from('customers')
        .insert([{
          salon_id: salonProfile.id,
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email
        }])
        .select()
    } catch (error) {
      console.error('Error creating customer:', error)
      return { data: null, error }
    }
  },

  deleteCustomer: async (customerId: string) => {
    try {
      return await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)
        .select()
    } catch (error) {
      console.error('Error deleting customer:', error)
      return { data: null, error }
    }
  },

  getCustomerById: async (userId: string, customerId: string) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        return { data: null, error: 'Salon profili bulunamadı' }
      }
      
      return await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .eq('salon_id', salonProfile.id)
        .single()
    } catch (error) {
      console.error('Error getting customer by id:', error)
      return { data: null, error }
    }
  },

  getCustomerAppointments: async (userId: string, customerId: string) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        return { data: [], error: null }
      }
      
      return await supabase
        .from('appointments')
        .select(`
          *,
          services(name, duration, price)
        `)
        .eq('customer_id', customerId)
        .eq('salon_id', salonProfile.id)
        .order('start_time', { ascending: false })
    } catch (error) {
      console.error('Error getting customer appointments:', error)
      return { data: [], error }
    }
  },

  // Hizmetler
  getServices: async (userId: string) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        return { data: [], error: null }
      }
      
      return await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonProfile.id)
        .order('created_at', { ascending: false })
    } catch (error) {
      console.error('Error getting services:', error)
      return { data: [], error }
    }
  },

  createService: async (userId: string, serviceData: any) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        throw new Error('Salon profili bulunamadı')
      }
      
      return await supabase
        .from('services')
        .insert([{
          salon_id: salonProfile.id,
          name: serviceData.name,
          duration: serviceData.duration,
          price: serviceData.price,
          description: serviceData.description
        }])
        .select()
    } catch (error) {
      console.error('Error creating service:', error)
      return { data: null, error }
    }
  },

  // Randevular
  getAppointments: async (userId: string) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        return { data: [], error: null }
      }
      
      return await supabase
        .from('appointments')
        .select(`
          *,
          customers(name, phone),
          services(name, duration, price),
          employees(name, position)
        `)
        .eq('salon_id', salonProfile.id)
        .order('start_time', { ascending: true })
    } catch (error) {
      console.error('Error getting appointments:', error)
      return { data: [], error }
    }
  },

  createAppointment: async (userId: string, appointmentData: any) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        throw new Error('Salon profili bulunamadı')
      }
      
      return await supabase
        .from('appointments')
        .insert([{
          salon_id: salonProfile.id,
          customer_id: appointmentData.customer_id,
          service_id: appointmentData.service_id,
          employee_id: appointmentData.employee_id,
          start_time: appointmentData.appointment_date,
          end_time: appointmentData.appointment_date, // Will be calculated based on service duration
          notes: appointmentData.notes,
          status: appointmentData.status || 'scheduled'
        }])
        .select()
    } catch (error) {
      console.error('Error creating appointment:', error)
      return { data: null, error }
    }
  },

  deleteAppointment: async (appointmentId: string) => {
    try {
      return await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId)
        .select()
    } catch (error) {
      console.error('Error deleting appointment:', error)
      return { data: null, error }
    }
  },

  getAppointmentById: async (userId: string, appointmentId: string) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        return { data: null, error: 'Salon profili bulunamadı' }
      }
      
      return await supabase
        .from('appointments')
        .select(`
          *,
          customers(name, phone, email),
          services(name, duration, price)
        `)
        .eq('id', appointmentId)
        .eq('salon_id', salonProfile.id)
        .single()
    } catch (error) {
      console.error('Error getting appointment by id:', error)
      return { data: null, error }
    }
  },

  // Çalışanın belirli bir tarihteki randevularını al
  getAppointmentsByEmployeeAndDate: async (userId: string, employeeId: string, date: string) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        return { data: [], error: null }
      }
      
      return await supabase
        .from('appointments')
        .select(`
          *,
          customers(name, phone),
          services(name, duration, price)
        `)
        .eq('employee_id', employeeId)
        .eq('salon_id', salonProfile.id)
        .gte('start_time', `${date}T00:00:00`)
        .lt('start_time', `${date}T23:59:59`)
        .order('start_time', { ascending: true })
    } catch (error) {
      console.error('Error getting appointments by employee and date:', error)
      return { data: [], error }
    }
  },

  // Çalışanın tüm randevularını al
  getAppointmentsByEmployee: async (userId: string, employeeId: string) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        return { data: [], error: null }
      }
      
      return await supabase
        .from('appointments')
        .select(`
          *,
          customers(name, phone),
          services(name, duration, price)
        `)
        .eq('employee_id', employeeId)
        .eq('salon_id', salonProfile.id)
        .order('start_time', { ascending: false })
    } catch (error) {
      console.error('Error getting appointments by employee:', error)
      return { data: [], error }
    }
  },

  // WhatsApp mesajları
  getWhatsAppMessages: async (userId: string) => {
    return await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  createWhatsAppMessage: async (userId: string, messageData: any) => {
    return await supabase
      .from('whatsapp_messages')
      .insert([{
        user_id: userId,
        customer_phone: messageData.customer_phone,
        message_type: messageData.message_type,
        message_text: messageData.message_text,
        status: messageData.status || 'sent'
      }])
      .select()
  },

  // Telefon aramaları
  getPhoneCalls: async (userId: string) => {
    return await supabase
      .from('phone_calls')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  createPhoneCall: async (userId: string, callData: any) => {
    return await supabase
      .from('phone_calls')
      .insert([{
        user_id: userId,
        customer_phone: callData.customer_phone,
        call_type: callData.call_type,
        duration: callData.duration,
        status: callData.status || 'completed'
      }])
      .select()
  },



  // WhatsApp mesaj detayı
  getWhatsAppMessageById: async (userId: string, messageId: string) => {
    return await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('id', messageId)
      .eq('user_id', userId)
      .single()
  },

  // Telefon arama detayı
  getPhoneCallById: async (userId: string, callId: string) => {
    return await supabase
      .from('phone_calls')
      .select('*')
      .eq('id', callId)
      .eq('user_id', userId)
      .single()
  },

  // Konuşma geçmişi
  getCallHistory: async (userId: string) => {
    return await supabase
      .from('call_history')
      .select(`
        *,
        call_recordings(*),
        conversation_analytics(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  // Belirli bir arama için konuşma geçmişi
  getCallHistoryById: async (userId: string, callId: string) => {
    return await supabase
      .from('call_history')
      .select(`
        *,
        call_recordings(*),
        conversation_analytics(*)
      `)
      .eq('id', callId)
      .eq('user_id', userId)
      .single()
  },

  // Müşteri için konuşma geçmişi
  getCallHistoryByPhone: async (userId: string, phone: string) => {
    return await supabase
      .from('call_history')
      .select(`
        *,
        call_recordings(*),
        conversation_analytics(*)
      `)
      .eq('user_id', userId)
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false })
  },

  // Konuşma geçmişi oluştur
  createCallHistory: async (userId: string, callData: any) => {
    return await supabase
      .from('call_history')
      .insert([{
        user_id: userId,
        customer_phone: callData.customer_phone,
        call_type: callData.call_type,
        duration: callData.duration,
        status: callData.status,
        recording_url: callData.recording_url,
        transcript: callData.transcript,
        sentiment_analysis: callData.sentiment_analysis,
        key_points: callData.key_points,
        follow_up_required: callData.follow_up_required,
        follow_up_notes: callData.follow_up_notes
      }])
      .select()
  },

  // Dinleme kaydı oluştur
  createCallRecording: async (userId: string, recordingData: any) => {
    return await supabase
      .from('call_recordings')
      .insert([{
        user_id: userId,
        call_history_id: recordingData.call_history_id,
        file_name: recordingData.file_name,
        file_url: recordingData.file_url,
        file_size: recordingData.file_size,
        duration: recordingData.duration,
        format: recordingData.format,
        quality: recordingData.quality
      }])
      .select()
  },

  // Konuşma analizi oluştur
  createConversationAnalytics: async (userId: string, analyticsData: any) => {
    return await supabase
      .from('conversation_analytics')
      .insert([{
        user_id: userId,
        call_history_id: analyticsData.call_history_id,
        customer_satisfaction_score: analyticsData.customer_satisfaction_score,
        conversation_quality_score: analyticsData.conversation_quality_score,
        response_time_avg: analyticsData.response_time_avg,
        interruption_count: analyticsData.interruption_count,
        topic_detected: analyticsData.topic_detected,
        emotion_detected: analyticsData.emotion_detected,
        action_items: analyticsData.action_items
      }])
      .select()
  },

  // Çalışan oluştur
  createEmployee: async (userId: string, employeeData: any) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        throw new Error('Salon profili bulunamadı')
      }
      
      return await supabase
        .from('employees')
        .insert([{
          salon_id: salonProfile.id,
          name: employeeData.name,
          email: employeeData.email,
          phone: employeeData.phone,
          position: employeeData.position,
          specialties: employeeData.specialties,
          working_hours: employeeData.working_hours,
          leave_days: employeeData.leave_days,
          bio: employeeData.bio,
          experience_years: employeeData.experience_years,
          hourly_rate: employeeData.hourly_rate
        }])
        .select()
    } catch (error) {
      console.error('Error creating employee:', error)
      return { data: null, error }
    }
  },

  deleteEmployee: async (userId: string, employeeId: string) => {
    try {
      // Önce employee_services tablosundan ilgili kayıtları sil
      const { error: servicesError } = await supabase
        .from('employee_services')
        .delete()
        .eq('employee_id', employeeId)
      
      if (servicesError) {
        console.error('Error deleting employee services:', servicesError)
      }
      
      // Sonra çalışanı sil
      const result = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId)
        .select()
      
      console.log('Delete employee result:', result)
      return result
    } catch (error) {
      console.error('Error deleting employee:', error)
      return { data: null, error }
    }
  }
}

// Çalışanlar
export const employees = {
  getEmployees: async (userId: string) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        console.log('No salon profile found for user:', userId)
        return { data: [], error: null }
      }
      
      return await supabase
        .from('employees')
        .select('*')
        .eq('salon_id', salonProfile.id)
        .order('name', { ascending: true })
    } catch (error) {
      console.error('Error in getEmployees:', error)
      return { data: [], error }
    }
  },

  createEmployee: async (userId: string, employeeData: any) => {
    const { data: salonProfile } = await db.getSalonProfile(userId)
    return await supabase
      .from('employees')
      .insert([{
        salon_id: salonProfile?.id,
        name: employeeData.name,
        email: employeeData.email,
        phone: employeeData.phone,
        position: employeeData.position,
        specialties: employeeData.specialties,
        working_hours: employeeData.working_hours,
        leave_days: employeeData.leave_days,
        bio: employeeData.bio,
        experience_years: employeeData.experience_years,
        hourly_rate: employeeData.hourly_rate
      }])
      .select()
  },

  updateEmployee: async (userId: string, employeeId: string, employeeData: any) => {
    try {
      console.log('updateEmployee called with:', { userId, employeeId, employeeData })
      const { data: salonProfile, error: profileError } = await db.getSalonProfile(userId)
      
      if (profileError) {
        console.error('Error getting salon profile:', profileError)
        return { data: null, error: profileError }
      }
      
      if (!salonProfile) {
        console.error('No salon profile found for user:', userId)
        return { data: null, error: 'Salon profili bulunamadı' }
      }
      
      console.log('Salon profile found:', salonProfile)
      
      const result = await supabase
        .from('employees')
        .update({
          name: employeeData.name,
          email: employeeData.email,
          phone: employeeData.phone,
          position: employeeData.position,
          specialties: employeeData.specialties,
          working_hours: employeeData.working_hours,
          leave_days: employeeData.leave_days,
          bio: employeeData.bio,
          experience_years: employeeData.experience_years,
          hourly_rate: employeeData.hourly_rate
        })
        .eq('id', employeeId)
        .eq('salon_id', salonProfile?.id)
        .select()
      
      console.log('Update result:', result)
      return result
    } catch (error) {
      console.error('Error updating employee:', error)
      return { data: null, error }
    }
  },

  getEmployeeById: async (userId: string, employeeId: string) => {
    try {
      console.log('getEmployeeById called with:', { userId, employeeId })
      const { data: salonProfile, error: profileError } = await db.getSalonProfile(userId)
      
      if (profileError) {
        console.error('Error getting salon profile:', profileError)
        return { data: null, error: profileError }
      }
      
      if (!salonProfile) {
        console.error('No salon profile found for user:', userId)
        return { data: null, error: 'No salon profile found' }
      }
      
      console.log('Salon profile found:', salonProfile)
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .eq('salon_id', salonProfile?.id)
        .single()
      
      console.log('Employee query result:', { data, error })
      return { data, error }
    } catch (error) {
      console.error('Error in getEmployeeById:', error)
      return { data: null, error }
    }
  },

  // Çalışan programları
  getEmployeeSchedules: async (userId: string, employeeId: string, date?: string) => {
    const { data: salonProfile } = await db.getSalonProfile(userId)
    let query = supabase
      .from('employee_schedules')
      .select('*')
      .eq('employee_id', employeeId)
    
    if (date) {
      query = query.eq('date', date)
    }
    
    return await query.order('date', { ascending: true })
  },

  createEmployeeSchedule: async (userId: string, scheduleData: any) => {
    return await supabase
      .from('employee_schedules')
      .insert([{
        employee_id: scheduleData.employee_id,
        date: scheduleData.date,
        start_time: scheduleData.start_time,
        end_time: scheduleData.end_time,
        is_available: scheduleData.is_available,
        break_start: scheduleData.break_start,
        break_end: scheduleData.break_end,
        notes: scheduleData.notes
      }])
        .select()
  },

  // Çalışan hizmetleri
  getEmployeeServices: async (userId: string, employeeId: string) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        console.log('No salon profile found for user:', userId)
        return { data: [], error: null }
      }
      
      console.log('Getting employee services for employee:', employeeId)
      
      const { data, error } = await supabase
        .from('employee_services')
        .select(`
          *,
          services(name, description, duration, price)
        `)
        .eq('employee_id', employeeId)
      
      console.log('Employee services query result:', { data, error })
      
      if (error) {
        console.error('Error getting employee services:', error)
        return { data: [], error }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error getting employee services:', error)
      return { data: [], error }
    }
  },

  assignServiceToEmployee: async (userId: string, employeeId: string, serviceId: string, customPrice?: number) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        console.log('No salon profile found for user:', userId)
        return { data: null, error: 'Salon profili bulunamadı' }
      }
      
      console.log('Assigning service to employee:', { employeeId, serviceId, customPrice })
      
      // Yeni kayıt oluştur
      const result = await supabase
        .from('employee_services')
        .insert([{
          employee_id: employeeId,
          service_id: serviceId,
          is_available: true,
          custom_price: customPrice
        }])
        .select()
      
      console.log('Insert result:', result)
      
      if (result.error) {
        console.error('Error assigning service to employee:', result.error)
        // Tablo yoksa veya başka bir hata varsa detaylı log
        if (result.error.code === '42P01') {
          console.error('employee_services table does not exist! Please run the SQL setup.')
          return { data: null, error: 'Veritabanı tablosu bulunamadı. Lütfen SQL kurulumunu çalıştırın.' }
        }
        return { data: null, error: result.error }
      }
      
      return result
    } catch (error) {
      console.error('Error assigning service to employee:', error)
      return { data: null, error }
    }
  },

  removeServiceFromEmployee: async (userId: string, employeeId: string, serviceId: string) => {
    try {
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        console.log('No salon profile found for user:', userId)
        return { data: null, error: 'Salon profili bulunamadı' }
      }
      
      console.log('Removing service from employee:', { employeeId, serviceId })
      
      // Kaydı tamamen sil
      const result = await supabase
        .from('employee_services')
        .delete()
        .eq('employee_id', employeeId)
        .eq('service_id', serviceId)
        .select()
      
      console.log('Delete result for removal:', result)
      
      if (result.error) {
        console.error('Error removing employee service:', result.error)
        return { data: null, error: result.error }
      }
      
      return result
    } catch (error) {
      console.error('Error removing service from employee:', error)
      return { data: null, error }
    }
  },

  // Randevu oluştururken çalışan seçimi
  getAvailableEmployees: async (userId: string, serviceId: string, date: string, time: string) => {
    try {
      console.log('=== getAvailableEmployees called ===')
      console.log('Parameters:', { userId, serviceId, date, time })
      
      const { data: salonProfile } = await db.getSalonProfile(userId)
      if (!salonProfile) {
        console.log('❌ No salon profile found')
        return { data: [], error: null }
      }
      
      console.log('✅ Salon profile found:', salonProfile)
      
      // Basit test: Tüm aktif çalışanları döndür
      console.log('🔍 Simple test: returning all active employees')
      
      const { data: allEmployees, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('salon_id', salonProfile.id)
        .eq('is_active', true)
        .order('name', { ascending: true })
      
      if (employeeError) {
        console.error('❌ Error getting all employees:', employeeError)
        return { data: [], error: employeeError }
      }
      
      console.log('✅ All active employees:', allEmployees)
      return { data: allEmployees || [], error: null }
      
    } catch (error) {
      console.error('❌ Error in getAvailableEmployees:', error)
      return { data: [], error }
    }
  },

  deleteEmployee: async (userId: string, employeeId: string) => {
    try {
      // Önce employee_services tablosundan ilgili kayıtları sil
      const { error: servicesError } = await supabase
        .from('employee_services')
        .delete()
        .eq('employee_id', employeeId)
      
      if (servicesError) {
        console.error('Error deleting employee services:', servicesError)
      }
      
      // Sonra çalışanı sil
      const result = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId)
        .select()
      
      console.log('Delete employee result:', result)
      return result
    } catch (error) {
      console.error('Error deleting employee:', error)
      return { data: null, error }
    }
  }
}