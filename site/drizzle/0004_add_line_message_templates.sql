ALTER TABLE `farm_settings` ADD COLUMN `line_message_th` text NOT NULL DEFAULT 'สวัสดีค่ะ/ครับ สนใจผัก {name} ของ KENDO FARM ค่ะ/ครับ';
ALTER TABLE `farm_settings` ADD COLUMN `line_message_en` text NOT NULL DEFAULT 'Hello! I am interested in {name} from KENDO FARM.';
