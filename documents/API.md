# API Dokümantasyonu - Randevuasistan

Bu dokümantasyon, Randevuasistan backend API'sinin tüm endpoint'lerini ve kullanımlarını içerir.

## Base URL

Production: `https://randevucun.shop/api`  
Development: `http://localhost:3001/api`

## Authentication

Tüm endpoint'ler (auth hariç) JWT token gerektirir. Token'ı `Authorization` header'ında gönderin:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST `/api/auth/register`
Yeni kullanıcı kaydı.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Kullanıcı Adı",
  "salonName": "Salon Adı",
  "phone": "5551234567"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Kullanıcı Adı",
      "role": "user"
    },
    "salonProfiles": [...],
    "currentSalonId": "uuid",
    "token": "jwt_token"
  }
}
```

#### POST `/api/auth/login`
Kullanıcı girişi.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "salonProfiles": [...],
    "currentSalonId": "uuid",
    "token": "jwt_token"
  }
}
```

#### GET `/api/auth/me`
Mevcut kullanıcı bilgileri.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Kullanıcı Adı",
    "role": "user",
    "salonProfiles": [...]
  }
}
```

### Salons

#### GET `/api/salons?salonId=<uuid>`
Tüm salon profillerini getirir.

#### GET `/api/salons/:id?salonId=<uuid>`
Belirli bir salon profilini getirir.

#### POST `/api/salons?salonId=<uuid>`
Yeni salon profili oluşturur.

**Request Body:**
```json
{
  "name": "Salon Adı",
  "ownerName": "Sahip Adı",
  "phone": "5551234567",
  "email": "salon@example.com",
  "address": "Adres",
  "description": "Açıklama"
}
```

#### PUT `/api/salons/:id?salonId=<uuid>`
Salon profilini günceller.

#### DELETE `/api/salons/:id?salonId=<uuid>`
Salon profilini siler.

### Employees

#### GET `/api/employees?salonId=<uuid>`
Tüm çalışanları getirir.

#### GET `/api/employees/:id?salonId=<uuid>`
Belirli bir çalışanı getirir.

#### POST `/api/employees?salonId=<uuid>`
Yeni çalışan oluşturur.

**Request Body:**
```json
{
  "name": "Çalışan Adı",
  "email": "employee@example.com",
  "phone": "5551234567",
  "position": "Kuaför",
  "specialties": ["Saç Kesimi", "Boyama"],
  "workingHours": {
    "monday": {"start": "09:00", "end": "18:00"},
    "tuesday": {"start": "09:00", "end": "18:00"}
  },
  "leaveDays": ["saturday", "sunday"],
  "bio": "Açıklama",
  "experienceYears": 5,
  "hourlyRate": 150
}
```

#### PUT `/api/employees/:id?salonId=<uuid>`
Çalışan bilgilerini günceller.

#### DELETE `/api/employees/:id?salonId=<uuid>`
Çalışanı siler.

#### POST `/api/employees/:id/services?salonId=<uuid>`
Çalışana hizmet atar veya kaldırır.

**Request Body:**
```json
{
  "serviceId": "uuid",
  "assign": true
}
```

### Services

#### GET `/api/services?salonId=<uuid>`
Tüm hizmetleri getirir.

#### GET `/api/services/:id?salonId=<uuid>`
Belirli bir hizmeti getirir.

#### POST `/api/services?salonId=<uuid>`
Yeni hizmet oluşturur.

**Request Body:**
```json
{
  "name": "Hizmet Adı",
  "description": "Açıklama",
  "duration": 60,
  "price": 200,
  "category": "Saç Kesimi",
  "isActive": true
}
```

#### PUT `/api/services/:id?salonId=<uuid>`
Hizmeti günceller.

#### DELETE `/api/services/:id?salonId=<uuid>`
Hizmeti siler.

### Customers

#### GET `/api/customers?salonId=<uuid>`
Tüm müşterileri getirir.

#### GET `/api/customers/:id?salonId=<uuid>`
Belirli bir müşteriyi getirir.

#### POST `/api/customers?salonId=<uuid>`
Yeni müşteri oluşturur.

**Request Body:**
```json
{
  "name": "Müşteri Adı",
  "phone": "5551234567",
  "email": "customer@example.com",
  "birthDate": "1990-01-01",
  "notes": "Notlar",
  "preferences": {}
}
```

#### PUT `/api/customers/:id?salonId=<uuid>`
Müşteri bilgilerini günceller.

#### DELETE `/api/customers/:id?salonId=<uuid>`
Müşteriyi siler.

### Appointments

#### GET `/api/appointments?salonId=<uuid>`
Tüm randevuları getirir.

#### GET `/api/appointments/:id?salonId=<uuid>`
Belirli bir randevuyu getirir.

#### POST `/api/appointments?salonId=<uuid>`
Yeni randevu oluşturur.

**Request Body:**
```json
{
  "customerId": "uuid",
  "serviceId": "uuid",
  "employeeId": "uuid",
  "startTime": "2025-11-10T10:00:00Z",
  "status": "scheduled",
  "notes": "Notlar",
  "source": "manual"
}
```

#### PUT `/api/appointments/:id?salonId=<uuid>`
Randevuyu günceller.

#### DELETE `/api/appointments/:id?salonId=<uuid>`
Randevuyu siler.

### Dashboard

#### GET `/api/dashboard/stats?salonId=<uuid>`
Dashboard istatistiklerini getirir.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 100,
    "totalEmployees": 5,
    "totalServices": 10,
    "todayAppointments": 5,
    "todayEarnings": 1000,
    "upcomingAppointments": 3
  }
}
```

#### GET `/api/dashboard/activities?salonId=<uuid>`
Son aktiviteleri getirir.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "appointment_created",
      "description": "Yeni randevu oluşturuldu",
      "createdAt": "2025-11-06T10:00:00Z"
    }
  ]
}
```

## Error Responses

Tüm hatalar aşağıdaki formatta döner:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "path": ["field"],
      "message": "Validation error message"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation error)
- `401` - Unauthorized (Missing or invalid token)
- `404` - Not Found
- `500` - Internal Server Error

## Notes

- Tüm endpoint'ler `salonId` query parametresi ile çoklu salon desteği sağlar
- Tarih formatları ISO 8601 formatında olmalıdır
- Decimal değerler (fiyat, ücret) string olarak gönderilebilir, backend otomatik dönüştürür

---

**Son Güncelleme:** V2.1.0  
**Tarih:** 2025-11-06

