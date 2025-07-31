#!/usr/bin/env -S deno run --allow-read --allow-write

import { performEnhancedAnalysis } from "./packages/ui-lib/utils/migration-analysis.ts";

const componentPaths = [
  "packages/ui-lib/components/display/badge/Badge.tsx",
  "packages/ui-lib/components/display/avatar/Avatar.tsx",
  "packages/ui-lib/components/display/avatar/UserAvatar.tsx"
];

console.log("🔍 Analyzing Badge and Avatar components for DaisyUI 5 and Tailwind 4 migration...\n");

for (const filePath of componentPaths) {
  try {
    console.log(`📄 Analyzing: ${filePath}`);
    
    const analysis = await performEnhancedAnalysis(filePath);
    
    console.log(`  Component: ${analysis.componentName}`);
    console.log(`  Category: ${analysis.category}`);
    console.log(`  Complexity: ${analysis.migrationComplexity}`);
    console.log(`  Estimated time: ${analysis.estimatedMigrationTime} minutes`);
    console.log(`  DaisyUI classes: ${analysis.daisyuiClasses.join(', ') || 'none'}`);
    console.log(`  Tailwind classes: ${analysis.tailwindClasses.join(', ') || 'none'}`);
    console.log(`  Custom classes: ${analysis.customClasses.join(', ') || 'none'}`);
    
    if (analysis.breakingChanges.length > 0) {
      console.log(`  Breaking changes:`);
      analysis.breakingChanges.forEach(change => {
        console.log(`    - ${change.description} (${change.severity})`);
      });
    }
    
    if (analysis.deprecatedPatterns.length > 0) {
      console.log(`  Deprecated patterns: ${analysis.deprecatedPatterns.join(', ')}`);
    }
    
    console.log("");
  } catch (error) {
    console.error(`❌ Error analyzing ${filePath}: ${error.message}`);
  }
}