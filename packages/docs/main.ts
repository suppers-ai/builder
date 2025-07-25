#!/usr/bin/env deno run -A
import { loadSync } from "@std/dotenv";
import { dirname, fromFileUrl } from "@std/path/mod.ts";
// import { start } from "fresh";
// import manifest from "./fresh.gen.ts";
// // Load environment variables from .env.local, .env files
loadSync({
  envPath: ".env.local",
  defaultsPath: ".env",
  export: true,
});

// await start(manifest, {
//   port: 8001,
// });

// main.ts
import { App, fsRoutes, staticFiles } from "fresh";

// Ensure the working directory is the same directory as this file
Deno.chdir(dirname(fromFileUrl(import.meta.url)));

export const app = new App()
  // Add static file serving middleware with CSS support
  .use(staticFiles());

// Enable file-system based routing
await fsRoutes(app, {
  loadIsland: (path) => import(`./islands/${path}`),
  loadRoute: (path) => import(`./routes/${path}`),
});

// If this module is called directly, start the server
if (import.meta.main) {
  await app.listen();
}
