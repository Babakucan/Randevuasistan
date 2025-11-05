# 🔧 Hostinger API Kullanım Rehberi

## 📋 Özet

MCP server yerine, Hostinger VPS API'yi doğrudan deployment script'lerinde kullanabilirsiniz.

## 🚀 Kullanım

### 1. API Tool ile VPS Bilgilerini Alma

```bash
cd scripts
node hostinger-api-tool.js <API_TOKEN> list virtual-machines
```

### 2. Environment Variable ile Kullanım

```bash
export HOSTINGER_API_TOKEN="Y0ixI2E9Twf1jLgA3bgsaMP15IhN5JLzfVHTvwYT8ee5c37d"
export HOSTINGER_API_URL="https://developers.hostinger.com/api/vps/v1"

node hostinger-api-tool.js list virtual-machines
```

### 3. Deployment Script'lerinde Kullanım

```javascript
const { makeHostingerRequest } = require('./scripts/hostinger-api-tool');

// VPS listesini al
const vpsList = await makeHostingerRequest('virtual-machines');
console.log(vpsList);
```

## 🔐 Güvenlik

**ÖNEMLİ:** API token'ınızı asla git'e commit etmeyin!

- `.env` dosyasına ekleyin
- Environment variable olarak kullanın
- `.gitignore` içinde `.env` olduğundan emin olun

## 📝 Mevcut VPS Bilgileri

**VPS ID:** 1105106  
**IP:** 72.61.89.17  
**Hostname:** srv1105106.hstgr.cloud  
**Durum:** Running ✅

## 🔄 MCP Server Notu

MCP server hatası nedeniyle, API'yi doğrudan tool olarak kullanıyoruz. Bu daha güvenilir ve basit bir çözümdür.

---

**Son Güncelleme:** 2025-11-05

