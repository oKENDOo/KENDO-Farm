import { env } from "cloudflare:workers";
import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

async function request(path: string, init?: RequestInit) {
  return exports.default.fetch(new Request(`http://kendo-farm.test${path}`, init), env, {} as ExecutionContext);
}

describe("catalog API integration", () => {
  it("returns an empty public catalog before the first harvest is added", async () => {
    const response = await request("/api/catalog");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ vegetables: [] });
  });

  it("returns 404 for an unknown API route", async () => {
    const response = await request("/api/not-found");
    expect(response.status).toBe(404);
  });
});
