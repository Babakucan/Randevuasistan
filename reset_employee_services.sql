-- employee_services tablosunu tamamen temizle
DELETE FROM employee_services;

-- Tabloyu kontrol et
SELECT COUNT(*) as remaining_records FROM employee_services;

-- Çalışanları ve hizmetleri listele
SELECT 'employees' as table_name, id, name FROM employees
UNION ALL
SELECT 'services' as table_name, id, name FROM services;
