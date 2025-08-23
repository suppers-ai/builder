#!/usr/bin/env deno run -A
import { App, staticFiles } from "fresh";
console.log("profile");

export const app = new App()
  .use(staticFiles())
  .fsRoutes();

if (import.meta.main) {
  await app.listen();
}
