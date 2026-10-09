import { env } from "cloudflare:workers";

export function getD1() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Run the database migration before loading KENDO FARM data."
    );
  }

  return env.DB;
}
