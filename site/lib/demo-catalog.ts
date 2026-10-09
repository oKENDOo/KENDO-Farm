import type { Catalog } from "@/lib/types";

export const demoCatalog: Catalog = {
  settings: {
    farmNameTh: "KENDO FARM",
    farmNameEn: "KENDO FARM",
    lineOfficialId: "",
    updatedAt: "2026-10-09T08:30:00.000Z",
  },
  vegetables: [
    { id: "green-oak", nameTh: "กรีนโอ๊ค", nameEn: "Green Oak", descriptionTh: "กรอบนุ่ม รสหวานอ่อน เก็บสดจากรางปลูกเช้านี้", descriptionEn: "Tender, crisp lettuce harvested fresh from this morning's channels.", priceBaht: 45, stockBags: 12, displayOrder: 1, updatedAt: "2026-10-09T08:30:00.000Z" },
    { id: "red-oak", nameTh: "เรดโอ๊ค", nameEn: "Red Oak", descriptionTh: "ใบแดงนุ่ม เพิ่มสีสันและรสชาติให้ทุกจาน", descriptionEn: "Soft crimson leaves that bring colour and character to every plate.", priceBaht: 50, stockBags: 8, displayOrder: 2, updatedAt: "2026-10-09T08:30:00.000Z" },
    { id: "butterhead", nameTh: "บัตเตอร์เฮด", nameEn: "Butterhead", descriptionTh: "หัวแน่น ใบละมุน เหมาะกับสลัดและแซนด์วิช", descriptionEn: "Velvety, full heads that are perfect for salads and sandwiches.", priceBaht: 55, stockBags: 6, displayOrder: 3, updatedAt: "2026-10-09T08:30:00.000Z" },
    { id: "kale", nameTh: "เคล", nameEn: "Kale", descriptionTh: "ใบเขียวเข้ม เนื้อแน่น สำหรับเมนูสุขภาพทุกวัน", descriptionEn: "Deep-green, sturdy leaves for everyday wholesome cooking.", priceBaht: 60, stockBags: 4, displayOrder: 4, updatedAt: "2026-10-09T08:30:00.000Z" },
  ],
};
