-- Mevcut çalışanları kontrol et
SELECT 
  id,
  name,
  working_hours,
  leave_days,
  is_active
FROM employees
ORDER BY name;

-- Çalışan sayısını kontrol et
SELECT COUNT(*) as total_employees FROM employees;

-- Aktif çalışan sayısını kontrol et
SELECT COUNT(*) as active_employees FROM employees WHERE is_active = true;
