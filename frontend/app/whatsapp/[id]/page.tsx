'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Calendar, Users, MessageCircle, Phone, LogOut, User, ArrowLeft, Edit, Trash2, Mail, Clock, MapPin, Send, Download } from 'lucide-react'
import { auth, db } from '@/lib/supabase'

export default function WhatsAppMessageDetailPage() {
  const router = useRouter()
  const params = useParams()
  const messageId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [messageId])

  const checkUser = async () => {
    try {
      const { data: sessionData } = await auth.getSession()
      
      if (sessionData.session) {
        setUser(sessionData.session.user)
        await loadMessageData(sessionData.session.user.id)
      } else {
        const { user: currentUser } = await auth.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          await loadMessageData(currentUser.id)
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

  const loadMessageData = async (userId: string) => {
    try {
      const { data, error } = await db.getWhatsAppMessageById(userId, messageId)
      if (error) {
        console.error('Error loading message:', error)
        setMessage(null)
      } else {
        setMessage(data)
      }
    } catch (error) {
      console.error('Error loading message:', error)
      setMessage(null)
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

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'incoming':
        return 'bg-green-100 text-green-800'
      case 'outgoing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMessageTypeText = (type: string) => {
    switch (type) {
      case 'incoming':
        return 'Gelen'
      case 'outgoing':
        return 'Giden'
      default:
        return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-gray-100 text-gray-800'
      case 'delivered':
        return 'bg-blue-100 text-blue-800'
      case 'read':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Gönderildi'
      case 'delivered':
        return 'Teslim Edildi'
      case 'read':
        return 'Okundu'
      default:
        return status
    }
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

  if (!message) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)' }}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mesaj Bulunamadı</h2>
            <p className="text-gray-600 mb-4">Aradığınız WhatsApp mesajı bulunamadı.</p>
            <button
              onClick={() => router.push('/whatsapp')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              WhatsApp Mesajlarına Dön
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
                onClick={() => router.push('/whatsapp')}
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>WhatsApp Mesajlarına Dön</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Mesaj Detayı</span>
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
        {/* Message Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WhatsApp Mesajı</h1>
                <p className="text-gray-600">Mesaj ID: {message.id}</p>
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

          {/* Message Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Message Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Mesaj İçeriği</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{message.message_text}</p>
              </div>
            </div>

            {/* Message Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Mesaj Bilgileri</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Telefon Numarası</p>
                    <p className="font-medium text-gray-900">{message.customer_phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Send className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Mesaj Tipi</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMessageTypeColor(message.message_type)}`}>
                      {getMessageTypeText(message.message_type)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Durum</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                      {getStatusText(message.status)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Oluşturulma Tarihi</p>
                    <p className="font-medium text-gray-900">
                      {new Date(message.created_at).toLocaleDateString('tr-TR')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(message.created_at).toLocaleTimeString('tr-TR', { 
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
              <Send className="w-4 h-4" />
              <span>Yanıtla</span>
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Dışa Aktar</span>
            </button>
            <button 
              onClick={() => router.push('/whatsapp')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Listeye Dön</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
