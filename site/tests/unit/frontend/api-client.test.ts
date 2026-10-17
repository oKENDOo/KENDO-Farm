import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError, api } from "@frontend/lib/api-client";

describe("frontend API client", () => {
  afterEach(() => vi.restoreAllMocks());

  it("adds JSON headers and returns a successful response", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await expect(api<{ ok: boolean }>("/api/catalog")).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("/api/catalog", {
      headers: { "Content-Type": "application/json" },
    });
  });

  it("throws a typed error when the API responds with an error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Not allowed" }), { status: 403 }),
    );

    await expect(api("/api/admin/catalog")).rejects.toEqual(
      new ApiRequestError("Not allowed", 403),
    );
  });
});
