# Supabase Authentication Ayarları Düzeltme

## 1. Email Authentication'ı Aç

1. **Supabase Dashboard**'a git
2. **Authentication** > **Providers** sekmesine git
3. **Email** provider'ını bul
4. **Enable** kutusunu **işaretle**
5. **Save** butonuna tıkla

## 2. Email Confirmation Ayarları

1. **Authentication** > **Settings** sekmesine git
2. **Email Auth** bölümünde:
   - **Enable email confirmations** kutusunu **işaretleme** (kapat)
   - **Enable email change confirmations** kutusunu **işaretleme** (kapat)
3. **Save** butonuna tıkla

## 3. Site URL Ayarları

1. **Authentication** > **Settings** sekmesine git
2. **Site URL** bölümünde:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: `http://localhost:3000/auth/callback`
3. **Save** butonuna tıkla

## 4. Test Et

1. Frontend'i yeniden başlat
2. `http://localhost:3000/register` - Yeni hesap oluştur
3. Console'da hata mesajlarını kontrol et

## 5. Olası Sorunlar

- **Email provider kapalı**: Authentication > Providers > Email > Enable
- **Email confirmation açık**: Settings > Email confirmations kapat
- **Site URL yanlış**: Settings > Site URL = http://localhost:3000
- **RLS policy sorunu**: Database > Tables > salon_profiles > Policies kontrol et
