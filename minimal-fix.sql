-- Minimal sütun ekleme - sadece gerekli sütunları ekle

-- Services tablosuna salon_id ekle
ALTER TABLE services ADD COLUMN IF NOT EXISTS salon_id UUID;

-- Customers tablosuna salon_id ekle
ALTER TABLE customers ADD COLUMN IF NOT EXISTS salon_id UUID;

-- Appointments tablosuna salon_id ekle
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS salon_id UUID;

-- Appointments tablosuna employee_id ekle
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS employee_id UUID;

-- Employees tablosuna salon_id ekle
ALTER TABLE employees ADD COLUMN IF NOT EXISTS salon_id UUID;

-- Employees tablosuna leave_days ekle
ALTER TABLE employees ADD COLUMN IF NOT EXISTS leave_days JSONB DEFAULT '[]';

-- İndeksleri oluştur
CREATE INDEX IF NOT EXISTS idx_services_salon_id ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_customers_salon_id ON customers(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_employees_salon_id ON employees(salon_id);
