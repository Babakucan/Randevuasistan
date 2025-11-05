# 🚀 VPS Deployment - Adım Adım Talimatlar

## VPS Bilgileri

- **IP:** 72.61.89.17
- **Hostname:** srv1105106.hstgr.cloud
- **Domain:** randevucun.shop
- **SSH:** root@72.61.89.17
- **Şifre:** 3621344552aA.

## 🎯 Hızlı Deployment

### Adım 1: VPS'e SSH ile Bağlanın

Terminal veya PowerShell'de:

```bash
ssh root@72.61.89.17
```

Şifre sorulduğunda: `3621344552aA.` girin

### Adım 2: Deployment Script'ini Çalıştırın

VPS'e bağlandıktan sonra:

```bash
# Script'i indir
cd /tmp
curl -O https://raw.githubusercontent.com/Babakucan/Randevuasistan/main/scripts/deploy-all.sh

# Çalıştırılabilir yap
chmod +x deploy-all.sh

# Script'i çalıştır
sudo ./deploy-all.sh
```

### Adım 3: Bekleyin

Script otomatik olarak:
- ✅ Sistem güncellemesi yapacak
- ✅ Node.js, PostgreSQL, Nginx, PM2 kuracak
- ✅ Database oluşturacak
- ✅ Projeyi klonlayacak
- ✅ Backend ve Frontend build edecek
- ✅ PM2 ile başlatacak
- ✅ Nginx config ayarlayacak

### Adım 4: Kontrol Edin

```bash
# PM2 durumu
pm2 status

# Backend health check
curl http://localhost:3001/health

# Frontend erişim
curl http://localhost:3000
```

## 🌐 Erişim

Deployment tamamlandıktan sonra:

- **Domain:** randevucun.shop
- **Frontend:** https://randevucun.shop (SSL kurulduktan sonra)
- **Backend API:** https://randevucun.shop/api
- **Health Check:** https://randevucun.shop/api/health

**Not:** SSL sertifikası kurulduktan sonra https:// kullanılabilir. SSL kurulumu için:
```bash
sudo certbot --nginx -d randevucun.shop -d www.randevucun.shop
```

## 🔧 Sorun Giderme

### PM2 servisleri çalışmıyor

```bash
pm2 logs randevuasistan-backend
pm2 logs randevuasistan-frontend
pm2 restart all
```

### Nginx çalışmıyor

```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl restart nginx
```

### Database bağlantı hatası

```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "\l"
```

---

**Son Güncelleme:** 2025-11-05

