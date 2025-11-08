# Randevu Asistan REST API Dokümantasyonu

Bu doküman Express.js tabanlı backend API'si için güncel uç noktaları ve sözleşmeleri içerir. İstemci örnekleri `frontend/lib/api.ts` dosyasında bulunabilir.

## Temel Bilgiler
- **Geliştirme tabanı:** `http://localhost:3001`
- **Üretim tabanı:** VPS yapılandırmasına bağlıdır (örn. `https://<domain>`). Nginx üzerinden `/` köküne yayınlanır.
- Tüm `/auth` uçları hariç isteklerde JWT zorunludur:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- Çoklu salon desteği için `salonId` query parametresi kullanılabilir. Parametre gönderilmezse backend kullanıcının ilk salonunu seçer.

## 1. Kimlik Doğrulama (`/auth`)

| Metot & Yol | Açıklama | Body |
| --- | --- | --- |
| `POST /auth/register` | Kullanıcı + ilk salon kaydı | `{ email, password, name, salonName, phone? }` |
| `POST /auth/login` | Giriş yapar | `{ email, password }` |
| `GET /auth/me` | Oturum açmış kullanıcıyı döndürür | — |

**Başarılı Login/Register Yanıtı** (özet):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "name": "Kullanıcı", "role": "user" },
    "salonProfiles": [{ "id": "salon-uuid", "name": "Salon Adı" }],
    "currentSalonId": "salon-uuid",
    "token": "jwt-token"
  }
}
```

## 2. Salon Yönetimi (`/salons`)

| Metot & Yol | Açıklama |
| --- | --- |
| `GET /salons` | Oturum açmış kullanıcının tüm salon profilleri |
| `GET /salons/:id` | Belirli salon detayı (kullanıcıya ait olmalı) |
| `POST /salons` | Yeni salon oluşturur |
| `PUT /salons/:id` | Salon bilgisini günceller |
| `DELETE /salons/:id` | Kullanıcının salonunu siler |

**Salon Oluşturma Gövdesi**
```json
{
  "name": "Salon Adı",
  "ownerName": "Sahip Adı",
  "phone": "5551234567",
  "email": "salon@example.com",
  "address": "Adres",
  "description": "Kısa açıklama",
  "logoUrl": "https://...",
  "workingHours": { "monday": { "open": "09:00", "close": "18:00" } }
}
```

## 3. Müşteri Yönetimi (`/customers`)
Tüm uçlar JWT ister ve `salonId` (opsiyonel) query parametresini destekler.

| Metot & Yol | Açıklama |
| --- | --- |
| `GET /customers` | Aktif salonun tüm müşterileri (+ son randevular) |
| `GET /customers/:id` | Salon kapsamında müşteri detayı (son 10 randevu) |
| `POST /customers` | Yeni müşteri oluşturur |
| `PUT /customers/:id` | Müşteri verilerini günceller |
| `DELETE /customers/:id` | Müşteriyi siler |

**Örnek İstek (POST /customers)**
```json
{
  "name": "Müşteri Adı",
  "phone": "5551234567",
  "email": "customer@example.com",
  "birthDate": "1995-06-01",
  "notes": "VIP müşteri"
}
```

## 4. Çalışan Yönetimi (`/employees`)

| Metot & Yol | Açıklama |
| --- | --- |
| `GET /employees` | Salon çalışan listesi (atanan hizmetlerle) |
| `GET /employees/:id` | Çalışan detayı (+ son 10 randevu) |
| `POST /employees` | Yeni çalışan |
| `PUT /employees/:id` | Çalışan güncelleme |
| `DELETE /employees/:id` | Çalışan silme |
| `POST /employees/:id/services` | Hizmet atama/kaldırma |

**Hizmet Atama İsteği**
```json
{
  "serviceId": "service-uuid",
  "assign": true
}
```
`assign: true` → hizmeti atar (upsert), `false` → ilişkisini siler.

## 5. Hizmet Yönetimi (`/services`)

| Metot & Yol | Açıklama |
| --- | --- |
| `GET /services` | Salon hizmet listesi |
| `GET /services/:id` | Hizmet detayı |
| `POST /services` | Yeni hizmet |
| `PUT /services/:id` | Hizmet güncelleme |
| `DELETE /services/:id` | Hizmet silme |

**Örnek Gövde (POST /services)**
```json
{
  "name": "Saç Kesimi",
  "description": "Profesyonel saç kesimi",
  "duration": 45,
  "price": 200,
  "category": "Kesim",
  "isActive": true
}
```

## 6. Randevu Yönetimi (`/appointments`)

| Metot & Yol | Açıklama |
| --- | --- |
| `GET /appointments` | Salon randevu listesi (customer/service/employee nested) |
| `GET /appointments/:id` | Randevu detayı |
| `POST /appointments` | Yeni randevu |
| `PUT /appointments/:id` | Randevu güncelleme |
| `DELETE /appointments/:id` | Randevu silme |

**Gerekli Alanlar (POST /appointments)**
```json
{
  "customerId": "uuid",
  "serviceId": "uuid",
  "employeeId": "uuid",         // opsiyonel
  "startTime": "2025-11-10T10:00:00Z",
  "endTime": "2025-11-10T11:00:00Z",
  "status": "scheduled",        // optional (default: scheduled)
  "notes": "İlk randevu",
  "source": "manual"            // optional (manual | whatsapp | phone | ai)
}
```
`PUT` isteklerinde alanlar kısmi olarak gönderilebilir.

**Başarılı Oluşturma Yanıtı**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "id": "uuid",
    "salonId": "uuid",
    "customerId": "uuid",
    "serviceId": "uuid",
    "employeeId": "uuid",
    "startTime": "2025-11-10T10:00:00.000Z",
    "endTime": "2025-11-10T11:00:00.000Z",
    "status": "scheduled",
    "source": "manual",
    "createdAt": "...",
    "updatedAt": "...",
    "customer": { "...": "..." },
    "service": { "...": "..." },
    "employee": { "...": "..." }
  }
}
```

## 7. Dashboard (`/dashboard`)
- `GET /dashboard/stats`: Salon bazlı toplu metrikler
  ```json
  {
    "success": true,
    "data": {
      "totalAppointments": 128,
      "totalCustomers": 86,
      "totalEmployees": 9,
      "totalServices": 14,
      "todayAppointments": 5,
      "todayEarnings": 1450,
      "thisWeekAppointments": 32,
      "thisMonthEarnings": 18750
    }
  }
  ```
- `GET /dashboard/activities`: Son 10 aktivite (randevu/müşteri/çalışan/hizmet)
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "type": "appointment",
        "description": "Fatma Şahin randevu aldı",
        "details": "Saç Kesimi - Ahmet Yılmaz",
        "timestamp": "2025-11-07T09:32:00.000Z"
      }
    ]
  }
  ```

## 8. Hata Formatı
Tüm hatalar `AppError` veya genel hata yakalayıcısı tarafından standart formata çevrilir.
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    { "path": ["customerId"], "message": "Expected string, received null" }
  ]
}
```

HTTP durum kodları:
- `200 OK` – başarılı GET/PUT/DELETE
- `201 Created` – başarılı POST
- `400 Bad Request` – Zod doğrulama hatası veya eksik veri
- `401 Unauthorized` – JWT yok/invalid
- `403 Forbidden` – (Kullanımda değil; gerekli olursa `authorize()` ile eklenebilir)
- `404 Not Found` – Salon kapsamı dışında kayıt veya bulunamadı
- `500 Internal Server Error` – Beklenmeyen hata

## 9. Entegrasyon Notları
- `salonId` parametresi gönderilmezse backend otomatik olarak kullanıcının erişebildiği ilk salonu kullanır.
- Prisma decimal alanları JavaScript tarafında string veya number olarak kabul eder; API string dönebilir.
- Tarih alanları ISO 8601 formatında beklenir (`.datetime()` Zod doğrulaması).
- Rate limit middleware'i henüz etkinleştirilmemiştir; ihtiyaç halinde `index.ts` içinde konfigüre edilebilir.

---
**Son Güncelleme:** Kasım 2025  
**Sorumlu:** Backend Ekibi

