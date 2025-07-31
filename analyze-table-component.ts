#!/usr/bin/env -S deno run --allow-read --allow-write

import { performEnhancedAnalysis } from "./packages/ui-lib/utils/migration-analysis.ts";

const componentPath = "packages/ui-lib/components/display/table/Table.tsx";

console.log("🔍 Analyzing Table component for DaisyUI 5 and Tailwind 4 migration...\n");

try {
  console.log(`📄 Analyzing: ${componentPath}`);
  
  const analysis = await performEnhancedAnalysis(componentPath);
  
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
  console.error(`❌ Error analyzing ${componentPath}: ${error.message}`);
}