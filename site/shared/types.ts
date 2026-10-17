export type Locale = "th" | "en";
export type LineAccountType = "personal" | "official";

export type Vegetable = {
  id: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  priceBaht: number;
  stockBags: number;
  displayOrder: number;
  imageUrl: string | null;
  updatedAt: string;
};

export type FarmSettings = {
  farmNameTh: string;
  farmNameEn: string;
  lineOfficialId: string;
  lineAccountType: LineAccountType;
  lineMessageTh: string;
  lineMessageEn: string;
  updatedAt: string;
};

export type Catalog = {
  settings: FarmSettings;
  vegetables: Vegetable[];
};
