-- Employees tabloları için RLS'yi geçici olarak devre dışı bırak
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE employee_services DISABLE ROW LEVEL SECURITY;

-- Durumu kontrol et
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('employees', 'employee_services');
