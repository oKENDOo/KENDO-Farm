CREATE TABLE `farm_settings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`farm_name_th` text NOT NULL,
	`farm_name_en` text NOT NULL,
	`line_official_id` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vegetables` (
	`id` text PRIMARY KEY NOT NULL,
	`name_th` text NOT NULL,
	`name_en` text NOT NULL,
	`description_th` text NOT NULL,
	`description_en` text NOT NULL,
	`price_baht` integer NOT NULL,
	`stock_bags` integer DEFAULT 0 NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_vegetables_display_order` ON `vegetables` (`display_order`);--> statement-breakpoint
CREATE INDEX `idx_vegetables_stock_bags` ON `vegetables` (`stock_bags`);