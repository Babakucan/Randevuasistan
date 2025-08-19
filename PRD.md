# Salon Yönetim Sistemi - Product Requirements Document (PRD)

## 📋 Proje Özeti

**Proje Adı:** Sevim Kuaför Salon Yönetim Sistemi  
**Versiyon:** 1.0  
**Tarih:** 2024  
**Durum:** Geliştirme Aşamasında 🔄

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
- **Framework:** Node.js + Express.js
- **Dil:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth + JWT
- **API:** RESTful API
- **Security:** Row Level Security (RLS)
- **AI Integration:** OpenAI API
- **Automation:** n8n Integration

### Hosting & Deployment
- **Frontend:** Vercel (önerilen)
- **Backend:** Railway/Heroku/Vercel
- **Database:** Supabase Cloud
- **Automation:** n8n Cloud/Self-hosted

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
- start_time (TIMESTAMP)
- end_time (TIMESTAMP)
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

#### 7. `ai_conversations`
```sql
- id (UUID, Primary Key)
- salon_id (UUID, Foreign Key)
- customer_phone (VARCHAR)
- platform (VARCHAR)
- status (VARCHAR)
- conversation_data (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 8. `notifications`
```sql
- id (UUID, Primary Key)
- salon_id (UUID, Foreign Key)
- type (VARCHAR)
- title (VARCHAR)
- message (TEXT)
- is_read (BOOLEAN)
- created_at (TIMESTAMP)
```

## 🎨 Kullanıcı Arayüzü

### Tasarım Prensipleri
- **Renk Paleti:** Siyah-gri gradient arka plan (from-gray-900 via-gray-800 to-black)
- **Kart Tasarımı:** Yarı şeffaf gri arka planlar (bg-gray-800/50) glassmorphism
- **İkonlar:** Soft renk tonları (text-gray-300/400)
- **Tipografi:** Modern, okunabilir fontlar
- **Responsive:** Mobil uyumlu tasarım
- **UX:** Sezgisel navigasyon ve hızlı işlemler

### Sayfa Yapısı

#### 1. **Dashboard** (`/dashboard`) ✅
- Salon genel bakış
- Günlük randevular
- Hızlı istatistikler (5 kart)
- Hızlı işlemler menüsü
- Son aktiviteler
- Sistem durumu
- Navigasyon menüsü

#### 2. **Çalışan Yönetimi** (`/employees`) ✅
- Çalışan listesi (grid görünümü)
- Çalışan ekleme (`/employees/new`)
- Çalışan düzenleme (`/employees/[id]/edit`)
- Çalışan detayları (`/employees/[id]`)
- Bugünkü randevu sayısı
- Bugünkü kazanç bilgisi
- Randevu görüntüleme modalı

#### 3. **Hizmet Yönetimi** (`/services`) ✅
- Hizmet listesi (grid görünümü)
- Hizmet ekleme (`/services/new`)
- Hizmet düzenleme (`/services/[id]/edit`)
- Hizmet detayları (`/services/[id]`)

#### 4. **Müşteri Yönetimi** (`/customers`) ✅
- Müşteri listesi (tablo görünümü)
- Müşteri ekleme (`/customers/new`)
- Müşteri düzenleme (`/customers/[id]/edit`)
- Müşteri detayları (`/customers/[id]`)

#### 5. **Randevu Yönetimi** (`/appointments`) ✅
- Randevu listesi (tablo görünümü)
- Randevu oluşturma (`/appointments/new`)
- Randevu düzenleme (`/appointments/[id]/edit`)
- Randevu detayları (`/appointments/[id]`)
- Durum değiştirme dropdown'u
- Sayfalama sistemi

#### 6. **Telefon Aramaları** (`/phone-calls`) ✅
- Arama listesi (tablo görünümü)
- Arama detayları (`/phone-calls/[id]`)

#### 7. **WhatsApp Mesajları** (`/whatsapp`) ✅
- Mesaj listesi (tablo görünümü)
- Mesaj detayları (`/whatsapp/[id]`)

#### 8. **AI Konuşmaları** (`/ai-conversations`) 🔄
- AI konuşma geçmişi
- Konuşma analizi
- Sentiment analizi

#### 9. **Bildirimler** (`/notifications`) 🔄
- Sistem bildirimleri
- Randevu hatırlatıcıları
- Okunmamış bildirim sayısı

## 🔧 Temel Özellikler

### 1. **Kimlik Doğrulama** ✅
- Email/şifre ile giriş
- Otomatik salon profili oluşturma
- Güvenli oturum yönetimi
- Otomatik yönlendirme

### 2. **Çalışan Yönetimi** ✅
- Çalışan ekleme/düzenleme/silme
- Uzmanlık alanları
- İletişim bilgileri
- Biyografi
- Bugünkü performans takibi

### 3. **Hizmet Yönetimi** ✅
- Hizmet ekleme/düzenleme/silme
- Fiyat ve süre belirleme
- Açıklama sistemi
- Aktif/pasif durumu

### 4. **Müşteri Yönetimi** ✅
- Müşteri ekleme/düzenleme/silme
- İletişim bilgileri
- Müşteri notları
- Arama ve filtreleme

### 5. **Randevu Sistemi** ✅
- Randevu oluşturma
- Randevu düzenleme/silme
- Durum yönetimi (Planlandı, Tamamlandı, İptal Edildi)
- Müşteri, çalışan ve hizmet ilişkilendirme
- Notlar sistemi

### 6. **Arama ve Filtreleme** ✅
- Tüm listelerde arama
- Gerçek zamanlı filtreleme
- Sayfalama sistemi

### 7. **AI Entegrasyonu** 🔄
- OpenAI API entegrasyonu
- Otomatik müşteri yanıtları
- Randevu önerileri
- Sentiment analizi

### 8. **Bildirim Sistemi** 🔄
- Otomatik randevu hatırlatıcıları
- Sistem bildirimleri
- Email/SMS entegrasyonu (gelecek)

## 🚀 Gelişmiş Özellikler

### 1. **Modern UI/UX Tasarım** ✅
- Glassmorphism efektleri
- Soft renk paleti
- Responsive tasarım
- Hover animasyonları
- Loading states

### 2. **Dashboard İstatistikleri** ✅
- Toplam randevu sayısı
- Toplam müşteri sayısı
- Telefon arama sayısı
- WhatsApp mesaj sayısı
- Çalışan sayısı
- Haftalık randevu grafiği
- Hizmet dağılımı grafiği
- Bu hafta randevu sayısı
- Bu ay kazanç toplamı

### 3. **Çalışan Performans Takibi** ✅
- Bugünkü randevu sayısı
- Bugünkü kazanç hesaplama
- Randevu geçmişi görüntüleme

### 4. **Responsive Tasarım** ✅
- Mobil uyumlu arayüz
- Tablet optimizasyonu
- Desktop deneyimi
- Grid ve tablo görünümleri

### 5. **Gelişmiş Dashboard Özellikleri** ✅
- Hızlı randevu oluşturma modalı
- Gerçek zamanlı istatistikler
- Tıklanabilir kartlar
- Profil menüsü
- Son aktiviteler (tüm tablolardan)
- Müşteri geçmişi görünümü

### 6. **n8n Otomasyon Entegrasyonu** 🔄
- Workflow otomasyonları
- Webhook entegrasyonları
- Otomatik randevu hatırlatıcıları
- Müşteri takip otomasyonları
- Raporlama otomasyonları

## 🔒 Güvenlik

### 1. **Row Level Security (RLS)** ✅
- Salon bazlı veri izolasyonu
- Kullanıcı bazlı erişim kontrolü
- Güvenli veri paylaşımı

### 2. **Authentication** ✅
- Supabase Auth entegrasyonu
- Güvenli oturum yönetimi
- Otomatik yönlendirme

### 3. **Data Validation** ✅
- Form validasyonu
- Veri bütünlüğü kontrolü
- SQL injection koruması

## 📱 Kullanıcı Deneyimi

### 1. **Hızlı İşlemler** ✅
- Tek tıkla sayfa geçişleri
- Hızlı arama
- Modal pencereler
- Hızlı randevu oluşturma
- Tıklanabilir dashboard kartları

### 2. **Görsel Geri Bildirim** ✅
- Loading animasyonları
- Başarı/hata mesajları
- Hover efektleri
- Scale animasyonları

### 3. **Sezgisel Navigasyon** ✅
- Breadcrumb navigasyonu
- Hızlı erişim butonları
- Tutarlı tasarım dili
- Geri dönüş butonları
- Profil menüsü ile kolay navigasyon

## 🧪 Test Senaryoları

### 1. **Kimlik Doğrulama Testleri** ✅
- Giriş yapma
- Çıkış yapma
- Oturum kontrolü
- Salon profili oluşturma

### 2. **CRUD İşlemleri** ✅
- Çalışan ekleme/düzenleme/silme
- Hizmet ekleme/düzenleme/silme
- Müşteri ekleme/düzenleme/silme
- Randevu oluşturma/düzenleme/silme

### 3. **Randevu Sistemi Testleri** ✅
- Randevu oluşturma
- Durum değiştirme
- Müşteri, çalışan ve hizmet ilişkilendirme

### 4. **Arama ve Filtreleme** ✅
- Müşteri arama
- Çalışan arama
- Hizmet arama
- Randevu arama

### 5. **AI ve Otomasyon Testleri** 🔄
- AI konuşma işleme
- n8n workflow testleri
- Webhook entegrasyonları

## 📈 Performans

### 1. **Optimizasyonlar** ✅
- Lazy loading
- Image optimization
- Code splitting
- Caching stratejileri

### 2. **Database Optimizasyonu** ✅
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

### 3. **Entegrasyonlar** 🔄
- SMS/Email bildirimleri
- Ödeme sistemi
- Takvim entegrasyonu
- WhatsApp Business API
- Twilio entegrasyonu

### 4. **AI Özellikleri** 🔄
- Akıllı randevu önerileri
- Müşteri davranış analizi
- Otomatik fiyatlandırma
- Sentiment analizi
- Otomatik müşteri yanıtları

### 5. **n8n Otomasyonları** 🔄
- Otomatik randevu hatırlatıcıları
- Müşteri takip otomasyonları
- Raporlama otomasyonları
- Sosyal medya entegrasyonları
- CRM entegrasyonları

## 🛠️ Kurulum ve Deployment

### 1. **Frontend Geliştirme Ortamı**
```bash
# Repository klonlama
git clone [repository-url]
cd salon-yonetim-sistemi/frontend

# Bağımlılıkları yükleme
npm install

# Environment değişkenleri
cp .env.example .env.local

# Geliştirme sunucusu
npm run dev
```

### 2. **Backend Geliştirme Ortamı**
```bash
cd backend

# Bağımlılıkları yükleme
npm install

# Environment değişkenleri
cp .env.example .env

# Geliştirme sunucusu
npm run dev
```

### 3. **n8n Kurulumu**
```bash
# Global kurulum
npm install -g n8n

# n8n başlatma
n8n start
```

### 4. **Production Deployment**
```bash
# Frontend Build
cd frontend
npm run build

# Backend Build
cd backend
npm run build

# Deploy (Vercel/Railway)
vercel --prod
railway up
```

### 5. **Database Setup**
- Supabase projesi oluşturma
- SQL scriptlerini çalıştırma
- RLS politikalarını ayarlama
- AI ve notification tablolarını oluşturma

## 📝 Dokümantasyon

### 1. **API Dokümantasyonu** ✅
- Backend REST API dokümantasyonu
- Supabase client fonksiyonları
- Database şeması
- RLS politikaları
- n8n entegrasyon rehberi

### 2. **Kullanıcı Kılavuzu** ✅
- Sistem kullanımı
- Özellik açıklamaları
- Sık sorulan sorular
- n8n workflow kullanımı
- AI özellikleri rehberi

### 3. **Geliştirici Kılavuzu** ✅
- Kod yapısı
- Katkı rehberi
- Test stratejileri
- Backend API geliştirme
- n8n workflow geliştirme

## 🎯 Başarı Kriterleri

### 1. **Fonksiyonel Gereksinimler** ✅
- ✅ Tüm CRUD işlemleri çalışıyor
- ✅ Randevu sistemi aktif
- ✅ Çalışan yönetimi tamamlandı
- ✅ Müşteri yönetimi aktif
- ✅ Hizmet yönetimi aktif
- ✅ Dashboard istatistikleri çalışıyor
- 🔄 Backend API geliştirildi
- 🔄 AI entegrasyonu hazır
- 🔄 n8n kurulumu tamamlandı

### 2. **Performans Kriterleri** ✅
- ✅ Sayfa yükleme süresi < 2 saniye
- ✅ Responsive tasarım
- ✅ Cross-browser uyumluluk

### 3. **Güvenlik Kriterleri** ✅
- ✅ RLS politikaları aktif
- ✅ Authentication sistemi
- ✅ Data validation

### 4. **UI/UX Kriterleri** ✅
- ✅ Modern glassmorphism tasarım
- ✅ Soft renk paleti
- ✅ Tutarlı ikonlar ve yazı tipleri
- ✅ Hover ve animasyon efektleri
- ✅ Mobil uyumlu tasarım

### 5. **Teknik Kriterleri** 🔄
- 🔄 Backend API performansı
- 🔄 AI entegrasyonu testleri
- 🔄 n8n workflow testleri
- 🔄 Güvenlik testleri

## 📞 İletişim

**Geliştirici:** [Anıl Yazıcı]  
**Email:** [Anilyazici1238@gmail.com]  
**GitHub:** [GitHub Profili]

---

*Bu doküman Sevim Kuaför Salon Yönetim Sistemi'nin tam özelliklerini ve teknik detaylarını içermektedir. Güncellemeler ve değişiklikler için lütfen iletişime geçin.*
