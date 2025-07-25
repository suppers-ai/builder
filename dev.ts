#!/usr/bin/env deno run -A
import { dirname, fromFileUrl, join } from "@std/path/mod.ts";

const rootDir = dirname(fromFileUrl(import.meta.url));

const pkgRelative = Deno.env.get("APP_PACKAGE");
if (!pkgRelative) {
  throw new Error("APP_PACKAGE is not set");
}

const pkgDir = join(rootDir, pkgRelative);

// Switch CWD so all relative paths inside the package work as expected.
Deno.chdir(pkgDir);

// Forward control to the real dev.ts of the chosen package.
await import(`./${pkgRelative}/dev.ts`); 