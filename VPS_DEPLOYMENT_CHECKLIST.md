# ✅ VPS Deployment Checklist

Bu checklist VPS sunucusuna deployment yaparken takip edilmesi gereken adımları içerir.

## 📋 Ön Hazırlık

### VPS Bilgileri
- [ ] VPS IP adresi: `________________`
- [ ] Domain adı (varsa): `________________`
- [ ] SSH erişim bilgileri hazır
- [ ] Root veya sudo yetkisi var

### Gerekli Bilgiler
- [ ] PostgreSQL database şifresi belirlendi
- [ ] JWT secret key oluşturuldu (güçlü ve uzun)
- [ ] CORS origin URL'i belirlendi (production domain)
- [ ] OpenAI API key (opsiyonel, gelecekte)

---

## 🔧 Sunucu Kurulumu

### 1. SSH Bağlantısı
```bash
ssh root@your-vps-ip
# veya
ssh your-username@your-vps-ip
```

### 2. Sistem Güncellemesi
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Node.js Kurulumu
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Kontrol: v18.x.x olmalı
npm --version
```

### 4. PostgreSQL Kurulumu
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 5. PostgreSQL Database Oluşturma
```bash
sudo -u postgres psql
```

PostgreSQL içinde:
```sql
CREATE USER randevuasistan WITH PASSWORD 'güçlü_şifre_buraya';
CREATE DATABASE randevuasistan_db OWNER randevuasistan;
GRANT ALL PRIVILEGES ON DATABASE randevuasistan_db TO randevuasistan;
\q
```

### 6. Nginx Kurulumu
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 7. PM2 Kurulumu
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

### 2. Backend Kurulumu
```bash
cd backend
npm install
npm run build
```

### 3. Frontend Kurulumu
```bash
cd ../frontend
npm install
npm run build
```
> Not: Kök dizinde `npm run install:all` çalıştırarak tüm workspace bağımlılıklarını tek seferde yükleyebilirsiniz.

### 4. Prisma Database Setup
```bash
cd ../backend
npx prisma generate
npx prisma db push
```

---

## 🔐 Environment Variables

### Backend `.env` Dosyası Oluşturma
```bash
cd /var/www/Randevuasistan/backend
nano .env
```

İçerik:
```env
PORT=3001
NODE_ENV=production

DATABASE_URL="postgresql://randevuasistan:şifre_buraya@localhost:5432/randevuasistan_db?schema=public"

JWT_SECRET="çok_güçlü_ve_güvenli_jwt_secret_key_buraya_çok_uzun"
JWT_EXPIRES_IN=7d

CORS_ORIGIN=https://yourdomain.com

# AI (opsiyonel)
OPENAI_API_KEY=your_openai_api_key_here
```

### Frontend `.env.local` Dosyası Oluşturma
```bash
cd /var/www/Randevuasistan/frontend
nano .env.local
```

İçerik:
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
# Eğer backend ayrı bir subdomain'de çalışıyorsa:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 🚀 PM2 ile Servis Başlatma

### Backend Başlatma
```bash
cd /var/www/Randevuasistan/backend
pm2 start dist/index.js --name randevuasistan-backend
pm2 save
pm2 startup
```

### Frontend Başlatma
```bash
cd /var/www/Randevuasistan/frontend
pm2 start npm --name randevuasistan-frontend -- start
pm2 save
```

### PM2 Kontrolü
```bash
pm2 status
pm2 logs randevuasistan-backend
pm2 logs randevuasistan-frontend
```

---

## 🌐 Nginx Yapılandırması

### Config Dosyası Oluşturma
```bash
sudo nano /etc/nginx/sites-available/randevuasistan
```

İçerik:
```nginx
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

### Config Aktif Etme
```bash
sudo ln -s /etc/nginx/sites-available/randevuasistan /etc/nginx/sites-enabled/
sudo nginx -t  # Test
sudo systemctl reload nginx
```

---

## 🔒 SSL/HTTPS Kurulumu

### Let's Encrypt ile SSL
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Otomatik Yenileme Testi
```bash
sudo certbot renew --dry-run
```

---

## ✅ Kontrol Listesi

- [ ] Backend çalışıyor (pm2 status)
- [ ] Frontend çalışıyor (pm2 status)
- [ ] Nginx çalışıyor (sudo systemctl status nginx)
- [ ] Database bağlantısı çalışıyor
- [ ] API endpoint'leri erişilebilir
- [ ] Frontend yükleniyor
- [ ] SSL sertifikası kurulu
- [ ] Firewall ayarlandı (UFW)

---

## 🔄 Güncelleme Süreci

```bash
cd /var/www/Randevuasistan
git pull origin main

# Backend
cd backend
npm install
npm run build
pm2 restart randevuasistan-backend

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart randevuasistan-frontend

# Database migration (gerekirse)
cd ../backend
npx prisma migrate deploy
```

---

## 🐛 Sorun Giderme

### Backend Çalışmıyor
```bash
pm2 logs randevuasistan-backend
cd backend
node dist/index.js  # Manuel test
```

### Frontend Çalışmıyor
```bash
pm2 logs randevuasistan-frontend
cd frontend
npm run build
```

### Database Bağlantı Sorunu
```bash
sudo systemctl status postgresql
psql -U randevuasistan -d randevuasistan_db -h localhost
```

### Nginx Sorunları
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

---

**Son Güncelleme:** 2025

