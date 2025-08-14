'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, MessageCircle, Phone, LogOut, User, ArrowLeft, Plus, Search, Edit, Trash2, Clock } from 'lucide-react'
import { auth, db } from '@/lib/supabase'

export default function AppointmentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: sessionData } = await auth.getSession()
      
      if (sessionData.session) {
        setUser(sessionData.session.user)
        await loadAppointments(sessionData.session.user.id)
      } else {
        const { user: currentUser } = await auth.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          await loadAppointments(currentUser.id)
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

  const loadAppointments = async (userId: string) => {
    try {
      const { data, error } = await db.getAppointments(userId)
      if (error) {
        console.error('Error loading appointments:', error)
      } else {
        setAppointments(data || [])
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
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

  const handleEditAppointment = (appointmentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/appointments/${appointmentId}/edit`)
  }

  const handleDeleteAppointment = async (appointmentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await db.deleteAppointment(appointmentId)
        if (error) {
          console.error('Error deleting appointment:', error)
          alert('Randevu silinirken hata oluştu.')
        } else {
          alert('Randevu başarıyla silindi.')
          // Randevuları yeniden yükle
          if (user) {
            await loadAppointments(user.id)
          }
        }
      } catch (error) {
        console.error('Error deleting appointment:', error)
        alert('Randevu silinirken hata oluştu.')
      }
    }
  }

  const filteredAppointments = appointments.filter(appointment =>
    appointment.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.services?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard'a Dön</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Randevular</span>
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
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Randevu Listesi</h1>
              <p className="text-gray-600">Toplam {appointments.length} randevu</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Randevu ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => router.push('/appointments/new')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Randevu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
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
                    Notlar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz randevu bulunmuyor.'}
                    </td>
                  </tr>
                ) : (
                                     filteredAppointments.map((appointment) => (
                     <tr 
                       key={appointment.id} 
                       className="hover:bg-gray-50 cursor-pointer transition-colors"
                       onClick={() => router.push(`/appointments/${appointment.id}`)}
                     >
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div 
                           className="flex items-center"
                           onClick={(e) => {
                             e.stopPropagation()
                             router.push(`/customers/${appointment.customer_id}`)
                           }}
                         >
                           <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                             <Users className="w-5 h-5 text-green-600" />
                           </div>
                           <div className="ml-4">
                             <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                               {appointment.customers?.name}
                             </div>
                             <div className="text-sm text-gray-500">{appointment.customers?.phone}</div>
                           </div>
                         </div>
                       </td>
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
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {appointment.notes || '-'}
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                         <div 
                           className="flex items-center space-x-2"
                           onClick={(e) => e.stopPropagation()}
                         >
                           <button 
                             className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                             onClick={(e) => handleEditAppointment(appointment.id, e)}
                           >
                             <Edit className="w-4 h-4" />
                           </button>
                           <button 
                             className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                             onClick={(e) => handleDeleteAppointment(appointment.id, e)}
                           >
                             <Trash2 className="w-4 h-4" />
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
