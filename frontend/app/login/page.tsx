'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Calendar, ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const { data, error } = await auth.signIn(formData.email, formData.password)
      
      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }
      
      if (data.user) {
        router.push('/dashboard')
      } else {
        setError('Giriş başarısız oldu')
      }
    } catch (err) {
      setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)' }}>
      <div className="w-full max-w-md mx-auto p-4">
        {/* Back to Home */}
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Hoş Geldiniz
            </h1>
            <p className="text-gray-600">
              Hesabınıza giriş yapın
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Giriş Yapılıyor...
                </div>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Hesabınız yok mu?{' '}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Ücretsiz Kayıt Olun
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
