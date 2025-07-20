#!/usr/bin/env deno run -A --watch=static/,routes/,islands/,components/,lib/,hooks/,providers/,pages/
import { loadSync } from "@std/dotenv";
import { Builder } from "fresh/dev";
import { tailwind } from "@fresh/plugin-tailwind";
import { app } from "./main.ts";

const cwd = Deno.cwd();
const envLocalPath = `${cwd}/../../.env.local`;
const envPath = `${cwd}/../../.env`;

// Load environment variables from .env.local, .env files
console.log("🔍 Path debugging:");
console.log("Current working directory:", cwd);
console.log("Script directory:", import.meta.url);
console.log("Looking for .env.local at:", envLocalPath);

try {
  // Check if .env.local exists
  try {
    const stat = await Deno.stat(envLocalPath);
    console.log("✅ .env.local found:", envLocalPath, "size:", stat.size);
  } catch {
    console.log("❌ .env.local not found at:", envLocalPath);
  }

  loadSync({
    envPath: envLocalPath,
    defaultsPath: envPath,
    export: true,
  });
  console.log("✅ Environment variables loaded");
  console.log("SUPABASE_URL:", Deno.env.get("SUPABASE_URL") ? "✓ Set" : "✗ Missing");
  console.log("SUPABASE_ANON_KEY:", Deno.env.get("SUPABASE_ANON_KEY") ? "✓ Set" : "✗ Missing");
} catch (error) {
  console.warn("⚠️  Failed to load .env.local, trying without it:", (error as Error).message);
  try {
    loadSync({
      envPath: ".env",
      export: true,
    });
  } catch (err) {
    console.warn("⚠️  No .env file found:", (err as Error).message);
  }
}

// Pass development only configuration here
const builder = new Builder({ target: "safari12" });

// Configure the tailwind plugin for Fresh
tailwind(builder, app);
// Create optimized assets for the browser when
// running `deno run -A dev.ts build`
if (Deno.args.includes("build")) {
  await builder.build(app);
} else {
  // ...otherwise start the development server
  await builder.listen(app, {
    port: 8001,
  });
}
