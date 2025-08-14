-- Employees tablosu için RLS politikalarını kontrol et
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'employees';

-- Employees tablosunun RLS durumunu kontrol et
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'employees';

-- Employee_services tablosu için RLS politikalarını kontrol et
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'employee_services';

-- Employee_services tablosunun RLS durumunu kontrol et
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'employee_services';
