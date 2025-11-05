#!/usr/bin/env node

/**
 * Hostinger VPS API Tool
 * Bu script VPS deployment için Hostinger API'yi kullanır
 * MCP server yerine basit bir CLI tool olarak çalışır
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

// Environment variables
const API_URL = process.env.HOSTINGER_API_URL || 'https://developers.hostinger.com/api/vps/v1';
const API_TOKEN = process.env.HOSTINGER_API_TOKEN || process.argv[2];

if (!API_TOKEN) {
  console.error('❌ HOSTINGER_API_TOKEN gerekli!');
  console.error('Kullanım: node hostinger-api-tool.js <token> [command]');
  process.exit(1);
}

/**
 * Hostinger API'ye istek gönderir
 */
function makeHostingerRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const fullUrl = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_URL}/${endpoint}`.replace(/\/+/g, '/').replace(/:\//, '://');
    
    const url = new URL(fullUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && (method === 'POST' || method === 'PUT')) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// CLI komutları
const command = process.argv[3] || 'list';
const vpsId = process.argv[4];
const endpoint = process.argv[5] || 'virtual-machines';

async function main() {
  try {
    switch (command) {
      case 'list':
      case 'get':
        console.log('🔄 VPS listesi alınıyor...\n');
        const response = await makeHostingerRequest(endpoint);
        
        if (response.status === 200 && Array.isArray(response.data)) {
          console.log('✅ VPS Listesi:\n');
          response.data.forEach((vps, index) => {
            console.log(`${index + 1}. VPS ID: ${vps.id}`);
            console.log(`   Hostname: ${vps.hostname}`);
            console.log(`   IP: ${vps.ipv4?.[0]?.address || 'N/A'}`);
            console.log(`   Durum: ${vps.state}`);
            console.log(`   Plan: ${vps.plan} (${vps.cpus} CPU, ${vps.memory}MB RAM, ${vps.disk}MB Disk)`);
            console.log(`   Template: ${vps.template?.name || 'N/A'}`);
            console.log('');
          });
        } else {
          console.log(JSON.stringify(response, null, 2));
        }
        break;

      case 'info':
        console.log('🔄 VPS bilgileri alınıyor...\n');
        const info = await makeHostingerRequest(endpoint);
        console.log(JSON.stringify(info, null, 2));
        break;

      case 'reset':
      case 'rebuild':
      case 'reinstall':
        if (!vpsId) {
          console.error('❌ VPS ID gerekli!');
          console.error('Kullanım: node hostinger-api-tool.js <token> reset <vps_id>');
          process.exit(1);
        }

        console.log(`⚠️  UYARI: VPS ${vpsId} sıfırlanacak!`);
        console.log('⚠️  Tüm veriler silinecek!');
        console.log('🔄 Sıfırlama işlemi başlatılıyor...\n');

        // Hostinger API endpoint'lerini deniyoruz
        // Farklı endpoint formatları olabilir
        const possibleEndpoints = [
          `virtual-machines/${vpsId}/rebuild`,
          `virtual-machines/${vpsId}/reinstall`,
          `virtual-machines/${vpsId}/reset`,
          `virtual-machines/${vpsId}/actions/rebuild`,
          `virtual-machines/${vpsId}/actions/reinstall`,
        ];

        const resetData = {
          template_id: 1121, // Ubuntu 24.04 with Docker (mevcut template)
        };

        let resetResponse = null;
        let lastError = null;

        // Farklı endpoint'leri deniyoruz
        for (const endpoint of possibleEndpoints) {
          try {
            console.log(`🔄 Denenen endpoint: ${endpoint}`);
            resetResponse = await makeHostingerRequest(endpoint, 'POST', resetData);
            
            if (resetResponse.status === 200 || resetResponse.status === 202) {
              break; // Başarılı endpoint bulundu
            }
            lastError = resetResponse;
          } catch (error) {
            lastError = { status: 'ERROR', data: { message: error.message } };
          }
        }

        if (!resetResponse || (resetResponse.status !== 200 && resetResponse.status !== 202)) {
          // Son hata ile devam et
          resetResponse = lastError;
        }
        
        if (resetResponse.status === 200 || resetResponse.status === 202) {
          console.log('✅ VPS sıfırlama işlemi başlatıldı!');
          console.log(JSON.stringify(resetResponse.data, null, 2));
          console.log('\n⏳ İşlem tamamlanana kadar bekleyin...');
        } else {
          console.error('❌ Sıfırlama hatası:');
          console.error(JSON.stringify(resetResponse, null, 2));
        }
        break;

      default:
        console.log('📖 Kullanım:');
        console.log('  node hostinger-api-tool.js <token> [command] [vps_id|endpoint]');
        console.log('');
        console.log('Komutlar:');
        console.log('  list      - VPS listesini göster (varsayılan)');
        console.log('  get       - VPS bilgilerini al');
        console.log('  info      - Detaylı bilgi');
        console.log('  reset     - VPS\'yi sıfırla (tüm veriler silinir!)');
        console.log('  rebuild   - VPS\'yi yeniden oluştur');
        console.log('  reinstall - VPS\'yi yeniden kur');
        console.log('');
        console.log('Örnekler:');
        console.log('  node hostinger-api-tool.js <token> list');
        console.log('  node hostinger-api-tool.js <token> reset 1105106');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { makeHostingerRequest };

