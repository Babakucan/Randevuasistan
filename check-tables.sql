-- Mevcut tabloları listele
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Her tablonun sütunlarını listele
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('salon_profiles', 'services', 'customers', 'appointments', 'employees', 'ai_conversations', 'salon_settings')
ORDER BY table_name, ordinal_position;
