import Link from 'next/link'
import { Calendar, Users, MessageCircle, Phone, Zap, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Randevuasistan</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Giriş Yap
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Kuaför Salonunuz İçin
            <span className="text-blue-600 block">Yapay Zeka Asistanı</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            WhatsApp ve telefon üzerinden gelen randevu taleplerini otomatik olarak işleyen, 
            müşteri ile iletişimi kolaylaştıran ve randevu yönetimini otomatikleştiren platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg px-8 py-3 rounded-lg transition-colors"
            >
              14 Gün Ücretsiz Dene
            </Link>
            <Link 
              href="#features" 
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium text-lg px-8 py-3 rounded-lg transition-colors"
            >
              Özellikleri Keşfet
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Neden Randevuasistan?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Kuaför salonunuzu dijital dünyaya taşıyın ve müşteri deneyimini iyileştirin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Asistan */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Asistan</h3>
              <p className="text-gray-600">
                WhatsApp ve telefon mesajlarını otomatik olarak analiz eder, 
                randevu bilgilerini çıkarır ve müşteri ile iletişim kurar.
              </p>
            </div>

            {/* 7/24 Hizmet */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">7/24 Hizmet</h3>
              <p className="text-gray-600">
                İş saatleri dışında gelen talepleri kaçırmayın. 
                AI asistanınız her zaman müşterilerinizle ilgilenir.
              </p>
            </div>

            {/* Müşteri Yönetimi */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Müşteri Yönetimi</h3>
              <p className="text-gray-600">
                Müşteri profilleri, randevu geçmişi ve tercihleri 
                tek yerden yönetin.
              </p>
            </div>

            {/* WhatsApp Entegrasyonu */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">WhatsApp Entegrasyonu</h3>
              <p className="text-gray-600">
                WhatsApp Business API ile mesajları otomatik olarak 
                alır ve yanıtlar.
              </p>
            </div>

            {/* Telefon Entegrasyonu */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Telefon Entegrasyonu</h3>
              <p className="text-gray-600">
                Gelen aramaları karşılar, sesli komutları anlar ve 
                otomatik randevu oluşturur.
              </p>
            </div>

            {/* Güvenlik */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Güvenlik</h3>
              <p className="text-gray-600">
                KVKK uyumlu, şifrelenmiş veri saklama ve 
                güvenli kimlik doğrulama sistemi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Hemen Başlayın
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            14 gün ücretsiz deneme ile Randevuasistan'ın gücünü keşfedin.
          </p>
                      <Link 
              href="/register" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-block"
            >
              Ücretsiz Hesap Oluştur
            </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Randevuasistan</span>
              </div>
              <p className="text-gray-400">
                Kuaförlere özel yapay zeka destekli randevu yönetim sistemi.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Ürün</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Özellikler</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Fiyatlandırma</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Destek</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Yardım</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">İletişim</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Dokümantasyon</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Şirket</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">Hakkımızda</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Gizlilik</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Şartlar</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Randevuasistan. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
