import path from "node:path";
import { fileURLToPath } from "node:url";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));
const migrations = await readD1Migrations({ projectPath: root, migrationsDir: "drizzle" });

export default defineConfig({
  resolve: {
    alias: {
      "@frontend": path.join(root, "frontend"),
      "@backend": path.join(root, "backend"),
      "@shared": path.join(root, "shared"),
      "@/lib/utils": path.join(root, "frontend/lib/utils"),
      "@/components": path.join(root, "frontend/components"),
      "@/hooks": path.join(root, "frontend/hooks"),
    },
  },
  plugins: [
    cloudflareTest({
      main: "./tests/fixtures/test-worker.ts",
      miniflare: {
        compatibilityDate: "2026-05-15",
        compatibilityFlags: ["nodejs_compat", "nodejs_compat_v2"],
        bindings: { TEST_MIGRATIONS: migrations },
      },
      wrangler: {
        configPath: "./wrangler.test.jsonc",
      },
    }),
  ],
  test: {
    globals: true,
    include: [
      "tests/unit/backend/**/*.test.ts",
      "tests/integration/backend/**/*.test.ts",
    ],
    setupFiles: ["./tests/setup/workers.ts"],
  },
});
