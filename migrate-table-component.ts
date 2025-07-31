#!/usr/bin/env -S deno run --allow-read --allow-write

import { migrateFile } from "./packages/ui-lib/utils/migration-utilities.ts";

const componentPath = "packages/ui-lib/components/display/table/Table.tsx";

console.log("🔄 Migrating Table component for DaisyUI 5 and Tailwind 4...\n");

try {
  console.log(`📄 Migrating: ${componentPath}`);
  
  const result = await migrateFile(componentPath, { verbose: true, skipBackup: false });
  
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
  console.error(`❌ Error migrating ${componentPath}: ${error.message}`);
}

console.log("✅ Table component migration complete!");