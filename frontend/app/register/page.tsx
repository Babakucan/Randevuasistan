'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Building, Phone, ArrowLeft, Calendar } from 'lucide-react'
import { auth, db } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    salonName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor!')
      return
    }
    
    if (!formData.acceptTerms) {
      setError('Kullanım şartlarını kabul etmelisiniz!')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Create user account
      const { data, error } = await auth.signUp(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone,
        salon_name: formData.salonName
      })
      
      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }
      
      if (data.user) {
        if (data.session) {
          router.push('/dashboard')
        } else {
          setSuccess('Hesabınız başarıyla oluşturuldu!')
        }
      }
    } catch (err) {
      setError('Hesap oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)' }}>
      <div className="w-full max-w-lg mx-auto p-4">
        {/* Back to Home */}
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Link>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Hesap Oluşturun
            </h1>
            <p className="text-gray-600">
              14 gün ücretsiz deneme ile başlayın
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Ad Soyad"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefon Numarası
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
            </div>

            {/* Salon Name */}
            <div>
              <label htmlFor="salonName" className="block text-sm font-medium text-gray-700 mb-2">
                Salon Adı
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="salonName"
                  name="salonName"
                  value={formData.salonName}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Salon Adı"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="En az 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre Tekrar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Şifrenizi tekrar girin"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-600">
                <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                  Kullanım Şartları
                </Link>{' '}
                ve{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                  Gizlilik Politikası
                </Link>{' '}
                kabul ediyorum
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Hesap Oluşturuluyor...
                </div>
              ) : (
                'Ücretsiz Hesap Oluştur'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Giriş Yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
