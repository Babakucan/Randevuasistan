'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Calendar, Users, MessageCircle, Phone, LogOut, User, ArrowLeft, Edit, Trash2, Mail, Clock, MapPin, Download } from 'lucide-react'
// TODO: Import API service from new backend

export default function PhoneCallDetailPage() {
  const router = useRouter()
  const params = useParams()
  const callId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [call, setCall] = useState<any>(null)
  const [callHistory, setCallHistory] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [callId])

  const checkUser = async () => {
    try {
      const { data: sessionData } = await auth.getSession()
      
      if (sessionData.session) {
        setUser(sessionData.session.user)
        await loadCallData(sessionData.session.user.id)
      } else {
        const { user: currentUser } = await auth.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          await loadCallData(currentUser.id)
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

  const loadCallData = async (userId: string) => {
    try {
      const { data, error } = await db.getPhoneCallById(userId, callId)
      if (error) {
        console.error('Error loading call:', error)
        setCall(null)
      } else {
        setCall(data)
        // Konuşma geçmişi verilerini de yükle
        if (data) {
          const { data: historyData } = await db.getCallHistoryByPhone(userId, data.customer_phone)
          setCallHistory(historyData)
        }
      }
    } catch (error) {
      console.error('Error loading call:', error)
      setCall(null)
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

  const getCallTypeColor = (type: string) => {
    switch (type) {
      case 'incoming':
        return 'bg-green-100 text-green-800'
      case 'outgoing':
        return 'bg-blue-100 text-blue-800'
      case 'missed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCallTypeText = (type: string) => {
    switch (type) {
      case 'incoming':
        return 'Gelen'
      case 'outgoing':
        return 'Giden'
      case 'missed':
        return 'Cevapsız'
      default:
        return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'missed':
        return 'bg-red-100 text-red-800'
      case 'busy':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı'
      case 'missed':
        return 'Cevapsız'
      case 'busy':
        return 'Meşgul'
      default:
        return status
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '0 saniye'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes === 0) return `${remainingSeconds} saniye`
    if (remainingSeconds === 0) return `${minutes} dakika`
    return `${minutes} dakika ${remainingSeconds} saniye`
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)' }}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!call) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)' }}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Phone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Arama Bulunamadı</h2>
            <p className="text-gray-600 mb-4">Aradığınız telefon araması bulunamadı.</p>
            <button
              onClick={() => router.push('/phone-calls')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Telefon Aramalarına Dön
            </button>
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
                onClick={() => router.push('/phone-calls')}
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Telefon Aramalarına Dön</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Arama Detayı</span>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Call Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Phone className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Telefon Araması</h1>
                <p className="text-gray-600">Arama ID: {call.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Call Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Call Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Arama Bilgileri</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Telefon Numarası</p>
                    <p className="font-medium text-gray-900">{call.customer_phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Arama Tipi</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCallTypeColor(call.call_type)}`}>
                      {getCallTypeText(call.call_type)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Arama Süresi</p>
                    <p className="font-medium text-gray-900">{formatDuration(call.duration)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Arama Durumu</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 text-gray-400">
                    <div className={`w-3 h-3 rounded-full ${call.status === 'completed' ? 'bg-green-500' : call.status === 'missed' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Durum</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(call.status)}`}>
                      {getStatusText(call.status)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Arama Tarihi</p>
                    <p className="font-medium text-gray-900">
                      {new Date(call.created_at).toLocaleDateString('tr-TR')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(call.created_at).toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">İşlemler</h3>
          <div className="flex flex-wrap gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Tekrar Ara</span>
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Dışa Aktar</span>
            </button>
            <button 
              onClick={() => router.push('/phone-calls')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Listeye Dön</span>
            </button>
          </div>
        </div>

        {/* Konuşma Geçmişi */}
        {callHistory && callHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Konuşma Geçmişi</h3>
            <div className="space-y-4">
              {callHistory.slice(0, 5).map((history: any) => (
                <div key={history.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCallTypeColor(history.call_type)}`}>
                        {getCallTypeText(history.call_type)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(history.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{formatDuration(history.duration)}</span>
                  </div>
                  
                  {history.transcript && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Konuşma Özeti:</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">{history.transcript}</p>
                    </div>
                  )}
                  
                  {history.key_points && history.key_points.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Anahtar Noktalar:</h4>
                      <div className="flex flex-wrap gap-1">
                        {history.key_points.map((point: string, index: number) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {history.follow_up_required && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">Takip Gerekli</h4>
                      <p className="text-sm text-yellow-700">{history.follow_up_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dinleme Verisi */}
        {callHistory && callHistory.some((h: any) => h.call_recordings && h.call_recordings.length > 0) && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dinleme Kayıtları</h3>
            <div className="space-y-4">
              {callHistory
                .filter((h: any) => h.call_recordings && h.call_recordings.length > 0)
                .slice(0, 3)
                .map((history: any) => (
                  <div key={history.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {new Date(history.created_at).toLocaleDateString('tr-TR')} - {formatDuration(history.duration)}
                        </h4>
                        <p className="text-sm text-gray-500">{history.customer_phone}</p>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>Dinle</span>
                      </button>
                    </div>
                    
                    {history.call_recordings.map((recording: any) => (
                      <div key={recording.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{recording.file_name}</p>
                            <p className="text-xs text-gray-500">
                              {recording.format?.toUpperCase()} • {recording.quality} • {Math.round(recording.file_size / 1024)}KB
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-800">
                              <Phone className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
