import type { Catalog, FarmSettings, Vegetable } from "@shared/types";
import type { settingsInput, vegetableInput } from "@shared/validation";
import type { z } from "zod";

export type ApiErrorBody = { error: string };
export type CatalogResponse = Catalog;
export type AdminSessionResponse = { user: { id: string; email: string } };
export type VegetableInput = z.infer<typeof vegetableInput>;
export type SettingsInput = z.infer<typeof settingsInput>;
export type VegetableDraft = Omit<Vegetable, "id" | "updatedAt">;
export type FarmSettingsDraft = Omit<FarmSettings, "updatedAt">;
