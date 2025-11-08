# 🚀 Deployment Rehberi - Randevu Asistan V2

Bu dokümantasyon, Randevu Asistan V2 projesinin bir VPS sunucusunda production ortamına deploy edilmesi için adım adım rehberdir.

## 📋 Gereksinimler

### Sunucu Gereksinimleri

#### Minimum Gereksinimler
- **CPU**: 2 vCPU
- **RAM**: 4 GB
- **Disk**: 20 GB SSD
- **OS**: Ubuntu 20.04+ / Debian 11+

#### Önerilen Gereksinimler
- **CPU**: 4 vCPU
- **RAM**: 8 GB
- **Disk**: 50 GB SSD
- **OS**: Ubuntu 22.04 LTS

### Yazılım Gereksinimleri
- Node.js 18+ (LTS önerilir)
- PostgreSQL 14+
- Nginx
- PM2 (process manager)
- Git

---

## 🔧 Sunucu Kurulumu

### 1. Sunucu Güncellemesi

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
```

### 2. Node.js Kurulumu

```bash
# Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kontrol
node --version
npm --version
```

### 3. PostgreSQL Kurulumu

```bash
# PostgreSQL kurulumu
sudo apt install postgresql postgresql-contrib -y

# PostgreSQL başlatma
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PostgreSQL kullanıcı oluşturma
sudo -u postgres psql
```

PostgreSQL içinde:
```sql
CREATE USER randevuasistan WITH PASSWORD 'güçlü_şifre_buraya';
CREATE DATABASE randevuasistan_db OWNER randevuasistan;
GRANT ALL PRIVILEGES ON DATABASE randevuasistan_db TO randevuasistan;
\q
```

### 4. Nginx Kurulumu

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. PM2 Kurulumu

```bash
sudo npm install -g pm2
```

---

## 📦 Proje Kurulumu

### 1. Proje Klonlama

```bash
cd /var/www
sudo git clone https://github.com/Babakucan/Randevuasistan.git
sudo chown -R $USER:$USER Randevuasistan
cd Randevuasistan
```

### 2. Environment Variables

#### Backend `.env` Dosyası

```bash
cd backend
cp env.example .env
nano .env
```

`.env` dosyası içeriği:
```env
# Sunucu
PORT=3001
NODE_ENV=production

# Veritabanı
DATABASE_URL="postgresql://randevuasistan:güçlü_şifre_buraya@localhost:5432/randevuasistan_db?schema=public"

# JWT
JWT_SECRET="çok_güçlü_ve_güvenli_jwt_secret_key_buraya_çok_uzun"
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com

# AI (opsiyonel, gelecekte kullanılacak)
OPENAI_API_KEY=your_openai_api_key_here
```

#### Frontend `.env.local` Dosyası

```bash
cd ../frontend
cp env.example .env.local
nano .env.local
```

`.env.local` dosyası içeriği:
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
# Backend'i ayrı subdomain altında çalıştırıyorsanız:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 3. Bağımlılıkları Yükleme

```bash
# Root dizinde
npm install

# Tüm workspace bağımlılıklarını otomatik kurmak için (isteğe bağlı)
# npm run install:all

# Backend
cd backend
npm install
npm run build

# Frontend
cd ../frontend
npm install
npm run build
```

### 4. Database Setup

```bash
cd backend
npx prisma generate
npx prisma db push
```

**Not:** Production'da `prisma db push` yerine `prisma migrate deploy` kullanılmalıdır.
Tek komutla kurulum için `scripts/deploy-all.sh` ve `scripts/deploy-to-vps.sh` dosyalarını inceleyin; ihtiyaçlarınıza göre düzenleyip çalıştırabilirsiniz.

---

## 🚀 Backend Deployment

### 1. PM2 ile Backend Başlatma

```bash
cd /var/www/Randevuasistan/backend
pm2 start dist/index.js --name randevuasistan-backend
pm2 save
pm2 startup
```

### 2. Backend Kontrolü

```bash
# PM2 durumu
pm2 status

# Loglar
pm2 logs randevuasistan-backend

# Restart
pm2 restart randevuasistan-backend
```

### 3. Backend Health Check

```bash
curl http://localhost:3001/health
```

---

## 🎨 Frontend Deployment

### 1. Next.js Production Build

```bash
cd /var/www/Randevuasistan/frontend
npm run build
```

### 2. PM2 ile Frontend Başlatma

```bash
pm2 start npm --name randevuasistan-frontend -- start
# veya
pm2 start node_modules/next/dist/bin/next --name randevuasistan-frontend -- start
pm2 save
```

**Alternatif:** Next.js standalone build kullanılabilir (daha optimize).

---

## 🌐 Nginx Yapılandırması

### 1. Nginx Config Dosyası

```bash
sudo nano /etc/nginx/sites-available/randevuasistan
```

Config içeriği:
```nginx
# Frontend (Next.js)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Nginx Config'i Aktif Etme

```bash
sudo ln -s /etc/nginx/sites-available/randevuasistan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 SSL/HTTPS Kurulumu

### Let's Encrypt ile SSL

```bash
# Certbot kurulumu
sudo apt install certbot python3-certbot-nginx -y

# SSL sertifikası alma
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

SSL kurulumundan sonra Nginx config'i otomatik güncellenir.

---

## 🔄 Güncelleme Süreci

### 1. Yeni Versiyon Çekme

```bash
cd /var/www/Randevuasistan
git pull origin main
```

### 2. Bağımlılıkları Güncelleme

```bash
# Root
npm install

# Backend
cd backend
npm install
npm run build

# Frontend
cd ../frontend
npm install
npm run build
```

### 3. Database Migration (Gerekirse)

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

### 4. Servisleri Yeniden Başlatma

```bash
pm2 restart randevuasistan-backend
pm2 restart randevuasistan-frontend
```

---

## 📊 Monitoring ve Logging

### PM2 Monitoring

```bash
# PM2 dashboard
pm2 monit

# Log görüntüleme
pm2 logs

# Belirli bir servis logları
pm2 logs randevuasistan-backend
```

### Log Dosyaları

```bash
# PM2 logları
~/.pm2/logs/

# Nginx logları
/var/log/nginx/access.log
/var/log/nginx/error.log
```

### Health Check Monitoring

Health check endpoint'i zaten var: `/health`

---

## 🤖 AI Entegrasyonları (VPS Üzerinde)

### OpenAI API Entegrasyonu

Backend `.env` dosyasında `OPENAI_API_KEY` zaten tanımlı. AI özellikleri eklendiğinde otomatik çalışacak.

### Background Jobs (Gelecek)

PM2 ile background job'lar çalıştırılabilir:

```bash
pm2 start scripts/ai-processor.js --name ai-processor
```

---

## 🔐 Güvenlik Kontrolleri

### Firewall

```bash
# UFW kurulumu
sudo apt install ufw -y

# Temel kurallar
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Database Güvenliği

- Güçlü şifreler kullanın
- PostgreSQL sadece localhost'tan erişilebilir olmalı
- Gereksiz kullanıcıları kaldırın

### API Güvenliği

- JWT secret'ı güçlü ve uzun olmalı
- Rate limiting paketi projede mevcut ancak varsayılan olarak devre dışı; ihtiyaç halinde `backend/src/index.ts` içerisinde yapılandırın
- CORS sadece production domain'ini içermeli

---

## 🐛 Sorun Giderme

### Backend Çalışmıyor

```bash
# PM2 durumu kontrol
pm2 status

# Logları kontrol et
pm2 logs randevuasistan-backend

# Manuel başlatma
cd backend
node dist/index.js
```

### Frontend Çalışmıyor

```bash
# Build kontrolü
cd frontend
npm run build

# PM2 durumu
pm2 status randevuasistan-frontend
```

### Database Bağlantı Sorunu

```bash
# PostgreSQL durumu
sudo systemctl status postgresql

# Bağlantı testi
psql -U randevuasistan -d randevuasistan_db -h localhost
```

### Nginx Sorunları

```bash
# Config testi
sudo nginx -t

# Nginx durumu
sudo systemctl status nginx

# Logları kontrol
sudo tail -f /var/log/nginx/error.log
```

---

## 📝 Environment Variables Özeti

### Backend (.env)
- `PORT=3001`
- `NODE_ENV=production`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN=7d`
- `CORS_ORIGIN`
- `OPENAI_API_KEY` (opsiyonel)

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`

---

## ✅ Deployment Checklist

- [ ] Sunucu güncellemesi yapıldı
- [ ] Node.js kuruldu
- [ ] PostgreSQL kuruldu ve database oluşturuldu
- [ ] Nginx kuruldu
- [ ] PM2 kuruldu
- [ ] Proje klonlandı
- [ ] Environment variables ayarlandı
- [ ] Bağımlılıklar yüklendi
- [ ] Database setup yapıldı
- [ ] Backend build edildi ve PM2'de çalışıyor
- [ ] Frontend build edildi ve PM2'de çalışıyor
- [ ] Nginx config edildi ve aktif
- [ ] SSL sertifikası kuruldu
- [ ] Firewall ayarlandı
- [ ] Health check endpoint'i test edildi
- [ ] Frontend ve backend birbirine bağlandı

---

**Son Güncelleme:** V2.1.0  
**Deployment Versiyonu:** 2.1  
**Dokümantasyon Tarihi:** 2025-11-06

