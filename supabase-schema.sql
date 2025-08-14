-- Enable Row Level Security
-- Create salon_profiles table
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

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES salon_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER DEFAULT 60, -- minutes
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
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

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES salon_profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled, no-show
  notes TEXT,
  source VARCHAR(50) DEFAULT 'manual', -- manual, whatsapp, phone, ai
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES salon_profiles(id) ON DELETE CASCADE,
  customer_phone VARCHAR(20) NOT NULL,
  platform VARCHAR(50) NOT NULL, -- whatsapp, phone
  messages JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'active', -- active, completed, archived
  appointment_id UUID REFERENCES appointments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create call_history table for detailed call records
CREATE TABLE IF NOT EXISTS call_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_phone VARCHAR(20) NOT NULL,
  call_type VARCHAR(20) NOT NULL, -- incoming, outgoing, missed
  duration INTEGER DEFAULT 0, -- seconds
  status VARCHAR(20) DEFAULT 'completed', -- completed, missed, busy, failed
  recording_url TEXT, -- URL to call recording
  transcript TEXT, -- AI generated transcript
  sentiment_analysis JSONB, -- AI sentiment analysis
  key_points JSONB, -- Extracted key points from conversation
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create call_recordings table for audio files
CREATE TABLE IF NOT EXISTS call_recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  call_history_id UUID REFERENCES call_history(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER, -- bytes
  duration INTEGER, -- seconds
  format VARCHAR(10), -- mp3, wav, etc.
  quality VARCHAR(20), -- high, medium, low
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_analytics table for insights
CREATE TABLE IF NOT EXISTS conversation_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  call_history_id UUID REFERENCES call_history(id) ON DELETE CASCADE,
  customer_satisfaction_score INTEGER, -- 1-10
  conversation_quality_score INTEGER, -- 1-10
  response_time_avg INTEGER, -- average response time in seconds
  interruption_count INTEGER,
  topic_detected JSONB, -- detected topics in conversation
  emotion_detected JSONB, -- detected emotions
  action_items JSONB, -- extracted action items
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create salon_settings table
CREATE TABLE IF NOT EXISTS salon_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES salon_profiles(id) ON DELETE CASCADE,
  setting_key VARCHAR(255) NOT NULL,
  setting_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(salon_id, setting_key)
);

-- Enable Row Level Security on all tables
ALTER TABLE salon_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for salon_profiles
CREATE POLICY "Users can view own salon profile" ON salon_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own salon profile" ON salon_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own salon profile" ON salon_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for services
CREATE POLICY "Salon can manage own services" ON services
  FOR ALL USING (
    salon_id IN (
      SELECT id FROM salon_profiles WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for customers
CREATE POLICY "Salon can manage own customers" ON customers
  FOR ALL USING (
    salon_id IN (
      SELECT id FROM salon_profiles WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for appointments
CREATE POLICY "Salon can manage own appointments" ON appointments
  FOR ALL USING (
    salon_id IN (
      SELECT id FROM salon_profiles WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for ai_conversations
CREATE POLICY "Salon can manage own conversations" ON ai_conversations
  FOR ALL USING (
    salon_id IN (
      SELECT id FROM salon_profiles WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for call_history
CREATE POLICY "Users can manage own call history" ON call_history
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for call_recordings
CREATE POLICY "Users can manage own call recordings" ON call_recordings
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for conversation_analytics
CREATE POLICY "Users can manage own conversation analytics" ON conversation_analytics
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for salon_settings
CREATE POLICY "Salon can manage own settings" ON salon_settings
  FOR ALL USING (
    salon_id IN (
      SELECT id FROM salon_profiles WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_salon_profiles_user_id ON salon_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_services_salon_id ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_customers_salon_id ON customers(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_salon_id ON ai_conversations(salon_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_customer_phone ON ai_conversations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_call_history_user_id ON call_history(user_id);
CREATE INDEX IF NOT EXISTS idx_call_history_customer_phone ON call_history(customer_phone);
CREATE INDEX IF NOT EXISTS idx_call_history_created_at ON call_history(created_at);
CREATE INDEX IF NOT EXISTS idx_call_recordings_user_id ON call_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_call_recordings_call_history_id ON call_recordings(call_history_id);
CREATE INDEX IF NOT EXISTS idx_conversation_analytics_user_id ON conversation_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_analytics_call_history_id ON conversation_analytics(call_history_id);
CREATE INDEX IF NOT EXISTS idx_salon_settings_salon_id ON salon_settings(salon_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_salon_profiles_updated_at BEFORE UPDATE ON salon_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_call_history_updated_at BEFORE UPDATE ON call_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_salon_settings_updated_at BEFORE UPDATE ON salon_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
