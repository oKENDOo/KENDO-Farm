import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AdminDashboard } from "@frontend/features/admin/admin-dashboard";
import { demoCatalog } from "@shared/demo-catalog";
import type { Catalog, Vegetable } from "@shared/types";

let authenticated = false;
let catalog: Catalog = structuredClone(demoCatalog);

const server = setupServer(
  http.get("/api/admin/session", () =>
    authenticated
      ? HttpResponse.json({ user: { id: "admin-1", email: "admin-one@kendo.test" } })
      : HttpResponse.json({ error: "Please sign in to continue." }, { status: 401 }),
  ),
  http.post("/api/admin/session", async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (body.email !== "admin-one@kendo.test" || body.password !== "correct-password") {
      return HttpResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }
    authenticated = true;
    return HttpResponse.json({ ok: true });
  }),
  http.get("/api/admin/catalog", () => HttpResponse.json(catalog)),
  http.post("/api/admin/vegetables", async ({ request }) => {
    const input = (await request.json()) as Omit<Vegetable, "id" | "updatedAt">;
    const vegetable: Vegetable = {
      ...input,
      id: "new-vegetable",
      updatedAt: "2026-10-17T09:00:00.000Z",
    };
    catalog = { ...catalog, vegetables: [...catalog.vegetables, vegetable] };
    return HttpResponse.json(vegetable, { status: 201 });
  }),
  http.patch("/api/admin/settings", async ({ request }) => {
    const settings = (await request.json()) as Catalog["settings"];
    catalog = { ...catalog, settings: { ...settings, updatedAt: "2026-10-17T09:00:00.000Z" } };
    return HttpResponse.json(catalog.settings);
  }),
  http.delete("/api/admin/session", () => {
    authenticated = false;
    return HttpResponse.json({ ok: true });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  authenticated = false;
  catalog = structuredClone(demoCatalog);
  window.localStorage.clear();
});

describe("admin dashboard integration", () => {
  it("signs in through the API and loads the inventory", async () => {
    const user = userEvent.setup();
    render(<AdminDashboard />);

    await screen.findByRole("heading", { name: "เข้าสู่หลังบ้าน" });
    await user.type(screen.getByLabelText("อีเมลผู้ดูแล"), "admin-one@kendo.test");
    await user.type(screen.getByLabelText("รหัสผ่าน"), "correct-password");
    await user.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }));

    await screen.findByRole("heading", { name: "สวัสดีทีมสวน" });
    expect(screen.getByText("กรีนโอ๊ค")).toBeInTheDocument();
    expect(screen.getByText("เข้าสู่ระบบแล้ว: admin-one@kendo.test")).toBeInTheDocument();
  });

  it("saves a new vegetable and shows the success feedback", async () => {
    const user = userEvent.setup();
    authenticated = true;
    render(<AdminDashboard />);

    await screen.findByRole("heading", { name: "สวัสดีทีมสวน" });
    await user.click(screen.getByRole("button", { name: "เพิ่มผัก" }));
    await screen.findByRole("heading", { name: "เพิ่มผักใหม่" });

    await user.type(screen.getByLabelText("ชื่อผัก (ไทย)"), "ผักทดลอง");
    await user.type(screen.getByLabelText("ชื่อผัก (English)"), "Test Green");
    await user.type(screen.getByLabelText("รายละเอียด (ไทย)"), "ผักสำหรับทดสอบ");
    await user.type(screen.getByLabelText("Description (English)"), "A test vegetable");
    await user.click(screen.getByRole("button", { name: "บันทึกรายการผัก" }));

    await waitFor(() => expect(screen.getByText("บันทึกข้อมูลสำเร็จ")).toBeInTheDocument());
    expect(screen.getByText("ผักทดลอง")).toBeInTheDocument();
  });
});
