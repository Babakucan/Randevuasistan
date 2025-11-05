# 🏪 Randevu Asistan - Salon Yönetim Sistemi (V2)

Modern salon işletmelerinin günlük operasyonlarını dijitalleştirmek için geliştirilmiş kapsamlı web uygulaması.

**🎉 V2.0.0 - Yeni Mimari:** Express.js + Prisma + PostgreSQL ile tamamen yeniden yapılandırıldı!

## ✨ Özellikler

### 🔐 Kimlik Doğrulama
- Email/şifre ile güvenli giriş
- JWT token tabanlı authentication
- Multi-tenant salon desteği

### 👥 Çalışan Yönetimi
- Çalışan ekleme, düzenleme, silme
- İzin günleri takibi
- Çalışma saatleri yönetimi
- Hizmet atama sistemi
- Deneyim ve uzmanlık alanları
- **Performans takibi** (randevu sayısı, kazanç istatistikleri)

### 🎯 Hizmet Yönetimi
- Hizmet ekleme, düzenleme, silme
- Fiyat ve süre belirleme
- Kategori sistemi
- Aktif/pasif durumu
- **Performans takibi** (randevu sayısı, kazanç istatistikleri)

### 👤 Müşteri Yönetimi
- Müşteri ekleme, düzenleme, silme
- İletişim bilgileri
- Müşteri notları
- Arama ve filtreleme
- **Aktif/Pasif gösterimi** (randevu geçmişine göre)
- **Randevu detayları** (son randevu, aktif randevu sayısı)

### 📅 Akıllı Randevu Sistemi
- Otomatik çalışan önerisi
- Çalışan müsaitlik kontrolü
- **Hizmet bazlı çalışan filtreleme** (sadece hizmeti veren çalışanlar)
- İzin günleri kontrolü
- Çalışma saatleri kontrolü
- Randevu düzenleme/silme
- Otomatik bitiş saati hesaplama

### 🏢 Multi-Tenant Salon Yönetimi
- **Birden fazla salon profili** (bir kullanıcı birden fazla salon)
- Salon ekleme, düzenleme, silme
- Aktif salon seçimi
- Salon bazlı veri izolasyonu

### 🤖 AI Entegrasyonu (Gelecek)
- OpenAI API entegrasyonu (VPS üzerinde)
- Otomatik müşteri yanıtları
- Randevu önerileri
- Sentiment analizi
- Conversation analytics

### 🔍 Arama ve Filtreleme
- Tüm listelerde arama
- Tarih bazlı filtreleme
- Durum bazlı filtreleme

## 🛠️ Teknoloji Stack

### Frontend
- **Next.js 15** - React framework (App Router)
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Styling
- **Lucide React** - İkonlar
- **Custom API Client** - REST API entegrasyonu

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js 4.18+** - Web framework
- **TypeScript 5.3+** - Backend tip güvenliği
- **Prisma 5.7+** - Modern ORM
- **PostgreSQL** - İlişkisel veritabanı
- **JWT** - Token-based authentication
- **Zod** - Schema validation
- **bcryptjs** - Password hashing

### Security
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting
- **JWT** - Secure authentication

### Deployment
- **VPS** - Production hosting
- **PM2** - Process manager
- **Nginx** - Reverse proxy
- **Let's Encrypt** - SSL/HTTPS

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ (LTS önerilir)
- npm veya yarn
- PostgreSQL 14+
- OpenAI API key (opsiyonel, gelecekte)

### 1. Repository Klonlama
```bash
git clone https://github.com/Babakucan/Randevuasistan.git
cd Randevuasistan
```

### 2. Frontend Kurulumu
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### 3. Backend Kurulumu
```bash
cd backend
npm install
cp env.example .env
npm run dev
```

### 4. Database Kurulumu

#### PostgreSQL ile Docker (Önerilen)
```bash
docker run --name postgres-randevuasistan \
  -e POSTGRES_USER=randevuasistan \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=randevuasistan_db \
  -p 5432:5432 \
  -d postgres:15
```

#### PostgreSQL Manuel Kurulum
```bash
# PostgreSQL kurulumu (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib -y

# Database ve kullanıcı oluşturma
sudo -u postgres psql
CREATE USER randevuasistan WITH PASSWORD 'your_password';
CREATE DATABASE randevuasistan_db OWNER randevuasistan;
\q
```

### 5. Prisma Database Setup
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 6. Environment Değişkenleri

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend (.env):**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://randevuasistan:your_password@localhost:5432/randevuasistan_db?schema=public"
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key_here
```

## 📊 Veritabanı Şeması

### Ana Modeller (Prisma)
- `User` - Kullanıcı hesapları
- `SalonProfile` - Salon profilleri (multi-tenant)
- `Employee` - Çalışan bilgileri
- `Service` - Hizmet bilgileri
- `Customer` - Müşteri bilgileri
- `Appointment` - Randevu bilgileri
- `EmployeeService` - Çalışan-hizmet ilişkileri
- `AIConversation` - AI konuşma geçmişi (gelecek)
- `CallHistory` - Arama geçmişi (gelecek)
- `CallRecording` - Arama kayıtları (gelecek)
- `ConversationAnalytic` - Konuşma analitikleri (gelecek)
- `SalonSetting` - Salon ayarları (gelecek)

Detaylı şema için [ARCHITECTURE.md](./ARCHITECTURE.md) dosyasına bakın.

## 🎨 Kullanıcı Arayüzü

### Tasarım Prensipleri
- **Renk Paleti:** Gri ve siyah tonları (gradient)
- **Responsive:** Mobil uyumlu tasarım
- **UX:** Sezgisel navigasyon
- **Glassmorphism:** Modern görsel efektler

### Sayfa Yapısı
- **Dashboard** - Genel bakış ve istatistikler (salon seçici ile)
- **Salonlar** - Salon yönetimi (CRUD)
- **Çalışanlar** - Çalışan yönetimi (performans takibi ile)
- **Hizmetler** - Hizmet yönetimi (performans takibi ile)
- **Müşteriler** - Müşteri yönetimi (aktif/pasif gösterimi ile)
- **Randevular** - Randevu yönetimi
- **Phone Calls** - Arama yönetimi (migration gerekli)
- **WhatsApp** - WhatsApp yönetimi (migration gerekli)

## 🔒 Güvenlik

### Authentication & Authorization
- **JWT token** tabanlı kimlik doğrulama
- **Password hashing** (bcryptjs)
- **Token expiration** (7 gün)
- **Salon bazlı veri izolasyonu** (multi-tenant)
- Kullanıcı sadece kendi salonlarına erişebilir

### API Security
- **CORS** koruması
- **Rate limiting** (express-rate-limit)
- **Helmet** security headers
- **Input validation** (Zod schema validation)
- **SQL injection** koruması (Prisma ORM ile otomatik)

## 📱 Responsive Tasarım

Uygulama tüm cihazlarda mükemmel çalışır:
- 📱 Mobil telefonlar
- 📱 Tabletler
- 💻 Desktop bilgisayarlar

## 🧪 Test

### Manuel Test Senaryoları
1. **Kimlik Doğrulama**
   - Giriş yapma
   - Çıkış yapma
   - Salon profili oluşturma

2. **CRUD İşlemleri**
   - Çalışan ekleme/düzenleme/silme
   - Hizmet ekleme/düzenleme/silme
   - Müşteri ekleme/düzenleme/silme
   - Randevu oluşturma/düzenleme/silme

3. **AI ve Otomasyon**
   - AI konuşma işleme
   - n8n workflow testleri
   - Webhook entegrasyonları

## 🚀 Deployment

Detaylı deployment rehberi için [DEPLOYMENT.md](./DEPLOYMENT.md) dosyasına bakın.

### VPS Deployment (Önerilen)

#### Sunucu Gereksinimleri
- Ubuntu 20.04+ / Debian 11+
- 2+ vCPU, 4+ GB RAM
- PostgreSQL 14+

#### Hızlı Kurulum
```bash
# 1. Proje klonlama
git clone https://github.com/Babakucan/Randevuasistan.git
cd Randevuasistan

# 2. Backend kurulumu
cd backend
npm install
npm run build
pm2 start dist/index.js --name randevuasistan-backend

# 3. Frontend kurulumu
cd ../frontend
npm install
npm run build
pm2 start npm --name randevuasistan-frontend -- start

# 4. Nginx reverse proxy kurulumu
# (Detaylar için DEPLOYMENT.md'ye bakın)

# 5. SSL kurulumu
sudo certbot --nginx -d yourdomain.com
```

### Environment Variables
Production'da şu environment variables'ları ayarlayın:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Güçlü JWT secret key
- `CORS_ORIGIN` - Production domain
- `OPENAI_API_KEY` - (Gelecekte kullanılacak)

## 📈 Performans

### Optimizasyonlar
- Lazy loading
- Image optimization
- Code splitting
- Caching stratejileri
- Rate limiting

### Database Optimizasyonu
- İndeksler
- Query optimizasyonu
- Connection pooling

## 📚 Dokümantasyon

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Mimari detayları ve teknik bilgiler
- **[V2_ROADMAP.md](./V2_ROADMAP.md)** - Yol haritası ve gelecek planları
- **[CHANGELOG.md](./CHANGELOG.md)** - Versiyon geçmişi ve değişiklikler
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - VPS deployment rehberi

## 🔄 Gelecek Özellikler

Detaylı planlar için [V2_ROADMAP.md](./V2_ROADMAP.md) dosyasına bakın.

### V2.1.0 (Planlanan)
- 🧹 Kod temizliği ve optimizasyon
- 🐛 Bug fix'ler
- 📝 Dokümantasyon iyileştirmeleri

### V2.2.0 (Planlanan)
- 🤖 AI entegrasyonları (VPS üzerinde)
- 📞 Call management
- 🔔 Notification system

### V3.0.0 (Gelecek)
- 📱 Mobil uygulama (React Native)
- 📊 Gelişmiş raporlama
- 💳 Ödeme sistemi entegrasyonu
- ⚡ Performance optimizasyonları

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](./LICENSE) dosyasına bakın.

## 📞 İletişim

**Geliştirici:** Anıl Yazıcı  
**Email:** Anilyazici1238@gmail.com  
**GitHub:** [GitHub Profili]

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - React framework
- [Express.js](https://expressjs.com/) - Web framework
- [Prisma](https://www.prisma.io/) - Modern ORM
- [PostgreSQL](https://www.postgresql.org/) - Veritabanı
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Lucide](https://lucide.dev) - İkonlar
- [TypeScript](https://www.typescriptlang.org/) - Tip güvenliği

---

## 📦 Versiyonlar

- **V2.0.0** - Yeni mimari (Express.js + Prisma + PostgreSQL) ✅
- **V2.1.0** - Temizlik ve optimizasyon (Planlanan) 🔄
- **V2.2.0** - AI entegrasyonları (Planlanan) 📋

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
