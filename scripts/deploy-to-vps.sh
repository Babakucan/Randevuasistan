#!/bin/bash

# 🚀 Randevu Asistan V2 - VPS Deployment Script
# Bu script VPS sunucusuna projeyi deploy eder

set -e  # Hata durumunda dur

echo "🚀 Randevu Asistan V2 - VPS Deployment Başlatılıyor..."
echo ""

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Değişkenler (VPS bilgilerine göre güncelleyin)
VPS_IP="72.61.89.17"
VPS_HOSTNAME="srv1105106.hstgr.cloud"
VPS_USER="root"
PROJECT_DIR="/var/www/Randevuasistan"
GITHUB_REPO="https://github.com/Babakucan/Randevuasistan.git"

# Database bilgileri
DB_USER="randevuasistan"
DB_NAME="randevuasistan_db"
DB_PASSWORD=""  # Buraya güçlü bir şifre girin

# Domain
DOMAIN="randevucun.shop"

echo -e "${YELLOW}📋 Deployment Bilgileri:${NC}"
echo "  VPS IP: $VPS_IP"
echo "  VPS Hostname: $VPS_HOSTNAME"
echo "  Project Directory: $PROJECT_DIR"
echo ""

# 1. Sistem güncellemesi
echo -e "${YELLOW}📦 Sistem güncelleniyor...${NC}"
sudo apt update && sudo apt upgrade -y

# 2. Node.js kurulumu kontrolü
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Node.js kuruluyor...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo -e "${GREEN}✅ Node.js zaten kurulu: $(node --version)${NC}"
fi

# 3. PostgreSQL kurulumu kontrolü
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}📦 PostgreSQL kuruluyor...${NC}"
    sudo apt install postgresql postgresql-contrib -y
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
else
    echo -e "${GREEN}✅ PostgreSQL zaten kurulu${NC}"
fi

# 4. PostgreSQL database oluşturma
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}⚠️  DB_PASSWORD değişkeni boş! Lütfen script içinde düzenleyin.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 PostgreSQL database ve kullanıcı oluşturuluyor...${NC}"
sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\q
EOF

# 5. Nginx kurulumu kontrolü
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Nginx kuruluyor...${NC}"
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
else
    echo -e "${GREEN}✅ Nginx zaten kurulu${NC}"
fi

# 6. PM2 kurulumu kontrolü
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 PM2 kuruluyor...${NC}"
    sudo npm install -g pm2
else
    echo -e "${GREEN}✅ PM2 zaten kurulu${NC}"
fi

# 7. Proje klasörü oluşturma
echo -e "${YELLOW}📦 Proje klasörü hazırlanıyor...${NC}"
sudo mkdir -p /var/www
cd /var/www

# 8. Proje klonlama veya güncelleme
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}📦 Proje güncelleniyor...${NC}"
    cd $PROJECT_DIR
    git pull origin main
else
    echo -e "${YELLOW}📦 Proje klonlanıyor...${NC}"
    sudo git clone $GITHUB_REPO
    sudo chown -R $USER:$USER Randevuasistan
    cd $PROJECT_DIR
fi

# 9. Backend kurulumu
echo -e "${YELLOW}📦 Backend bağımlılıkları yükleniyor...${NC}"
cd backend
npm install
npm run build

# 10. Backend .env dosyası oluşturma
echo -e "${YELLOW}📦 Backend .env dosyası oluşturuluyor...${NC}"
if [ ! -f .env ]; then
    cat > .env << EOF
PORT=3001
NODE_ENV=production
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public"
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://${DOMAIN:-$VPS_IP}
OPENAI_API_KEY=""
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    echo -e "${GREEN}✅ Backend .env dosyası oluşturuldu${NC}"
else
    echo -e "${YELLOW}⚠️  Backend .env dosyası zaten var${NC}"
fi

# 11. Prisma database setup
echo -e "${YELLOW}📦 Prisma database setup yapılıyor...${NC}"
npx prisma generate
npx prisma db push

# 12. Frontend kurulumu
echo -e "${YELLOW}📦 Frontend bağımlılıkları yükleniyor...${NC}"
cd ../frontend
npm install
npm run build

# 13. Frontend .env.local dosyası oluşturma
echo -e "${YELLOW}📦 Frontend .env.local dosyası oluşturuluyor...${NC}"
if [ ! -f .env.local ]; then
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://${DOMAIN:-$VPS_IP}/api
EOF
    echo -e "${GREEN}✅ Frontend .env.local dosyası oluşturuldu${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend .env.local dosyası zaten var${NC}"
fi

# 14. PM2 ile backend başlatma
echo -e "${YELLOW}📦 Backend PM2 ile başlatılıyor...${NC}"
cd ../backend
pm2 delete randevuasistan-backend 2>/dev/null || true
pm2 start dist/index.js --name randevuasistan-backend
pm2 save

# 15. PM2 ile frontend başlatma
echo -e "${YELLOW}📦 Frontend PM2 ile başlatılıyor...${NC}"
cd ../frontend
pm2 delete randevuasistan-frontend 2>/dev/null || true
pm2 start npm --name randevuasistan-frontend -- start
pm2 save

# 16. PM2 startup
echo -e "${YELLOW}📦 PM2 startup ayarlanıyor...${NC}"
pm2 startup

# 17. Nginx config oluşturma
echo -e "${YELLOW}📦 Nginx config dosyası oluşturuluyor...${NC}"
sudo tee /etc/nginx/sites-available/randevuasistan > /dev/null << EOF
server {
    listen 80;
    server_name ${DOMAIN:-$VPS_IP} ${DOMAIN:+www.$DOMAIN};

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 18. Nginx config aktif etme
echo -e "${YELLOW}📦 Nginx config aktif ediliyor...${NC}"
sudo ln -sf /etc/nginx/sites-available/randevuasistan /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# 19. Firewall ayarları
echo -e "${YELLOW}📦 Firewall ayarları yapılıyor...${NC}"
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw --force enable

echo ""
echo -e "${GREEN}✅ Deployment tamamlandı!${NC}"
echo ""
echo "📊 Durum Kontrolü:"
pm2 status
echo ""
echo "🌐 Erişim:"
if [ -n "$DOMAIN" ]; then
    echo "  Frontend: https://$DOMAIN"
    echo "  Backend API: https://$DOMAIN/api"
    echo "  Health Check: https://$DOMAIN/api/health"
    echo ""
    echo "📝 Sonraki Adımlar:"
    echo "  1. SSL sertifikası kurun (Let's Encrypt):"
    echo "     sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    echo "     (SSL kurulduktan sonra https:// kullanılabilir)"
else
    echo "  Frontend: http://$VPS_IP"
    echo "  Backend API: http://$VPS_IP/api"
    echo "  Health Check: http://$VPS_IP/api/health"
fi
echo "  2. PM2 loglarını kontrol edin:"
echo "     pm2 logs randevuasistan-backend"
echo "     pm2 logs randevuasistan-frontend"

