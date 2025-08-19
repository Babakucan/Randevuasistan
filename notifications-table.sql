-- Notifications tablosu
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES salon_profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'appointment_reminder', 'new_customer', 'new_appointment', 'system'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  target_type VARCHAR(50), -- 'appointment', 'customer', 'employee', 'service'
  target_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS'yi etkinleştir
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS politikası
CREATE POLICY "Salon can manage own notifications" ON notifications
  FOR ALL USING (
    salon_id IN (
      SELECT id FROM salon_profiles WHERE user_id = auth.uid()
    )
  );

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_notifications_salon_id ON notifications(salon_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Otomatik bildirim oluşturma fonksiyonu (randevu hatırlatması için)
CREATE OR REPLACE FUNCTION create_appointment_reminder()
RETURNS TRIGGER AS $$
BEGIN
  -- Randevu oluşturulduğunda 24 saat öncesi hatırlatma bildirimi oluştur
  INSERT INTO notifications (salon_id, type, title, message, target_type, target_id)
  VALUES (
    NEW.salon_id,
    'appointment_reminder',
    'Randevu Hatırlatması',
    'Yarın saat ' || to_char(NEW.start_time, 'HH24:MI') || ' randevunuz var.',
    'appointment',
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur
CREATE TRIGGER appointment_reminder_trigger
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_appointment_reminder();
