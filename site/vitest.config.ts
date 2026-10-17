import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": root,
      "@frontend": path.join(root, "frontend"),
      "@backend": path.join(root, "backend"),
      "@shared": path.join(root, "shared"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup/frontend.ts"],
    include: [
      "tests/unit/shared/**/*.test.{ts,tsx}",
      "tests/unit/frontend/**/*.test.{ts,tsx}",
      "tests/integration/frontend/**/*.test.{ts,tsx}",
    ],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["shared/**/*.ts", "frontend/**/*.{ts,tsx}"],
      exclude: ["**/*.d.ts", "frontend/components/ui/**"],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 75,
      },
    },
  },
});
