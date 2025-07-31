#!/usr/bin/env -S deno run --allow-read --allow-write

import { migrateFile } from "./packages/ui-lib/utils/migration-utilities.ts";

const cardComponentPaths = [
  "packages/ui-lib/components/display/card/Card.tsx",
  "packages/ui-lib/components/display/card/EntityCard.tsx", 
  "packages/ui-lib/components/display/card/ApplicationCard.tsx"
];

console.log("🔄 Migrating Card components for DaisyUI 5 and Tailwind 4...\n");

for (const filePath of cardComponentPaths) {
  try {
    console.log(`📄 Migrating: ${filePath}`);
    
    const result = await migrateFile(filePath, { verbose: true, skipBackup: false });
    
    console.log(`  Changes: ${result.changes.length}`);
    if (result.changes.length > 0) {
      result.changes.forEach(change => {
        console.log(`    - ${change}`);
      });
    }
    
    if (result.warnings.length > 0) {
      console.log(`  Warnings: ${result.warnings.length}`);
      result.warnings.forEach(warning => {
        console.log(`    ⚠️  ${warning}`);
      });
    }
    
    console.log("");
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}: ${error.message}`);
  }
}

console.log("✅ Card component migration complete!");