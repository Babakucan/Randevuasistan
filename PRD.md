# Salon Yönetim Sistemi - Product Requirements Document (PRD)

## 📋 Proje Özeti

**Proje Adı:** Salon Yönetim Sistemi  
**Versiyon:** 1.0  
**Tarih:** 2024  
**Durum:** Tamamlandı ✅

### 🎯 Proje Amacı
Modern salon işletmelerinin günlük operasyonlarını dijitalleştirmek, randevu yönetimini kolaylaştırmak ve müşteri deneyimini iyileştirmek için kapsamlı bir web uygulaması geliştirmek.

## 🏗️ Teknik Mimari

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Dil:** TypeScript
- **Styling:** Tailwind CSS
- **İkonlar:** Lucide React
- **State Management:** React Hooks

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **API:** Supabase Client
- **Security:** Row Level Security (RLS)

### Hosting & Deployment
- **Frontend:** Vercel (önerilen)
- **Database:** Supabase Cloud

## 📊 Veritabanı Şeması

### Ana Tablolar

#### 1. `salon_profiles`
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- name (VARCHAR)
- address (TEXT)
- phone (VARCHAR)
- email (VARCHAR)
- working_hours (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 2. `employees`
```sql
- id (UUID, Primary Key)
- salon_id (UUID, Foreign Key)
- name (VARCHAR)
- email (VARCHAR)
- phone (VARCHAR)
- position (VARCHAR)
- specialties (JSONB)
- working_hours (JSONB)
- leave_days (JSONB)
- bio (TEXT)
- experience_years (INTEGER)
- hourly_rate (DECIMAL)
- is_active (BOOLEAN)
- avatar_url (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3. `services`
```sql
- id (UUID, Primary Key)
- salon_id (UUID, Foreign Key)
- name (VARCHAR)
- description (TEXT)
- duration (INTEGER)
- price (DECIMAL)
- category (VARCHAR)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 4. `customers`
```sql
- id (UUID, Primary Key)
- salon_id (UUID, Foreign Key)
- name (VARCHAR)
- phone (VARCHAR)
- email (VARCHAR)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 5. `appointments`
```sql
- id (UUID, Primary Key)
- salon_id (UUID, Foreign Key)
- customer_id (UUID, Foreign Key)
- employee_id (UUID, Foreign Key)
- service_id (UUID, Foreign Key)
- appointment_date (DATE)
- appointment_time (TIME)
- duration (INTEGER)
- status (VARCHAR)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 6. `employee_services`
```sql
- id (UUID, Primary Key)
- employee_id (UUID, Foreign Key)
- service_id (UUID, Foreign Key)
- is_available (BOOLEAN)
- custom_price (DECIMAL)
- created_at (TIMESTAMP)
```

## 🎨 Kullanıcı Arayüzü

### Tasarım Prensipleri
- **Renk Paleti:** Gri ve siyah tonları (gradient)
- **Tipografi:** Modern, okunabilir fontlar
- **Responsive:** Mobil uyumlu tasarım
- **UX:** Sezgisel navigasyon ve hızlı işlemler

### Sayfa Yapısı

#### 1. **Dashboard** (`/dashboard`)
- Salon genel bakış
- Günlük randevular
- Hızlı istatistikler
- Navigasyon menüsü

#### 2. **Çalışan Yönetimi** (`/employees`)
- Çalışan listesi (grid görünümü)
- Çalışan ekleme (`/employees/new`)
- Çalışan düzenleme (`/employees/[id]/edit`)
- Çalışan detayları (`/employees/[id]`)
- İzin günleri yönetimi
- Çalışma saatleri ayarlama
- Hizmet atama

#### 3. **Hizmet Yönetimi** (`/services`)
- Hizmet listesi
- Hizmet ekleme (`/services/new`)
- Hizmet düzenleme (`/services/[id]/edit`)
- Hizmet detayları (`/services/[id]`)

#### 4. **Müşteri Yönetimi** (`/customers`)
- Müşteri listesi (tablo görünümü)
- Müşteri ekleme (`/customers/new`)
- Müşteri düzenleme (`/customers/[id]/edit`)
- Müşteri detayları (`/customers/[id]`)

#### 5. **Randevu Yönetimi** (`/appointments`)
- Randevu listesi (tablo görünümü)
- Randevu oluşturma (`/appointments/new`)
- Randevu düzenleme (`/appointments/[id]/edit`)
- Randevu detayları (`/appointments/[id]`)

## 🔧 Temel Özellikler

### 1. **Kimlik Doğrulama**
- Email/şifre ile giriş
- Otomatik salon profili oluşturma
- Güvenli oturum yönetimi

### 2. **Çalışan Yönetimi**
- Çalışan ekleme/düzenleme/silme
- İzin günleri takibi
- Çalışma saatleri yönetimi
- Hizmet atama sistemi
- Deneyim ve uzmanlık alanları

### 3. **Hizmet Yönetimi**
- Hizmet ekleme/düzenleme/silme
- Fiyat ve süre belirleme
- Kategori sistemi
- Aktif/pasif durumu

### 4. **Müşteri Yönetimi**
- Müşteri ekleme/düzenleme/silme
- İletişim bilgileri
- Müşteri notları
- Arama ve filtreleme

### 5. **Randevu Sistemi**
- Akıllı randevu oluşturma
- Çalışan müsaitlik kontrolü
- Hizmet bazlı çalışan filtreleme
- İzin günleri kontrolü
- Çalışma saatleri kontrolü
- Randevu düzenleme/silme

### 6. **Arama ve Filtreleme**
- Tüm listelerde arama
- Tarih bazlı filtreleme
- Durum bazlı filtreleme

## 🚀 Gelişmiş Özellikler

### 1. **Akıllı Randevu Sistemi**
- Otomatik çalışan önerisi
- Çakışma kontrolü
- Müsaitlik kontrolü
- İzin günleri kontrolü

### 2. **Çalışan İzin Yönetimi**
- Günlük izin takibi
- JSONB tabanlı esnek yapı
- Görsel izin göstergeleri

### 3. **Hizmet Atama Sistemi**
- Çalışan-hizmet ilişkilendirme
- Özel fiyatlandırma
- Müsaitlik kontrolü

### 4. **Responsive Tasarım**
- Mobil uyumlu arayüz
- Tablet optimizasyonu
- Desktop deneyimi

## 🔒 Güvenlik

### 1. **Row Level Security (RLS)**
- Salon bazlı veri izolasyonu
- Kullanıcı bazlı erişim kontrolü
- Güvenli veri paylaşımı

### 2. **Authentication**
- Supabase Auth entegrasyonu
- Güvenli oturum yönetimi
- Otomatik yönlendirme

### 3. **Data Validation**
- Form validasyonu
- Veri bütünlüğü kontrolü
- SQL injection koruması

## 📱 Kullanıcı Deneyimi

### 1. **Hızlı İşlemler**
- Tek tıkla randevu oluşturma
- Hızlı arama
- Otomatik tamamlama

### 2. **Görsel Geri Bildirim**
- Loading animasyonları
- Başarı/hata mesajları
- Hover efektleri

### 3. **Sezgisel Navigasyon**
- Breadcrumb navigasyonu
- Hızlı erişim butonları
- Tutarlı tasarım dili

## 🧪 Test Senaryoları

### 1. **Kimlik Doğrulama Testleri**
- Giriş yapma
- Çıkış yapma
- Oturum kontrolü
- Salon profili oluşturma

### 2. **CRUD İşlemleri**
- Çalışan ekleme/düzenleme/silme
- Hizmet ekleme/düzenleme/silme
- Müşteri ekleme/düzenleme/silme
- Randevu oluşturma/düzenleme/silme

### 3. **Randevu Sistemi Testleri**
- Çalışan müsaitlik kontrolü
- İzin günleri kontrolü
- Çakışma kontrolü
- Hizmet bazlı filtreleme

### 4. **Arama ve Filtreleme**
- Müşteri arama
- Çalışan arama
- Tarih filtreleme
- Durum filtreleme

## 📈 Performans

### 1. **Optimizasyonlar**
- Lazy loading
- Image optimization
- Code splitting
- Caching stratejileri

### 2. **Database Optimizasyonu**
- İndeksler
- Query optimizasyonu
- Connection pooling

## 🔄 Gelecek Özellikler

### 1. **Mobil Uygulama**
- React Native uygulaması
- Push notification
- Offline çalışma

### 2. **Gelişmiş Raporlama**
- Satış raporları
- Çalışan performans analizi
- Müşteri analitikleri

### 3. **Entegrasyonlar**
- SMS/Email bildirimleri
- Ödeme sistemi
- Takvim entegrasyonu

### 4. **AI Özellikleri**
- Akıllı randevu önerileri
- Müşteri davranış analizi
- Otomatik fiyatlandırma

## 🛠️ Kurulum ve Deployment

### 1. **Geliştirme Ortamı**
```bash
# Repository klonlama
git clone [repository-url]
cd salon-yonetim-sistemi

# Bağımlılıkları yükleme
npm install

# Environment değişkenleri
cp .env.example .env.local

# Geliştirme sunucusu
npm run dev
```

### 2. **Production Deployment**
```bash
# Build
npm run build

# Deploy (Vercel)
vercel --prod
```

### 3. **Database Setup**
- Supabase projesi oluşturma
- SQL scriptlerini çalıştırma
- RLS politikalarını ayarlama

## 📝 Dokümantasyon

### 1. **API Dokümantasyonu**
- Supabase client fonksiyonları
- Database şeması
- RLS politikaları

### 2. **Kullanıcı Kılavuzu**
- Sistem kullanımı
- Özellik açıklamaları
- Sık sorulan sorular

### 3. **Geliştirici Kılavuzu**
- Kod yapısı
- Katkı rehberi
- Test stratejileri

## 🎯 Başarı Kriterleri

### 1. **Fonksiyonel Gereksinimler**
- ✅ Tüm CRUD işlemleri çalışıyor
- ✅ Randevu sistemi aktif
- ✅ Çalışan yönetimi tamamlandı
- ✅ Müşteri yönetimi aktif

### 2. **Performans Kriterleri**
- ✅ Sayfa yükleme süresi < 2 saniye
- ✅ Responsive tasarım
- ✅ Cross-browser uyumluluk

### 3. **Güvenlik Kriterleri**
- ✅ RLS politikaları aktif
- ✅ Authentication sistemi
- ✅ Data validation

## 📞 İletişim

**Geliştirici:** [Geliştirici Adı]  
**Email:** [Email Adresi]  
**GitHub:** [GitHub Profili]

---

*Bu doküman salon yönetim sisteminin tam özelliklerini ve teknik detaylarını içermektedir. Güncellemeler ve değişiklikler için lütfen iletişime geçin.*
