-- Eksik salon_id sütunlarını ekle

-- Services tablosuna salon_id ekle (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'services' AND column_name = 'salon_id') THEN
        ALTER TABLE services ADD COLUMN salon_id UUID REFERENCES salon_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Customers tablosuna salon_id ekle (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'salon_id') THEN
        ALTER TABLE customers ADD COLUMN salon_id UUID REFERENCES salon_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Appointments tablosuna salon_id ekle (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'salon_id') THEN
        ALTER TABLE appointments ADD COLUMN salon_id UUID REFERENCES salon_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Appointments tablosuna employee_id ekle (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'employee_id') THEN
        ALTER TABLE appointments ADD COLUMN employee_id UUID;
    END IF;
END $$;

-- AI conversations tablosuna salon_id ekle (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'ai_conversations' AND column_name = 'salon_id') THEN
        ALTER TABLE ai_conversations ADD COLUMN salon_id UUID REFERENCES salon_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Salon settings tablosuna salon_id ekle (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'salon_settings' AND column_name = 'salon_id') THEN
        ALTER TABLE salon_settings ADD COLUMN salon_id UUID REFERENCES salon_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Employees tablosuna salon_id ekle (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'salon_id') THEN
        ALTER TABLE employees ADD COLUMN salon_id UUID REFERENCES salon_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Employees tablosuna leave_days ekle (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'leave_days') THEN
        ALTER TABLE employees ADD COLUMN leave_days JSONB DEFAULT '[]';
    END IF;
END $$;

-- İndeksleri oluştur
CREATE INDEX IF NOT EXISTS idx_services_salon_id ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_customers_salon_id ON customers(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_salon_id ON ai_conversations(salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_settings_salon_id ON salon_settings(salon_id);
CREATE INDEX IF NOT EXISTS idx_employees_salon_id ON employees(salon_id);

-- RLS politikalarını güncelle (eğer yoksa)
DO $$ 
BEGIN
    -- Services için RLS politikası
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Salon can manage own services') THEN
        CREATE POLICY "Salon can manage own services" ON services
          FOR ALL USING (
            salon_id IN (
              SELECT id FROM salon_profiles WHERE user_id = auth.uid()
            )
          );
    END IF;
    
    -- Customers için RLS politikası
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Salon can manage own customers') THEN
        CREATE POLICY "Salon can manage own customers" ON customers
          FOR ALL USING (
            salon_id IN (
              SELECT id FROM salon_profiles WHERE user_id = auth.uid()
            )
          );
    END IF;
    
    -- Appointments için RLS politikası
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Salon can manage own appointments') THEN
        CREATE POLICY "Salon can manage own appointments" ON appointments
          FOR ALL USING (
            salon_id IN (
              SELECT id FROM salon_profiles WHERE user_id = auth.uid()
            )
          );
    END IF;
    
    -- AI conversations için RLS politikası
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_conversations' AND policyname = 'Salon can manage own conversations') THEN
        CREATE POLICY "Salon can manage own conversations" ON ai_conversations
          FOR ALL USING (
            salon_id IN (
              SELECT id FROM salon_profiles WHERE user_id = auth.uid()
            )
          );
    END IF;
    
    -- Salon settings için RLS politikası
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'salon_settings' AND policyname = 'Salon can manage own settings') THEN
        CREATE POLICY "Salon can manage own settings" ON salon_settings
          FOR ALL USING (
            salon_id IN (
              SELECT id FROM salon_profiles WHERE user_id = auth.uid()
            )
          );
    END IF;
    
    -- Employees için RLS politikası
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employees' AND policyname = 'Salon can manage own employees') THEN
        CREATE POLICY "Salon can manage own employees" ON employees
          FOR ALL USING (
            salon_id IN (
              SELECT id FROM salon_profiles WHERE user_id = auth.uid()
            )
          );
    END IF;
END $$;
