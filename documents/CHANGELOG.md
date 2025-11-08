# 📝 Changelog - Randevu Asistan

Tüm önemli değişiklikler bu dosyada dokümante edilmiştir.

Format [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/) standardına göre,
ve bu proje [Semantic Versioning](https://semver.org/lang/tr/) kullanır.

## [2.1.1] - 2025-11-07 - Dokümantasyon Senkronizasyonu

### 📝 Dokümantasyon
- README güncellendi: mevcut özellikler, kuruluma dair komutlar ve multi-tenant akışı yeniden yazıldı
- `documents/ARCHITECTURE.md` mevcut katmanlar, modüller ve veri akışına göre yenilendi
- `documents/API.md` Express uçlarının gerçek URL'leri, istek/gövde örnekleri ve dashboard yanıtlarıyla güncellendi
- `documents/DEPLOYMENT.md`, `DEPLOYMENT_INSTRUCTIONS.md`, `VPS_DEPLOYMENT_CHECKLIST.md` üretim ortamı için güncel komutlar, `.env` örnekleri ve güvenlik notlarıyla senkronize edildi
- AI, rate limit ve çağrı yönetimi gibi henüz aktif olmayan özellikler "gelecek" olarak işaretlendi

### 🛠️ Bakım
- Rate limit ortam değişkeni örnekleri kaldırıldı (özellik henüz etkin olmadığından)
- Deployment scriptlerinin manuel inceleme/güncelleme adımları eklendi

---

## [2.1.0] - 2025-11-06 - Temizlik ve Optimizasyon

### 🧹 Temizlik
- ✅ **Gereksiz dosyalar temizlendi**: SQL dosyaları, backup dosyaları ve eski Supabase referansları `.gitignore` ile yönetiliyor
- ✅ **Kod temizliği**: Eski Supabase referansları kod dosyalarından kaldırıldı (sadece dokümantasyonda referanslar kaldı)

### 🐛 Düzeltmeler
- ✅ **Çalışan düzenleme sayfası buton state yönetimi**: `handleSave` fonksiyonunda `finally` bloğu eklendi, buton state her durumda doğru şekilde yönetiliyor
- ✅ **Employee Service assignment endpoint**: Backend'e `POST /api/employees/:id/services` endpoint'i eklendi
  - `assignServiceToEmployee` controller fonksiyonu eklendi
  - Frontend'de `employeesApi.assignService` metodu eklendi
  - Employee edit sayfasında gerçek API entegrasyonu yapıldı
- ✅ **Phone Calls sayfası migration**: Zaten `authApi` kullanıyor, migration tamamlanmış
- ✅ **WhatsApp sayfası migration**: Zaten `authApi` kullanıyor, migration tamamlanmış

### 📝 Dokümantasyon
- ✅ ARCHITECTURE.md eklendi
- ✅ V2_ROADMAP.md eklendi
- ✅ CHANGELOG.md eklendi
- ✅ DEPLOYMENT.md eklendi
- ✅ README.md güncellendi

---

## [2.0.0] - 2024 - Yeni Mimari

### 🎉 Büyük Değişiklikler

#### Backend Yeniden Yapılandırma
- ✅ **Supabase → Express.js + Prisma**: Tamamen yeni backend mimarisi
- ✅ **JWT Authentication**: Supabase Auth yerine JWT token sistemi
- ✅ **PostgreSQL**: Standalone PostgreSQL veritabanı
- ✅ **Prisma ORM**: Type-safe database queries
- ✅ **REST API**: Custom REST API endpoints

#### Frontend Entegrasyonu
- ✅ **API Client**: Yeni backend için API client (`lib/api.ts`)
- ✅ **Authentication Migration**: Supabase Auth → JWT
- ✅ **Tüm Sayfalar Güncellendi**: Customers, Employees, Services, Appointments
- ✅ **Detail Pages Migration**: Tüm detay sayfaları yeni API'ye geçirildi

#### Multi-Tenant Özellikleri
- ✅ **Çoklu Salon Desteği**: Bir kullanıcı birden fazla salon profili oluşturabilir
- ✅ **Salon Seçici**: Dashboard'da salon değiştirme dropdown'ı
- ✅ **Salon Yönetimi**: Salon CRUD işlemleri
- ✅ **Otomatik Salon ID**: API isteklerinde otomatik salon ID ekleme

### ✨ Yeni Özellikler

#### Müşteri Yönetimi
- ✅ **Aktif/Pasif Gösterimi**: Randevu geçmişine göre aktif müşteri tespiti
- ✅ **Randevu Detayları**: Müşteri listesinde son randevu bilgileri
- ✅ **Aktif Randevu Sayısı**: Her müşteri için aktif randevu sayısı

#### Çalışan Yönetimi
- ✅ **Performans Takibi**: Çalışan bazlı performans istatistikleri
- ✅ **Çalışma Saatleri**: JSON formatında çalışma saatleri yönetimi
- ✅ **İzin Günleri**: Array formatında izin günleri yönetimi
- ✅ **Hizmet Atamaları**: Çalışan-hizmet ilişkisi

#### Hizmet Yönetimi
- ✅ **Performans Takibi**: Hizmet bazlı performans istatistikleri
- ✅ **Detaylı İstatistikler**: Hizmet kartlarında performans metrikleri
- ✅ **Performans Modal**: Detaylı performans analizi

#### Randevu Yönetimi
- ✅ **Akıllı Çalışan Filtreleme**: Seçilen hizmeti veren çalışanlar
- ✅ **Müsaitlik Kontrolü**: Çalışma saatleri ve izin günleri kontrolü
- ✅ **Otomatik End Time**: Hizmet süresine göre bitiş saati hesaplama

### 🔧 Teknik İyileştirmeler

#### Backend
- ✅ **Error Handling**: Merkezi hata yönetimi middleware
- ✅ **Validation**: Zod schema validation
- ✅ **Type Safety**: Full TypeScript desteği
- ✅ **Security**: JWT, bcrypt, helmet, CORS, rate limiting
- ✅ **Database**: Prisma migrations ve type-safe queries

#### Frontend
- ✅ **Type Safety**: TypeScript ile tip güvenliği
- ✅ **Error Handling**: API hatalarının kullanıcı dostu gösterimi
- ✅ **Loading States**: Tüm sayfalarda loading state yönetimi
- ✅ **Form Validation**: Client-side ve server-side validation

### 📁 Dosya Yapısı

#### Yeni Dosyalar
- `backend/` - Yeni Express.js backend
- `backend/src/` - Backend kaynak kodları
- `backend/prisma/schema.prisma` - Prisma schema
- `frontend/lib/api.ts` - API client
- `ARCHITECTURE.md` - Mimari dokümantasyonu
- `V2_ROADMAP.md` - Yol haritası
- `CHANGELOG.md` - Bu dosya

#### Silinen Dosyalar
- `lib/supabase.ts` - Eski Supabase client
- Eski Supabase referansları frontend'den kaldırıldı

### 🐛 Bilinen Sorunlar

#### Çözülen Sorunlar
- ✅ **Çalışan Düzenleme Butonu**: Buton state yönetimi düzeltildi (V2.1.0)
- ✅ **Employee Service Assignment**: Backend endpoint'i eklendi ve frontend'de entegre edildi (V2.1.0)
- ✅ **Phone Calls Sayfası**: Migration tamamlandı (V2.0.0)
- ✅ **WhatsApp Sayfası**: Migration tamamlandı (V2.0.0)

### 📊 İstatistikler

- **Backend Routes**: 7 ana route grubu (auth, customers, employees, services, appointments, dashboard, salons)
- **API Endpoints**: 30+ endpoint
- **Database Models**: 12 Prisma model
- **Frontend Pages**: 15+ sayfa güncellendi
- **Migration Dosyaları**: 0 (Prisma db push kullanıldı)

---

## [1.0.0] - Eski Versiyon - Supabase Tabanlı

### Özellikler
- Supabase Auth
- Supabase Database
- Supabase REST API
- Tek salon profili
- Temel CRUD işlemleri

---

## Gelecek Versiyonlar

### [2.2.0] - Planlanan
- AI entegrasyonları
- Call management
- Notification system

### [3.0.0] - Planlanan
- Production optimizasyonları
- Monitoring & logging
- Performance improvements
- Mobile app

---

**Not:** Bu changelog otomatik güncellenmez. Her versiyon için manuel olarak güncellenmelidir.

**Son Güncelleme:** V2.1.1  
**Sonraki Versiyon:** V2.2.0

