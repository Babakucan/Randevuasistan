#!/bin/bash
# 🚀 Randevu Asistan V2 - Otomatik Deployment Script
# Bu script'i VPS'te çalıştırın

set -e

echo "🚀 Randevu Asistan V2 - VPS Deployment Başlatılıyor..."
echo ""

# 1. Sistem güncellemesi
echo "📦 1/18 - Sistem güncelleniyor..."
sudo apt update && sudo apt upgrade -y

# 2. Node.js kurulumu
echo "📦 2/18 - Node.js kuruluyor..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js zaten kurulu: $(node --version)"
fi

# 3. PostgreSQL kurulumu
echo "📦 3/18 - PostgreSQL kuruluyor..."
if ! command -v psql &> /dev/null; then
    sudo apt install postgresql postgresql-contrib -y
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
else
    echo "✅ PostgreSQL zaten kurulu"
fi

# 4. Database oluşturma
echo "📦 4/18 - Database oluşturuluyor..."
sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS randevuasistan_db;
DROP USER IF EXISTS randevuasistan;
CREATE USER randevuasistan WITH PASSWORD 'RandevuAsistan2025!';
CREATE DATABASE randevuasistan_db OWNER randevuasistan;
GRANT ALL PRIVILEGES ON DATABASE randevuasistan_db TO randevuasistan;
\q
EOF

# 5. Nginx kurulumu
echo "📦 5/18 - Nginx kuruluyor..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
else
    echo "✅ Nginx zaten kurulu"
fi

# 6. PM2 kurulumu
echo "📦 6/18 - PM2 kuruluyor..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    echo "✅ PM2 zaten kurulu"
fi

# 7. Proje klasörü
echo "📦 7/18 - Proje klasörü hazırlanıyor..."
sudo mkdir -p /var/www
cd /var/www

# 8. Proje klonlama
echo "📦 8/18 - Proje klonlanıyor..."
if [ -d "Randevuasistan" ]; then
    sudo rm -rf Randevuasistan
fi
sudo git clone https://github.com/Babakucan/Randevuasistan.git
sudo chown -R $USER:$USER Randevuasistan
cd Randevuasistan

# 9. Backend bağımlılıkları
echo "📦 9/18 - Backend bağımlılıkları yükleniyor..."
cd backend
npm install

# 10. Backend .env dosyası
echo "📦 10/18 - Backend .env dosyası oluşturuluyor..."
JWT_SECRET=$(openssl rand -base64 32)
cat > .env << EOF
PORT=3001
NODE_ENV=production
DATABASE_URL="postgresql://randevuasistan:RandevuAsistan2025!@localhost:5432/randevuasistan_db?schema=public"
JWT_SECRET="$JWT_SECRET"
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://randevucun.shop
OPENAI_API_KEY=""
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# 11. Prisma generate (build'den ÖNCE!)
echo "📦 11/18 - Prisma client generate ediliyor..."
npx prisma generate

# 12. Backend build
echo "📦 12/18 - Backend build ediliyor..."
npm run build

# 13. Prisma database setup
echo "📦 13/18 - Prisma database setup yapılıyor..."
npx prisma db push

# 14. Frontend bağımlılıkları
echo "📦 14/19 - Frontend bağımlılıkları yükleniyor..."
cd ../frontend
npm install

# 15. Frontend build
echo "📦 15/19 - Frontend build ediliyor..."
npm run build

# 16. Frontend .env.local
echo "📦 16/19 - Frontend .env.local dosyası oluşturuluyor..."
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://randevucun.shop/api
EOF

# 17. PM2 backend
echo "📦 17/19 - Backend PM2 ile başlatılıyor..."
cd ../backend
pm2 delete randevuasistan-backend 2>/dev/null || true
pm2 start dist/index.js --name randevuasistan-backend
pm2 save

# 18. PM2 frontend
echo "📦 18/19 - Frontend PM2 ile başlatılıyor..."
cd ../frontend
pm2 delete randevuasistan-frontend 2>/dev/null || true
pm2 start npm --name randevuasistan-frontend -- start
pm2 save

# 19. Nginx config
echo "📦 19/19 - Nginx config oluşturuluyor..."
sudo tee /etc/nginx/sites-available/randevuasistan > /dev/null << 'NGINXCONF'
server {
    listen 80;
    server_name randevucun.shop www.randevucun.shop;

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
NGINXCONF

sudo ln -sf /etc/nginx/sites-available/randevuasistan /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# 20. Firewall
echo "📦 20/20 - Firewall ayarlanıyor..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo ""
echo "✅ Deployment tamamlandı!"
echo ""
echo "📊 PM2 Durumu:"
pm2 status
echo ""
echo "🌐 Erişim:"
echo "  Frontend: https://randevucun.shop"
echo "  Backend API: https://randevucun.shop/api"
echo "  Health Check: https://randevucun.shop/api/health"
echo ""
echo "📝 Not: SSL sertifikası kurulduktan sonra https:// kullanılabilir"
echo "  SSL kurulumu: sudo certbot --nginx -d randevucun.shop -d www.randevucun.shop"
echo ""

