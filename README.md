# 🏪 Randevu Asistan - Salon Yönetim Sistemi

Modern salon işletmelerinin günlük operasyonlarını dijitalleştirmek için geliştirilmiş kapsamlı web uygulaması.

## ✨ Özellikler

### 🔐 Kimlik Doğrulama
- Email/şifre ile güvenli giriş
- Otomatik salon profili oluşturma
- Supabase Auth entegrasyonu

### 👥 Çalışan Yönetimi
- Çalışan ekleme, düzenleme, silme
- İzin günleri takibi
- Çalışma saatleri yönetimi
- Hizmet atama sistemi
- Deneyim ve uzmanlık alanları

### 🎯 Hizmet Yönetimi
- Hizmet ekleme, düzenleme, silme
- Fiyat ve süre belirleme
- Kategori sistemi
- Aktif/pasif durumu

### 👤 Müşteri Yönetimi
- Müşteri ekleme, düzenleme, silme
- İletişim bilgileri
- Müşteri notları
- Arama ve filtreleme

### 📅 Akıllı Randevu Sistemi
- Otomatik çalışan önerisi
- Çalışan müsaitlik kontrolü
- Hizmet bazlı çalışan filtreleme
- İzin günleri kontrolü
- Çalışma saatleri kontrolü
- Randevu düzenleme/silme

### 🤖 AI Entegrasyonu
- OpenAI API entegrasyonu
- Otomatik müşteri yanıtları
- Randevu önerileri
- Sentiment analizi

### 🔄 n8n Otomasyonları
- Workflow otomasyonları
- Webhook entegrasyonları
- Otomatik randevu hatırlatıcıları
- Müşteri takip otomasyonları

### 🔍 Arama ve Filtreleme
- Tüm listelerde arama
- Tarih bazlı filtreleme
- Durum bazlı filtreleme

## 🛠️ Teknoloji Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Styling
- **Lucide React** - İkonlar

### Backend
- **Node.js + Express.js** - REST API
- **TypeScript** - Backend tip güvenliği
- **Supabase** - Backend as a Service
- **PostgreSQL** - Veritabanı
- **Row Level Security (RLS)** - Güvenlik
- **OpenAI API** - AI entegrasyonu

### Automation
- **n8n** - Workflow otomasyonları

### Deployment
- **Vercel** - Frontend hosting
- **Railway/Heroku** - Backend hosting
- **Supabase Cloud** - Database hosting

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Supabase hesabı
- OpenAI API key (opsiyonel)
- n8n (opsiyonel)

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
cp .env.example .env
npm run dev
```

### 4. n8n Kurulumu (Opsiyonel)
```bash
npm install -g n8n
n8n start
```

### 5. Environment Değişkenleri

**Frontend (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (.env):**
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
```

### 6. Veritabanı Kurulumu
1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. SQL Editor'de `supabase-schema.sql` dosyasını çalıştırın
4. AI ve notification tablolarını oluşturun

## 📊 Veritabanı Şeması

### Ana Tablolar
- `salon_profiles` - Salon bilgileri
- `employees` - Çalışan bilgileri
- `services` - Hizmet bilgileri
- `customers` - Müşteri bilgileri
- `appointments` - Randevu bilgileri
- `employee_services` - Çalışan-hizmet ilişkileri
- `ai_conversations` - AI konuşma geçmişi
- `notifications` - Sistem bildirimleri

Detaylı şema için [PRD.md](./PRD.md) dosyasına bakın.

## 🎨 Kullanıcı Arayüzü

### Tasarım Prensipleri
- **Renk Paleti:** Gri ve siyah tonları (gradient)
- **Responsive:** Mobil uyumlu tasarım
- **UX:** Sezgisel navigasyon
- **Glassmorphism:** Modern görsel efektler

### Sayfa Yapısı
- **Dashboard** - Genel bakış ve istatistikler
- **Çalışanlar** - Çalışan yönetimi
- **Hizmetler** - Hizmet yönetimi
- **Müşteriler** - Müşteri yönetimi
- **Randevular** - Randevu yönetimi
- **AI Konuşmaları** - AI entegrasyonu
- **Bildirimler** - Sistem bildirimleri

## 🔒 Güvenlik

### Row Level Security (RLS)
- Salon bazlı veri izolasyonu
- Kullanıcı bazlı erişim kontrolü
- Güvenli veri paylaşımı

### Authentication
- Supabase Auth entegrasyonu
- JWT token sistemi
- Güvenli oturum yönetimi
- Rate limiting

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

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Railway/Heroku)
```bash
cd backend
npm run build
railway up
# veya
heroku create
git push heroku main
```

### Environment Variables
Production'da şu environment variables'ları ayarlayın:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `JWT_SECRET`

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

## 🔄 Gelecek Özellikler

### Planlanan Özellikler
- 📱 Mobil uygulama (React Native)
- 📊 Gelişmiş raporlama
- 💬 SMS/Email bildirimleri
- 💳 Ödeme sistemi entegrasyonu
- 🤖 Gelişmiş AI özellikleri
- 🔄 n8n workflow şablonları

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
- [Supabase](https://supabase.com) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Lucide](https://lucide.dev) - İkonlar
- [OpenAI](https://openai.com) - AI API
- [n8n](https://n8n.io) - Workflow automation

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
