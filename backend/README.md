# 🚀 Randevu Asistan Backend API

Bu dosya, backend API'sinin tüm özelliklerini, kurulumunu ve kullanımını açıklar.

## 📁 Proje Yapısı

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Supabase bağlantı konfigürasyonu
│   ├── controllers/             # Controller dosyaları (gelecek özellikler)
│   ├── middleware/
│   │   ├── auth.ts             # Kimlik doğrulama middleware'i
│   │   └── validation.ts       # Veri doğrulama middleware'i
│   ├── routes/
│   │   ├── auth.ts             # Kimlik doğrulama route'ları
│   │   ├── appointments.ts     # Randevu route'ları
│   │   ├── customers.ts        # Müşteri route'ları
│   │   ├── employees.ts        # Çalışan route'ları
│   │   ├── services.ts         # Hizmet route'ları
│   │   └── ai.ts               # AI route'ları
│   ├── services/               # Business logic servisler (gelecek)
│   ├── types/
│   │   └── index.ts            # TypeScript tip tanımları
│   ├── utils/
│   │   └── helpers.ts          # Yardımcı fonksiyonlar
│   └── index.ts                # Ana uygulama dosyası
├── .env                        # Environment variables (oluşturulacak)
├── package.json               # NPM paket tanımları
├── tsconfig.json             # TypeScript konfigürasyonu
└── README.md                 # Bu dosya
```

## ⚙️ Kurulum ve Çalıştırma

### 1. Environment Variables Oluşturun

`.env` dosyası oluşturun ve aşağıdaki değerleri ekleyin:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Twilio Configuration (opsiyonel)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Backend'i Çalıştırın

```bash
# Geliştirme modunda (hot reload)
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint

# Test (gelecekte eklenecek)
npm test
```

## 🌐 API Endpoints

### Base URL: `http://localhost:3001/api`

### 🔐 Authentication Routes (`/api/auth`)

| Method | Endpoint | Açıklama | Body |
|--------|----------|----------|------|
| POST | `/register` | Yeni kullanıcı kaydı | `{email, password, salon_name, owner_name, phone?}` |
| POST | `/login` | Kullanıcı girişi | `{email, password}` |
| POST | `/logout` | Kullanıcı çıkışı | - |
| GET | `/me` | Mevcut kullanıcı bilgileri | - |
| POST | `/refresh` | Token yenileme | `{refresh_token}` |

### 📅 Appointment Routes (`/api/appointments`)

| Method | Endpoint | Açıklama | Body |
|--------|----------|----------|------|
| GET | `/` | Randevuları listele | Query: `page, limit, status, start_date, end_date` |
| GET | `/:id` | Randevu detayları | - |
| POST | `/` | Yeni randevu oluştur | `{customer_id, service_id, start_time, end_time, notes?, source?}` |
| PUT | `/:id` | Randevu güncelle | `{customer_id?, service_id?, start_time?, end_time?, status?, notes?}` |
| DELETE | `/:id` | Randevu sil | - |
| GET | `/range/:start/:end` | Tarih aralığında randevular | - |

### 👥 Customer Routes (`/api/customers`)

| Method | Endpoint | Açıklama | Body |
|--------|----------|----------|------|
| GET | `/` | Müşterileri listele | Query: `page, limit, search` |
| GET | `/:id` | Müşteri detayları | - |
| POST | `/` | Yeni müşteri oluştur | `{name, phone, email?, birth_date?, notes?, preferences?}` |
| PUT | `/:id` | Müşteri güncelle | `{name?, phone?, email?, birth_date?, notes?, preferences?}` |
| DELETE | `/:id` | Müşteri sil | - |
| GET | `/:id/appointments` | Müşteri randevuları | Query: `page, limit` |

### 👨‍💼 Employee Routes (`/api/employees`)

| Method | Endpoint | Açıklama | Body |
|--------|----------|----------|------|
| GET | `/` | Çalışanları listele | Query: `page, limit, search, is_active` |
| GET | `/:id` | Çalışan detayları | - |
| POST | `/` | Yeni çalışan oluştur | `{name, email?, phone?, position?, specialties?, working_hours?, bio?, experience_years?, hourly_rate?}` |
| PUT | `/:id` | Çalışan güncelle | `{name?, email?, phone?, position?, specialties?, working_hours?, bio?, experience_years?, hourly_rate?}` |
| DELETE | `/:id` | Çalışan sil | - |
| GET | `/:id/services` | Çalışan hizmetleri | - |
| POST | `/:id/services` | Çalışana hizmet ata | `{service_id, custom_price?}` |
| DELETE | `/:id/services/:service_id` | Çalışandan hizmet kaldır | - |

### 🛠️ Service Routes (`/api/services`)

| Method | Endpoint | Açıklama | Body |
|--------|----------|----------|------|
| GET | `/` | Hizmetleri listele | Query: `page, limit, search, category, is_active` |
| GET | `/:id` | Hizmet detayları | - |
| POST | `/` | Yeni hizmet oluştur | `{name, description?, duration, price, category?}` |
| PUT | `/:id` | Hizmet güncelle | `{name?, description?, duration?, price?, category?}` |
| DELETE | `/:id` | Hizmet sil | - |
| GET | `/categories/list` | Hizmet kategorileri | - |
| GET | `/category/:category` | Kategoriye göre hizmetler | - |

### 🤖 AI Routes (`/api/ai`)

| Method | Endpoint | Açıklama | Body |
|--------|----------|----------|------|
| POST | `/conversation` | AI konuşma işle | `{customer_phone, platform, message}` |
| GET | `/conversations` | Konuşma geçmişi | Query: `page, limit, status` |
| GET | `/conversations/:id` | Konuşma detayları | - |
| PUT | `/conversations/:id/status` | Konuşma durumu güncelle | `{status}` |
| POST | `/analyze/:conversation_id` | Konuşma analizi | - |

## 🔒 Authentication

### Bearer Token Kullanımı

```javascript
// Header'a token ekleyin
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

### Token Alma Örneği

```javascript
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'salon@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.data.session.access_token;
```

## 📊 Veri Modelleri

### Salon Profile
```typescript
interface SalonProfile {
  id: string;
  user_id: string;
  name: string;
  owner_name: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  logo_url?: string;
  working_hours?: any;
  created_at: string;
  updated_at: string;
}
```

### Customer
```typescript
interface Customer {
  id: string;
  salon_id: string;
  name: string;
  phone: string;
  email?: string;
  birth_date?: string;
  notes?: string;
  preferences?: any;
  created_at: string;
  updated_at: string;
}
```

### Appointment
```typescript
interface Appointment {
  id: string;
  salon_id: string;
  customer_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  source: 'manual' | 'whatsapp' | 'phone' | 'ai';
  created_at: string;
  updated_at: string;
}
```

## 🛡️ Güvenlik Özellikleri

- **Rate Limiting**: IP başına 15 dakikada 100 istek
- **CORS**: Sadece frontend URL'den isteklere izin
- **Helmet.js**: HTTP güvenlik header'ları
- **Input Validation**: Tüm input'lar doğrulanır
- **Row Level Security**: Supabase RLS aktif
- **JWT Authentication**: Güvenli token sistemi

## ⚡ Performans

- **Pagination**: Tüm listeleme endpoint'lerinde sayfalama
- **Indexing**: Veritabanı performansı için indexler
- **Caching**: HTTP header'ları ile caching
- **Compression**: Gzip sıkıştırma

## 🐛 Hata Yönetimi

### Hata Response Formatı

```json
{
  "success": false,
  "error": "Hata mesajı",
  "details": [] // Validation hataları için
}
```

### HTTP Status Kodları

- **200**: Başarılı
- **201**: Oluşturuldu
- **400**: Geçersiz istek
- **401**: Kimlik doğrulama hatası
- **403**: Yetki hatası
- **404**: Bulunamadı
- **429**: Rate limit aşıldı
- **500**: Sunucu hatası

## 📝 Logging

```javascript
// Console'da gösterilen log formatı
[2024-01-19T10:30:00.000Z] INFO: Server started on port 3001
[2024-01-19T10:30:01.000Z] ERROR: Database connection failed
```

## 🔧 Geliştirme Araçları

### Useful Scripts

```bash
# TypeScript compile
npm run build

# Watch mode development
npm run dev

# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Database Schema Kontrol

```bash
# Mevcut tabloları kontrol et
psql -f check-current-schema.sql
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3001
# Diğer production değerleri...
```

## 📞 AI Entegrasyonu

### OpenAI Kullanımı

```javascript
// AI conversation endpoint'i
POST /api/ai/conversation
{
  "customer_phone": "+905551234567",
  "platform": "whatsapp",
  "message": "Randevu almak istiyorum"
}
```

### AI Response Formatı

```json
{
  "success": true,
  "data": {
    "response": "AI yanıtı",
    "conversation_id": "uuid",
    "is_appointment_request": true
  }
}
```

## 📱 n8n Entegrasyonu

### Webhook URL'leri

```javascript
// n8n için webhook endpoint'leri
const webhooks = {
  appointment_created: '/webhooks/appointment-created',
  customer_registered: '/webhooks/customer-registered',
  ai_conversation: '/webhooks/ai-conversation'
};
```

### n8n HTTP Request Ayarları

```json
{
  "method": "GET",
  "url": "http://localhost:3001/api/appointments",
  "headers": {
    "Authorization": "Bearer {{$json.token}}",
    "Content-Type": "application/json"
  }
}
```

## 🔍 Troubleshooting

### Yaygın Hatalar

1. **CORS Hatası**
   - Frontend URL'i .env dosyasında doğru ayarlayın
   - FRONTEND_URL=http://localhost:3000

2. **Database Connection Error**
   - Supabase credentials'ları kontrol edin
   - SUPABASE_URL ve SUPABASE_ANON_KEY doğru mu?

3. **Authentication Failed**
   - JWT_SECRET ayarlandı mı?
   - Token süresi dolmuş olabilir

4. **Rate Limit Exceeded**
   - IP'niz bloke olmuş, biraz bekleyin
   - Rate limit ayarlarını .env'de değiştirin

### Debug Modu

```bash
# Debug logları için
DEBUG=* npm run dev
```

## 📊 API Test Örnekleri

### Postman Collection

```json
{
  "info": {
    "name": "Randevu Asistan API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth - Login",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "http://localhost:3001/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "auth", "login"]
        }
      }
    }
  ]
}
```

## 📈 Monitoring

### Health Check

```bash
curl http://localhost:3001/health
```

### Response:

```json
{
  "status": "OK",
  "timestamp": "2024-01-19T10:30:00.000Z",
  "uptime": 3600
}
```

## 🔄 Backup ve Restore

### Database Backup

```bash
# Supabase dashboard'dan backup alın
# Veya SQL dump oluşturun
pg_dump database_url > backup.sql
```

## 🎯 Gelecek Özellikler

- [ ] Redis cache entegrasyonu
- [ ] WebSocket real-time updates
- [ ] Email service entegrasyonu
- [ ] SMS service entegrasyonu
- [ ] File upload sistemi
- [ ] Comprehensive test suite
- [ ] API documentation (Swagger)
- [ ] Docker containerization

## 📞 Destek

Herhangi bir sorun yaşarsanız:

1. Console loglarını kontrol edin
2. Network tab'ında istekleri inceleyin
3. .env dosyası ayarlarını doğrulayın
4. Database bağlantısını test edin

---

**Not**: Bu backend API'si Modern Salon Yönetim Sistemi'nin bir parçasıdır ve frontend, n8n otomasyonları ve mobil uygulamalarla entegre çalışacak şekilde tasarlanmıştır.
