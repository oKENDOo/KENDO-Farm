import { getAdminCatalog, getCatalog } from "@backend/db/repository";

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/catalog" && request.method === "GET") {
      return Response.json(await getCatalog());
    }
    if (path === "/api/admin/catalog" && request.method === "GET") {
      return Response.json(await getAdminCatalog());
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },
};
