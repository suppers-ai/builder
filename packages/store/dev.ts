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

const builder = new Builder({ target: "safari12" });

tailwind(builder, app);

if (Deno.args.includes("build")) {
  await builder.build(app);
} else {
  await builder.listen(app, {
    port: 8002,
  });
}
