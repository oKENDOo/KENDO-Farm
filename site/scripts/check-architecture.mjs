import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const requiredDirectories = ["frontend", "backend", "shared", "app"];
const requiredFiles = [
  "frontend/lib/api-client.ts",
  "backend/db/repository.ts",
  "backend/auth/index.ts",
  "shared/api-contracts.ts",
  "app/api/catalog/route.ts",
  "app/api/admin/session/route.ts",
];
const legacyDirectories = ["components", "db", "hooks", "lib"];

const missingDirectories = requiredDirectories.filter(
  (directory) => !existsSync(join(root, directory)),
);
const missingFiles = requiredFiles.filter((file) => !existsSync(join(root, file)));
const legacySourceDirectories = legacyDirectories.filter((directory) =>
  existsSync(join(root, directory)),
);

if (missingDirectories.length || missingFiles.length || legacySourceDirectories.length) {
  console.error("Architecture check failed.");
  if (missingDirectories.length) console.error(`Missing directories: ${missingDirectories.join(", ")}`);
  if (missingFiles.length) console.error(`Missing files: ${missingFiles.join(", ")}`);
  if (legacySourceDirectories.length) console.error(`Legacy directories still exist: ${legacySourceDirectories.join(", ")}`);
  process.exit(1);
}

const frontendFiles = [
  "frontend/features/storefront/storefront.tsx",
  "frontend/features/admin/admin-dashboard.tsx",
  "frontend/lib/api-client.ts",
];
const forbiddenFrontendImports = /@backend\//;
const frontendViolations = frontendFiles.filter((file) =>
  forbiddenFrontendImports.test(readFileSync(join(root, file), "utf8")),
);

if (frontendViolations.length) {
  console.error(`Frontend must not import backend modules: ${frontendViolations.join(", ")}`);
  process.exit(1);
}

console.log("Architecture check passed: frontend, backend, shared, and route adapters are separated.");
