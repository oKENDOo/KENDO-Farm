describe("KENDO FARM storefront", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("shows today's vegetables, price, stock, contact, and map details", () => {
    cy.contains("KENDO FARM").should("be.visible");
    cy.get("#harvest").scrollIntoView();
    cy.contains("กรีนโอ๊ค").should("be.visible");
    cy.contains("฿45").should("be.visible");
    cy.contains("เหลือ 12 ถุง").should("be.visible");
    cy.contains("พร้อมจัดส่ง").should("be.visible");
    cy.contains("081-931-1520").should("be.visible");
    cy.contains("เปิด Google Maps").should("have.attr", "href").and("include", "google.com/maps");
  });

  it("switches between Thai and English and opens the personal LINE profile", () => {
    cy.get("#harvest").scrollIntoView();
    cy.get('a[href*="line.me/R/ti/p/~kendozaza14271"]').first().should("be.visible");
    cy.contains("EN").click();
    cy.get("#harvest").scrollIntoView();
    cy.contains("TODAY'S SUPPLY").should("be.visible");
    cy.contains("Green Oak").should("be.visible");
    cy.contains("Open LINE profile").should("be.visible");
    cy.contains("ไทย").click();
    cy.get("#top").scrollIntoView();
    cy.contains("ผักสดที่พร้อม").should("be.visible");
  });
});
