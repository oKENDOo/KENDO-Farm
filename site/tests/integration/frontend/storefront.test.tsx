import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Storefront } from "@frontend/features/storefront/storefront";
import { demoCatalog } from "@shared/demo-catalog";

describe("storefront integration", () => {
  it("switches language, hides empty stock, and builds a personal LINE link", () => {
    const catalog = {
      ...demoCatalog,
      settings: {
        ...demoCatalog.settings,
        lineOfficialId: "kendozaza14271",
        lineAccountType: "personal" as const,
      },
      vegetables: [demoCatalog.vegetables[0]],
    };

    render(<Storefront catalog={catalog} isDemo={false} />);

    expect(screen.getByRole("heading", { name: "กรีนโอ๊ค" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /เปิดโปรไฟล์ LINE/i })).toHaveAttribute(
      "href",
      "https://line.me/R/ti/p/~kendozaza14271",
    );

    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByRole("heading", { name: "Green Oak" })).toBeInTheDocument();
    expect(screen.getByText("READY TO SHIP")).toBeInTheDocument();
  });

  it("creates an encoded Official LINE message using the selected language", () => {
    const catalog = {
      ...demoCatalog,
      settings: {
        ...demoCatalog.settings,
        lineOfficialId: "@kendo-farm",
        lineAccountType: "official" as const,
        lineMessageTh: "สนใจ {name} ค่ะ",
      },
      vegetables: [demoCatalog.vegetables[0]],
    };

    render(<Storefront catalog={catalog} isDemo={false} />);
    const link = screen.getByRole("link", { name: /ทัก LINE เรื่องผักนี้/i });

    expect(link).toHaveAttribute(
      "href",
      `https://line.me/R/oaMessage/${encodeURIComponent("@kendo-farm")}/?${encodeURIComponent("สนใจ กรีนโอ๊ค ค่ะ")}`,
    );
  });
});
