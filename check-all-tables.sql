-- Tüm tabloları listele
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Salon profiles tablosunu kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'salon_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Services tablosunu kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'services' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Customers tablosunu kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Appointments tablosunu kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Employees tablosunu kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'employees' 
AND table_schema = 'public'
ORDER BY ordinal_position;
