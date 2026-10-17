import { beforeAll, beforeEach } from "vitest";
import { env } from "cloudflare:workers";
import { applyD1Migrations } from "cloudflare:test";

beforeAll(async () => {
  if (!env.DB) throw new Error("The test D1 binding DB is unavailable.");
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS as unknown as Parameters<typeof applyD1Migrations>[1]);
});

beforeEach(async () => {
  if (!env.DB) return;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM vegetables"),
    env.DB.prepare("DELETE FROM farm_settings"),
  ]);
});
