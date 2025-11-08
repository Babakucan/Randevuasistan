# 🏪 Randevu Asistan V2

Modern kuaför ve güzellik salonlarının günlük operasyonlarını yönetmesi için geliştirilen, uçtan uca randevu ve müşteri yönetim platformu.

## ✨ Öne Çıkan Özellikler

### Kimlik Doğrulama ve Çoklu Salon Yönetimi
- E-posta/şifre ile kayıt ve giriş
- JWT tabanlı oturum yönetimi (`/auth/register`, `/auth/login`, `/auth/me`)
- Tek kullanıcı hesabı altında birden fazla salon profili
- Oturum açıldıktan sonra salon seçimi ve salon bazlı veri izolasyonu

### Salon İş Akışları
- Salon profili oluşturma, düzenleme ve silme
- Salon detayları: iletişim, çalışma saatleri, açıklama, logo
- Çalışan, müşteri, hizmet ve randevuların aynı salonla ilişkilenmesi

### Kaynak Yönetimi
- **Hizmetler:** Süre, fiyat, kategori ve aktif/pasif durumu ile CRUD
- **Çalışanlar:** İletişim bilgileri, uzmanlıklar, çalışma saatleri, izin günleri ve aktiflik durumu
- **Çalışan ↔ Hizmet** eşleştirmesi (`POST /employees/:id/services`) ile servis bazlı yetkinlik tanımı
- **Müşteriler:** İletişim bilgileri, notlar, son randevular ve hızlı arama

### Randevu ve Dashboard
- Randevu oluşturma, düzenleme, silme ve durum güncelleme
- Çalışan/hizmet ilişkileri doğrultusunda çalışan seçimi (isteğe bağlı)
- Randevu kaynağı (`manual`, `whatsapp`, `phone`, `ai`) alanları
- Dashboard üzerinden toplam randevu, müşteri, çalışan, hizmet sayıları ve gelir metrikleri
- Son 10 aktivite için birleşik zaman akışı (randevu, müşteri, çalışan, hizmet)

### İstemci Uygulaması (Next.js)
- Her ana kaynak için liste / detay / oluşturma-düzenleme sayfaları
- Hızlı işlem modalları (dashboard üzerinden müşteri, çalışan, hizmet, randevu)
- Arama, tarih filtresi ve sayfalama yetenekleri
- `frontend/app` dizininde kaynak bazlı yönlendirme (App Router)

### Yardımcı Scriptler
- `backend/scripts/seed-user-data.ts`: örnek salon, hizmet, çalışan, müşteri ve randevu seed’i
- `backend/scripts/check-salons.ts`: veritabanındaki salonların durumunu raporlar
- `backend/scripts/update-salon-name.ts`: salon adını güncellemek için örnek script
- `scripts/deploy-*.sh|ps1`: VPS dağıtımı için otomasyon komutları

### Planlanan (Henüz Üretimde Değil)
- WhatsApp & telefon görüşmesi ekranlarının gerçek veri ile entegrasyonu
- AI destekli otomatik cevap ve randevu önerileri
- Gelişmiş bildirim ve görev otomasyonları

## 🛠️ Teknoloji Yığını

| Katman | Teknolojiler |
| --- | --- |
| Frontend | Next.js 15, React 18, TypeScript, Tailwind CSS, Lucide Icons |
| Backend | Node.js 18+, Express 4, TypeScript, Prisma ORM, Zod, bcryptjs |
| Veritabanı | PostgreSQL 14+ |
| Güvenlik | Helmet, CORS, JWT, rate limiting (opsiyonel) |
| Paylaşılan | `shared/` içinde Zod tabanlı tip tanımları |
| DevOps | PM2, Nginx, Docker (PostgreSQL için önerilen), deploy scriptleri |

## 📁 Depo Yapısı

```
.
├── backend/        # Express + Prisma REST API
├── frontend/       # Next.js 15 istemci uygulaması
├── shared/         # Ortak TypeScript tipleri
├── documents/      # Mimari, API ve süreç dokümantasyonu
├── scripts/        # VPS ve Hostinger dağıtım scriptleri
└── docs/           # (Boş) ek dökümanlar için yer tutucu
```

## 🚀 Hızlı Başlangıç

### 1. Gerekli Yazılımlar
- Node.js 18 veya üzeri (npm ≥ 9)
- PostgreSQL 14 veya üzeri
- Git

### 2. Depoyu Klonlayın
```bash
git clone https://github.com/Babakucan/Randevuasistan.git
cd Randevuasistan
```

### 3. Bağımlılıkları Kurun
```bash
npm install           # kök paket.json (workspaces)
cd frontend && npm install
cd ../backend && npm install
```
> Alternatif: `npm run install:all`

### 4. Ortam Dosyalarını Hazırlayın
- `frontend/.env.example` → `.env.local`
- `backend/env.example` → `.env`

Örnek değerler:
```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```
```env
# backend/.env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://randevuasistan:your_password@localhost:5432/randevuasistan_db?schema=public"
JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### 5. Veritabanını Kurun
- PostgreSQL yerel kurulum veya Docker:
  ```bash
  docker run --name postgres-randevu \
    -e POSTGRES_USER=randevuasistan \
    -e POSTGRES_PASSWORD=your_password \
    -e POSTGRES_DB=randevuasistan_db \
    -p 5432:5432 \
    -d postgres:15
  ```
- Prisma şema ve client kurulumları:
  ```bash
  cd backend
  npx prisma db push
  npx prisma generate
  # İsteğe bağlı örnek veriler
  npx ts-node scripts/seed-user-data.ts
  ```

### 6. Geliştirme Sunucularını Başlatın
- Kök dizinden aynı anda:
  ```bash
  npm run dev
  ```
- veya manuel:
  ```bash
  cd backend && npm run dev   # http://localhost:3001
  cd frontend && npm run dev  # http://localhost:3000
  ```

## 📚 Dokümantasyon Kaynakları
- `documents/ARCHITECTURE.md`: katmanlar, veri akışı, modüller
- `documents/API.md`: REST uçları, istek/yanıt sözleşmeleri
- `documents/DEPLOYMENT.md`, `DEPLOYMENT_INSTRUCTIONS.md`, `VPS_DEPLOYMENT_CHECKLIST.md`: sunucu kurulumu ve otomasyon
- `documents/PRD.md`: ürün gereksinimleri
- `documents/CHANGELOG.md`: sürüm günlüğü
- `documents/V2_ROADMAP.md`: kısa & orta vadeli yol haritası

## 🗄️ Prisma Modelleri
Prisma şemasında yer alan başlıca modeller:
- `User`, `SalonProfile`
- `Service`, `Employee`, `EmployeeService`
- `Customer`, `Appointment`
- Gelecek için ayrılmış: `AiConversation`, `CallHistory`, `CallRecording`, `ConversationAnalytic`, `SalonSetting`

Ayrıntı için `backend/prisma/schema.prisma` ve `documents/ARCHITECTURE.md` dosyalarına bakın.

## 🧪 Test ve Kalite
- Şu an otomatik test bulunmuyor; manuel senaryolar `documents/DAILY_TASKS.md` içinde listelenmiştir.
- Kod stili için:
  ```bash
  cd frontend && npm run lint
  npm run format        # kök dizinden Prettier
  ```
- TypeScript tip kontrolü:
  ```bash
  cd frontend && npm run type-check
  cd backend && npm run build   # tsc denetimleri derleme sırasında yapılır
  ```

## 🚢 Dağıtım
- PM2 ile Node.js süreç yönetimi ve Nginx reverse proxy önerilir.
- Kapsamlı yönergeler: `documents/DEPLOYMENT.md`, `VPS_DEPLOYMENT_CHECKLIST.md`, `deploy.sh`
- Hostinger entegrasyonu için örnekler: `HOSTINGER_API_GUIDE.md`, `scripts/hostinger-*.js`

## 🧭 Yol Haritası
- Kısa vade: dokümantasyon senkronizasyonu, UI temizlikleri, kalite iyileştirmeleri
- Orta vade: AI destekli senaryolar, çağrı/WhatsApp modüllerinin backend bağlantıları
- Ayrıntılı maddeler için `documents/V2_ROADMAP.md` dosyasını inceleyin

## 🤝 Katkıda Bulunma
1. Depoyu fork'layın
2. Feature branch açın (`git checkout -b feature/isim`)
3. Değişiklikleri commit'leyin (`git commit -m "Açıklama"`)
4. Branch’i push edin (`git push origin feature/isim`)
5. Pull Request oluşturun

## 📝 Lisans
Bu proje MIT lisansı altındadır. Detaylar için `LICENSE` dosyasına bakın.

## 📞 İletişim
- **Geliştirici:** Anıl Yazıcı  
- **E-posta:** anilyazici1238@gmail.com  
- **GitHub:** [GitHub Profili]

## 🙏 Teşekkürler
- [Next.js](https://nextjs.org/)
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide](https://lucide.dev)
- [TypeScript](https://www.typescriptlang.org/)

---
⭐ Projeyi beğendiyseniz GitHub’da yıldız vermeyi unutmayın!
