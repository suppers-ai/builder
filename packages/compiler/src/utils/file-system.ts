import { basename, dirname, join } from "@std/path/mod.ts";
import { copy, ensureDir } from "@std/fs/mod.ts";
import type { DirectoryCopyOptions } from "../types/mod.ts";

/**
 * File System utilities using Deno APIs
 * Replaces Nx Tree API with native Deno file operations
 */
export class FileSystem {
    /**
     * Check if a file or directory exists
     */
    static async exists(path: string): Promise<boolean> {
      try {
        await Deno.stat(path);
        return true;
      } catch {
        return false;
      }
    }
  
    /**
     * Read a file as text
     */
    static async readText(path: string): Promise<string> {
      try {
        return await Deno.readTextFile(path);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Could not read file ${path}: ${errorMessage}`);
      }
    }
  
    /**
     * Read a file as bytes
     */
    static async readBytes(path: string): Promise<Uint8Array> {
      try {
        return await Deno.readFile(path);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Could not read file ${path}: ${errorMessage}`);
      }
    }
  
    /**
     * Write text to a file
     */
    static async writeText(path: string, content: string): Promise<void> {
      await ensureDir(dirname(path));
      await Deno.writeTextFile(path, content);
    }
  
    /**
     * Write bytes to a file
     */
    static async writeBytes(path: string, content: Uint8Array): Promise<void> {
      await ensureDir(dirname(path));
      await Deno.writeFile(path, content);
    }
  
    /**
     * Remove a file or directory
     */
    static async remove(path: string): Promise<void> {
      try {
        const stat = await Deno.stat(path);
        if (stat.isDirectory) {
          await Deno.remove(path, { recursive: true });
        } else {
          await Deno.remove(path);
        }
      } catch {
        // Ignore if doesn't exist
      }
    }
  
    /**
     * List files and directories in a directory
     */
    static async listDir(path: string): Promise<string[]> {
      const entries = [];
      try {
        for await (const entry of Deno.readDir(path)) {
          entries.push(entry.name);
        }
      } catch {
        // Return empty array if directory doesn't exist
      }
      return entries;
    }
  
    /**
     * Check if path is a file
     */
    static async isFile(path: string): Promise<boolean> {
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
    static async isDirectory(path: string): Promise<boolean> {
      try {
        const stat = await Deno.stat(path);
        return stat.isDirectory;
      } catch {
        return false;
      }
    }
  
    /**
     * Copy a file or directory recursively
     */
    static async copy(
      source: string,
      destination: string,
      options?: {
        exclude?: string[];
      },
    ): Promise<void> {
      const exclude = options?.exclude || [];
  
      if (exclude.some((pattern) => source.includes(pattern))) {
        return;
      }
  
      if (await this.isFile(source)) {
        await ensureDir(dirname(destination));
        await copy(source, destination);
      } else if (await this.isDirectory(source)) {
        await ensureDir(destination);
  
        for await (const entry of Deno.readDir(source)) {
          if (exclude.includes(entry.name)) {
            continue;
          }
  
          const sourcePath = join(source, entry.name);
          const destPath = join(destination, entry.name);
  
          await this.copy(sourcePath, destPath, options);
        }
      }
    }
  
    /**
     * Join path segments (cross-platform)
     */
    static join(...paths: string[]): string {
      return join(...paths);
    }
  
    /**
     * Get directory name of a path
     */
    static dirname(path: string): string {
      return dirname(path);
    }
  
    /**
     * Get base name of a path
     */
    static basename(path: string): string {
      return basename(path);
    }
  
    /**
     * Ensure directory exists (create if needed)
     */
    static async ensureDir(path: string): Promise<void> {
      await ensureDir(path);
    }
  }
  
  /**
   * Utility to copy directory with exclusions
   */
  export async function copyDirectory(
    options: DirectoryCopyOptions,
  ): Promise<void> {
    await FileSystem.copy(options.source, options.destination, {
      exclude: options.exclude || [".next", "node_modules", "dist", ".git"],
    });
  }
  
  /**
   * Utility to format file paths consistently
   */
  export function formatPath(...segments: string[]): string {
    return join(...segments);
  }