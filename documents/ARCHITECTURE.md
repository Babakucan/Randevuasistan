# 🏗️ Randevu Asistan Mimari Dokümantasyonu (V2)

## 1. Genel Görünüm
Randevu Asistan; Next.js tabanlı bir istemci, Express.js + Prisma ile yazılmış TypeScript backend'i ve PostgreSQL veritabanı üzerinde çalışan çok katmanlı bir web uygulamasıdır. V2 sürümüyle birlikte eski Supabase temelli yapıdan tamamen bağımsız, çoklu salon destekli bir mimariye geçilmiştir.

## 2. Yüksek Seviye Mimarisi
```
Kullanıcı → Next.js (App Router) → lib/api.ts → REST → Express API → Prisma → PostgreSQL
```
- **İstemci (frontend/):** Next.js 15, React 18, Tailwind CSS ile sayfa bazlı modüller (appointments, customers, employees, services, dashboard, salons, auth).
- **API Katmanı (backend/src):** Express yönlendirmeleri, controller tabanlı iş kuralları, JWT doğrulaması ve hata yönetimi.
- **Veri Katmanı:** Prisma Client aracılığıyla PostgreSQL; modeller `backend/prisma/schema.prisma` içinde tanımlı.

## 3. Katmanlar ve Dizink Yapısı

| Katman | Diziler | Açıklama |
| --- | --- | --- |
| Konfigürasyon | `backend/src/config/database.ts` | Prisma istemcisinin tekil örneği |
| Middleware | `backend/src/middleware/auth.ts`, `backend/src/middleware/error.ts` | JWT doğrulama, özel hata sınıfı |
| Rotalar | `backend/src/routes/*.routes.ts` | Her kaynak için REST rotaları |
| Controller | `backend/src/controllers/*.controller.ts` | İş kuralları, Zod validasyonu, Prisma çağrıları |
| Yardımcılar | `backend/src/utils/salon.ts` | Multi-tenant salon erişimi |
| Frontend API Client | `frontend/lib/api.ts` | Fetch wrapper, token yönetimi, salonId ekleme |
| Next.js Sayfaları | `frontend/app/**/page.tsx` | Kaynak bazlı UI akışları |
| Paylaşılan Tipler | `shared/types` | Zod şemaları (gelecek entegrasyonlar için) |

## 4. Backend Modülleri

- **Kimlik Doğrulama (`auth.controller.ts`):** Kayıt (`POST /auth/register`), giriş (`POST /auth/login`) ve mevcut kullanıcı (`GET /auth/me`) uçları; bcrypt ile şifreleme, JWT üretimi.
- **Salon Yönetimi (`salons.controller.ts`):** Kullanıcının salon profillerini listeleme, detaya inme, CRUD işlemleri. Multi-tenant için kullanıcı-salon eşleşmesi zorunlu.
- **Müşteri Yönetimi (`customers.controller.ts`):** Salon bazlı müşteri listesi, son randevular, CRUD. `salonId` sorgu parametresi veya varsayılan salon.
- **Çalışan Yönetimi (`employees.controller.ts`):** Çalışan detayları, çalışma saatleri ve `assignServiceToEmployee` uç noktası ile servis eşleştirme.
- **Hizmet Yönetimi (`services.controller.ts`):** Süre, fiyat, kategori ve aktiflik durumu ile CRUD.
- **Randevu Yönetimi (`appointments.controller.ts`):** Müşteri, hizmet, çalışan ilişkileri, durum geçişleri ve kaynak alanı (`source`).
- **Dashboard (`dashboard.controller.ts`):** Toplam metrikler ve son aktiviteler; salon filtreli toplulaştırmalar.
- **Middleware:** `authenticate` JWT kontrolü ve kullanıcı doğrulaması; `errorHandler` uygulama hatalarını standart biçime getirir.

## 5. Frontend Modülleri
- Her ana kaynak için ayrı Next.js sayfa dizinleri: `app/appointments`, `app/customers`, `app/employees`, `app/services`, `app/salons`, `app/dashboard`.
- `lib/api.ts`: Token saklama, otomatik logout, salon seçimi (`current_salon_id`) ve REST çağrıları.
- Dashboard hızlı aksiyon modalları ile kaynak ekleme akışları.
- Tailwind tabanlı componentler (`components/Header.tsx`, `components/Sidebar.tsx`, `components/Layout.tsx`). 

## 6. Veritabanı Modelleri (Özet)
- **User** ←→ **SalonProfile** (1:N)
- **SalonProfile** ←→ **Service**, **Employee**, **Customer**, **Appointment**
- **EmployeeService**: çalışan–hizmet çoktan çoğa ilişkisi (upsert ile atanıyor).
- **Appointment** bir müşteri, hizmet ve isteğe bağlı çalışanla ilişkilidir; `status`, `source` alanları.
- AI/çağrı ile ilgili modeller şemada yer alır ancak henüz aktif kullanılmamaktadır; ileride entegrasyon için reserved durumdadır.

Detaylı sütunlar için `backend/prisma/schema.prisma` ve `documents/API.md` dökümanlarına bakın.

## 7. Multi-Tenant Akışı
1. Kullanıcı giriş yaptığında `/auth/me` yanıtı salon profillerini içerir.
2. Frontend `localStorage` içerisindeki `current_salon_id` değerini kontrol eder; yoksa ilk salonu seçer.
3. `lib/api.ts` tüm korumalı uçlara giderken `?salonId=` parametresini ekler.
4. Backend `getUserSalonProfile()` yardımıyla kullanıcının salonu üzerinde yetkisi olup olmadığını doğrular, değilse `AppError` döner.

## 8. API Yüzeyi
- **Auth:** `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- **Salons:** `GET /salons`, `GET /salons/:id`, `POST /salons`, `PUT /salons/:id`, `DELETE /salons/:id`
- **Customers:** `GET /customers`, `GET /customers/:id`, `POST /customers`, `PUT /customers/:id`, `DELETE /customers/:id`
- **Employees:** `GET /employees`, `GET /employees/:id`, `POST /employees`, `PUT /employees/:id`, `DELETE /employees/:id`, `POST /employees/:id/services`
- **Services:** `GET /services`, `GET /services/:id`, `POST /services`, `PUT /services/:id`, `DELETE /services/:id`
- **Appointments:** `GET /appointments`, `GET /appointments/:id`, `POST /appointments`, `PUT /appointments/:id`, `DELETE /appointments/:id`
- **Dashboard:** `GET /dashboard/stats`, `GET /dashboard/activities`
> Tüm kaynak uçları `authenticate` middleware’i gerektirir ve `salonId` sorgu parametresini kabul eder (opsiyonel). 

Tam istek/yanıt şemaları `documents/API.md` içerisinde yer alır.

## 9. Veri Akışı Örneği (Randevu Oluşturma)
1. Kullanıcı Next.js formunu doldurur → `appointmentsApi.create` çağrısı
2. `lib/api.ts` token’ı ve `salonId` değerini header/URL’e ekler
3. `authenticate` middleware’i token’ı doğrular; `req.user` oluşturulur
4. `createAppointment` controller’ı Zod ile request’i doğrular ve `getUserSalonProfile` ile yetkiyi kontrol eder
5. Prisma ile `appointment` kaydı oluşturulur; ilişki alanları `include` ile döndürülür
6. Frontend gelen yanıtı listeye yansıtır veya hatayı gösterir

## 10. Güvenlik ve Observability
- Kimlik doğrulama JWT ile, şifreler bcrypt ile hash’leniyor.
- CORS ve Helmet middleware’leri aktif.
- Rate limit paketi projeye eklenmiş olmakla birlikte şu anda yapılandırılmamış; ihtiyaç halinde `backend/src/index.ts` içine eklenmelidir.
- Hatalar `errorHandler` tarafından JSON olarak döndürülür, kritik durumlar `console.error` ile loglanır (ileride merkezi loglama planlanıyor).

## 11. Dağıtım Topolojisi
- **Geliştirme:** `npm run dev` (frontend 3000, backend 3001), PostgreSQL lokal/Docker.
- **Üretim:** PM2 ile backend, `next build` ile frontend, Nginx reverse proxy, Let’s Encrypt SSL. Script örnekleri `scripts/` dizininde.
- Ortam değişkenleri `backend/.env` ve `frontend/.env.local` dosyalarında tanımlı; `documents/DEPLOYMENT.md` detayları içerir.

## 12. Yol Haritası (Teknik)
- AI, WhatsApp ve telefon entegrasyonlarının backend üzerinde hayata geçirilmesi
- Bildirim ve görev kuyruğu (ör. BullMQ) eklenmesi
- Gelişmiş log/izleme (Winston/Sentry)
- Rate limit, caching (Redis) ve arka plan işleyicilerinin etkinleştirilmesi

---
**Son Güncelleme:** Kasım 2025  
**Sürüm:** 2.0 Mimari Notları  
Sorular için `documents/API.md` veya `documents/DEPLOYMENT.md` dosyalarına başvurun.*** End Patch

