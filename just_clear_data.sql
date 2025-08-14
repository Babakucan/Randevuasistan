-- Sadece verileri temizle, tabloyu silme
DELETE FROM employee_services;

-- Kontrol et
SELECT COUNT(*) as remaining_records FROM employee_services;
