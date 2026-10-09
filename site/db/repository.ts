import { getD1 } from "@/db";
import { demoCatalog } from "@/lib/demo-catalog";
import type { Catalog, FarmSettings, LineAccountType, Vegetable } from "@/lib/types";

type VegetableRow = {
  id: string;
  name_th: string;
  name_en: string;
  description_th: string;
  description_en: string;
  price_baht: number;
  stock_bags: number;
  display_order: number;
  updated_at: string;
};

type SettingsRow = {
  farm_name_th: string;
  farm_name_en: string;
  line_official_id: string;
  line_account_type: string;
  updated_at: string;
};

function defaultLineId() {
  return process.env.LINE_DEFAULT_ID?.trim() ?? "";
}

const DEFAULT_SETTINGS: FarmSettings = {
  farmNameTh: "KENDO FARM",
  farmNameEn: "KENDO FARM",
  lineOfficialId: defaultLineId(),
  lineAccountType: "personal",
  updatedAt: new Date().toISOString(),
};

const vegetableColumns = `
  id, name_th, name_en, description_th, description_en,
  price_baht, stock_bags, display_order, updated_at
`;

function toVegetable(row: VegetableRow): Vegetable {
  return {
    id: row.id,
    nameTh: row.name_th,
    nameEn: row.name_en,
    descriptionTh: row.description_th,
    descriptionEn: row.description_en,
    priceBaht: row.price_baht,
    stockBags: row.stock_bags,
    displayOrder: row.display_order,
    updatedAt: row.updated_at,
  };
}

function toSettings(row: SettingsRow | null): FarmSettings {
  if (!row) return DEFAULT_SETTINGS;

  return {
    farmNameTh: row.farm_name_th,
    farmNameEn: row.farm_name_en,
    lineOfficialId: row.line_official_id.trim() || defaultLineId(),
    lineAccountType: (row.line_account_type === "official" ? "official" : "personal") as LineAccountType,
    updatedAt: row.updated_at,
  };
}

export async function getCatalog(): Promise<Catalog> {
  const db = getD1();
  const [settingsResult, vegetablesResult] = await db.batch([
    db.prepare(
      "SELECT farm_name_th, farm_name_en, line_official_id, line_account_type, updated_at FROM farm_settings WHERE id = 1",
    ),
    db
      .prepare(
        `SELECT ${vegetableColumns} FROM vegetables WHERE stock_bags > ? ORDER BY display_order ASC, name_th ASC`,
      )
      .bind(0),
  ]);

  return {
    settings: toSettings((settingsResult.results[0] as SettingsRow | undefined) ?? null),
    vegetables: (vegetablesResult.results as VegetableRow[]).map(toVegetable),
  };
}

export async function getAdminCatalog(): Promise<Catalog> {
  const db = getD1();
  const [settingsResult, vegetablesResult] = await db.batch([
    db.prepare(
      "SELECT farm_name_th, farm_name_en, line_official_id, line_account_type, updated_at FROM farm_settings WHERE id = 1",
    ),
    db.prepare(`SELECT ${vegetableColumns} FROM vegetables ORDER BY display_order ASC, name_th ASC`),
  ]);

  return {
    settings: toSettings((settingsResult.results[0] as SettingsRow | undefined) ?? null),
    vegetables: (vegetablesResult.results as VegetableRow[]).map(toVegetable),
  };
}

export async function createVegetable(input: Vegetable): Promise<Vegetable> {
  const db = getD1();
  const updatedAt = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO vegetables (${vegetableColumns}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.nameTh,
      input.nameEn,
      input.descriptionTh,
      input.descriptionEn,
      input.priceBaht,
      input.stockBags,
      input.displayOrder,
      updatedAt,
    )
    .run();

  return { ...input, updatedAt };
}

export async function updateVegetable(input: Vegetable): Promise<Vegetable> {
  const db = getD1();
  const updatedAt = new Date().toISOString();
  const result = await db
    .prepare(
      `UPDATE vegetables
       SET name_th = ?, name_en = ?, description_th = ?, description_en = ?,
           price_baht = ?, stock_bags = ?, display_order = ?, updated_at = ?
       WHERE id = ?`,
    )
    .bind(
      input.nameTh,
      input.nameEn,
      input.descriptionTh,
      input.descriptionEn,
      input.priceBaht,
      input.stockBags,
      input.displayOrder,
      updatedAt,
      input.id,
    )
    .run();

  if (!result.meta.changes) throw new Error("Vegetable not found.");
  return { ...input, updatedAt };
}

export async function deleteVegetable(id: string) {
  const db = getD1();
  const result = await db.prepare("DELETE FROM vegetables WHERE id = ?").bind(id).run();
  if (!result.meta.changes) throw new Error("Vegetable not found.");
}

export async function saveFarmSettings(input: Omit<FarmSettings, "updatedAt">) {
  const db = getD1();
  const updatedAt = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO farm_settings (id, farm_name_th, farm_name_en, line_official_id, line_account_type, updated_at)
       VALUES (1, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         farm_name_th = excluded.farm_name_th,
         farm_name_en = excluded.farm_name_en,
         line_official_id = excluded.line_official_id,
         line_account_type = excluded.line_account_type,
         updated_at = excluded.updated_at`,
    )
    .bind(input.farmNameTh, input.farmNameEn, input.lineOfficialId, input.lineAccountType, updatedAt)
    .run();

  return { ...input, updatedAt };
}

export async function seedStarterCatalog() {
  const db = getD1();
  const current = await db.prepare("SELECT COUNT(*) AS count FROM vegetables").first<{ count: number }>();
  if ((current?.count ?? 0) > 0) return getAdminCatalog();

  const now = new Date().toISOString();
  const statements = demoCatalog.vegetables.map((item) =>
    db
      .prepare(`INSERT INTO vegetables (${vegetableColumns}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(item.id, item.nameTh, item.nameEn, item.descriptionTh, item.descriptionEn, item.priceBaht, item.stockBags, item.displayOrder, now),
  );
  statements.push(
    db
      .prepare(`INSERT INTO farm_settings (id, farm_name_th, farm_name_en, line_official_id, line_account_type, updated_at) VALUES (1, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`)
      .bind(demoCatalog.settings.farmNameTh, demoCatalog.settings.farmNameEn, demoCatalog.settings.lineOfficialId || defaultLineId(), demoCatalog.settings.lineAccountType, now),
  );
  await db.batch(statements);
  return getAdminCatalog();
}
