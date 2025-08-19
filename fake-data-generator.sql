-- =====================================================
-- SEVİM KUAFÖR SALONU SAHTE VERİ ÜRETİCİ
-- =====================================================

-- Önce mevcut verileri temizle (isteğe bağlı)
-- DELETE FROM conversation_analytics;
-- DELETE FROM call_recordings;
-- DELETE FROM call_history;
-- DELETE FROM ai_conversations;
-- DELETE FROM appointments;
-- DELETE FROM employee_services;
-- DELETE FROM employees;
-- DELETE FROM customers;
-- DELETE FROM services;
-- DELETE FROM salon_settings;

-- =====================================================
-- 1. SALON PROFİLİ OLUŞTUR
-- =====================================================

-- Önce salon profili oluştur (user_id'yi kendi user_id'niz ile değiştirin)
INSERT INTO salon_profiles (user_id, name, owner_name, phone, email, address, description, working_hours)
VALUES (
  'YOUR_USER_ID_HERE', -- Buraya kendi user_id'nizi yazın
  'Sevim Kuaför Salonu',
  'Sevim Yılmaz',
  '+90 555 123 4567',
  'sevim@kuaforsalonu.com',
  'Atatürk Caddesi No: 123, Merkez/İstanbul',
  'Profesyonel kuaför hizmetleri, modern ekipmanlar ve deneyimli personel ile hizmetinizdeyiz.',
  '{"monday": {"open": "09:00", "close": "20:00"}, "tuesday": {"open": "09:00", "close": "20:00"}, "wednesday": {"open": "09:00", "close": "20:00"}, "thursday": {"open": "09:00", "close": "20:00"}, "friday": {"open": "09:00", "close": "20:00"}, "saturday": {"open": "09:00", "close": "18:00"}, "sunday": {"open": "10:00", "close": "16:00"}}'
);

-- =====================================================
-- 2. HİZMETLER OLUŞTUR
-- =====================================================

INSERT INTO services (salon_id, name, description, duration, price, category, is_active)
SELECT 
  sp.id,
  service_data.name,
  service_data.description,
  service_data.duration,
  service_data.price,
  service_data.category,
  true
FROM salon_profiles sp
CROSS JOIN (
  VALUES 
    ('Saç Kesimi', 'Profesyonel saç kesimi ve şekillendirme', 45, 80.00, 'Saç'),
    ('Saç Boyama', 'Kalıcı saç boyama işlemi', 120, 200.00, 'Saç'),
    ('Fön', 'Saç kurutma ve şekillendirme', 30, 60.00, 'Saç'),
    ('Saç Bakımı', 'Derin saç bakımı ve nemlendirme', 60, 120.00, 'Saç'),
    ('Manikür', 'El bakımı ve oje uygulaması', 45, 70.00, 'El/Ayak'),
    ('Pedikür', 'Ayak bakımı ve oje uygulaması', 60, 90.00, 'El/Ayak'),
    ('Cilt Bakımı', 'Yüz temizleme ve nemlendirme', 90, 150.00, 'Cilt'),
    ('Makyaj', 'Günlük ve özel gün makyajı', 60, 100.00, 'Makyaj'),
    ('Kaş Şekillendirme', 'Kaş alma ve şekillendirme', 30, 50.00, 'Kaş/Kirpik'),
    ('Kirpik Lifting', 'Kirpik perma işlemi', 90, 180.00, 'Kaş/Kirpik'),
    ('Saç Uzatma', 'Saç ekleme ve uzatma', 180, 500.00, 'Saç'),
    ('Keratin Bakımı', 'Saç düzleştirme ve bakım', 120, 300.00, 'Saç'),
    ('Balayage', 'Saç açma ve boyama tekniği', 150, 350.00, 'Saç'),
    ('Ombre', 'Gradyan saç boyama', 120, 280.00, 'Saç'),
    ('Saç Örgü', 'Çeşitli örgü modelleri', 45, 80.00, 'Saç')
) AS service_data(name, description, duration, price, category)
WHERE sp.name = 'Sevim Kuaför Salonu';

-- =====================================================
-- 3. ÇALIŞANLAR OLUŞTUR
-- =====================================================

INSERT INTO employees (salon_id, name, email, phone, position, specialties, bio, experience_years, hourly_rate, is_active)
SELECT 
  sp.id,
  emp_data.name,
  emp_data.email,
  emp_data.phone,
  emp_data.position,
  emp_data.specialties,
  emp_data.bio,
  emp_data.experience_years,
  emp_data.hourly_rate,
  true
FROM salon_profiles sp
CROSS JOIN (
  VALUES 
    ('Ayşe Demir', 'ayse@kuaforsalonu.com', '+90 555 111 1111', 'Kuaför', '["Saç Kesimi", "Saç Boyama", "Fön"]', '10 yıllık deneyimli kuaför, özellikle saç boyama konusunda uzman.', 10, 120.00),
    ('Fatma Kaya', 'fatma@kuaforsalonu.com', '+90 555 222 2222', 'Kuaför', '["Saç Bakımı", "Keratin Bakımı", "Saç Uzatma"]', 'Saç bakımı ve keratin işlemlerinde uzmanlaşmış deneyimli kuaför.', 8, 110.00),
    ('Zeynep Özkan', 'zeynep@kuaforsalonu.com', '+90 555 333 3333', 'Makyaj Uzmanı', '["Makyaj", "Cilt Bakımı", "Kaş Şekillendirme"]', 'Profesyonel makyaj ve cilt bakımı uzmanı, özel günler için özel makyajlar.', 6, 100.00),
    ('Elif Yıldız', 'elif@kuaforsalonu.com', '+90 555 444 4444', 'Manikür/Pedikür Uzmanı', '["Manikür", "Pedikür", "Tırnak Bakımı"]', 'El ve ayak bakımında uzman, hijyenik çalışma prensibi.', 5, 80.00),
    ('Merve Çelik', 'merve@kuaforsalonu.com', '+90 555 555 5555', 'Stajyer Kuaför', '["Saç Kesimi", "Fön"]', 'Yeni mezun, öğrenmeye açık ve enerjik stajyer kuaför.', 1, 60.00)
) AS emp_data(name, email, phone, position, specialties, bio, experience_years, hourly_rate)
WHERE sp.name = 'Sevim Kuaför Salonu';

-- =====================================================
-- 4. MÜŞTERİLER OLUŞTUR
-- =====================================================

INSERT INTO customers (salon_id, name, phone, email, birth_date, notes, preferences)
SELECT 
  sp.id,
  cust_data.name,
  cust_data.phone,
  cust_data.email,
  cust_data.birth_date,
  cust_data.notes,
  cust_data.preferences
FROM salon_profiles sp
CROSS JOIN (
  VALUES 
    ('Selin Arslan', '+90 555 666 6666', 'selin@email.com', '1990-05-15', 'Düzenli müşteri, saç boyama tercih ediyor', '{"favorite_service": "Saç Boyama", "preferred_stylist": "Ayşe Demir", "allergies": []}'),
    ('Deniz Yılmaz', '+90 555 777 7777', 'deniz@email.com', '1985-08-22', 'Kısa saç tercih ediyor, hızlı işlem istiyor', '{"favorite_service": "Saç Kesimi", "preferred_stylist": "Fatma Kaya", "allergies": ["Lateks"]}'),
    ('Büşra Özkan', '+90 555 888 8888', 'busra@email.com', '1992-12-03', 'Uzun saç bakımı yaptırıyor', '{"favorite_service": "Saç Bakımı", "preferred_stylist": "Zeynep Özkan", "allergies": []}'),
    ('Gizem Demir', '+90 555 999 9999', 'gizem@email.com', '1988-03-10', 'Özel günler için makyaj yaptırıyor', '{"favorite_service": "Makyaj", "preferred_stylist": "Elif Yıldız", "allergies": ["Paraben"]}'),
    ('Esra Kaya', '+90 555 000 0000', 'esra@email.com', '1995-07-18', 'Manikür ve pedikür düzenli yaptırıyor', '{"favorite_service": "Manikür", "preferred_stylist": "Merve Çelik", "allergies": []}'),
    ('Melis Arslan', '+90 555 111 2222', 'melis@email.com', '1991-11-25', 'Balayage ve ombre tercih ediyor', '{"favorite_service": "Balayage", "preferred_stylist": "Ayşe Demir", "allergies": ["Amonyak"]}'),
    ('Sude Yıldız', '+90 555 333 4444', 'sude@email.com', '1993-04-12', 'Keratin bakımı düzenli yaptırıyor', '{"favorite_service": "Keratin Bakımı", "preferred_stylist": "Fatma Kaya", "allergies": []}'),
    ('İrem Çelik', '+90 555 555 6666', 'irem@email.com', '1989-09-30', 'Kaş şekillendirme ve kirpik lifting', '{"favorite_service": "Kaş Şekillendirme", "preferred_stylist": "Zeynep Özkan", "allergies": []}'),
    ('Zara Özkan', '+90 555 777 8888', 'zara@email.com', '1994-01-08', 'Saç örgü modelleri tercih ediyor', '{"favorite_service": "Saç Örgü", "preferred_stylist": "Merve Çelik", "allergies": []}'),
    ('Eylül Demir', '+90 555 999 0000', 'eylul@email.com', '1996-06-20', 'Cilt bakımı düzenli yaptırıyor', '{"favorite_service": "Cilt Bakımı", "preferred_stylist": "Elif Yıldız", "allergies": ["Retinol"]}'),
    ('Defne Kaya', '+90 555 222 3333', 'defne@email.com', '1987-10-14', 'Saç uzatma işlemi yaptırdı', '{"favorite_service": "Saç Uzatma", "preferred_stylist": "Fatma Kaya", "allergies": []}'),
    ('Ada Yılmaz', '+90 555 444 5555', 'ada@email.com', '1990-02-28', 'Düğün makyajı için geliyor', '{"favorite_service": "Makyaj", "preferred_stylist": "Zeynep Özkan", "allergies": []}'),
    ('Mira Arslan', '+90 555 666 7777', 'mira@email.com', '1993-12-05', 'Pedikür düzenli yaptırıyor', '{"favorite_service": "Pedikür", "preferred_stylist": "Elif Yıldız", "allergies": []}'),
    ('Ece Özkan', '+90 555 888 9999', 'ece@email.com', '1988-05-17', 'Fön ve şekillendirme tercih ediyor', '{"favorite_service": "Fön", "preferred_stylist": "Ayşe Demir", "allergies": []}'),
    ('Lara Çelik', '+90 555 000 1111', 'lara@email.com', '1995-08-09', 'Ombre boyama yaptırdı', '{"favorite_service": "Ombre", "preferred_stylist": "Fatma Kaya", "allergies": []}')
) AS cust_data(name, phone, email, birth_date, notes, preferences)
WHERE sp.name = 'Sevim Kuaför Salonu';

-- =====================================================
-- 5. ÇALIŞAN-HİZMET İLİŞKİLERİ OLUŞTUR
-- =====================================================

INSERT INTO employee_services (employee_id, service_id, is_available, custom_price)
SELECT 
  e.id,
  s.id,
  true,
  CASE 
    WHEN s.name = 'Saç Kesimi' THEN 85.00
    WHEN s.name = 'Saç Boyama' THEN 220.00
    WHEN s.name = 'Fön' THEN 65.00
    WHEN s.name = 'Saç Bakımı' THEN 130.00
    WHEN s.name = 'Manikür' THEN 75.00
    WHEN s.name = 'Pedikür' THEN 95.00
    WHEN s.name = 'Cilt Bakımı' THEN 160.00
    WHEN s.name = 'Makyaj' THEN 110.00
    WHEN s.name = 'Kaş Şekillendirme' THEN 55.00
    WHEN s.name = 'Kirpik Lifting' THEN 190.00
    WHEN s.name = 'Saç Uzatma' THEN 550.00
    WHEN s.name = 'Keratin Bakımı' THEN 320.00
    WHEN s.name = 'Balayage' THEN 380.00
    WHEN s.name = 'Ombre' THEN 300.00
    WHEN s.name = 'Saç Örgü' THEN 85.00
    ELSE s.price
  END
FROM employees e
CROSS JOIN services s
WHERE e.salon_id = s.salon_id
AND (
  (e.name = 'Ayşe Demir' AND s.name IN ('Saç Kesimi', 'Saç Boyama', 'Fön', 'Balayage', 'Ombre', 'Saç Örgü'))
  OR (e.name = 'Fatma Kaya' AND s.name IN ('Saç Bakımı', 'Keratin Bakımı', 'Saç Uzatma', 'Saç Kesimi', 'Fön'))
  OR (e.name = 'Zeynep Özkan' AND s.name IN ('Makyaj', 'Cilt Bakımı', 'Kaş Şekillendirme', 'Kirpik Lifting'))
  OR (e.name = 'Elif Yıldız' AND s.name IN ('Manikür', 'Pedikür', 'Cilt Bakımı'))
  OR (e.name = 'Merve Çelik' AND s.name IN ('Saç Kesimi', 'Fön', 'Saç Örgü'))
);

-- =====================================================
-- 6. RANDEVULAR OLUŞTUR (SON 30 GÜN)
-- =====================================================

INSERT INTO appointments (salon_id, customer_id, service_id, start_time, end_time, status, notes, source)
SELECT 
  sp.id,
  c.id,
  s.id,
  apt_data.start_time,
  apt_data.end_time,
  apt_data.status,
  apt_data.notes,
  apt_data.source
FROM salon_profiles sp
CROSS JOIN customers c
CROSS JOIN services s
CROSS JOIN (
  VALUES 
    ('2024-01-15 10:00:00+03', '2024-01-15 11:00:00+03', 'completed', 'Müşteri çok memnun kaldı', 'manual'),
    ('2024-01-16 14:00:00+03', '2024-01-16 16:00:00+03', 'completed', 'Saç boyama işlemi başarılı', 'whatsapp'),
    ('2024-01-17 11:00:00+03', '2024-01-17 11:45:00+03', 'completed', 'Hızlı saç kesimi', 'phone'),
    ('2024-01-18 15:00:00+03', '2024-01-18 16:00:00+03', 'completed', 'Manikür işlemi', 'manual'),
    ('2024-01-19 09:00:00+03', '2024-01-19 10:30:00+03', 'completed', 'Cilt bakımı yapıldı', 'whatsapp'),
    ('2024-01-20 13:00:00+03', '2024-01-20 14:00:00+03', 'completed', 'Fön ve şekillendirme', 'phone'),
    ('2024-01-21 16:00:00+03', '2024-01-21 17:00:00+03', 'completed', 'Pedikür işlemi', 'manual'),
    ('2024-01-22 10:00:00+03', '2024-01-22 12:00:00+03', 'completed', 'Balayage boyama', 'whatsapp'),
    ('2024-01-23 14:00:00+03', '2024-01-23 15:00:00+03', 'completed', 'Kaş şekillendirme', 'phone'),
    ('2024-01-24 11:00:00+03', '2024-01-24 12:00:00+03', 'completed', 'Saç bakımı', 'manual'),
    ('2024-01-25 15:00:00+03', '2024-01-25 16:00:00+03', 'completed', 'Makyaj işlemi', 'whatsapp'),
    ('2024-01-26 09:00:00+03', '2024-01-26 10:00:00+03', 'completed', 'Saç kesimi', 'phone'),
    ('2024-01-27 13:00:00+03', '2024-01-27 14:00:00+03', 'completed', 'Keratin bakımı', 'manual'),
    ('2024-01-28 16:00:00+03', '2024-01-28 17:00:00+03', 'completed', 'Fön işlemi', 'whatsapp'),
    ('2024-01-29 10:00:00+03', '2024-01-29 11:00:00+03', 'completed', 'Manikür', 'phone'),
    ('2024-01-30 14:00:00+03', '2024-01-30 15:00:00+03', 'completed', 'Saç örgü', 'manual'),
    ('2024-02-01 11:00:00+03', '2024-02-01 12:00:00+03', 'scheduled', 'Yeni randevu', 'whatsapp'),
    ('2024-02-02 15:00:00+03', '2024-02-02 16:00:00+03', 'scheduled', 'Saç boyama randevusu', 'phone'),
    ('2024-02-03 09:00:00+03', '2024-02-03 10:00:00+03', 'scheduled', 'Saç kesimi', 'manual'),
    ('2024-02-04 13:00:00+03', '2024-02-04 14:00:00+03', 'scheduled', 'Cilt bakımı', 'whatsapp'),
    ('2024-02-05 16:00:00+03', '2024-02-05 17:00:00+03', 'scheduled', 'Makyaj', 'phone'),
    ('2024-02-06 10:00:00+03', '2024-02-06 11:00:00+03', 'scheduled', 'Fön', 'manual'),
    ('2024-02-07 14:00:00+03', '2024-02-07 15:00:00+03', 'scheduled', 'Manikür', 'whatsapp'),
    ('2024-02-08 11:00:00+03', '2024-02-08 12:00:00+03', 'scheduled', 'Saç bakımı', 'phone'),
    ('2024-02-09 15:00:00+03', '2024-02-09 16:00:00+03', 'scheduled', 'Pedikür', 'manual'),
    ('2024-02-10 09:00:00+03', '2024-02-10 10:00:00+03', 'scheduled', 'Kaş şekillendirme', 'whatsapp'),
    ('2024-02-11 13:00:00+03', '2024-02-11 14:00:00+03', 'scheduled', 'Saç örgü', 'phone'),
    ('2024-02-12 16:00:00+03', '2024-02-12 17:00:00+03', 'scheduled', 'Cilt bakımı', 'manual'),
    ('2024-02-13 10:00:00+03', '2024-02-13 11:00:00+03', 'scheduled', 'Makyaj', 'whatsapp'),
    ('2024-02-14 14:00:00+03', '2024-02-14 15:00:00+03', 'scheduled', 'Saç kesimi', 'phone')
) AS apt_data(start_time, end_time, status, notes, source)
WHERE sp.name = 'Sevim Kuaför Salonu'
AND c.salon_id = sp.id
AND s.salon_id = sp.id
AND (c.id, s.id) IN (
  SELECT c2.id, s2.id 
  FROM customers c2 
  CROSS JOIN services s2 
  WHERE c2.salon_id = sp.id AND s2.salon_id = sp.id
  LIMIT 30
);

-- =====================================================
-- 7. TELEFON ARAMALARI GEÇMİŞİ OLUŞTUR
-- =====================================================

INSERT INTO call_history (user_id, customer_phone, call_type, duration, status, transcript, sentiment_analysis, key_points, follow_up_required, follow_up_notes)
SELECT 
  sp.user_id,
  call_data.customer_phone,
  call_data.call_type,
  call_data.duration,
  call_data.status,
  call_data.transcript,
  call_data.sentiment_analysis,
  call_data.key_points,
  call_data.follow_up_required,
  call_data.follow_up_notes
FROM salon_profiles sp
CROSS JOIN (
  VALUES 
    ('+90 555 666 6666', 'incoming', 180, 'completed', 'Müşteri: Merhaba, randevu almak istiyorum. Ayşe hanım müsait mi?', '{"sentiment": "positive", "confidence": 0.85}', '["randevu talebi", "Ayşe hanım tercihi"]', false, NULL),
    ('+90 555 777 7777', 'outgoing', 120, 'completed', 'Biz: Merhaba, randevunuzu hatırlatmak istiyoruz. Yarın saat 14:00''te geliyorsunuz.', '{"sentiment": "neutral", "confidence": 0.78}', '["randevu hatırlatması", "yarın 14:00"]', false, NULL),
    ('+90 555 888 8888', 'incoming', 90, 'completed', 'Müşteri: Saç boyama fiyatını öğrenmek istiyorum.', '{"sentiment": "neutral", "confidence": 0.82}', '["fiyat sorgusu", "saç boyama"]', true, 'Fiyat listesi gönderilecek'),
    ('+90 555 999 9999', 'incoming', 300, 'completed', 'Müşteri: Düğün makyajı için bilgi almak istiyorum. Ne kadar sürer?', '{"sentiment": "positive", "confidence": 0.88}', '["düğün makyajı", "süre sorgusu"]', true, 'Düğün makyaj paketi detayları gönderilecek'),
    ('+90 555 000 0000', 'outgoing', 60, 'missed', 'Arama yanıtlanmadı', '{"sentiment": "neutral", "confidence": 0.50}', '["yanıtlanmayan arama"]', true, 'Tekrar arama yapılacak'),
    ('+90 555 111 2222', 'incoming', 240, 'completed', 'Müşteri: Balayage yaptırmak istiyorum. Ne kadar sürer ve fiyatı nedir?', '{"sentiment": "positive", "confidence": 0.90}', '["balayage talebi", "süre ve fiyat"]', true, 'Balayage detayları ve fiyat gönderilecek'),
    ('+90 555 333 4444', 'outgoing', 150, 'completed', 'Biz: Saç bakım randevunuzu onaylamak istiyoruz. Uygun mu?', '{"sentiment": "positive", "confidence": 0.85}', '["randevu onayı", "saç bakım"]', false, NULL),
    ('+90 555 555 6666', 'incoming', 180, 'completed', 'Müşteri: Kaş şekillendirme yaptırmak istiyorum. Acıyor mu?', '{"sentiment": "concerned", "confidence": 0.75}', '["kaş şekillendirme", "acı endişesi"]', false, 'Ağrısız işlem açıklaması yapıldı'),
    ('+90 555 777 8888', 'incoming', 120, 'completed', 'Müşteri: Saç örgü modelleri var mı?', '{"sentiment": "positive", "confidence": 0.80}', '["saç örgü", "model sorgusu"]', true, 'Örgü modelleri fotoğrafları gönderilecek'),
    ('+90 555 999 0000', 'outgoing', 90, 'completed', 'Biz: Cilt bakım randevunuzu hatırlatıyoruz.', '{"sentiment": "neutral", "confidence": 0.78}', '["randevu hatırlatması", "cilt bakım"]', false, NULL)
) AS call_data(customer_phone, call_type, duration, status, transcript, sentiment_analysis, key_points, follow_up_required, follow_up_notes)
WHERE sp.name = 'Sevim Kuaför Salonu';

-- =====================================================
-- 8. AI KONUŞMALARI OLUŞTUR
-- =====================================================

INSERT INTO ai_conversations (salon_id, customer_phone, platform, messages, status, appointment_id)
SELECT 
  sp.id,
  conv_data.customer_phone,
  conv_data.platform,
  conv_data.messages,
  conv_data.status,
  a.id
FROM salon_profiles sp
CROSS JOIN appointments a
CROSS JOIN (
  VALUES 
    ('+90 555 666 6666', 'whatsapp', '[{"role": "customer", "content": "Merhaba, randevu almak istiyorum", "timestamp": "2024-01-15T09:30:00Z"}, {"role": "ai", "content": "Merhaba! Size yardımcı olmaktan memnuniyet duyarım. Hangi hizmet için randevu almak istiyorsunuz?", "timestamp": "2024-01-15T09:30:05Z"}, {"role": "customer", "content": "Saç boyama yaptırmak istiyorum", "timestamp": "2024-01-15T09:30:30Z"}, {"role": "ai", "content": "Harika! Saç boyama için uygun zamanlarımız var. Hangi gün tercih edersiniz?", "timestamp": "2024-01-15T09:30:35Z"}]', 'completed'),
    ('+90 555 777 7777', 'whatsapp', '[{"role": "customer", "content": "Saç kesimi fiyatı nedir?", "timestamp": "2024-01-16T14:20:00Z"}, {"role": "ai", "content": "Saç kesimi fiyatımız 80 TL. Randevu almak ister misiniz?", "timestamp": "2024-01-16T14:20:05Z"}, {"role": "customer", "content": "Evet, yarın saat 15:00 uygun mu?", "timestamp": "2024-01-16T14:20:30Z"}, {"role": "ai", "content": "Evet, yarın saat 15:00 müsait. Randevunuzu oluşturdum.", "timestamp": "2024-01-16T14:20:35Z"}]', 'completed'),
    ('+90 555 888 8888', 'phone', '[{"role": "customer", "content": "Makyaj yaptırmak istiyorum", "timestamp": "2024-01-17T11:15:00Z"}, {"role": "ai", "content": "Makyaj hizmetimiz mevcut. Hangi tür makyaj istiyorsunuz?", "timestamp": "2024-01-17T11:15:10Z"}, {"role": "customer", "content": "Günlük makyaj", "timestamp": "2024-01-17T11:15:30Z"}, {"role": "ai", "content": "Günlük makyaj fiyatımız 100 TL. Randevu oluşturabilirim.", "timestamp": "2024-01-17T11:15:40Z"}]', 'active')
) AS conv_data(customer_phone, platform, messages, status)
WHERE sp.name = 'Sevim Kuaför Salonu'
AND a.salon_id = sp.id
LIMIT 3;

-- =====================================================
-- 9. KONUŞMA ANALİZLERİ OLUŞTUR
-- =====================================================

INSERT INTO conversation_analytics (user_id, call_history_id, customer_satisfaction_score, conversation_quality_score, response_time_avg, interruption_count, topic_detected, emotion_detected, action_items)
SELECT 
  sp.user_id,
  ch.id,
  analytics_data.customer_satisfaction_score,
  analytics_data.conversation_quality_score,
  analytics_data.response_time_avg,
  analytics_data.interruption_count,
  analytics_data.topic_detected,
  analytics_data.emotion_detected,
  analytics_data.action_items
FROM salon_profiles sp
CROSS JOIN call_history ch
CROSS JOIN (
  VALUES 
    (8, 7, 3, 1, '["randevu", "hizmet"]', '["memnuniyet"]', '["randevu oluşturuldu"]'),
    (6, 5, 2, 0, '["fiyat", "bilgi"]', '["nötr"]', '["fiyat bilgisi gönderildi"]'),
    (9, 8, 4, 2, '["düğün", "makyaj"]', '["heyecan"]', '["düğün paketi detayları gönderildi"]'),
    (7, 6, 3, 1, '["balayage", "fiyat"]', '["ilgi"]', '["balayage detayları gönderildi"]'),
    (8, 7, 3, 0, '["kaş", "ağrı"]', '["endişe"]', '["ağrısız işlem açıklaması yapıldı"]')
) AS analytics_data(customer_satisfaction_score, conversation_quality_score, response_time_avg, interruption_count, topic_detected, emotion_detected, action_items)
WHERE sp.name = 'Sevim Kuaför Salonu'
AND ch.user_id = sp.user_id
LIMIT 5;

-- =====================================================
-- 10. SALON AYARLARI OLUŞTUR
-- =====================================================

INSERT INTO salon_settings (salon_id, setting_key, setting_value)
SELECT 
  sp.id,
  setting_data.setting_key,
  setting_data.setting_value
FROM salon_profiles sp
CROSS JOIN (
  VALUES 
    ('notification_settings', '{"email_notifications": true, "sms_notifications": true, "whatsapp_notifications": true}'),
    ('working_hours', '{"monday": {"open": "09:00", "close": "20:00"}, "tuesday": {"open": "09:00", "close": "20:00"}, "wednesday": {"open": "09:00", "close": "20:00"}, "thursday": {"open": "09:00", "close": "20:00"}, "friday": {"open": "09:00", "close": "20:00"}, "saturday": {"open": "09:00", "close": "18:00"}, "sunday": {"open": "10:00", "close": "16:00"}}'),
    ('appointment_settings', '{"min_advance_booking": 2, "max_advance_booking": 30, "cancellation_policy": "24 saat öncesi"}'),
    ('payment_settings', '{"cash": true, "credit_card": true, "bank_transfer": true, "online_payment": false}'),
    ('ai_settings', '{"auto_reply": true, "sentiment_analysis": true, "appointment_scheduling": true}')
) AS setting_data(setting_key, setting_value)
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
WHERE sp.name = 'Sevim Kuaför Salonu'

UNION ALL

SELECT 
  'AI Konuşmaları' as table_name,
  COUNT(*) as record_count
FROM ai_conversations ac
JOIN salon_profiles sp ON ac.salon_id = sp.id
WHERE sp.name = 'Sevim Kuaför Salonu';
