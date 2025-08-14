# 🏪 Salon Yönetim Sistemi

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
- **Supabase** - Backend as a Service
- **PostgreSQL** - Veritabanı
- **Row Level Security (RLS)** - Güvenlik

### Deployment
- **Vercel** - Frontend hosting
- **Supabase Cloud** - Backend hosting

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Supabase hesabı

### 1. Repository Klonlama
```bash
git clone https://github.com/kullaniciadi/salon-yonetim-sistemi.git
cd salon-yonetim-sistemi
```

### 2. Bağımlılıkları Yükleme
```bash
npm install
# veya
yarn install
```

### 3. Environment Değişkenleri
```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Veritabanı Kurulumu
1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. SQL Editor'de `supabase-schema.sql` dosyasını çalıştırın

### 5. Geliştirme Sunucusu
```bash
npm run dev
# veya
yarn dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacak.

## 📊 Veritabanı Şeması

### Ana Tablolar
- `salon_profiles` - Salon bilgileri
- `employees` - Çalışan bilgileri
- `services` - Hizmet bilgileri
- `customers` - Müşteri bilgileri
- `appointments` - Randevu bilgileri
- `employee_services` - Çalışan-hizmet ilişkileri

Detaylı şema için [PRD.md](./PRD.md) dosyasına bakın.

## 🎨 Kullanıcı Arayüzü

### Tasarım Prensipleri
- **Renk Paleti:** Gri ve siyah tonları (gradient)
- **Responsive:** Mobil uyumlu tasarım
- **UX:** Sezgisel navigasyon

### Sayfa Yapısı
- **Dashboard** - Genel bakış
- **Çalışanlar** - Çalışan yönetimi
- **Hizmetler** - Hizmet yönetimi
- **Müşteriler** - Müşteri yönetimi
- **Randevular** - Randevu yönetimi

## 🔒 Güvenlik

### Row Level Security (RLS)
- Salon bazlı veri izolasyonu
- Kullanıcı bazlı erişim kontrolü
- Güvenli veri paylaşımı

### Authentication
- Supabase Auth entegrasyonu
- Güvenli oturum yönetimi
- Otomatik yönlendirme

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

3. **Randevu Sistemi**
   - Çalışan müsaitlik kontrolü
   - İzin günleri kontrolü
   - Hizmet bazlı filtreleme

## 🚀 Deployment

### Vercel ile Deployment
```bash
# Build
npm run build

# Deploy
vercel --prod
```

### Environment Variables
Vercel'de şu environment variables'ları ayarlayın:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📈 Performans

### Optimizasyonlar
- Lazy loading
- Image optimization
- Code splitting
- Caching stratejileri

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
- 🤖 AI destekli özellikler

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](./LICENSE) dosyasına bakın.

## 📞 İletişim

**Geliştirici:** [Geliştirici Adı]  
**Email:** [Email Adresi]  
**GitHub:** [GitHub Profili]

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Lucide](https://lucide.dev) - İkonlar

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
