#!/usr/bin/env -S deno run -A

/**
 * Test script for all packages in the monorepo
 */

const packages = [
  "packages/shared",
  "packages/compiler",
  "packages/api", 
  "packages/ui-library"
];

console.log("🧪 Running tests for all packages...");

for (const pkg of packages) {
  console.log(`\n📦 Testing ${pkg}...`);
  
  const cmd = new Deno.Command("deno", {
    args: ["test", "-A", pkg],
    cwd: Deno.cwd(),
  });
  
  const { code, stderr } = await cmd.output();
  const stderrText = new TextDecoder().decode(stderr);
  
  if (code !== 0) {
    // Check if it's just "No test modules found" which is acceptable for now
    if (stderrText.includes("No test modules found")) {
      console.log(`⚠️  No tests found for ${pkg} (this is expected during initial setup)`);
    } else {
      console.error(`❌ Tests failed for ${pkg}`);
      console.error(stderrText);
      Deno.exit(1);
    }
  } else {
    console.log(`✅ Tests passed for ${pkg}`);
  }
}

console.log("\n🎉 All tests passed!");