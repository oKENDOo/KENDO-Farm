import { z } from "zod";

export const vegetableInput = z.object({
  nameTh: z.string().trim().min(1).max(80),
  nameEn: z.string().trim().min(1).max(80),
  descriptionTh: z.string().trim().min(1).max(240),
  descriptionEn: z.string().trim().min(1).max(240),
  priceBaht: z.number().int().min(0).max(100000),
  stockBags: z.number().int().min(0).max(100000),
  displayOrder: z.number().int().min(0).max(10000),
});

export const settingsInput = z.object({
  farmNameTh: z.string().trim().min(1).max(80),
  farmNameEn: z.string().trim().min(1).max(80),
  lineOfficialId: z.string().trim().max(120),
});
