-- employee_services tablosunu yeniden oluştur
CREATE TABLE IF NOT EXISTS employee_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  custom_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, service_id)
);

-- Tabloyu kontrol et
SELECT 'employee_services created' as status, COUNT(*) as count FROM employee_services;
