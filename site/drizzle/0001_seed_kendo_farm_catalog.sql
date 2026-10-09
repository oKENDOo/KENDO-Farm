INSERT INTO `farm_settings` (`id`, `farm_name_th`, `farm_name_en`, `line_official_id`)
VALUES (1, 'KENDO FARM', 'KENDO FARM', '')
ON CONFLICT(`id`) DO NOTHING;
--> statement-breakpoint
INSERT INTO `vegetables` (`id`, `name_th`, `name_en`, `description_th`, `description_en`, `price_baht`, `stock_bags`, `display_order`)
VALUES
  ('green-oak', 'กรีนโอ๊ค', 'Green Oak', 'กรอบนุ่ม รสหวานอ่อน เก็บสดจากรางปลูกเช้านี้', 'Tender, crisp lettuce harvested fresh from this morning''s channels.', 45, 12, 1),
  ('red-oak', 'เรดโอ๊ค', 'Red Oak', 'ใบแดงนุ่ม เพิ่มสีสันและรสชาติให้ทุกจาน', 'Soft crimson leaves that bring colour and character to every plate.', 50, 8, 2),
  ('butterhead', 'บัตเตอร์เฮด', 'Butterhead', 'หัวแน่น ใบละมุน เหมาะกับสลัดและแซนด์วิช', 'Velvety, full heads that are perfect for salads and sandwiches.', 55, 6, 3),
  ('kale', 'เคล', 'Kale', 'ใบเขียวเข้ม เนื้อแน่น สำหรับเมนูสุขภาพทุกวัน', 'Deep-green, sturdy leaves for everyday wholesome cooking.', 60, 4, 4)
ON CONFLICT(`id`) DO NOTHING;
