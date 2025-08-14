-- Mevcut verileri kontrol et
SELECT 'employee_services' as table_name, COUNT(*) as count FROM employee_services
UNION ALL
SELECT 'employees' as table_name, COUNT(*) as count FROM employees
UNION ALL
SELECT 'services' as table_name, COUNT(*) as count FROM services;

-- employee_services detayları
SELECT 
  es.employee_id,
  e.name as employee_name,
  es.service_id,
  s.name as service_name,
  es.is_available
FROM employee_services es
JOIN employees e ON es.employee_id = e.id
JOIN services s ON es.service_id = s.id;

-- Çalışanların izin günleri
SELECT 
  id,
  name,
  leave_days
FROM employees;
