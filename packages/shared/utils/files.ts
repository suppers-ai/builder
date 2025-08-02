/**
 * File and Path Utilities
 * Common utilities for file operations and path handling
 */

import { basename, dirname, extname, join } from "jsr:@std/path";

/**
 * Format file path by joining segments
 */
export function formatPath(...segments: string[]): string {
  return join(...segments);
}

/**
 * Ensure directory exists (create if it doesn't)
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await Deno.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Ignore error if directory already exists
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }
}

/**
 * Check if file or directory exists
 */
export async function pathExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }
    throw error;
  }
}

/**
 * Copy file from source to destination
 */
export async function copyFile(source: string, destination: string): Promise<void> {
  await ensureDir(dirname(destination));
  await Deno.copyFile(source, destination);
}

/**
 * Write file with automatic directory creation
 */
export async function writeFile(
  filePath: string,
  content: string | Uint8Array,
): Promise<void> {
  await ensureDir(dirname(filePath));

  if (typeof content === "string") {
    await Deno.writeTextFile(filePath, content);
  } else {
    await Deno.writeFile(filePath, content);
  }
}

/**
 * Read file as text
 */
export async function readTextFile(filePath: string): Promise<string> {
  return await Deno.readTextFile(filePath);
}

/**
 * Read file as bytes
 */
export async function readFile(filePath: string): Promise<Uint8Array> {
  return await Deno.readFile(filePath);
}

/**
 * Get file extension
 */
export function getFileExtension(filePath: string): string {
  return extname(filePath);
}

/**
 * Get file name without extension
 */
export function getFileName(filePath: string): string {
  const name = basename(filePath);
  const ext = extname(name);
  return ext ? name.slice(0, -ext.length) : name;
}

/**
 * Get file name with extension
 */
export function getFileNameWithExtension(filePath: string): string {
  return basename(filePath);
}

/**
 * Get directory path
 */
export function getDirName(filePath: string): string {
  return dirname(filePath);
}

/**
 * Check if path is a file
 */
export async function isFile(path: string): Promise<boolean> {
  try {
    const stat = await Deno.stat(path);
    return stat.isFile;
  } catch {
    return false;
  }
}

/**
 * Check if path is a directory
 */
export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stat = await Deno.stat(path);
    return stat.isDirectory;
  } catch {
    return false;
  }
}

/**
 * List files in directory
 */
export async function listFiles(dirPath: string): Promise<string[]> {
  const files: string[] = [];

  try {
    for await (const entry of Deno.readDir(dirPath)) {
      if (entry.isFile) {
        files.push(entry.name);
      }
    }
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }

  return files.sort();
}

/**
 * List directories in directory
 */
export async function listDirectories(dirPath: string): Promise<string[]> {
  const dirs: string[] = [];

  try {
    for await (const entry of Deno.readDir(dirPath)) {
      if (entry.isDirectory) {
        dirs.push(entry.name);
      }
    }
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }

  return dirs.sort();
}

/**
 * Remove file or directory recursively
 */
export async function remove(path: string): Promise<void> {
  try {
    await Deno.remove(path, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }
}

/**
 * Copy directory recursively
 */
export async function copyDir(source: string, destination: string): Promise<void> {
  await ensureDir(destination);

  for await (const entry of Deno.readDir(source)) {
    const sourcePath = join(source, entry.name);
    const destPath = join(destination, entry.name);

    if (entry.isDirectory) {
      await copyDir(sourcePath, destPath);
    } else {
      await copyFile(sourcePath, destPath);
    }
  }
}

/**
 * Get file size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  const stat = await Deno.stat(filePath);
  return stat.size;
}

/**
 * Get file modification time
 */
export async function getModificationTime(filePath: string): Promise<Date | null> {
  try {
    const stat = await Deno.stat(filePath);
    return stat.mtime;
  } catch {
    return null;
  }
}

/**
 * Create temporary file
 */
export async function createTempFile(prefix?: string, suffix?: string): Promise<string> {
  const tempDir = await Deno.makeTempDir();
  const fileName = `${prefix || "temp"}_${Date.now()}${suffix || ".tmp"}`;
  return join(tempDir, fileName);
}

/**
 * Normalize file path for cross-platform compatibility
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

/**
 * Check if file has specific extension
 */
export function hasExtension(filePath: string, extensions: string | string[]): boolean {
  const ext = getFileExtension(filePath).toLowerCase();
  const extsToCheck = Array.isArray(extensions) ? extensions : [extensions];
  return extsToCheck.some((e) => ext === e.toLowerCase());
}

/**
 * Generate package.json content
 */
export function generatePackageJson(name: string, template: string): string {
  const packageJson = {
    name: `@suppers/generated-${name}`,
    version: "1.0.0",
    description: `Generated application: ${name}`,
    type: "module",
    scripts: {
      dev: "deno task dev",
      build: "deno task build",
      start: "deno task start",
    },
    dependencies: {},
    devDependencies: {},
    keywords: ["suppers", "generated", template],
  };

  return JSON.stringify(packageJson, null, 2);
}

/**
 * Generate deno.json configuration
 */
export function generateDenoConfig(name: string, template: string): string {
  const baseConfig: {
    name: string;
    version: string;
    exports: string;
    tasks: Record<string, string>;
    imports: Record<string, string>;
    compilerOptions: Record<string, any>;
  } = {
    name: `@suppers/generated-${name}`,
    version: "1.0.0",
    exports: "./main.ts",
    tasks: {
      dev: "deno run -A --watch=static/,routes/ dev.ts",
      build: "deno run -A dev.ts build",
      start: "deno run -A main.ts",
      test: "deno test -A",
      lint: "deno lint",
      fmt: "deno fmt",
    },
    imports: {
      "preact": "https://esm.sh/preact@10.26.9",
      "preact/": "https://esm.sh/preact@10.26.9/",
      "preact/hooks": "https://esm.sh/preact@10.26.9/hooks",
      "@std/": "jsr:@std/",
      "suppers/ui-lib": "../../packages/ui-lib/mod.ts",
    },
    compilerOptions: {
      strict: true,
      allowJs: true,
      jsx: "react-jsx",
      jsxImportSource: "preact",
    },
  };

  // Template-specific configurations
  if (template === "fresh-basic") {
    baseConfig.imports["$fresh/"] = "https://deno.land/x/fresh@1.6.8/";
    baseConfig.tasks.dev = "deno run -A --watch=static/,routes/ dev.ts";
    baseConfig.tasks.build = "deno run -A dev.ts build";
    baseConfig.tasks.preview = "deno run -A main.ts";
  }

  return JSON.stringify(baseConfig, null, 2);
}
