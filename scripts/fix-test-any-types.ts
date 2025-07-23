#!/usr/bin/env deno run --allow-read --allow-write
/**
 * Fix 'as any' type assertions in test files
 */

import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";

async function fixTestAnyTypes() {
  console.log("🔧 Fixing 'as any' type assertions in test files...");

  const currentDir = Deno.cwd();
  let projectRoot = currentDir;

  // Find project root
  while (!await Deno.stat(projectRoot + "/packages").then(() => true).catch(() => false)) {
    const parent = projectRoot.split("/").slice(0, -1).join("/");
    if (parent === projectRoot) break;
    projectRoot = parent;
  }

  const uiLibDir = projectRoot + "/packages/ui-lib/components";
  let fixedCount = 0;

  // Walk through all test files
  for await (const entry of walk(uiLibDir, {
    includeDirs: false,
    match: [/\.test\.ts$/],
  })) {
    const filePath = entry.path;
    let content = await Deno.readTextFile(filePath);
    let modified = false;

    // Replace common 'as any' patterns with proper types
    const replacements = [
      // Component props
      { from: /size: size as any,/g, to: "size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl'," },
      { from: /color: color as any,/g, to: "color: color as 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error'," },
      { from: /variant: variant as any,/g, to: "variant: variant as string," },
      { from: /position: position as any,/g, to: "position: position as string," },
      { from: /type: type as any,/g, to: "type: type as 'info' | 'success' | 'warning' | 'error'," },
      { from: /language: language as any,/g, to: "language: language as 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'json' | 'bash' | 'sql'," },
      { from: /background: background as any,/g, to: "background: background as string," },
      { from: /align: align as any,/g, to: "align: align as string," },
      { from: /gap: gap as any,/g, to: "gap: gap as string," },
      { from: /justify: justify as any,/g, to: "justify: justify as string," },
      
      // Component objects
      { from: /\) as any\);/g, to: ") as ComponentProps);" },
    ];

    for (const replacement of replacements) {
      if (replacement.from.test(content)) {
        content = content.replace(replacement.from, replacement.to);
        modified = true;
      }
    }

    if (modified) {
      await Deno.writeTextFile(filePath, content);
      console.log(`✅ Fixed: ${filePath.replace(projectRoot, "")}`);
      fixedCount++;
    }
  }

  console.log(`\n🎉 Fixed ${fixedCount} test files!`);
}

if (import.meta.main) {
  await fixTestAnyTypes();
} 