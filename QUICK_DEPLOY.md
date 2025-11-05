# 🚀 Hızlı Deployment - Randevu Asistan V2

## VPS Bilgileri

- **IP:** 72.61.89.17
- **Hostname:** srv1105106.hstgr.cloud
- **Durum:** Running ✅

## Deployment Adımları

### 1. VPS'e SSH ile Bağlanın

```bash
ssh root@72.61.89.17
# veya
ssh root@srv1105106.hstgr.cloud
```

### 2. Deployment Script'ini İndirin ve Çalıştırın

```bash
# Script'i GitHub'dan indirin
cd /tmp
curl -O https://raw.githubusercontent.com/Babakucan/Randevuasistan/main/scripts/deploy-to-vps.sh

# Script'i çalıştırılabilir yapın
chmod +x deploy-to-vps.sh

# Script'i düzenleyin (DB_PASSWORD ve DOMAIN değişkenlerini ayarlayın)
nano deploy-to-vps.sh

# Script'i çalıştırın
sudo ./deploy-to-vps.sh
```

### 3. Veya Manuel Deployment

Script çalışmazsa, adım adım manuel deployment:

```bash
# 1. Sistem güncellemesi
sudo apt update && sudo apt upgrade -y

# 2. Node.js kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. PostgreSQL kurulumu
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 4. Database oluşturma
sudo -u postgres psql
CREATE USER randevuasistan WITH PASSWORD 'güçlü_şifre_buraya';
CREATE DATABASE randevuasistan_db OWNER randevuasistan;
GRANT ALL PRIVILEGES ON DATABASE randevuasistan_db TO randevuasistan;
\q

# 5. Nginx kurulumu
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# 6. PM2 kurulumu
sudo npm install -g pm2

# 7. Proje klonlama
cd /var/www
sudo git clone https://github.com/Babakucan/Randevuasistan.git
sudo chown -R $USER:$USER Randevuasistan
cd Randevuasistan

# 8. Backend kurulumu
cd backend
npm install
npm run build

# 9. Backend .env dosyası oluşturma
nano .env
# İçeriğini DEPLOYMENT.md'den kopyalayın

# 10. Prisma setup
npx prisma generate
npx prisma db push

# 11. Frontend kurulumu
cd ../frontend
npm install
npm run build

# 12. Frontend .env.local dosyası
nano .env.local
# NEXT_PUBLIC_API_URL=http://72.61.89.17/api

# 13. PM2 ile başlatma
cd ../backend
pm2 start dist/index.js --name randevuasistan-backend
pm2 save

cd ../frontend
pm2 start npm --name randevuasistan-frontend -- start
pm2 save

pm2 startup

# 14. Nginx config
sudo nano /etc/nginx/sites-available/randevuasistan
# DEPLOYMENT.md'den config'i kopyalayın

sudo ln -s /etc/nginx/sites-available/randevuasistan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## ✅ Kontrol

```bash
# PM2 durumu
pm2 status

# Backend health check
curl http://localhost:3001/health

# Frontend erişim
curl http://localhost:3000
```

## 🌐 Erişim

- **Frontend:** http://72.61.89.17
- **Backend API:** http://72.61.89.17/api
- **Health Check:** http://72.61.89.17/api/health

