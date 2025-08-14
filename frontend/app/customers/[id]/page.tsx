'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Calendar, Users, MessageCircle, Phone, LogOut, User, ArrowLeft, Edit, Trash2, Mail, Clock, MapPin } from 'lucide-react'
import { auth, db } from '@/lib/supabase'

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string
  
  const [user, setUser] = useState<any>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [customerId])

  const checkUser = async () => {
    try {
      const { data: sessionData } = await auth.getSession()
      
      if (sessionData.session) {
        setUser(sessionData.session.user)
        await loadCustomerData(sessionData.session.user.id)
      } else {
        const { user: currentUser } = await auth.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          await loadCustomerData(currentUser.id)
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

  const loadCustomerData = async (userId: string) => {
    try {
      // Müşteri bilgilerini yükle
      const { data: customerData, error: customerError } = await db.getCustomerById(userId, customerId)

      if (customerError) {
        console.error('Error loading customer:', customerError)
        router.push('/customers')
        return
      }

      setCustomer(customerData)

      // Müşterinin randevularını yükle
      const { data: appointmentsData, error: appointmentsError } = await db.getCustomerAppointments(userId, customerId)

      if (appointmentsError) {
        console.error('Error loading appointments:', appointmentsError)
      } else {
        setAppointments(appointmentsData || [])
      }
    } catch (error) {
      console.error('Error loading customer data:', error)
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)' }}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-600">Müşteri bulunamadı</p>
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
                onClick={() => router.push('/customers')}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Müşterilere Dön</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Müşteri Detayı</span>
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
        {/* Customer Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                <div className="flex items-center space-x-6 mt-2">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone || 'Telefon yok'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{customer.email || 'E-posta yok'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Kayıt: {new Date(customer.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/customers/${customerId}/edit`)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Düzenle</span>
              </button>
              <button
                onClick={() => router.push(`/appointments/new?customer=${customerId}`)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Yeni Randevu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Randevu</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Harcama</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(appointments.reduce((total, a) => total + (a.services?.price || 0), 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">₺</span>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Randevu Geçmişi</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hizmet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih & Saat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Henüz randevu bulunmuyor.
                    </td>
                  </tr>
                ) : (
                                     appointments.map((appointment) => (
                     <tr 
                       key={appointment.id} 
                       className="hover:bg-gray-50 cursor-pointer transition-colors"
                       onClick={() => router.push(`/appointments/${appointment.id}`)}
                     >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{appointment.services?.name}</div>
                        <div className="text-sm text-gray-500">{appointment.services?.duration} dk</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(appointment.appointment_date).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(appointment.appointment_date).toLocaleTimeString('tr-TR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(appointment.services?.price || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => router.push(`/appointments/${appointment.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Görüntüle
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
