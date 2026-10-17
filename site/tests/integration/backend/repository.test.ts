import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { createVegetable, getCatalog, getAdminCatalog, saveFarmSettings, seedStarterCatalog, updateVegetable } from "@backend/db/repository";

const vegetable = {
  id: "test-oak",
  nameTh: "กรีนโอ๊คทดสอบ",
  nameEn: "Test Oak",
  descriptionTh: "ผักสำหรับทดสอบ",
  descriptionEn: "Vegetable used for tests",
  priceBaht: 49,
  stockBags: 3,
  displayOrder: 1,
  imageUrl: null,
  updatedAt: "2026-10-17T09:00:00.000Z",
};

describe("D1 catalog repository", () => {
  it("creates, updates, and hides a zero-stock vegetable from the public catalog", async () => {
    await createVegetable(vegetable);
    expect((await getCatalog()).vegetables.map((item) => item.id)).toContain("test-oak");

    await updateVegetable({ ...vegetable, stockBags: 0 });
    expect((await getCatalog()).vegetables.map((item) => item.id)).not.toContain("test-oak");
    expect((await getAdminCatalog()).vegetables.map((item) => item.id)).toContain("test-oak");
  });

  it("persists farm settings and seeds only an empty catalog", async () => {
    const saved = await saveFarmSettings({
      farmNameTh: "KENDO FARM ทดสอบ",
      farmNameEn: "KENDO FARM Test",
      lineOfficialId: "@kendo-test",
      lineAccountType: "official",
      lineMessageTh: "สนใจ {name}",
      lineMessageEn: "Interested in {name}",
    });

    expect(saved.lineAccountType).toBe("official");
    expect((await getAdminCatalog()).settings.lineMessageTh).toBe("สนใจ {name}");
    await seedStarterCatalog();
    const seeded = await getAdminCatalog();
    expect(seeded.vegetables.length).toBe(4);
    expect(seeded.settings.lineOfficialId).toBe("@kendo-test");
  });

  it("uses the configured D1 binding", () => {
    expect(env.DB).toBeDefined();
  });
});
