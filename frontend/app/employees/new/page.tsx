'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, ArrowLeft, Save, Calendar } from 'lucide-react'
import { auth, db } from '@/lib/supabase'

export default function NewEmployeePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    specialties: '',
    hourly_rate: '',
    bio: '',
    experience_years: ''
  })

  // Leave days
  const [leaveDays, setLeaveDays] = useState<string[]>([])

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

  const handleLeaveDayChange = (date: string, checked: boolean) => {
    if (checked) {
      setLeaveDays(prev => [...prev, date])
    } else {
      setLeaveDays(prev => prev.filter(d => d !== date))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      // Get salon profile or create if not exists
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
        
        if (!salonProfile) {
          alert('Salon profili oluşturulamadı.')
          return
        }
      }

      const result = await db.createEmployee(user.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
        working_hours: {
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '18:00' },
          friday: { start: '09:00', end: '18:00' },
          saturday: { start: '09:00', end: '17:00' },
          sunday: { start: '', end: '' }
        },
        leave_days: leaveDays,
        bio: formData.bio,
        experience_years: parseInt(formData.experience_years) || 0,
        hourly_rate: parseFloat(formData.hourly_rate) || 0
      })

      if (result.data) {
        alert('Çalışan başarıyla oluşturuldu!')
        router.push('/employees')
      } else {
        alert('Çalışan oluşturulurken hata oluştu.')
      }
    } catch (error) {
      console.error('Error creating employee:', error)
      alert('Çalışan oluşturulurken hata oluştu.')
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/employees')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yeni Çalışan</h1>
              <p className="text-gray-600">Yeni çalışan ekleyin</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Çalışan adı ve soyadı"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="calisan@salon.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+90 5XX XXX XX XX"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pozisyon
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn: Kuaför, Manikürcü"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uzmanlık Alanları
                </label>
                <input
                  type="text"
                  value={formData.specialties}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Saç kesimi, saç boyama, manikür (virgülle ayırın)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saatlik Ücret (TL)
                </label>
                <input
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deneyim (Yıl)
                </label>
                <input
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hakkında
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Çalışan hakkında kısa bilgi..."
              />
            </div>

            {/* Leave Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                İzin Günleri
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Next 30 days */}
                {Array.from({ length: 30 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() + i)
                  const dateString = date.toISOString().split('T')[0]
                  const dayName = date.toLocaleDateString('tr-TR', { weekday: 'long' })
                  const dayNumber = date.getDate()
                  const monthName = date.toLocaleDateString('tr-TR', { month: 'long' })
                  
                  return (
                    <div key={dateString} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <input
                        type="checkbox"
                        id={dateString}
                        checked={leaveDays.includes(dateString)}
                        onChange={(e) => handleLeaveDayChange(dateString, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={dateString} className="text-sm text-gray-700 cursor-pointer">
                        <div className="font-medium">{dayName}</div>
                        <div className="text-gray-500">{dayNumber} {monthName}</div>
                      </label>
                    </div>
                  )
                })}
              </div>
              {leaveDays.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Seçilen izin günleri:</strong> {leaveDays.length} gün
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/employees')}
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
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Çalışan Oluştur
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
