import path from "node:path";
import { fileURLToPath } from "node:url";
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
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup/frontend.ts"],
    include: [
      "tests/unit/shared/**/*.test.{ts,tsx}",
      "tests/unit/backend/auth.test.ts",
      "tests/unit/frontend/**/*.test.{ts,tsx}",
      "tests/integration/frontend/**/*.test.{ts,tsx}",
    ],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: [
        "shared/demo-catalog.ts",
        "shared/validation.ts",
        "frontend/features/**/*.{ts,tsx}",
        "frontend/lib/api-client.ts",
        "frontend/lib/utils.ts",
      ],
      exclude: ["**/*.d.ts", "frontend/components/ui/**"],
      thresholds: {
        lines: 60,
        statements: 55,
        functions: 50,
        branches: 55,
      },
    },
  },
});
