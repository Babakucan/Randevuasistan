'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, MessageCircle, Phone, LogOut, User, ArrowLeft, Plus, Search, Edit, Trash2, Send, Download } from 'lucide-react'
import { auth, db } from '@/lib/supabase'

export default function WhatsAppPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
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
        await loadMessages(sessionData.session.user.id)
      } else {
        const { user: currentUser } = await auth.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          await loadMessages(currentUser.id)
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

  const loadMessages = async (userId: string) => {
    try {
      const { data, error } = await db.getWhatsAppMessages(userId)
      if (error) {
        console.error('Error loading messages:', error)
      } else {
        setMessages(data || [])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
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

  const filteredMessages = messages.filter(message =>
    message.customer_phone?.includes(searchTerm) ||
    message.message_text?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">WhatsApp Mesajları</span>
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
              <h1 className="text-2xl font-bold text-gray-900">WhatsApp Mesajları</h1>
              <p className="text-gray-600">Toplam {messages.length} mesaj</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Mesaj ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => router.push('/whatsapp/new')}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Yeni Mesaj</span>
              </button>
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mesaj
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz mesaj bulunmuyor.'}
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((message) => (
                    <tr 
                      key={message.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/whatsapp/${message.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Phone className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{message.customer_phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {message.message_text}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMessageTypeColor(message.message_type)}`}>
                          {getMessageTypeText(message.message_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                          {getStatusText(message.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleDateString('tr-TR')}
                        <br />
                        {new Date(message.created_at).toLocaleTimeString('tr-TR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div 
                          className="flex items-center space-x-2"
                          onClick={(e) => e.stopPropagation()} // Prevent row click when action buttons are clicked
                        >
                          <button className="text-blue-600 hover:text-blue-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
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
