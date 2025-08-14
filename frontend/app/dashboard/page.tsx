'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, MessageCircle, Phone, LogOut, User } from 'lucide-react'
import { auth, db, employees } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [salonProfile, setSalonProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    appointmentCount: 0,
    customerCount: 0,
    whatsappCount: 0,
    phoneCount: 0,
    employeeCount: 0
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      console.log('Checking user authentication...')
      
      // Önce session kontrolü yap
      const { data: sessionData, error: sessionError } = await auth.getSession()
      console.log('Session check:', { sessionData, sessionError })
      
      if (sessionData.session) {
        console.log('Session found, user:', sessionData.session.user)
        setUser(sessionData.session.user)
        
        // İstatistikleri yükle
        await loadStats(sessionData.session.user.id)
        
        // Get salon profile or create if not exists
        try {
          let { data: profile, error: profileError } = await db.getSalonProfile(sessionData.session.user.id)
          console.log('Profile check:', { profile, profileError })
          
          if (!profile) {
            // Create default salon profile
            const { data: newProfile } = await db.createSalonProfile(sessionData.session.user.id, {
              salonName: 'Güzellik Salonu',
              name: sessionData.session.user.email?.split('@')[0] || 'Salon Sahibi',
              phone: '+90 555 000 0000',
              email: sessionData.session.user.email || 'salon@example.com'
            })
            profile = newProfile?.[0]
            console.log('Created new profile:', profile)
          }
          
          setSalonProfile(profile)
        } catch (profileErr) {
          console.log('Profile error (ignoring):', profileErr)
        }
      } else {
        // Session yoksa current user kontrolü yap
        const { data: { user: currentUser }, error: userError } = await auth.getCurrentUser()
        console.log('Current user check:', { currentUser, userError })
        
        if (currentUser) {
          setUser(currentUser)
          
          // İstatistikleri yükle
          await loadStats(currentUser.id)
          
          // Get salon profile or create if not exists
          try {
            let { data: profile, error: profileError } = await db.getSalonProfile(currentUser.id)
            console.log('Profile check:', { profile, profileError })
            
            if (!profile) {
              // Create default salon profile
              const { data: newProfile } = await db.createSalonProfile(currentUser.id, {
                salonName: 'Güzellik Salonu',
                name: currentUser.email?.split('@')[0] || 'Salon Sahibi',
                phone: '+90 555 000 0000',
                email: currentUser.email || 'salon@example.com'
              })
              profile = newProfile?.[0]
              console.log('Created new profile:', profile)
            }
            
            setSalonProfile(profile)
          } catch (profileErr) {
            console.log('Profile error (ignoring):', profileErr)
          }
        } else {
          console.log('No user found, redirecting to login')
          router.push('/login')
          return
        }
      }
    } catch (err) {
      console.error('Auth check error:', err)
      // Hata durumunda hemen login'e yönlendirme, biraz bekle
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async (userId: string) => {
    try {
      console.log('Loading stats for user:', userId)
      const statsData = await db.getDashboardStats(userId)
      console.log('Stats loaded:', statsData)
      
      // Çalışan sayısını da yükle
      try {
        const { data: employeesData } = await employees.getEmployees(userId)
        const employeeCount = employeesData?.length || 0
        
        setStats({
          ...statsData,
          employeeCount
        })
      } catch (employeeError) {
        console.error('Error loading employees:', employeeError)
        setStats({
          ...statsData,
          employeeCount: 0
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      router.push('/')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)' }}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Randevuasistan</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>{salonProfile?.name || user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hoş Geldiniz! 🎉
          </h1>
          <p className="text-gray-600">
            {salonProfile?.name ? `${salonProfile.name} salonunuzun yönetim paneline hoş geldiniz.` : 'Dashboard\'unuza hoş geldiniz.'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Kullanıcı ID: {user?.id}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <button 
            onClick={() => router.push('/appointments')}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-transparent hover:border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Randevu</p>
                <p className="text-2xl font-bold text-gray-900">{stats.appointmentCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => router.push('/customers')}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-transparent hover:border-green-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Müşteri</p>
                <p className="text-2xl font-bold text-gray-900">{stats.customerCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => router.push('/whatsapp')}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-transparent hover:border-green-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">WhatsApp Mesajları</p>
                <p className="text-2xl font-bold text-gray-900">{stats.whatsappCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => router.push('/employees')}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-transparent hover:border-purple-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Çalışanlar</p>
                <p className="text-2xl font-bold text-gray-900">{stats.employeeCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => router.push('/phone-calls')}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-transparent hover:border-purple-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Telefon Aramaları</p>
                <p className="text-2xl font-bold text-gray-900">{stats.phoneCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/appointments/new')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Yeni Randevu Oluştur
              </button>
              <button 
                onClick={() => router.push('/customers/new')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Müşteri Ekle
              </button>
              <button 
                onClick={() => router.push('/services/new')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Hizmet Ekle
              </button>
              <button 
                onClick={() => router.push('/employees/new')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Çalışan Ekle
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                Henüz aktivite bulunmuyor.
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistem Durumu</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Asistan</span>
                <span className="text-sm text-green-600 font-medium">Aktif</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">WhatsApp</span>
                <span className="text-sm text-yellow-600 font-medium">Kurulacak</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Telefon</span>
                <span className="text-sm text-yellow-600 font-medium">Kurulacak</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}