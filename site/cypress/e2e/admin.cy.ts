import catalogFixture from "../fixtures/catalog.json";

describe("KENDO FARM admin dashboard", () => {
  let catalog: typeof catalogFixture;
  let authenticated = false;

  beforeEach(() => {
    catalog = structuredClone(catalogFixture);
    authenticated = false;

    cy.intercept("GET", "/api/admin/session", (request) => {
      if (authenticated) {
        request.reply({ statusCode: 200, body: { user: { id: "parent-id", email: "parent@example.com" } } });
      } else {
        request.reply({ statusCode: 401, body: { error: "Please sign in to continue." } });
      }
    }).as("session");

    cy.intercept("POST", "/api/admin/session", (request) => {
      authenticated = true;
      request.reply({ statusCode: 200, body: { ok: true } });
    }).as("signIn");

    cy.intercept("DELETE", "/api/admin/session", { statusCode: 200, body: { ok: true } }).as("signOut");
    cy.intercept("GET", "/api/admin/catalog", (request) => request.reply({ statusCode: 200, body: catalog })).as("adminCatalog");
    cy.intercept("POST", "/api/admin/vegetables", (request) => {
      const vegetable = { ...request.body, id: "test-oak", updatedAt: "2026-10-17T09:30:00.000Z" };
      catalog.vegetables.push(vegetable);
      request.reply({ statusCode: 201, body: vegetable });
    }).as("createVegetable");
    cy.intercept("PATCH", "/api/admin/settings", (request) => {
      catalog.settings = { ...catalog.settings, ...request.body, updatedAt: "2026-10-17T09:35:00.000Z" };
      request.reply({ statusCode: 200, body: catalog.settings });
    }).as("saveSettings");

    cy.visit("/admin");
    cy.wait("@session");
  });

  function signIn() {
    cy.get('input[type="email"]').type("parent@example.com");
    cy.get('input[type="password"]').type("correct-horse-battery-staple");
    cy.contains("เข้าสู่ระบบ").click();
    cy.wait("@signIn");
    cy.wait("@session");
    cy.wait("@adminCatalog");
  }

  it("signs in, adds an inventory item, and shows a success toast", () => {
    signIn();
    cy.contains("เพิ่มผัก").click();
    cy.contains("label", "ชื่อผัก (ไทย)").find("input").first().type("เรดคอรัล");
    cy.contains("label", "ชื่อผัก (English)").find("input").first().type("Red Coral");
    cy.contains("label", "รายละเอียด (ไทย)").find("textarea").first().type("ใบกรอบสีสวย");
    cy.contains("label", "Description (English)").find("textarea").first().type("Crisp colourful leaves");
    cy.contains("label", "ราคา (บาท/ถุง)").find("input").first().clear().type("65");
    cy.contains("label", "จำนวนคงเหลือ (ถุง)").find("input").first().clear().type("5");
    cy.contains("บันทึกรายการผัก").click();
    cy.wait("@createVegetable");
    cy.wait("@adminCatalog");
    cy.contains("บันทึกข้อมูลสำเร็จ").should("be.visible");
    cy.contains("เรดคอรัล").should("be.visible");
  });

  it("switches LINE account type and saves the auto-message templates", () => {
    signIn();
    cy.get('button[role="combobox"]').click();
    cy.get('[role="option"]').contains("LINE Official Account").click();
    cy.contains("label", "LINE ID").find("input").first().clear().type("@kendo-farm");
    cy.contains("p", "ข้อความอัตโนมัติ (ไทย)").parent().find("textarea").first().clear().type("สนใจ {name} วันนี้ค่ะ");
    cy.contains("p", "ข้อความอัตโนมัติ (English)").parent().find("textarea").first().clear().type("I would like to order {name}.");
    cy.contains("ตั้งค่าฟาร์ม").parents("aside").find("form button").contains("บันทึก").click();
    cy.wait("@saveSettings");
    cy.wait("@adminCatalog");
    cy.contains("บันทึกข้อมูลสำเร็จ").should("be.visible");
  });
});
