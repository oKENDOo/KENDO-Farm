import { Storefront } from "@/components/storefront";
import { getCatalog } from "@/db/repository";
import { demoCatalog } from "@/lib/demo-catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const catalog = await getCatalog();
    if (catalog.vegetables.length) return <Storefront catalog={catalog} isDemo={false} />;
  } catch (error) {
    console.error("Unable to load live KENDO FARM catalog", error);
  }

  return <Storefront catalog={demoCatalog} isDemo />;
}
