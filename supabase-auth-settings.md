# Supabase Auth Ayarları

## Email Confirmation'ı Devre Dışı Bırak

1. **Supabase Dashboard** > **Authentication** > **Settings**
2. **Email Auth** bölümünde:
   - **Enable email confirmations** kutusunu işaretleme
   - **Enable email change confirmations** kutusunu işaretleme
3. **Save** butonuna tıkla

## Alternatif: Email Confirmation'ı Etkinleştir

Eğer email confirmation istiyorsan:
1. **Supabase Dashboard** > **Authentication** > **Settings**
2. **Email Auth** bölümünde:
   - **Enable email confirmations** kutusunu işaretle
   - **Enable email change confirmations** kutusunu işaretle
3. **SMTP Settings** bölümünde email ayarlarını yap
4. **Save** butonuna tıkla

## Test için Geçici Çözüm

Email confirmation olmadan test etmek için:
1. **Supabase Dashboard** > **Authentication** > **Users**
2. Kayıt olan kullanıcıyı bul
3. **Actions** > **Confirm user** tıkla
4. Artık login olabilir

## Frontend'de Email Confirmation Mesajı

Register sayfasında email confirmation mesajı göster:
"Kayıt başarılı! Email adresinizi kontrol edin ve hesabınızı doğrulayın."
