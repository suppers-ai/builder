#!/usr/bin/env deno run -A
import { dirname, fromFileUrl } from "@std/path";
import { App, staticFiles } from "fresh";

// Ensure the working directory is the same directory as this file
Deno.chdir(dirname(fromFileUrl(import.meta.url)));

export const app = new App()
  .use(staticFiles())
  .fsRoutes();

if (import.meta.main) {
  await app.listen();
}
