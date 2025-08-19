'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, ArrowLeft, Save } from 'lucide-react'
import { auth, db } from '@/lib/supabase'
import { capitalizeName } from '@/lib/utils'

export default function NewCustomerPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
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
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
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
      // Check if salon profile exists, create if not
      let { data: salonProfile } = await db.getSalonProfile(user.id)
      
      if (!salonProfile) {
        // Create default salon profile
        const { data: newProfile } = await db.createSalonProfile(user.id, {
          salonName: 'Güzellik Salonu',
          name: user.email?.split('@')[0] || 'Salon Sahibi',
          phone: '+90 555 000 0000',
          email: user.email || 'salon@example.com'
        })
        salonProfile = newProfile?.[0]
      }

      const result = await db.createCustomer(user.id, formData)

      if (result.data) {
        alert('Müşteri başarıyla oluşturuldu!')
        router.push('/customers')
      } else {
        alert('Müşteri oluşturulurken hata oluştu.')
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      alert('Müşteri oluşturulurken hata oluştu.')
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

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/customers')}
              className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Yeni Müşteri</h1>
                <p className="text-white/80">Müşteri bilgilerini girin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Ad Soyad
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  placeholder="Müşteri adı ve soyadı"
                  required
                />
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Telefon
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  placeholder="+90 555 123 4567"
                  required
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                E-posta
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  placeholder="musteri@email.com"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/customers')}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-400 disabled:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Müşteri Oluştur
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
