-- Çalışanların izin günlerini kontrol et
SELECT id, name, leave_days FROM employees;

-- employee_services verilerini kontrol et
SELECT 
  es.employee_id,
  e.name as employee_name,
  es.service_id,
  s.name as service_name
FROM employee_services es
JOIN employees e ON es.employee_id = e.id
JOIN services s ON es.service_id = s.id
ORDER BY e.name, s.name;
