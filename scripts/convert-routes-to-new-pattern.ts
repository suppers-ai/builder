#!/usr/bin/env deno run --allow-read --allow-write
/**
 * Convert component routes to use the new pattern
 */

import { basename, dirname, join } from "jsr:@std/path@^1.0.8";

interface ComponentInfo {
  name: string;
  category: string;
  routePath: string;
  hasExamplesFile: boolean;
}

/**
 * Generate the new route content using the createSimpleComponentRoute helper
 */
function generateRouteContent(componentInfo: ComponentInfo): string {
  const { name, category } = componentInfo;
  const importPath = `@suppers/ui-lib`;

  return `import { ${name} } from "${importPath}";
import { createSimpleComponentRoute } from "@suppers/shared";

// Use the generic component route generator
export default createSimpleComponentRoute("${name}", "${category}", ${name});
`;
}

/**
 * Check if a component has an examples.md file
 */
async function hasExamplesFile(
  componentName: string,
  category: string,
  projectRoot: string,
): Promise<boolean> {
  const examplesPath = join(
    projectRoot,
    `packages/ui-lib/components/${category}/${componentName.toLowerCase()}/${componentName}.examples.md`,
  );

  try {
    await Deno.stat(examplesPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Map category directory names to category names
 */
function mapCategoryDirToName(categoryDir: string): string {
  const mapping: Record<string, string> = {
    "action": "action",
    "display": "display",
    "feedback": "feedback",
    "input": "input",
    "layout": "layout",
    "navigation": "navigation",
    "mockup": "mockup",
  };

  return mapping[categoryDir] || categoryDir;
}

/**
 * Convert component name from kebab-case to PascalCase
 */
function toPascalCase(kebabCase: string): string {
  return kebabCase
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/**
 * Main conversion function
 */
async function convertRoutesToNewPattern() {
  console.log("🔄 Converting component routes to new pattern...");

  // Find project root
  const currentDir = Deno.cwd();
  let projectRoot = currentDir;

  while (!await Deno.stat(join(projectRoot, "packages")).then(() => true).catch(() => false)) {
    const parent = dirname(projectRoot);
    if (parent === projectRoot) break;
    projectRoot = parent;
  }

  console.log(`📁 Project root: ${projectRoot}`);

  // Find all component routes
  const routesDir = join(projectRoot, "packages/ui-lib-website/routes/components");
  const componentRoutes: ComponentInfo[] = [];

  // Recursively find .tsx files in category directories
  const categoryDirs = ["action", "display", "feedback", "input", "layout", "navigation", "mockup"];

  for (const categoryDir of categoryDirs) {
    const categoryPath = join(routesDir, categoryDir);

    try {
      for await (const entry of Deno.readDir(categoryPath)) {
        if (entry.name.endsWith(".tsx")) {
          const routePath = join(categoryPath, entry.name);
          const componentFileName = basename(entry.name, ".tsx");
          const componentName = toPascalCase(componentFileName);
          const category = mapCategoryDirToName(categoryDir);

          const hasExamples = await hasExamplesFile(componentName, category, projectRoot);

          componentRoutes.push({
            name: componentName,
            category,
            routePath,
            hasExamplesFile: hasExamples,
          });
        }
      }
    } catch (error) {
      console.warn(`⚠️  Cannot read category directory ${categoryDir}:`, error.message);
    }
  }

  console.log(`📋 Found ${componentRoutes.length} component routes`);

  let convertedCount = 0;
  let skippedCount = 0;

  for (const componentInfo of componentRoutes) {
    console.log(`📝 Processing: ${componentInfo.name} (${componentInfo.category})`);

    // Skip if no examples file exists
    if (!componentInfo.hasExamplesFile) {
      console.log(`   ⏭️  Skipping (no examples.md file)`);
      skippedCount++;
      continue;
    }

    // Skip button since it's already converted
    if (componentInfo.name === "Button") {
      console.log(`   ⏭️  Skipping (already converted)`);
      skippedCount++;
      continue;
    }

    try {
      // Generate new route content
      const newContent = generateRouteContent(componentInfo);

      // Write the new route file
      await Deno.writeTextFile(componentInfo.routePath, newContent);
      console.log(`   ✅ Converted to new pattern`);
      convertedCount++;
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      skippedCount++;
    }
  }

  console.log("\n🎉 Route conversion completed!");
  console.log(`✅ Converted: ${convertedCount} routes`);
  console.log(`⏭️  Skipped: ${skippedCount} routes`);
  console.log(`📁 Total: ${componentRoutes.length} routes`);

  if (convertedCount > 0) {
    console.log("\n📋 Converted routes:");
    console.log("- All converted routes now use the createSimpleComponentRoute helper");
    console.log("- They automatically load examples from their .examples.md files");
    console.log("- Preview generation is handled automatically");
    console.log("- The original hardcoded examples have been replaced");
  }
}

if (import.meta.main) {
  await convertRoutesToNewPattern();
}
