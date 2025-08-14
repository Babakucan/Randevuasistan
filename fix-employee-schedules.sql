-- Çalışanlara varsayılan çalışma saatleri ata

-- Varsayılan çalışma saatleri (Pazartesi-Cuma 09:00-18:00, Cumartesi 09:00-17:00, Pazar kapalı)
UPDATE employees 
SET working_hours = '{
  "monday": {"start": "09:00", "end": "18:00", "available": true},
  "tuesday": {"start": "09:00", "end": "18:00", "available": true},
  "wednesday": {"start": "09:00", "end": "18:00", "available": true},
  "thursday": {"start": "09:00", "end": "18:00", "available": true},
  "friday": {"start": "09:00", "end": "18:00", "available": true},
  "saturday": {"start": "09:00", "end": "17:00", "available": true},
  "sunday": {"start": "00:00", "end": "00:00", "available": false}
}'
WHERE working_hours IS NULL OR working_hours = '{}';

-- Tüm çalışanları aktif yap
UPDATE employees SET is_active = true WHERE is_active IS NULL OR is_active = false;

-- Güncellenmiş çalışanları kontrol et
SELECT 
  id,
  name,
  working_hours,
  leave_days,
  is_active
FROM employees
ORDER BY name;
