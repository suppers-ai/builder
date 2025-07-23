#!/usr/bin/env deno run --allow-read --allow-write
/**
 * Fix imports in converted route files
 */

import { dirname, join } from "jsr:@std/path@^1.0.8";

async function fixRouteImports() {
  console.log("🔧 Fixing imports in converted route files...");

  // Find project root
  const currentDir = Deno.cwd();
  let projectRoot = currentDir;

  while (!await Deno.stat(join(projectRoot, "packages")).then(() => true).catch(() => false)) {
    const parent = dirname(projectRoot);
    if (parent === projectRoot) break;
    projectRoot = parent;
  }

  const routesDir = join(projectRoot, "packages/ui-lib-website/routes/components");
  const categoryDirs = ["action", "display", "feedback", "input", "layout", "navigation", "mockup"];

  let fixedCount = 0;

  for (const categoryDir of categoryDirs) {
    const categoryPath = join(routesDir, categoryDir);

    try {
      for await (const entry of Deno.readDir(categoryPath)) {
        if (entry.name.endsWith(".tsx")) {
          const filePath = join(categoryPath, entry.name);
          const content = await Deno.readTextFile(filePath);

          // Check if it needs fixing
          if (content.includes('from "@suppers/shared"')) {
            const newContent = content.replace(
              'from "@suppers/shared"',
              'from "@suppers/shared/utils/component-route-generator.tsx"',
            );

            await Deno.writeTextFile(filePath, newContent);
            console.log(`✅ Fixed: ${entry.name}`);
            fixedCount++;
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  Cannot read category directory ${categoryDir}:`, (error as Error).message);
    }
  }

  console.log(`\n🎉 Fixed ${fixedCount} route import files!`);
}

if (import.meta.main) {
  await fixRouteImports();
}
