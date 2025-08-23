#!/usr/bin/env deno run -A --watch=static/,routes/,islands/,components/,lib/
import { loadSync } from "@std/dotenv";
import { Builder } from "fresh/dev";
import { tailwind } from "@fresh/plugin-tailwind-v3";

// Load environment variables
try {
  loadSync({
    envPath: "../../.env",
    export: true,
  });
  console.log("env variables loaded");
} catch {
  // Ignore if no env files
  console.log("No env variables found");
}

const builder = new Builder({ target: "safari12" });

// Configure the tailwind plugin for Fresh 2.0
tailwind(builder);

// Create optimized assets for the browser when
// running `deno run -A dev.ts build`
if (Deno.args.includes("build")) {
  console.log("Starting build process...");
  try {
    console.log("Building with Fresh...");
    await builder.build();
    console.log("Build completed successfully!");
    console.log("Exiting build process...");
    Deno.exit(0);
  } catch (error) {
    console.error("Build failed:", error);
    Deno.exit(1);
  }
} else {
  // Start the development server
  await builder.listen(() => import("./main.ts").then((m) => m.app), {
    port: 8006, // Use different port to avoid conflicts
  });
}
