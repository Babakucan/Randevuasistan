# Randevu Asistan Backend

PostgreSQL + Prisma + Express.js + TypeScript ile geliştirilmiş REST API backend.

## Teknolojiler

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM (PostgreSQL)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Zod** - Validation

## Kurulum

### 1. Bağımlılıkları Kur

```bash
npm install
```

### 2. Environment Değişkenlerini Ayarla

`.env` dosyası oluştur:

```bash
cp .env.example .env
```

`.env` dosyasını düzenle ve PostgreSQL connection string'ini ekle:

```
DATABASE_URL=postgresql://username:password@localhost:5432/randevuasistan?schema=public
JWT_SECRET=your_jwt_secret_here
```

### 3. Prisma Setup

```bash
# Prisma client generate et
npm run prisma:generate

# Database migration oluştur ve çalıştır
npm run prisma:migrate

# Veya schema'yı direkt push et (development için)
npm run prisma:push
```

### 4. Server'ı Başlat

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş
- `GET /api/auth/me` - Mevcut kullanıcı bilgisi

### Customers
- `GET /api/customers` - Tüm müşterileri listele
- `GET /api/customers/:id` - Müşteri detayı
- `POST /api/customers` - Yeni müşteri oluştur
- `PUT /api/customers/:id` - Müşteri güncelle
- `DELETE /api/customers/:id` - Müşteri sil

### Employees
- `GET /api/employees` - Tüm çalışanları listele
- `GET /api/employees/:id` - Çalışan detayı
- `POST /api/employees` - Yeni çalışan oluştur
- `PUT /api/employees/:id` - Çalışan güncelle
- `DELETE /api/employees/:id` - Çalışan sil

### Services
- `GET /api/services` - Tüm hizmetleri listele
- `GET /api/services/:id` - Hizmet detayı
- `POST /api/services` - Yeni hizmet oluştur
- `PUT /api/services/:id` - Hizmet güncelle
- `DELETE /api/services/:id` - Hizmet sil

### Appointments
- `GET /api/appointments` - Tüm randevuları listele
- `GET /api/appointments/:id` - Randevu detayı
- `POST /api/appointments` - Yeni randevu oluştur
- `PUT /api/appointments/:id` - Randevu güncelle
- `DELETE /api/appointments/:id` - Randevu sil

### Dashboard
- `GET /api/dashboard/stats` - Dashboard istatistikleri
- `GET /api/dashboard/activities` - Son aktiviteler

## Database Schema

Prisma schema dosyası: `prisma/schema.prisma`

### Ana Tablolar
- `users` - Kullanıcılar
- `salon_profiles` - Salon profilleri
- `employees` - Çalışanlar
- `employee_services` - Çalışan-hizmet ilişkileri
- `services` - Hizmetler
- `customers` - Müşteriler
- `appointments` - Randevular
- `ai_conversations` - AI konuşmaları
- `call_history` - Telefon arama geçmişi
- `call_recordings` - Arama kayıtları
- `conversation_analytics` - Konuşma analizleri
- `salon_settings` - Salon ayarları

## Prisma Komutları

```bash
# Prisma client generate
npm run prisma:generate

# Migration oluştur ve uygula
npm run prisma:migrate

# Schema'yı direkt push et (development)
npm run prisma:push

# Prisma Studio (Database GUI)
npm run prisma:studio
```

## Development

```bash
# TypeScript type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

## Notlar

- Tüm API endpoint'leri authentication gerektirir (auth hariç)
- JWT token `Authorization: Bearer <token>` header'ında gönderilmeli
- Tüm responses `{ success: boolean, data?: any, message?: string }` formatında

