#!/usr/bin/env -S deno run -A

/**
 * Build script for all packages in the monorepo
 */

const packages = [
  "packages/shared",
  "packages/compiler", 
  "packages/api",
  "packages/ui-library"
];

console.log("🔨 Building all packages...");

for (const pkg of packages) {
  console.log(`\n📦 Building ${pkg}...`);
  
  const cmd = new Deno.Command("deno", {
    args: ["check", `${pkg}/mod.ts`],
    cwd: Deno.cwd(),
  });
  
  const { code, stderr } = await cmd.output();
  
  if (code !== 0) {
    console.error(`❌ Failed to build ${pkg}`);
    console.error(new TextDecoder().decode(stderr));
    Deno.exit(1);
  } else {
    console.log(`✅ Successfully built ${pkg}`);
  }
}

console.log("\n🎉 All packages built successfully!");