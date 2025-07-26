#!/usr/bin/env deno run -A --watch=static/,routes/,islands/,lib/
import { loadSync } from "@std/dotenv";
import { Builder } from "fresh/dev";
import { tailwind } from "@fresh/plugin-tailwind";
import { app } from "./main.ts";

const cwd = Deno.cwd();
const envLocalPath = `${cwd}/../../.env.local`;
const envPath = `${cwd}/../../.env`;

// Load environment variables from .env.local, .env files
try {
  loadSync({
    envPath: envLocalPath,
    defaultsPath: envPath,
    export: true,
  });
  console.log("✅ Environment variables loaded");
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
// Note: Tailwind plugin configuration will be added in future tasks
// builder.use(tailwind());

// Create optimized assets for the browser when
// running `deno run -A dev.ts build`
if (Deno.args.includes("build")) {
  await builder.build(app);
} else {
  // ...otherwise start the development server
  await builder.listen(app, {
    port: 8002,
  });
}
