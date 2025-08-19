-- =====================================================
-- SEVİM KUAFÖR SALONU SAHTE VERİ ÜRETİCİ (FİNAL)
-- =====================================================

-- Önce user ID'nizi bulun (bu sorguyu çalıştırın)
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Önce mevcut tablo yapısını kontrol edin
-- \d salon_profiles

-- =====================================================
-- 1. SALON PROFİLİ OLUŞTUR (ADDRESS OLMADAN)
-- =====================================================

-- Önce salon profili oluştur (user_id'yi kendi user_id'niz ile değiştirin)
INSERT INTO salon_profiles (user_id, name, owner_name, phone, email, description, working_hours)
VALUES (
  'YOUR_USER_ID_HERE', -- Buraya kendi user_id'nizi yazın (UUID formatında)
  'Sevim Kuaför Salonu',
  'Sevim Yılmaz',
  '+90 555 123 4567',
  'sevim@kuaforsalonu.com',
  'Profesyonel kuaför hizmetleri, modern ekipmanlar ve deneyimli personel ile hizmetinizdeyiz. Atatürk Caddesi No: 123, Merkez/İstanbul',
  '{"monday": {"open": "09:00", "close": "20:00"}, "tuesday": {"open": "09:00", "close": "20:00"}, "wednesday": {"open": "09:00", "close": "20:00"}, "thursday": {"open": "09:00", "close": "20:00"}, "friday": {"open": "09:00", "close": "20:00"}, "saturday": {"open": "09:00", "close": "18:00"}, "sunday": {"open": "10:00", "close": "16:00"}}'
);

-- =====================================================
-- 2. HİZMETLER OLUŞTUR
-- =====================================================

INSERT INTO services (salon_id, name, description, duration, price, category, is_active)
SELECT 
  sp.id,
  'Saç Kesimi',
  'Profesyonel saç kesimi ve şekillendirme',
  45,
  80.00,
  'Saç',
  true
FROM salon_profiles sp
WHERE sp.name = 'Sevim Kuaför Salonu';

INSERT INTO services (salon_id, name, description, duration, price, category, is_active)
SELECT 
  sp.id,
  'Saç Boyama',
  'Kalıcı saç boyama işlemi',
  120,
  200.00,
  'Saç',
  true
FROM salon_profiles sp
WHERE sp.name = 'Sevim Kuaför Salonu';

INSERT INTO services (salon_id, name, description, duration, price, category, is_active)
SELECT 
  sp.id,
  'Fön',
  'Saç kurutma ve şekillendirme',
  30,
  60.00,
  'Saç',
  true
FROM salon_profiles sp
WHERE sp.name = 'Sevim Kuaför Salonu';

INSERT INTO services (salon_id, name, description, duration, price, category, is_active)
SELECT 
  sp.id,
  'Manikür',
  'El bakımı ve oje uygulaması',
  45,
  70.00,
  'El/Ayak',
  true
FROM salon_profiles sp
WHERE sp.name = 'Sevim Kuaför Salonu';

INSERT INTO services (salon_id, name, description, duration, price, category, is_active)
SELECT 
  sp.id,
  'Makyaj',
  'Günlük ve özel gün makyajı',
  60,
  100.00,
  'Makyaj',
  true
FROM salon_profiles sp
WHERE sp.name = 'Sevim Kuaför Salonu';

-- =====================================================
-- 3. ÇALIŞANLAR OLUŞTUR
-- =====================================================

INSERT INTO employees (salon_id, name, email, phone, position, specialties, bio, experience_years, hourly_rate, is_active)
SELECT 
  sp.id,
  'Ayşe Demir',
  'ayse@kuaforsalonu.com',
  '+90 555 111 1111',
  'Kuaför',
  '["Saç Kesimi", "Saç Boyama", "Fön"]',
  '10 yıllık deneyimli kuaför, özellikle saç boyama konusunda uzman.',
  10,
  120.00,
  true
FROM salon_profiles sp
WHERE sp.name = 'Sevim Kuaför Salonu';

INSERT INTO employees (salon_id, name, email, phone, position, specialties, bio, experience_years, hourly_rate, is_active)
SELECT 
  sp.id,
  'Fatma Kaya',
  'fatma@kuaforsalonu.com',
  '+90 555 222 2222',
  'Kuaför',
  '["Saç Bakımı", "Keratin Bakımı", "Saç Uzatma"]',
  'Saç bakımı ve keratin işlemlerinde uzmanlaşmış deneyimli kuaför.',
  8,
  110.00,
  true
FROM salon_profiles sp
WHERE sp.name = 'Sevim Kuaför Salonu';

INSERT INTO employees (salon_id, name, email, phone, position, specialties, bio, experience_years, hourly_rate, is_active)
SELECT 
  sp.id,
  'Zeynep Özkan',
  'zeynep@kuaforsalonu.com',
  '+90 555 333 3333',
  'Makyaj Uzmanı',
  '["Makyaj", "Cilt Bakımı", "Kaş Şekillendirme"]',
  'Profesyonel makyaj ve cilt bakımı uzmanı, özel günler için özel makyajlar.',
  6,
  100.00,
  true
FROM salon_profiles sp
WHERE sp.name = 'Sevim Kuaför Salonu';

-- =====================================================
-- 4. MÜŞTERİLER OLUŞTUR
-- =====================================================

INSERT INTO customers (salon_id, name, phone, email, birth_date, notes, preferences)
SELECT 
  sp.id,
  'Selin Arslan',
  '+90 555 666 6666',
  'selin@email.com',
  '1990-05-15',
  'Düzenli müşteri, saç boyama tercih ediyor',
  '{"favorite_service": "Saç Boyama", "preferred_stylist": "Ayşe Demir", "allergies": []}'
FROM salon_profiles sp
WHERE sp.name = 'Sevim Kuaför Salonu';

INSERT INTO customers (salon_id, name, phone, email, birth_date, notes, preferences)
SELECT 
  sp.id,
  'Deniz Yılmaz',
  '+90 555 777 7777',
  'deniz@email.com',
  '1985-08-22',
  'Kısa saç tercih ediyor, hızlı işlem istiyor',
  '{"favorite_service": "Saç Kesimi", "preferred_stylist": "Fatma Kaya", "allergies": ["Lateks"]}'
FROM salon_profiles sp
WHERE sp.name = 'Sevim Kuaför Salonu';

INSERT INTO customers (salon_id, name, phone, email, birth_date, notes, preferences)
SELECT 
  sp.id,
  'Büşra Özkan',
  '+90 555 888 8888',
  'busra@email.com',
  '1992-12-03',
  'Uzun saç bakımı yaptırıyor',
  '{"favorite_service": "Saç Bakımı", "preferred_stylist": "Zeynep Özkan", "allergies": []}'
FROM salon_profiles sp
WHERE sp.name = 'Sevim Kuaför Salonu';

INSERT INTO customers (salon_id, name, phone, email, birth_date, notes, preferences)
SELECT 
  sp.id,
  'Gizem Demir',
  '+90 555 999 9999',
  'gizem@email.com',
  '1988-03-10',
  'Özel günler için makyaj yaptırıyor',
  '{"favorite_service": "Makyaj", "preferred_stylist": "Elif Yıldız", "allergies": ["Paraben"]}'
FROM salon_profiles sp
WHERE sp.name = 'Sevim Kuaför Salonu';

INSERT INTO customers (salon_id, name, phone, email, birth_date, notes, preferences)
SELECT 
  sp.id,
  'Esra Kaya',
  '+90 555 000 0000',
  'esra@email.com',
  '1995-07-18',
  'Manikür ve pedikür düzenli yaptırıyor',
  '{"favorite_service": "Manikür", "preferred_stylist": "Merve Çelik", "allergies": []}'
FROM salon_profiles sp
WHERE sp.name = 'Sevim Kuaför Salonu';

-- =====================================================
-- 5. RANDEVULAR OLUŞTUR
-- =====================================================

INSERT INTO appointments (salon_id, customer_id, service_id, start_time, end_time, status, notes, source)
SELECT 
  sp.id,
  c.id,
  s.id,
  '2024-01-15 10:00:00+03',
  '2024-01-15 11:00:00+03',
  'completed',
  'Müşteri çok memnun kaldı',
  'manual'
FROM salon_profiles sp
JOIN customers c ON c.salon_id = sp.id
JOIN services s ON s.salon_id = sp.id
WHERE sp.name = 'Sevim Kuaför Salonu'
AND c.name = 'Selin Arslan'
AND s.name = 'Saç Boyama'
LIMIT 1;

INSERT INTO appointments (salon_id, customer_id, service_id, start_time, end_time, status, notes, source)
SELECT 
  sp.id,
  c.id,
  s.id,
  '2024-01-16 14:00:00+03',
  '2024-01-16 15:00:00+03',
  'completed',
  'Hızlı saç kesimi',
  'phone'
FROM salon_profiles sp
JOIN customers c ON c.salon_id = sp.id
JOIN services s ON s.salon_id = sp.id
WHERE sp.name = 'Sevim Kuaför Salonu'
AND c.name = 'Deniz Yılmaz'
AND s.name = 'Saç Kesimi'
LIMIT 1;

INSERT INTO appointments (salon_id, customer_id, service_id, start_time, end_time, status, notes, source)
SELECT 
  sp.id,
  c.id,
  s.id,
  '2024-01-17 11:00:00+03',
  '2024-01-17 12:00:00+03',
  'completed',
  'Makyaj işlemi',
  'whatsapp'
FROM salon_profiles sp
JOIN customers c ON c.salon_id = sp.id
JOIN services s ON s.salon_id = sp.id
WHERE sp.name = 'Sevim Kuaför Salonu'
AND c.name = 'Gizem Demir'
AND s.name = 'Makyaj'
LIMIT 1;

-- =====================================================
-- 6. TELEFON ARAMALARI GEÇMİŞİ OLUŞTUR
-- =====================================================

INSERT INTO call_history (user_id, customer_phone, call_type, duration, status, transcript, sentiment_analysis, key_points, follow_up_required, follow_up_notes)
SELECT 
  sp.user_id,
  '+90 555 666 6666',
  'incoming',
  180,
  'completed',
  'Müşteri: Merhaba, randevu almak istiyorum. Ayşe hanım müsait mi?',
  '{"sentiment": "positive", "confidence": 0.85}',
  '["randevu talebi", "Ayşe hanım tercihi"]',
  false,
  NULL
FROM salon_profiles sp
WHERE sp.name = 'Sevim Kuaför Salonu';

INSERT INTO call_history (user_id, customer_phone, call_type, duration, status, transcript, sentiment_analysis, key_points, follow_up_required, follow_up_notes)
SELECT 
  sp.user_id,
  '+90 555 777 7777',
  'outgoing',
  120,
  'completed',
  'Biz: Merhaba, randevunuzu hatırlatmak istiyoruz. Yarın saat 14:00''te geliyorsunuz.',
  '{"sentiment": "neutral", "confidence": 0.78}',
  '["randevu hatırlatması", "yarın 14:00"]',
  false,
  NULL
FROM salon_profiles sp
WHERE sp.name = 'Sevim Kuaför Salonu';

-- =====================================================
-- BAŞARILI MESAJI
-- =====================================================

SELECT 'Sahte veriler başarıyla oluşturuldu!' as message;

-- =====================================================
-- VERİ ÖZETİ
-- =====================================================

SELECT 
  'Salon Profili' as table_name,
  COUNT(*) as record_count
FROM salon_profiles
WHERE name = 'Sevim Kuaför Salonu'

UNION ALL

SELECT 
  'Hizmetler' as table_name,
  COUNT(*) as record_count
FROM services s
JOIN salon_profiles sp ON s.salon_id = sp.id
WHERE sp.name = 'Sevim Kuaför Salonu'

UNION ALL

SELECT 
  'Çalışanlar' as table_name,
  COUNT(*) as record_count
FROM employees e
JOIN salon_profiles sp ON e.salon_id = sp.id
WHERE sp.name = 'Sevim Kuaför Salonu'

UNION ALL

SELECT 
  'Müşteriler' as table_name,
  COUNT(*) as record_count
FROM customers c
JOIN salon_profiles sp ON c.salon_id = sp.id
WHERE sp.name = 'Sevim Kuaför Salonu'

UNION ALL

SELECT 
  'Randevular' as table_name,
  COUNT(*) as record_count
FROM appointments a
JOIN salon_profiles sp ON a.salon_id = sp.id
WHERE sp.name = 'Sevim Kuaför Salonu'

UNION ALL

SELECT 
  'Telefon Aramaları' as table_name,
  COUNT(*) as record_count
FROM call_history ch
JOIN salon_profiles sp ON ch.user_id = sp.user_id
WHERE sp.name = 'Sevim Kuaför Salonu';
