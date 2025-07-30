#!/usr/bin/env deno run -A --watch=static/,routes/,islands/,components/,lib/,hooks/,providers/,pages/
import { loadSync } from "@std/dotenv";
import { Builder } from "fresh/dev";
import { tailwind } from "@fresh/plugin-tailwind";

// Load environment variables
try {
  loadSync({
    envPath: "../../.env.local",
    defaultsPath: "../../.env",
    export: true,
  });
} catch {
  // Ignore if no env files
}

const builder = new Builder({ target: "safari12" });

// Configure the tailwind plugin for Fresh 2.0
tailwind(builder);

// Create optimized assets for the browser when
// running `deno run -A dev.ts build`
if (Deno.args.includes("build")) {
  await builder.build();
} else {
  // Start the development server
  await builder.listen(() => import("./main.ts").then(m => m.app), {
    port: parseInt(Deno.env.get("DOCS_PORT") || "8002"),
  });
}
