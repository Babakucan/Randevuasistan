'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Calendar, Users, MessageCircle, Phone, LogOut, User, ArrowLeft, Edit, Trash2, Mail, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { auth, db } from '@/lib/supabase'

export default function AppointmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id as string
  
  const [user, setUser] = useState<any>(null)
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [appointmentId])

  const checkUser = async () => {
    try {
      const { data: sessionData } = await auth.getSession()
      
      if (sessionData.session) {
        setUser(sessionData.session.user)
        await loadAppointmentData(sessionData.session.user.id)
      } else {
        const { user: currentUser } = await auth.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          await loadAppointmentData(currentUser.id)
        } else {
          router.push('/login')
          return
        }
      }
    } catch (err) {
      console.error('Auth check error:', err)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  const loadAppointmentData = async (userId: string) => {
    try {
      const { data: appointmentData, error: appointmentError } = await db.getAppointmentById(userId, appointmentId)

      if (appointmentError) {
        console.error('Error loading appointment:', appointmentError)
        router.push('/appointments')
        return
      }

      setAppointment(appointmentData)
    } catch (error) {
      console.error('Error loading appointment data:', error)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Planlandı'
      case 'completed':
        return 'Tamamlandı'
      case 'cancelled':
        return 'İptal Edildi'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
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

  if (!appointment) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)' }}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-600">Randevu bulunamadı</p>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/appointments')}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Randevulara Dön</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Randevu Detayı</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>{user?.email}</span>
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
        {/* Appointment Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {appointment.services?.name}
                </h1>
                <div className="flex items-center space-x-6 mt-2">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{appointment.services?.duration} dakika</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <span className="text-lg font-semibold text-green-600">
                      {formatCurrency(appointment.services?.price || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/appointments/${appointmentId}/edit`)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Düzenle</span>
              </button>
              <button
                onClick={() => router.push(`/customers/${appointment.customer_id}`)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Müşteri Detayı</span>
              </button>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span>Müşteri Bilgileri</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{appointment.customers?.name}</p>
                  <p className="text-sm text-gray-600">{appointment.customers?.phone}</p>
                </div>
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{appointment.customers?.phone || 'Telefon yok'}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{appointment.customers?.email || 'E-posta yok'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Randevu Detayları</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Durum:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  <span className="ml-2">{getStatusText(appointment.status)}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tarih:</span>
                <span className="font-medium">
                  {new Date(appointment.appointment_date).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Saat:</span>
                <span className="font-medium">
                  {new Date(appointment.appointment_date).toLocaleTimeString('tr-TR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Süre:</span>
                <span className="font-medium">{appointment.services?.duration} dakika</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Fiyat:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(appointment.services?.price || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {appointment.notes && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Notlar</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{appointment.notes}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">İşlemler</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push(`/appointments/${appointmentId}/edit`)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Randevuyu Düzenle</span>
            </button>
            <button
              onClick={() => router.push(`/customers/${appointment.customer_id}`)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Müşteri Profilini Görüntüle</span>
            </button>
            <button
              onClick={() => router.push(`/appointments/new?customer=${appointment.customer_id}`)}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Yeni Randevu Oluştur</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
