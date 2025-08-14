-- employee_services tablosunu tamamen sil ve yeniden oluştur
DROP TABLE IF EXISTS employee_services CASCADE;

-- employee_services tablosunu RLS olmadan oluştur
CREATE TABLE employee_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  custom_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, service_id)
);

-- RLS'yi devre dışı bırak (test için)
-- ALTER TABLE employee_services ENABLE ROW LEVEL SECURITY;

-- Test verisi ekle (isteğe bağlı)
-- INSERT INTO employee_services (employee_id, service_id) VALUES 
-- ('EMPLOYEE_ID_1', 'SERVICE_ID_1'),
-- ('EMPLOYEE_ID_2', 'SERVICE_ID_2'),
-- ('EMPLOYEE_ID_3', 'SERVICE_ID_3');

-- Kontrol et
SELECT COUNT(*) as total_records FROM employee_services;
