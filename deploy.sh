#!/bin/bash

# 🚀 Randevu Asistan V2 - VPS Deployment Script
# Bu script VPS sunucusunda projeyi deploy etmek için kullanılır

set -e  # Hata durumunda dur

echo "🚀 Randevu Asistan V2 Deployment Başlatılıyor..."

# Renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Değişkenler (Bu değerleri kendi VPS'inize göre düzenleyin)
PROJECT_DIR="/var/www/Randevuasistan"
DB_USER="randevuasistan"
DB_NAME="randevuasistan_db"
DB_PASSWORD=""  # PostgreSQL şifresi buraya
DOMAIN=""  # Domain adınız buraya (örn: randevuasistan.com)

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

# 4. PostgreSQL database ve kullanıcı oluşturma
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}⚠️  DB_PASSWORD değişkeni boş! Lütfen script içinde düzenleyin.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 PostgreSQL database ve kullanıcı oluşturuluyor...${NC}"
sudo -u postgres psql << EOF
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
    sudo git clone https://github.com/Babakucan/Randevuasistan.git
    sudo chown -R $USER:$USER Randevuasistan
    cd $PROJECT_DIR
fi

# 9. Backend bağımlılıkları
echo -e "${YELLOW}📦 Backend bağımlılıkları yükleniyor...${NC}"
cd backend
npm install
npm run build

# 10. Frontend bağımlılıkları
echo -e "${YELLOW}📦 Frontend bağımlılıkları yükleniyor...${NC}"
cd ../frontend
npm install

# 11. Environment dosyaları kontrolü
echo -e "${YELLOW}⚠️  Environment dosyalarını kontrol edin!${NC}"
echo -e "${YELLOW}   - backend/.env dosyasını oluşturun${NC}"
echo -e "${YELLOW}   - frontend/.env.local dosyasını oluşturun${NC}"

# 12. Prisma database setup
echo -e "${YELLOW}📦 Prisma database setup yapılıyor...${NC}"
cd ../backend
npx prisma generate
npx prisma db push

echo -e "${GREEN}✅ Deployment tamamlandı!${NC}"
echo -e "${YELLOW}⚠️  Sonraki adımlar:${NC}"
echo -e "   1. Environment dosyalarını oluşturun"
echo -e "   2. PM2 ile backend ve frontend'i başlatın"
echo -e "   3. Nginx config dosyasını oluşturun"
echo -e "   4. SSL sertifikası kurun (Let's Encrypt)"

