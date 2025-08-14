-- Mevcut tabloları listele
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Services tablosunun sütunlarını kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'services' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Customers tablosunun sütunlarını kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Appointments tablosunun sütunlarını kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Employees tablosunun sütunlarını kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'employees' 
AND table_schema = 'public'
ORDER BY ordinal_position;
