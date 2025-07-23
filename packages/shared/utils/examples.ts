/**
 * Component examples loading utilities
 * Handles loading and processing of component example markdown files
 */

import {
  type ComponentExamplesData,
  type ExampleSection,
  loadComponentExamples,
} from "./markdown.ts";
import { dirname, join } from "jsr:@std/path@^1.0.8";

export interface ProcessedExample {
  title: string;
  description: string;
  code: string;
  preview?: any; // JSX element - will be provided by the consuming component
}

export interface ComponentPageData {
  title: string;
  description: string;
  category: string;
  examples: ProcessedExample[];
  apiProps?: Array<{
    name: string;
    type: string;
    default?: string;
    description: string;
    required?: boolean;
  }>;
  usageNotes?: string[];
}

/**
 * Load component examples from a markdown file relative to a component
 * @param componentPath Path to the component file (e.g., "/path/to/Button.tsx")
 * @returns Processed component page data
 */
export async function loadComponentPageData(componentPath: string): Promise<ComponentPageData> {
  const componentDir = dirname(componentPath);
  const componentName = extractComponentName(componentPath);
  const examplesPath = join(componentDir, `${componentName}.examples.md`);

  try {
    const examplesData = await loadComponentExamples(examplesPath);

    return {
      title: examplesData.title,
      description: examplesData.description,
      category: examplesData.category,
      examples: examplesData.examples.map((example) => ({
        title: example.title,
        description: example.description,
        code: example.code,
        // preview will be added by the consuming component
      })),
      apiProps: examplesData.apiProps,
      usageNotes: examplesData.usageNotes,
    };
  } catch (error) {
    throw new Error(`Failed to load component page data for ${componentName}: ${error.message}`);
  }
}

/**
 * Check if a component has an examples markdown file
 * @param componentPath Path to the component file
 * @returns True if examples file exists
 */
export async function hasComponentExamples(componentPath: string): Promise<boolean> {
  const componentDir = dirname(componentPath);
  const componentName = extractComponentName(componentPath);
  const examplesPath = join(componentDir, `${componentName}.examples.md`);

  try {
    await Deno.stat(examplesPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the path to a component's examples markdown file
 * @param componentPath Path to the component file
 * @returns Path to the examples markdown file
 */
export function getComponentExamplesPath(componentPath: string): string {
  const componentDir = dirname(componentPath);
  const componentName = extractComponentName(componentPath);
  return join(componentDir, `${componentName}.examples.md`);
}

/**
 * Extract component name from file path
 * @param filePath Path like "/path/to/Button.tsx" or "/path/to/Button.metadata.tsx"
 * @returns Component name like "Button"
 */
function extractComponentName(filePath: string): string {
  const basename = filePath.split("/").pop() || "";
  const nameWithoutExt = basename.split(".")[0];
  return nameWithoutExt;
}

/**
 * Cache for loaded component examples to avoid repeated file reads
 */
const examplesCache = new Map<string, ComponentPageData>();

/**
 * Load component examples with caching
 * @param componentPath Path to the component file
 * @param useCache Whether to use the cache (default: true)
 * @returns Cached or freshly loaded component page data
 */
export async function loadComponentPageDataCached(
  componentPath: string,
  useCache = true,
): Promise<ComponentPageData> {
  const cacheKey = componentPath;

  if (useCache && examplesCache.has(cacheKey)) {
    return examplesCache.get(cacheKey)!;
  }

  const data = await loadComponentPageData(componentPath);
  examplesCache.set(cacheKey, data);

  return data;
}

/**
 * Clear the examples cache (useful in development)
 */
export function clearExamplesCache(): void {
  examplesCache.clear();
}
