import { describe, expect, it } from "vitest";
import { settingsInput, vegetableInput } from "@shared/validation";

describe("shared validation", () => {
  it("accepts a valid vegetable payload", () => {
    const result = vegetableInput.parse({
      nameTh: "กรีนโอ๊ค",
      nameEn: "Green Oak",
      descriptionTh: "ผักสดกรอบ",
      descriptionEn: "Fresh and crisp",
      priceBaht: 45,
      stockBags: 12,
      displayOrder: 1,
      imageUrl: null,
    });

    expect(result.nameTh).toBe("กรีนโอ๊ค");
  });

  it("rejects negative stock and unsupported LINE account types", () => {
    expect(() =>
      vegetableInput.parse({
        nameTh: "กรีนโอ๊ค",
        nameEn: "Green Oak",
        descriptionTh: "ผักสดกรอบ",
        descriptionEn: "Fresh and crisp",
        priceBaht: 45,
        stockBags: -1,
        displayOrder: 1,
        imageUrl: null,
      }),
    ).toThrow();

    expect(() =>
      settingsInput.parse({
        farmNameTh: "KENDO FARM",
        farmNameEn: "KENDO FARM",
        lineOfficialId: "kendo-test",
        lineAccountType: "invalid",
        lineMessageTh: "สวัสดี {name}",
        lineMessageEn: "Hello {name}",
      }),
    ).toThrow();
  });
});
