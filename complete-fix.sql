    -- Tam çözüm: Tüm tabloları ve sütunları düzelt

    -- 1. Önce eksik tabloları oluştur
    CREATE TABLE IF NOT EXISTS salon_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    description TEXT,
    logo_url TEXT,
    working_hours JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 2. Services tablosunu düzelt
    DROP TABLE IF EXISTS services CASCADE;
    CREATE TABLE services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID REFERENCES salon_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER DEFAULT 60,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 3. Customers tablosunu düzelt
    DROP TABLE IF EXISTS customers CASCADE;
    CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID REFERENCES salon_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    birth_date DATE,
    notes TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 4. Employees tablosunu düzelt
    DROP TABLE IF EXISTS employees CASCADE;
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

    -- 5. Appointments tablosunu düzelt
    DROP TABLE IF EXISTS appointments CASCADE;
    CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID REFERENCES salon_profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT,
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 6. RLS'yi etkinleştir
    ALTER TABLE salon_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE services ENABLE ROW LEVEL SECURITY;
    ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
    ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

    -- 7. RLS politikalarını oluştur
    DROP POLICY IF EXISTS "Users can view own salon profile" ON salon_profiles;
    DROP POLICY IF EXISTS "Users can insert own salon profile" ON salon_profiles;
    DROP POLICY IF EXISTS "Users can update own salon profile" ON salon_profiles;

    CREATE POLICY "Users can view own salon profile" ON salon_profiles
    FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own salon profile" ON salon_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own salon profile" ON salon_profiles
    FOR UPDATE USING (auth.uid() = user_id);

    -- Services politikaları
    DROP POLICY IF EXISTS "Salon can manage own services" ON services;
    CREATE POLICY "Salon can manage own services" ON services
    FOR ALL USING (
        salon_id IN (
        SELECT id FROM salon_profiles WHERE user_id = auth.uid()
        )
    );

    -- Customers politikaları
    DROP POLICY IF EXISTS "Salon can manage own customers" ON customers;
    CREATE POLICY "Salon can manage own customers" ON customers
    FOR ALL USING (
        salon_id IN (
        SELECT id FROM salon_profiles WHERE user_id = auth.uid()
        )
    );

    -- Employees politikaları
    DROP POLICY IF EXISTS "Salon can manage own employees" ON employees;
    CREATE POLICY "Salon can manage own employees" ON employees
    FOR ALL USING (
        salon_id IN (
        SELECT id FROM salon_profiles WHERE user_id = auth.uid()
        )
    );

    -- Appointments politikaları
    DROP POLICY IF EXISTS "Salon can manage own appointments" ON appointments;
    CREATE POLICY "Salon can manage own appointments" ON appointments
    FOR ALL USING (
        salon_id IN (
        SELECT id FROM salon_profiles WHERE user_id = auth.uid()
        )
    );

    -- 8. İndeksleri oluştur
    CREATE INDEX IF NOT EXISTS idx_salon_profiles_user_id ON salon_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_services_salon_id ON services(salon_id);
    CREATE INDEX IF NOT EXISTS idx_customers_salon_id ON customers(salon_id);
    CREATE INDEX IF NOT EXISTS idx_employees_salon_id ON employees(salon_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_salon_id ON appointments(salon_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);

    -- 9. Trigger fonksiyonunu oluştur
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- 10. Trigger'ları oluştur
    DROP TRIGGER IF EXISTS update_salon_profiles_updated_at ON salon_profiles;
    DROP TRIGGER IF EXISTS update_services_updated_at ON services;
    DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
    DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
    DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;

    CREATE TRIGGER update_salon_profiles_updated_at BEFORE UPDATE ON salon_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
