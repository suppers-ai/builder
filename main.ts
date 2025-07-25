#!/usr/bin/env deno run -A

// Root-level entry that simply delegates to the UI-library website’s main.ts.
// Having this file at the repository root satisfies Deno Deploy’s Fresh
// builder expectations without duplicating code.

import { dirname, fromFileUrl, join } from "@std/path/mod.ts";

const rootDir = dirname(fromFileUrl(import.meta.url));
const packageDir = join(rootDir, "packages", "ui-lib-website");

// Ensure we operate from inside the package directory so static file paths
// and relative imports work exactly the same in local dev and on Deploy.
Deno.chdir(packageDir);

await import("./packages/ui-lib-website/main.ts"); 