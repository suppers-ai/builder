#!/usr/bin/env deno run -A

// Root proxy to run the UI-lib website dev/build script so that Fresh
// builder on Deno Deploy can find a dev.ts at the repository root.
// It simply changes the working directory to the package directory and
// re-executes the real dev.ts preserving the original arguments.

import { dirname, fromFileUrl, join } from "@std/path/mod.ts";

const rootDir = dirname(fromFileUrl(import.meta.url));
const packageDir = join(rootDir, "packages", "ui-lib-website");

// Make sure all relative file operations happen inside the package
Deno.chdir(packageDir);

// Dynamically load the real dev script. All original CLI arguments are
// automatically available in `Deno.args` for the child script.
await import("./packages/ui-lib-website/dev.ts"); 