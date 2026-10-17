# KENDO FARM architecture

KENDO FARM keeps one Vinext/Cloudflare Worker deployment while separating the
source by responsibility:

- `frontend/` contains browser-facing pages, UI components, hooks, styles, and
  the typed API client.
- `backend/` contains API handlers, authentication, D1 access, business
  services, and server-only connector integrations.
- `shared/` contains data types, validation schemas, and demo data that are
  safe to use on both sides.
- `app/` contains only the route adapters required by Vinext. These adapters
  preserve the existing public paths while delegating implementation to the
  appropriate boundary.

The boundaries are logical rather than deployment boundaries. Frontend and
backend therefore continue to share the same origin, D1 binding, Supabase
configuration, and Cloudflare URL.
