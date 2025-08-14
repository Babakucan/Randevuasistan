-- Mevcut tabloyu tamamen sil
DROP TABLE IF EXISTS employee_services CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- employees tablosunu oluştur
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES salon_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  position VARCHAR(100),
  specialties JSONB DEFAULT '[]',
  working_hours JSONB DEFAULT '{}',
  leave_days JSONB DEFAULT '[]',
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- employee_services tablosunu yeniden oluştur
CREATE TABLE employee_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  custom_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, service_id)
);

-- RLS'yi geçici olarak devre dışı bırak (test için)
-- ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE employee_services ENABLE ROW LEVEL SECURITY;

-- Geçici olarak tüm işlemlere izin ver (test için)
-- CREATE POLICY "Allow all operations" ON employees FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON employee_services FOR ALL USING (true);
