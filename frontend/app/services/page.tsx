'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Plus, Search, Clock, DollarSign } from 'lucide-react'
import { auth, db } from '@/lib/supabase'

export default function ServicesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await auth.getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      await loadServices(user.id)
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadServices = async (userId: string) => {
    try {
      const { data, error } = await db.getServices(userId)
      if (error) {
        console.error('Error loading services:', error)
        setServices([])
      } else {
        setServices(data || [])
      }
    } catch (error) {
      console.error('Error in loadServices:', error)
      setServices([])
    }
  }

  const filteredServices = services.filter((service: any) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Settings size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hizmetler</h1>
              <p className="text-gray-600">Salon hizmetlerinizi yönetin</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/services/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Yeni Hizmet
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Hizmet ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service: any) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/services/${service.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                <div className="flex items-center gap-1 text-green-600 font-semibold">
                  <DollarSign size={16} />
                  {service.price}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <Clock size={16} />
                <span>{service.duration} dakika</span>
              </div>

              {service.description && (
                <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {service.description}
                </div>
              )}

              <div className="text-sm text-gray-500">
                ID: {service.id}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz hizmet yok'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                : 'İlk hizmetinizi ekleyerek başlayın'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/services/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                İlk Hizmeti Ekle
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
