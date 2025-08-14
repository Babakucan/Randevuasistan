-- Mevcut employee_services verilerini kontrol et
SELECT 'employee_services' as table_name, COUNT(*) as count FROM employee_services;

-- employee_services detayları
SELECT 
  es.employee_id,
  e.name as employee_name,
  es.service_id,
  s.name as service_name,
  es.is_available
FROM employee_services es
JOIN employees e ON es.employee_id = e.id
JOIN services s ON es.service_id = s.id
ORDER BY e.name, s.name;

-- Tüm çalışanları listele
SELECT id, name, is_active FROM employees ORDER BY name;

-- Tüm hizmetleri listele
SELECT id, name FROM services ORDER BY name;
