#!/usr/bin/env node

/**
 * Hostinger VPS API MCP Server
 * Bu script Hostinger VPS API'yi MCP protokolü üzerinden kullanılabilir hale getirir
 */

const http = require('http');
const https = require('https');

// Environment variables
const API_URL = process.env.HOSTINGER_API_URL || 'https://developers.hostinger.com/api/vps/v1';
const API_TOKEN = process.env.HOSTINGER_API_TOKEN;

if (!API_TOKEN) {
  console.error('HOSTINGER_API_TOKEN environment variable is required');
  process.exit(1);
}

/**
 * Hostinger API'ye istek gönderir
 */
function makeHostingerRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    // Endpoint'i tam URL olarak oluştur
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

// MCP Server basit implementasyonu
// Not: Tam MCP protokolü için @modelcontextprotocol/server-fetch veya benzeri kullanılmalı

// CLI kullanımı
if (require.main === module) {
  const command = process.argv[2];
  const endpoint = process.argv[3] || 'virtual-machines';

  switch (command) {
    case 'list':
    case 'get':
      makeHostingerRequest(endpoint)
        .then((response) => {
          console.log(JSON.stringify(response, null, 2));
        })
        .catch((error) => {
          console.error('Error:', error.message);
          process.exit(1);
        });
      break;

    default:
      console.log('Usage: node hostinger-mcp-server.js [list|get] [endpoint]');
      console.log('Example: node hostinger-mcp-server.js list virtual-machines');
      process.exit(1);
  }
}

module.exports = { makeHostingerRequest };

