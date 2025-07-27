#!/usr/bin/env deno run -A
import { App, fsRoutes, staticFiles } from "fresh";

export const app = new App()
  // Add static file serving middleware
  .use(staticFiles());

// Enable file-system based routing
await fsRoutes(app, {
  loadIsland: (path) => import(`./islands/${path}`),
  loadRoute: (path) => import(`./routes/${path}`),
});

// If this module is called directly, start the server
if (import.meta.main) {
  // Configure port from environment variable (default to 8000)
  const port = parseInt(Deno.env.get("STORE_PORT") || "8000");
  const hostname = Deno.env.get("STORE_HOST") || "localhost";
  
  console.log(`🚀 Store package starting on http://${hostname}:${port}`);
  await app.listen({ port, hostname });
}
