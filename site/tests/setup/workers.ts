import { beforeAll, beforeEach } from "vitest";
import { env } from "cloudflare:workers";
import { applyD1Migrations } from "cloudflare:test";
import { readD1Migrations } from "@cloudflare/vitest-plugin";

const migrations = await readD1Migrations({
  projectPath: process.cwd(),
  migrationsDir: "drizzle",
});

beforeAll(async () => {
  if (!env.DB) throw new Error("The test D1 binding DB is unavailable.");
  await applyD1Migrations(env.DB, migrations);
});

beforeEach(async () => {
  if (!env.DB) return;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM vegetables"),
    env.DB.prepare("DELETE FROM farm_settings"),
  ]);
});
