-- Basit sütun ekleme işlemleri

-- 1. Services tablosuna salon_id ekle
ALTER TABLE services ADD COLUMN IF NOT EXISTS salon_id UUID;

-- 2. Customers tablosuna salon_id ekle
ALTER TABLE customers ADD COLUMN IF NOT EXISTS salon_id UUID;

-- 3. Appointments tablosuna salon_id ekle
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS salon_id UUID;

-- 4. Appointments tablosuna employee_id ekle
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS employee_id UUID;

-- 5. Employees tablosuna salon_id ekle
ALTER TABLE employees ADD COLUMN IF NOT EXISTS salon_id UUID;

-- 6. Employees tablosuna leave_days ekle
ALTER TABLE employees ADD COLUMN IF NOT EXISTS leave_days JSONB DEFAULT '[]';

-- Foreign key constraint'leri ekle (eğer salon_profiles tablosu varsa)
DO $$
BEGIN
    -- Services için foreign key
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'salon_profiles') THEN
        BEGIN
            ALTER TABLE services ADD CONSTRAINT fk_services_salon_id 
            FOREIGN KEY (salon_id) REFERENCES salon_profiles(id) ON DELETE CASCADE;
        EXCEPTION
            WHEN duplicate_object THEN
                -- Constraint zaten varsa, hiçbir şey yapma
                NULL;
        END;
    END IF;
    
    -- Customers için foreign key
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'salon_profiles') THEN
        BEGIN
            ALTER TABLE customers ADD CONSTRAINT fk_customers_salon_id 
            FOREIGN KEY (salon_id) REFERENCES salon_profiles(id) ON DELETE CASCADE;
        EXCEPTION
            WHEN duplicate_object THEN
                NULL;
        END;
    END IF;
    
    -- Appointments için foreign key
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'salon_profiles') THEN
        BEGIN
            ALTER TABLE appointments ADD CONSTRAINT fk_appointments_salon_id 
            FOREIGN KEY (salon_id) REFERENCES salon_profiles(id) ON DELETE CASCADE;
        EXCEPTION
            WHEN duplicate_object THEN
                NULL;
        END;
    END IF;
    
    -- Employees için foreign key
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'salon_profiles') THEN
        BEGIN
            ALTER TABLE employees ADD CONSTRAINT fk_employees_salon_id 
            FOREIGN KEY (salon_id) REFERENCES salon_profiles(id) ON DELETE CASCADE;
        EXCEPTION
            WHEN duplicate_object THEN
                NULL;
        END;
    END IF;
END $$;

-- İndeksleri oluştur
CREATE INDEX IF NOT EXISTS idx_services_salon_id ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_customers_salon_id ON customers(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_employees_salon_id ON employees(salon_id);
