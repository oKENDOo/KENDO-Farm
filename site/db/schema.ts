import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const vegetables = sqliteTable(
  "vegetables",
  {
    id: text("id").primaryKey(),
    nameTh: text("name_th").notNull(),
    nameEn: text("name_en").notNull(),
    descriptionTh: text("description_th").notNull(),
    descriptionEn: text("description_en").notNull(),
    priceBaht: integer("price_baht").notNull(),
    stockBags: integer("stock_bags").notNull().default(0),
    displayOrder: integer("display_order").notNull().default(0),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_vegetables_display_order").on(table.displayOrder),
    index("idx_vegetables_stock_bags").on(table.stockBags),
  ],
);

export const farmSettings = sqliteTable("farm_settings", {
  id: integer("id").primaryKey().default(1),
  farmNameTh: text("farm_name_th").notNull(),
  farmNameEn: text("farm_name_en").notNull(),
  lineOfficialId: text("line_official_id").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
