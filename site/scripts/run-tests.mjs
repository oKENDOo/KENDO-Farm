import { mkdir } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const runtimeRoot = path.join(projectRoot, "..", ".wrangler", "test-runtime");

await mkdir(runtimeRoot, { recursive: true });
process.env.WRANGLER_WRITE_LOGS = "false";
process.env.WRANGLER_LOG_PATH = path.join(runtimeRoot, "logs");
process.env.WRANGLER_REGISTRY_PATH = path.join(runtimeRoot, "wrangler-registry");
process.env.MINIFLARE_REGISTRY_PATH = path.join(runtimeRoot, "miniflare-registry");

const vitestPath = path.join(projectRoot, "..", "node_modules", "vitest", "vitest.mjs");
const child = spawn(process.execPath, [vitestPath, ...process.argv.slice(2)], {
  cwd: path.join(projectRoot, ".."),
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
