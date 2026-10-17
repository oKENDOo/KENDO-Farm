import { Storefront } from "@frontend/features/storefront/storefront";
import { getCatalog } from "@backend/db/repository";
import { demoCatalog } from "@shared/demo-catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  let catalog = null;
  try {
    catalog = await getCatalog();
  } catch (error) {
    console.error("Unable to load live KENDO FARM catalog", error);
  }

  if (catalog?.vegetables.length) return <Storefront catalog={catalog} isDemo={false} />;

  return <Storefront catalog={demoCatalog} isDemo />;
}
