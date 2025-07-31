#!/usr/bin/env -S deno run --allow-read --allow-write

import { migrateFile } from "./packages/ui-lib/utils/migration-utilities.ts";

const componentPaths = [
  "packages/ui-lib/components/display/badge/Badge.tsx",
  "packages/ui-lib/components/display/avatar/Avatar.tsx",
  "packages/ui-lib/components/display/avatar/UserAvatar.tsx"
];

console.log("🔄 Migrating Badge and Avatar components for DaisyUI 5 and Tailwind 4...\n");

for (const filePath of componentPaths) {
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

console.log("✅ Badge and Avatar component migration complete!");