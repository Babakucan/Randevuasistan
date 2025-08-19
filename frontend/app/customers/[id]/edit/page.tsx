'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Users, ArrowLeft, Save } from 'lucide-react'
import { auth, db, supabase } from '@/lib/supabase'
import { capitalizeName } from '@/lib/utils'

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [customer, setCustomer] = useState<any>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  })

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
      await loadData(user.id)
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadData = async (userId: string) => {
    try {
      // Load customer
      const { data: customerData } = await db.getCustomerById(userId, customerId)
      if (customerData) {
        setCustomer(customerData)
        setFormData({
          name: customerData.name,
          phone: customerData.phone || '',
          email: customerData.email || ''
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const capitalizedValue = capitalizeName(value);
    setFormData(prev => ({ ...prev, name: capitalizedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      const result = await supabase
        .from('customers')
        .update({
          name: formData.name,
          phone: formData.phone,
          email: formData.email
        })
        .eq('id', customerId)
        .select()

      if (result.data) {
        alert('Müşteri başarıyla güncellendi!')
        router.push('/customers')
      } else {
        alert('Müşteri güncellenirken hata oluştu.')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      alert('Müşteri güncellenirken hata oluştu.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Müşteri Bulunamadı</h1>
          <p className="text-gray-600 mb-4">Aradığınız müşteri bulunamadı veya erişim izniniz yok.</p>
          <button
            onClick={() => router.push('/customers')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Müşterilere Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/customers')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Müşteri Düzenle</h1>
              <p className="text-gray-600">Müşteri bilgilerini güncelleyin</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Müşteri adı ve soyadı"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0555 123 45 67"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="musteri@example.com"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/customers')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Müşteri Güncelle
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
