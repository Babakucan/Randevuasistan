# 🏗️ Randevu Asistan - Mimari Dokümantasyonu (V2)

## 📋 Genel Bakış

Bu dokümantasyon, Randevu Asistan projesinin **V2** versiyonunun mimarisini ve teknik detaylarını açıklar. Proje, Supabase tabanlı eski yapıdan tamamen bağımsız, modern bir Express.js + Prisma + PostgreSQL mimarisine geçirilmiştir.

## 🔄 Mimari Değişiklikleri

### Eski Yapı (V1) → Yeni Yapı (V2)

| Özellik | Eski (V1) | Yeni (V2) |
|---------|-----------|-----------|
| **Backend** | Supabase (BaaS) | Express.js + TypeScript |
| **ORM** | Supabase Client | Prisma ORM |
| **Database** | Supabase PostgreSQL | Standalone PostgreSQL |
| **Authentication** | Supabase Auth | JWT (jsonwebtoken) |
| **API** | Supabase REST | Custom REST API |
| **Multi-tenant** | Tek salon/profil | Birden fazla salon profili |
| **Deployment** | Supabase Cloud | VPS (Bağımsız) |

## 🏛️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                    (Next.js 15 + React)                      │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Dashboard│  │Customers│  │Employees│  │Services  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │Appointments│ │  Salons  │  │  Auth   │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│                                                               │
│              ┌──────────────────────┐                         │
│              │   API Client (lib)   │                         │
│              └──────────────────────┘                         │
└────────────────────────┬──────────────────────────────────────┘
                         │ HTTP/REST
                         │ JWT Token
┌────────────────────────▼──────────────────────────────────────┐
│                        BACKEND                                 │
│              (Express.js + TypeScript)                        │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                  Middleware Layer                       │  │
│  │  - Authentication (JWT)                                │  │
│  │  - Error Handling                                      │  │
│  │  - CORS                                                │  │
│  │  - Rate Limiting                                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                  Routes Layer                           │  │
│  │  /api/auth      /api/customers   /api/employees        │  │
│  │  /api/services  /api/appointments  /api/dashboard     │  │
│  │  /api/salons                                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                  Controllers Layer                      │  │
│  │  - Business Logic                                      │  │
│  │  - Validation (Zod)                                    │  │
│  │  - Response Formatting                                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                  Prisma ORM                             │  │
│  │  - Type-safe Database Queries                          │  │
│  │  - Migrations                                           │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬──────────────────────────────────────┘
                         │ PostgreSQL Connection
┌────────────────────────▼──────────────────────────────────────┐
│                    PostgreSQL Database                          │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Users   │  │  Salons  │  │Employees │  │Services │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │Customers │  │Appointments││Employee │                   │
│  │          │  │          │  │Services │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │   AI     │  │  Call    │  │  Call   │                   │
│  │Conversa..│  │ History  │  │Recording│                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└───────────────────────────────────────────────────────────────┘
```

## 🛠️ Teknik Stack Detayları

### Frontend

#### Framework & Diller
- **Next.js 15** - React framework (App Router)
- **TypeScript** - Tip güvenliği
- **React 18** - UI kütüphanesi

#### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - İkon kütüphanesi
- **Custom Gradient** - Gri-siyah ton gradient tasarımı

#### State Management
- **React Hooks** - useState, useEffect
- **LocalStorage** - Token ve salon ID yönetimi
- **Context API** - (Gelecekte eklenebilir)

#### API Integration
- **Custom API Client** (`lib/api.ts`)
  - JWT token yönetimi
  - Otomatik salon ID ekleme
  - Hata yönetimi
  - Request/Response interceptors

### Backend

#### Framework & Runtime
- **Node.js 18+** - JavaScript runtime
- **Express.js 4.18+** - Web framework
- **TypeScript 5.3+** - Tip güvenliği

#### Database & ORM
- **PostgreSQL** - İlişkisel veritabanı
- **Prisma 5.7+** - Modern ORM
  - Type-safe queries
  - Migration management
  - Database introspection

#### Authentication & Security
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting

#### Validation & Error Handling
- **Zod** - Schema validation
- **Custom Error Middleware** - Merkezi hata yönetimi

### Database Schema

#### Ana Modeller (12 Model)

1. **User** - Kullanıcı hesapları
   - JWT authentication için
   - Multi-tenant salon desteği

2. **SalonProfile** - Salon profilleri
   - Bir kullanıcı birden fazla salon
   - Salon ayarları ve bilgileri

3. **Service** - Hizmetler
   - Fiyat, süre, açıklama
   - Salon'a bağlı

4. **Employee** - Çalışanlar
   - Çalışma saatleri (JSON)
   - İzin günleri (Array)
   - Hizmet atamaları (EmployeeService)

5. **Customer** - Müşteriler
   - İletişim bilgileri
   - Randevu geçmişi

6. **Appointment** - Randevular
   - Müşteri, çalışan, hizmet ilişkisi
   - Tarih/saat bilgileri
   - Durum takibi

7. **EmployeeService** - Çalışan-Hizmet ilişkisi
   - Hangi çalışan hangi hizmeti verebilir

8. **AIConversation** - AI konuşma geçmişi
   - (Gelecekte kullanılacak)

9. **CallHistory** - Arama geçmişi
   - (Gelecekte kullanılacak)

10. **CallRecording** - Arama kayıtları
    - (Gelecekte kullanılacak)

11. **ConversationAnalytic** - Konuşma analitikleri
    - (Gelecekte kullanılacak)

12. **SalonSetting** - Salon ayarları
    - (Gelecekte kullanılacak)

## 🔐 Multi-Tenant Mimari

### Salon Yönetimi

**Özellikler:**
- Bir kullanıcı birden fazla salon profili oluşturabilir
- Aktif salon seçimi (localStorage'da saklanır)
- Her API isteğinde aktif salon ID otomatik eklenir
- Salon bazlı veri izolasyonu

**Kullanım:**
```typescript
// Frontend'de
const salonId = getCurrentSalonId(); // localStorage'dan
const endpoint = addSalonIdToEndpoint('/api/customers'); 
// → '/api/customers?salonId=xxx'

// Backend'de
const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);
// Kullanıcının salon'una erişim kontrolü
```

## 📡 API Endpoint'leri

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcı bilgisi

### Salons
- `GET /api/salons` - Salon listesi
- `GET /api/salons/:id` - Salon detayı
- `POST /api/salons` - Yeni salon oluşturma
- `PUT /api/salons/:id` - Salon güncelleme
- `DELETE /api/salons/:id` - Salon silme

### Customers
- `GET /api/customers?salonId=xxx` - Müşteri listesi
- `GET /api/customers/:id?salonId=xxx` - Müşteri detayı
- `POST /api/customers?salonId=xxx` - Yeni müşteri
- `PUT /api/customers/:id?salonId=xxx` - Müşteri güncelleme
- `DELETE /api/customers/:id?salonId=xxx` - Müşteri silme

### Employees
- `GET /api/employees?salonId=xxx` - Çalışan listesi
- `GET /api/employees/:id?salonId=xxx` - Çalışan detayı
- `POST /api/employees?salonId=xxx` - Yeni çalışan
- `PUT /api/employees/:id?salonId=xxx` - Çalışan güncelleme
- `DELETE /api/employees/:id?salonId=xxx` - Çalışan silme

### Services
- `GET /api/services?salonId=xxx` - Hizmet listesi
- `GET /api/services/:id?salonId=xxx` - Hizmet detayı
- `POST /api/services?salonId=xxx` - Yeni hizmet
- `PUT /api/services/:id?salonId=xxx` - Hizmet güncelleme
- `DELETE /api/services/:id?salonId=xxx` - Hizmet silme

### Appointments
- `GET /api/appointments?salonId=xxx` - Randevu listesi
- `GET /api/appointments/:id?salonId=xxx` - Randevu detayı
- `POST /api/appointments?salonId=xxx` - Yeni randevu
- `PUT /api/appointments/:id?salonId=xxx` - Randevu güncelleme
- `DELETE /api/appointments/:id?salonId=xxx` - Randevu silme

### Dashboard
- `GET /api/dashboard/stats?salonId=xxx` - İstatistikler
- `GET /api/dashboard/recent-activities?salonId=xxx` - Son aktiviteler

## 🔄 Veri Akışı

### Örnek: Randevu Oluşturma

```
1. Frontend: Kullanıcı form doldurur
   ↓
2. Frontend: API Client (lib/api.ts)
   - JWT token ekler
   - Salon ID ekler (addSalonIdToEndpoint)
   ↓
3. Backend: Middleware (auth.ts)
   - Token doğrular
   - User bilgisini req.user'a ekler
   ↓
4. Backend: Controller (appointments.controller.ts)
   - Validasyon (Zod)
   - Salon erişim kontrolü (getUserSalonProfile)
   - Veritabanı işlemi (Prisma)
   ↓
5. Database: PostgreSQL
   - Randevu kaydı oluşturulur
   ↓
6. Backend: Response
   - Başarılı/hatalı response döner
   ↓
7. Frontend: UI Güncelleme
   - Başarılı: Randevu listesine yönlendir
   - Hatalı: Hata mesajı göster
```

## 🔒 Güvenlik Özellikleri

### Authentication
- JWT token tabanlı kimlik doğrulama
- Token expiration (7 gün varsayılan)
- Password hashing (bcryptjs)

### Authorization
- Salon bazlı veri erişim kontrolü
- Kullanıcı sadece kendi salonlarına erişebilir
- Multi-tenant izolasyon

### API Security
- CORS koruması
- Rate limiting
- Helmet security headers
- Input validation (Zod)

## 📊 Performans Özellikleri

### Frontend
- Next.js 15 App Router optimizasyonları
- Client-side state management
- Lazy loading
- Code splitting

### Backend
- Prisma connection pooling
- Efficient database queries
- Error handling ve logging
- Request validation

### Database
- Indexed queries
- Foreign key constraints
- Cascade delete operations

## 🚀 Deployment Yapısı

### Geliştirme Ortamı
- Frontend: `localhost:3000`
- Backend: `localhost:3001`
- Database: PostgreSQL (Docker veya local)

### Production Ortamı (VPS)
- Frontend: Next.js production build
- Backend: Express.js + PM2
- Database: PostgreSQL (aynı VPS veya ayrı)
- Reverse Proxy: Nginx
- SSL: Let's Encrypt

## 🔮 Gelecek Geliştirmeler

### Planlanan Özellikler
- AI entegrasyonları (VPS üzerinde)
- Call recording işleme
- Conversation analytics
- Real-time notifications (WebSocket)
- Background job processing
- Advanced reporting

### Teknik İyileştirmeler
- Caching layer (Redis)
- Message queue (RabbitMQ veya Bull)
- File storage (S3 veya local)
- Monitoring & Logging (Winston, Sentry)
- API versioning

---

**Son Güncelleme:** V2.0.0  
**Mimari Versiyonu:** 2.0  
**Dokümantasyon Tarihi:** 2025

