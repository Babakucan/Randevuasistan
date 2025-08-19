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
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    checkUser()
  }, [customerId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-600/20 text-blue-300 border border-blue-600/30'
      case 'completed':
        return 'bg-green-600/20 text-green-300 border border-green-600/30'
      case 'cancelled':
        return 'bg-red-600/20 text-red-300 border border-red-600/30'
      default:
        return 'bg-gray-600/20 text-gray-300 border border-gray-600/30'
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
          <span className="text-gray-300">Yükleniyor...</span>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">Müşteri bulunamadı</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/customers')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Müşteriler</span>
              </button>
              <span className="text-gray-400">|</span>
              <h1 className="text-2xl font-bold text-white">Müşteri Detayı</h1>
            </div>
            
            {/* Profile Menu */}
            <div className="relative profile-menu">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5 text-gray-300" />
              </button>
              
              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <div className="text-sm text-gray-300">{user?.email}</div>
                      <div className="text-xs text-gray-500">Yönetici</div>
                    </div>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => router.push('/appointments')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      Randevular
                    </button>
                    <button
                      onClick={() => router.push('/customers')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      Müşteriler
                    </button>
                    <button
                      onClick={() => router.push('/services')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      Hizmetler
                    </button>
                    <div className="border-t border-gray-700 mt-2 pt-2">
                      <button
                        onClick={async () => {
                          await auth.signOut();
                          router.push('/login');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Customer Info Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{customer.name}</h1>
                <div className="flex items-center space-x-6 mt-2">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone || 'Telefon yok'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Mail className="w-4 h-4" />
                    <span>{customer.email || 'E-posta yok'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>Kayıt: {new Date(customer.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/customers/${customerId}/edit`)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
              >
                <Edit className="w-4 h-4" />
                <span>Düzenle</span>
              </button>
              <button
                onClick={() => router.push(`/appointments/new?customer=${customerId}`)}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
              >
                <Calendar className="w-4 h-4" />
                <span>Yeni Randevu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Toplam Randevu</p>
                <p className="text-2xl font-bold text-white">{appointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Tamamlanan</p>
                <p className="text-2xl font-bold text-white">
                  {appointments.filter(a => a.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Toplam Harcama</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(appointments.reduce((total, a) => total + (a.services?.price || 0), 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-purple-400">₺</span>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Randevu Geçmişi</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Hizmet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tarih & Saat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      Henüz randevu bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment) => (
                    <tr 
                      key={appointment.id} 
                      className="hover:bg-gray-700/30 cursor-pointer transition-colors"
                      onClick={() => router.push(`/appointments/${appointment.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{appointment.services?.name}</div>
                        <div className="text-sm text-gray-400">{appointment.services?.duration} dk</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {new Date(appointment.appointment_date).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-sm text-gray-400">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {formatCurrency(appointment.services?.price || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/appointments/${appointment.id}`);
                            }}
                            className="text-blue-400 hover:text-blue-300"
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
