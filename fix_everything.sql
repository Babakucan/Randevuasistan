-- 1. Önce employee_services tablosunu tamamen sil
DROP TABLE IF EXISTS employee_services CASCADE;

-- 2. Tabloyu yeniden oluştur
CREATE TABLE employee_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  custom_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, service_id)
);

-- 3. Mevcut durumu kontrol et
SELECT 'employee_services' as table_name, COUNT(*) as count FROM employee_services
UNION ALL
SELECT 'employees' as table_name, COUNT(*) as count FROM employees
UNION ALL
SELECT 'services' as table_name, COUNT(*) as count FROM services;

-- 4. Çalışanların izin günlerini kontrol et
SELECT id, name, leave_days FROM employees;
