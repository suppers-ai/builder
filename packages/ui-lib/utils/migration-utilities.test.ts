/**
 * Tests for Migration Utilities
 */

import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { 
  applyDaisyUIMigrations, 
  applyTailwindMigrations, 
  applyAllMigrations,
  validateMapping,
  validateAllMappings,
  previewMigration,
  migrateFile,
  findComponentFiles,
  generateMigrationReport,
  DAISYUI_CLASS_MIGRATIONS,
  TAILWIND_CLASS_MIGRATIONS,
  type BatchMigrationResult
} from "./migration-utilities.ts";

Deno.test("applyDaisyUIMigrations - should replace loading class", () => {
  const content = `<span class="loading"></span>`;
  const result = applyDaisyUIMigrations(content);
  
  assertEquals(result.content, `<span class="loading loading-spinner"></span>`);
  assertEquals(result.changes.length, 1);
  assertEquals(result.changes[0], "loading → loading loading-spinner");
});

Deno.test("applyDaisyUIMigrations - should handle multiple classes", () => {
  const content = `<button class="btn btn-ghost loading">Click me</button>`;
  const result = applyDaisyUIMigrations(content);
  
  assertStringIncludes(result.content, "loading loading-spinner");
  // Should have 2 changes: btn-ghost → btn-ghost (verification) and loading → loading loading-spinner
  assertEquals(result.changes.length, 2);
});

Deno.test("applyTailwindMigrations - should replace gray with slate", () => {
  const content = `<div class="text-gray-500 bg-gray-100">Content</div>`;
  const result = applyTailwindMigrations(content);
  
  assertStringIncludes(result.content, "text-slate-500");
  assertStringIncludes(result.content, "bg-slate-100");
  assertEquals(result.changes.length, 2);
});

Deno.test("applyAllMigrations - should apply both DaisyUI and Tailwind migrations", () => {
  const content = `<button class="btn loading text-gray-500">Loading</button>`;
  const result = applyAllMigrations(content);
  
  assertStringIncludes(result.content, "loading loading-spinner");
  assertStringIncludes(result.content, "text-slate-500");
  assertEquals(result.changes.length, 2);
});

Deno.test("validateMapping - should validate correct mappings", () => {
  const validMapping = {
    from: "btn-ghost",
    to: "btn-ghost",
    type: "daisyui" as const,
    breaking: false,
    notes: "Verify ghost styling in DaisyUI 5"
  };
  
  assertEquals(validateMapping(validMapping), true);
});

Deno.test("validateMapping - should reject invalid class names", () => {
  const invalidMapping = {
    from: "btn@invalid",
    to: "btn-valid",
    type: "daisyui" as const,
    breaking: false
  };
  
  assertEquals(validateMapping(invalidMapping), false);
});

Deno.test("DAISYUI_CLASS_MIGRATIONS - should have valid mappings", () => {
  DAISYUI_CLASS_MIGRATIONS.forEach(mapping => {
    assertEquals(validateMapping(mapping), true, `Invalid mapping: ${mapping.from} → ${mapping.to}`);
  });
});

Deno.test("TAILWIND_CLASS_MIGRATIONS - should have valid mappings", () => {
  TAILWIND_CLASS_MIGRATIONS.forEach(mapping => {
    assertEquals(validateMapping(mapping), true, `Invalid mapping: ${mapping.from} → ${mapping.to}`);
  });
});

Deno.test("applyDaisyUIMigrations - should handle className attribute", () => {
  const content = `<div className="loading btn-ghost">Content</div>`;
  const result = applyDaisyUIMigrations(content);
  
  assertStringIncludes(result.content, "loading loading-spinner");
  assertEquals(result.changes.length, 2); // loading → loading loading-spinner and btn-ghost → btn-ghost
});

Deno.test("applyAllMigrations - should not modify unrelated classes", () => {
  const content = `<div class="custom-class my-component">Content</div>`;
  const result = applyAllMigrations(content);
  
  assertEquals(result.content, content);
  assertEquals(result.changes.length, 0);
});

Deno.test("applyAllMigrations - should handle template literals", () => {
  const content = `<div class=\`btn loading \${someClass}\`>Content</div>`;
  const result = applyAllMigrations(content);
  
  assertStringIncludes(result.content, "loading loading-spinner");
  assertEquals(result.changes.length, 1);
});

Deno.test("validateAllMappings - should identify valid and invalid mappings", () => {
  const validation = validateAllMappings();
  
  // Should have valid mappings
  assertEquals(validation.valid.length > 0, true);
  
  // Should not have invalid mappings with current setup
  assertEquals(validation.invalid.length, 0);
  
  // Check for duplicates (there shouldn't be any)
  assertEquals(validation.duplicates.length, 0);
});

Deno.test("previewMigration - should show changes without applying them", async () => {
  // Create a temporary test file
  const testContent = `<button class="btn loading text-gray-500">Test</button>`;
  const testFile = './test-migration-preview.tsx';
  
  await Deno.writeTextFile(testFile, testContent);
  
  try {
    const preview = await previewMigration(testFile);
    
    assertEquals(preview.originalContent, testContent);
    assertStringIncludes(preview.migratedContent, "loading loading-spinner");
    assertStringIncludes(preview.migratedContent, "text-slate-500");
    assertEquals(preview.changes.length, 2);
    assertEquals(preview.diff.length > 0, true);
    
    // Verify original file is unchanged
    const fileContent = await Deno.readTextFile(testFile);
    assertEquals(fileContent, testContent);
  } finally {
    // Clean up
    try {
      await Deno.remove(testFile);
    } catch {
      // Ignore cleanup errors
    }
  }
});

Deno.test("migrateFile - should create backup and apply changes", async () => {
  const testContent = `<div class="loading text-gray-500">Content</div>`;
  const testFile = './test-migration-file.tsx';
  const backupFile = `${testFile}.backup`;
  
  await Deno.writeTextFile(testFile, testContent);
  
  try {
    const result = await migrateFile(testFile, { verbose: false });
    
    assertEquals(result.changes.length, 2); // loading and text-gray-500
    
    // Check that file was updated
    const updatedContent = await Deno.readTextFile(testFile);
    assertStringIncludes(updatedContent, "loading loading-spinner");
    assertStringIncludes(updatedContent, "text-slate-500");
    
    // Check that backup was created
    const backupContent = await Deno.readTextFile(backupFile);
    assertEquals(backupContent, testContent);
  } finally {
    // Clean up
    try {
      await Deno.remove(testFile);
      await Deno.remove(backupFile);
    } catch {
      // Ignore cleanup errors
    }
  }
});

Deno.test("migrateFile - should handle dry run mode", async () => {
  const testContent = `<div class="loading text-gray-500">Content</div>`;
  const testFile = './test-migration-dry-run.tsx';
  
  await Deno.writeTextFile(testFile, testContent);
  
  try {
    const result = await migrateFile(testFile, { dryRun: true, skipBackup: true });
    
    assertEquals(result.changes.length, 2);
    
    // Check that file was NOT updated
    const fileContent = await Deno.readTextFile(testFile);
    assertEquals(fileContent, testContent);
  } finally {
    // Clean up
    try {
      await Deno.remove(testFile);
    } catch {
      // Ignore cleanup errors
    }
  }
});

Deno.test("findComponentFiles - should find files with correct extensions", async () => {
  // Create a temporary directory structure
  const testDir = './test-components';
  await Deno.mkdir(testDir, { recursive: true });
  await Deno.mkdir(`${testDir}/subdir`, { recursive: true });
  
  // Create test files
  await Deno.writeTextFile(`${testDir}/Component.tsx`, 'export default function Component() {}');
  await Deno.writeTextFile(`${testDir}/Component.jsx`, 'export default function Component() {}');
  await Deno.writeTextFile(`${testDir}/utils.ts`, 'export const utils = {};');
  await Deno.writeTextFile(`${testDir}/config.json`, '{}');
  await Deno.writeTextFile(`${testDir}/subdir/SubComponent.tsx`, 'export default function SubComponent() {}');
  
  try {
    const files = await findComponentFiles(testDir);
    
    assertEquals(files.length, 4); // Should find .tsx, .jsx, .ts files but not .json
    assertEquals(files.some(f => f.includes('Component.tsx')), true);
    assertEquals(files.some(f => f.includes('Component.jsx')), true);
    assertEquals(files.some(f => f.includes('utils.ts')), true);
    assertEquals(files.some(f => f.includes('SubComponent.tsx')), true);
    assertEquals(files.some(f => f.includes('config.json')), false);
  } finally {
    // Clean up
    try {
      await Deno.remove(testDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  }
});

Deno.test("generateMigrationReport - should create detailed report", () => {
  const results: BatchMigrationResult = {
    totalFiles: 10,
    processedFiles: 8,
    errors: [
      { file: 'error1.tsx', error: 'File not found' },
      { file: 'error2.tsx', error: 'Permission denied' }
    ],
    changes: [
      { file: 'component1.tsx', changes: 5 },
      { file: 'component2.jsx', changes: 3 },
      { file: 'utils.ts', changes: 2 }
    ]
  };
  
  const report = generateMigrationReport(results);
  
  assertStringIncludes(report, '# Migration Report');
  assertStringIncludes(report, 'Total files: 10');
  assertStringIncludes(report, 'Processed files: 8');
  assertStringIncludes(report, 'Files with changes: 3');
  assertStringIncludes(report, 'Errors: 2');
  assertStringIncludes(report, 'Total changes: 10');
  assertStringIncludes(report, 'component1.tsx');
  assertStringIncludes(report, 'error1.tsx');
});