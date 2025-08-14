# Supabase Ayarları Rehberi

## 1. Email Confirmation'ı Kapat

1. Supabase Dashboard'a git
2. **Authentication** > **Settings** sekmesine git
3. **Email Auth** bölümünde:
   - **Enable email confirmations** kutusunu **işaretleme**
   - **Enable email change confirmations** kutusunu **işaretleme**
4. **Save** butonuna tıkla

## 2. RLS Policies Kontrol Et

1. **Database** > **Tables** > **salon_profiles** tablosuna git
2. **Policies** sekmesine tıkla
3. Şu policy'lerin olduğundan emin ol:
   - "Users can view own salon profile"
   - "Users can insert own salon profile"
   - "Users can update own salon profile"

## 3. Test SQL Çalıştır

`test-supabase.sql` dosyasını Supabase SQL Editor'de çalıştır.

## 4. Environment Variables Kontrol Et

`frontend/.env.local` dosyasında:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 5. Frontend'i Yeniden Başlat

```bash
cd frontend
npm run dev
```

## 6. Test Et

1. `http://localhost:3000/register` - Yeni hesap oluştur
2. Console'da hata mesajlarını kontrol et
3. Supabase Dashboard > **Authentication** > **Users** - Kullanıcının oluştuğunu kontrol et
4. **Database** > **Tables** > **salon_profiles** - Profilin oluştuğunu kontrol et
