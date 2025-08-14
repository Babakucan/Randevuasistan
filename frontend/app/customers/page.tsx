'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, MessageCircle, Phone, LogOut, User, ArrowLeft, Plus, Search, Edit, Trash2 } from 'lucide-react'
import { auth, db } from '@/lib/supabase'

export default function CustomersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
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
        await loadCustomers(sessionData.session.user.id)
      } else {
        const { user: currentUser } = await auth.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          await loadCustomers(currentUser.id)
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

  const loadCustomers = async (userId: string) => {
    try {
      const { data, error } = await db.getCustomers(userId)
      if (error) {
        console.error('Error loading customers:', error)
      } else {
        setCustomers(data || [])
      }
    } catch (error) {
      console.error('Error loading customers:', error)
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

  const handleEditCustomer = (customerId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/customers/${customerId}/edit`)
  }

  const handleDeleteCustomer = async (customerId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (confirm('Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        const { error } = await db.deleteCustomer(customerId)
        if (error) {
          console.error('Error deleting customer:', error)
          alert('Müşteri silinirken hata oluştu.')
        } else {
          alert('Müşteri başarıyla silindi.')
          // Müşterileri yeniden yükle
          if (user) {
            await loadCustomers(user.id)
          }
        }
      } catch (error) {
        console.error('Error deleting customer:', error)
        alert('Müşteri silinirken hata oluştu.')
      }
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Müşteriler</span>
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
              <h1 className="text-2xl font-bold text-gray-900">Müşteri Listesi</h1>
              <p className="text-gray-600">Toplam {customers.length} müşteri</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Müşteri ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => router.push('/customers/new')}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Müşteri</span>
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-posta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz müşteri bulunmuyor.'}
                    </td>
                  </tr>
                ) : (
                                     filteredCustomers.map((customer) => (
                     <tr 
                       key={customer.id} 
                       className="hover:bg-gray-50 cursor-pointer transition-colors"
                       onClick={() => router.push(`/customers/${customer.id}`)}
                     >
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center">
                           <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                             <Users className="w-5 h-5 text-green-600" />
                           </div>
                           <div className="ml-4">
                             <div className="text-sm font-medium text-gray-900">
                               {customer.name}
                             </div>
                           </div>
                         </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.created_at).toLocaleDateString('tr-TR')}
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                         <div 
                           className="flex items-center space-x-2"
                           onClick={(e) => e.stopPropagation()}
                         >
                           <button 
                             className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                             onClick={(e) => handleEditCustomer(customer.id, e)}
                           >
                             <Edit className="w-4 h-4" />
                           </button>
                           <button 
                             className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                             onClick={(e) => handleDeleteCustomer(customer.id, e)}
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
