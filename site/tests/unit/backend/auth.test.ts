import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthError, authCookie, isAuthConfigured, requireAdmin, signInWithPassword } from "@backend/auth";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("admin authentication boundary", () => {
  it("reports configuration only when credentials and an allow-list exist", () => {
    vi.stubEnv("SUPABASE_URL", "https://supabase.test");
    vi.stubEnv("SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("ADMIN_EMAILS", "parent@example.com");
    expect(isAuthConfigured()).toBe(true);

    vi.stubEnv("ADMIN_EMAILS", "");
    expect(isAuthConfigured()).toBe(false);
  });

  it("signs in an approved admin and verifies the returned user", async () => {
    vi.stubEnv("SUPABASE_URL", "https://supabase.test");
    vi.stubEnv("SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("ADMIN_EMAILS", "parent@example.com");
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "session-token", expires_in: 3600 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "parent-id", email: "parent@example.com" }), { status: 200 }));

    await expect(signInWithPassword("parent@example.com", "secret")).resolves.toMatchObject({ access_token: "session-token" });
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it("rejects a valid Supabase user that is not on the admin allow-list", async () => {
    vi.stubEnv("SUPABASE_URL", "https://supabase.test");
    vi.stubEnv("SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("ADMIN_EMAILS", "parent@example.com");
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "session-token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "unknown-id", email: "visitor@example.com" }), { status: 200 }));

    await expect(signInWithPassword("visitor@example.com", "secret")).rejects.toMatchObject<AuthError>({ status: 403 });
  });

  it("requires a session cookie before reading the admin session", async () => {
    vi.stubEnv("SUPABASE_URL", "https://supabase.test");
    vi.stubEnv("SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("ADMIN_EMAILS", "parent@example.com");

    await expect(requireAdmin({ cookies: { get: () => undefined } } as never)).rejects.toMatchObject<AuthError>({ status: 401 });
    expect(authCookie.name).toBe("kendo_admin_session");
  });
});
