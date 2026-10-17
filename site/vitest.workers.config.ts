import path from "node:path";
import { fileURLToPath } from "node:url";
import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

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
      wrangler: {
        configPath: path.join(root, "wrangler.test.jsonc"),
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
    pool: "forks",
    fileParallelism: false,
  },
});
