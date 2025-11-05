# Randevuasistan - Görev Yönetimi

## 📋 Proje Durumu
**Mevcut Durum**: Proje Başlangıç Aşaması 🚀  
**Sonraki Milestone**: Frontend Geliştirme & Veritabanı Kurulumu 🎯

---

## ✅ Tamamlanan Görevler

### Proje Başlangıcı
- [x] Proje konsepti ve fikir geliştirme
- [x] Hedef kitle analizi
- [x] Problem tanımı ve çözüm önerisi
- [x] PRD dokümanı oluşturma

### Planlama ve Analiz
- [x] Ürün özelliklerinin detaylandırılması
- [x] Teknik gereksinimlerin belirlenmesi
- [x] Kullanıcı senaryolarının yazılması
- [x] UI/UX gereksinimlerinin tanımlanması

---

## 🚀 ÖNCELİKLİ GÖREVLER (Bu Hafta)

### 1. Frontend Geliştirme (Kritik)
**Sorumlu**: Frontend Geliştirici  
**Tahmini Süre**: 3-4 gün  
**Öncelik**: 🔴 Yüksek

#### 1.1 React.js Proje Kurulumu
- [ ] React.js proje yapısı kurulumu
- [ ] TypeScript konfigürasyonu
- [ ] Material-UI entegrasyonu
- [ ] Proje klasör yapısı oluşturma (components, pages, services, types, utils, hooks)
- [ ] TypeScript tip tanımları oluşturma
- [ ] Supabase servis katmanı oluşturma
- [ ] Auth sistemi ve useAuth hook'u oluşturma

#### 1.2 Temel Bileşenler
- [ ] Layout bileşeni oluşturma (sidebar, header, navigation)
- [ ] Dashboard sayfası oluşturma (istatistikler, son randevular, AI durumu)
- [ ] Temel sayfa bileşenleri oluşturma (Appointments, Customers, Services, Settings, Login)
- [ ] Routing yapısı kurma
- [ ] Tema ve stil konfigürasyonu yapma
- [ ] Toast bildirimleri entegrasyonu
- [ ] Responsive tasarım uygulama

### 2. Veritabanı Kurulumu (Kritik)
**Sorumlu**: Backend Geliştirici  
**Tahmini Süre**: 2-3 gün  
**Öncelik**: 🔴 Yüksek

#### 2.1 Supabase Projesi Oluşturma
- [ ] Supabase hesabı oluşturma
- [ ] Yeni proje oluşturma
- [ ] Proje ayarlarını yapılandırma
- [ ] Environment variables'ları kaydetme

#### 2.2 Veritabanı Şeması Tasarımı
- [ ] `appointments` tablosu oluşturma
  - [ ] id (uuid, primary key)
  - [ ] customer_name (text, not null)
  - [ ] customer_phone (text, not null)
  - [ ] service (text, not null)
  - [ ] date (date, not null)
  - [ ] time (time, not null)
  - [ ] status (enum: 'beklemede', 'onaylandı', 'iptal', 'tamamlandı')
  - [ ] notes (text)
  - [ ] source (enum: 'telefon', 'whatsapp', 'web')
  - [ ] ai_processed (boolean, default false)
  - [ ] created_at (timestamp, default now())
  - [ ] updated_at (timestamp, default now())

- [ ] `customers` tablosu oluşturma
  - [ ] id (uuid, primary key)
  - [ ] name (text, not null)
  - [ ] phone (text, unique, not null)
  - [ ] email (text)
  - [ ] notes (text)
  - [ ] preferred_services (jsonb)
  - [ ] total_appointments (integer, default 0)
  - [ ] created_at (timestamp, default now())
  - [ ] updated_at (timestamp, default now())

- [ ] `services` tablosu oluşturma
  - [ ] id (uuid, primary key)
  - [ ] name (text, not null)
  - [ ] duration (integer, not null) // dakika cinsinden
  - [ ] price (decimal, not null)
  - [ ] description (text)
  - [ ] is_active (boolean, default true)
  - [ ] created_at (timestamp, default now())
  - [ ] updated_at (timestamp, default now())

- [ ] `salon_settings` tablosu oluşturma
  - [ ] id (uuid, primary key)
  - [ ] name (text, not null)
  - [ ] address (text)
  - [ ] phone (text, not null)
  - [ ] working_hours (jsonb)
  - [ ] break_time (integer, default 15) // dakika cinsinden
  - [ ] max_appointments_per_day (integer, default 20)
  - [ ] created_at (timestamp, default now())
  - [ ] updated_at (timestamp, default now())

#### 2.3 RLS (Row Level Security) Politikaları
- [ ] Authentication politikaları oluşturma
- [ ] CRUD işlemleri için güvenlik kuralları
- [ ] Multi-tenant yapı için salon bazlı filtreleme

#### 2.4 Test Verileri
- [ ] Örnek müşteri verileri ekleme
- [ ] Örnek hizmet verileri ekleme
- [ ] Örnek randevu verileri ekleme
- [ ] Salon ayarları ekleme

### 3. Backend API Geliştirme (Kritik)
**Sorumlu**: Backend Geliştirici  
**Tahmini Süre**: 3-4 gün  
**Öncelik**: 🔴 Yüksek

#### 3.1 Node.js Proje Kurulumu
- [ ] Backend klasörü oluşturma
- [ ] package.json oluşturma
- [ ] Gerekli paketleri kurma:
  - [ ] express
  - [ ] cors
  - [ ] dotenv
  - [ ] @supabase/supabase-js
  - [ ] jsonwebtoken
  - [ ] bcryptjs
  - [ ] express-rate-limit
  - [ ] helmet
  - [ ] morgan

#### 3.2 Temel Server Yapısı
- [ ] Express server kurulumu
- [ ] Middleware konfigürasyonu
- [ ] Error handling middleware
- [ ] CORS ayarları
- [ ] Environment variables yapılandırması

#### 3.3 Authentication Sistemi
- [ ] JWT token oluşturma/doğrulama
- [ ] Login endpoint'i (`POST /api/auth/login`)
- [ ] Register endpoint'i (`POST /api/auth/register`)
- [ ] Logout endpoint'i (`POST /api/auth/logout`)
- [ ] Auth middleware oluşturma

#### 3.4 API Endpoint'leri
- [ ] **Appointments API**
  - [ ] GET /api/appointments (tüm randevular)
  - [ ] GET /api/appointments/:id (tek randevu)
  - [ ] POST /api/appointments (yeni randevu)
  - [ ] PUT /api/appointments/:id (randevu güncelle)
  - [ ] DELETE /api/appointments/:id (randevu sil)
  - [ ] GET /api/appointments/today (bugünkü randevular)
  - [ ] GET /api/appointments/stats (istatistikler)

- [ ] **Customers API**
  - [ ] GET /api/customers (tüm müşteriler)
  - [ ] GET /api/customers/:id (tek müşteri)
  - [ ] POST /api/customers (yeni müşteri)
  - [ ] PUT /api/customers/:id (müşteri güncelle)
  - [ ] DELETE /api/customers/:id (müşteri sil)

- [ ] **Services API**
  - [ ] GET /api/services (tüm hizmetler)
  - [ ] GET /api/services/:id (tek hizmet)
  - [ ] POST /api/services (yeni hizmet)
  - [ ] PUT /api/services/:id (hizmet güncelle)
  - [ ] DELETE /api/services/:id (hizmet sil)

- [ ] **Settings API**
  - [ ] GET /api/settings (salon ayarları)
  - [ ] PUT /api/settings (ayarları güncelle)

### 4. Frontend API Entegrasyonu (Yüksek)
**Sorumlu**: Frontend Geliştirici  
**Tahmini Süre**: 2-3 gün  
**Öncelik**: 🟡 Orta

#### 4.1 API Service Güncellemeleri
- [ ] Supabase servislerini backend API'lerine yönlendirme
- [ ] Error handling iyileştirmeleri
- [ ] Loading state'leri ekleme
- [ ] Retry mekanizması

#### 4.2 Form Bileşenleri
- [ ] Randevu ekleme/düzenleme formu
- [ ] Müşteri ekleme/düzenleme formu
- [ ] Hizmet ekleme/düzenleme formu
- [ ] Form validasyonları

#### 4.3 Sayfa Geliştirmeleri
- [ ] Appointments sayfası detaylandırma
- [ ] Customers sayfası detaylandırma
- [ ] Services sayfası detaylandırma
- [ ] Settings sayfası detaylandırma
- [ ] Login sayfası geliştirme

---

## 📅 KISA VADELİ GÖREVLER (1-2 Hafta)

### 5. AI Entegrasyonu (Orta)
**Sorumlu**: AI Geliştirici  
**Tahmini Süre**: 1 hafta  
**Öncelik**: 🟡 Orta

#### 5.1 OpenAI Entegrasyonu
- [ ] OpenAI API key konfigürasyonu
- [ ] Prompt engineering
- [ ] Mesaj işleme fonksiyonları
- [ ] Randevu bilgisi çıkarma algoritması

#### 5.2 WhatsApp Business API
- [ ] WhatsApp Business hesabı kurulumu
- [ ] Webhook endpoint'i oluşturma
- [ ] Mesaj alma/gönderme fonksiyonları
- [ ] Otomatik yanıt sistemi

#### 5.3 NETGSM Entegrasyonu
- [ ] NETGSM hesabı kurulumu
- [ ] SMS gönderme fonksiyonları
- [ ] Telefon arama entegrasyonu
- [ ] Sesli mesaj sistemi

### 6. Test ve Kalite (Orta)
**Sorumlu**: QA / Geliştirici  
**Tahmini Süre**: 3-4 gün  
**Öncelik**: 🟡 Orta

#### 6.1 Unit Testler
- [ ] Backend API testleri
- [ ] Frontend component testleri
- [ ] Service layer testleri
- [ ] Utility function testleri

#### 6.2 Integration Testler
- [ ] API endpoint testleri
- [ ] Database işlem testleri
- [ ] Authentication testleri

#### 6.3 E2E Testler
- [ ] Kullanıcı akış testleri
- [ ] Randevu oluşturma testleri
- [ ] Müşteri yönetimi testleri

---

## 🎯 ORTA VADELİ GÖREVLER (1-2 Ay)

### 7. Gelişmiş Özellikler
- [ ] Takvim görünümü
- [ ] Bildirim sistemi
- [ ] Raporlama modülü
- [ ] Export/Import fonksiyonları
- [ ] Backup sistemi

### 8. Performans Optimizasyonu
- [ ] Database indexleme
- [ ] Caching stratejileri
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Image optimization

### 9. Güvenlik İyileştirmeleri
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection koruması
- [ ] XSS koruması
- [ ] CSRF koruması

---

## 📊 GÖREV TAKİP SİSTEMİ

### Görev Durumları
- 🔴 **Kritik**: Hemen yapılması gereken
- 🟡 **Orta**: Kısa vadede yapılacak
- 🟢 **Düşük**: Uzun vadede yapılacak
- ✅ **Tamamlandı**: Biten görevler

### Görev Atama
- **Backend Geliştirici**: Veritabanı, API, AI entegrasyonu
- **Frontend Geliştirici**: UI/UX, form bileşenleri, API entegrasyonu
- **QA**: Test süreçleri, kalite kontrol
- **DevOps**: Deployment, altyapı

### Günlük Standup Soruları
1. Dün ne yaptın?
2. Bugün ne yapacaksın?
3. Karşılaştığın engeller neler?

---

## 📝 NOTLAR

### Önemli Tarihler
- **Bu Hafta**: Frontend geliştirme tamamlanmalı
- **Gelecek Hafta**: Veritabanı kurulumu tamamlanmalı
- **2 Hafta Sonra**: Backend API'leri hazır olmalı

### Risk Faktörleri
- Frontend geliştirme süresi
- Supabase kurulum sorunları
- API entegrasyon hataları
- AI servis maliyetleri
- Performans sorunları

### Başarı Kriterleri
- Frontend başarıyla geliştirildi
- Veritabanı başarıyla kuruldu
- API'ler çalışıyor
- Frontend-backend entegrasyonu tamamlandı
- Temel CRUD işlemleri çalışıyor
- Test coverage %80+

---

*Son Güncelleme: [12.08.2025]*  
*Versiyon: 1.0*
