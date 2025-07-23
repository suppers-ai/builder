/**
 * Preview generation utilities
 * Uses component metadata for generating previews (no more file parsing!)
 */
import { flatComponentsMetadata } from "@suppers/ui-lib";
import type { ComponentExample, ComponentMetadata } from "@suppers/ui-lib";

export interface PreviewConfig {
  wrapperClass?: string;
  imports?: Record<string, any>;
}

export interface PreviewSpec {
  type: "examples" | "code" | "error";
  wrapperClass?: string;
  examples?: ComponentExample[];
  code?: string;
  error?: string;
}

// Cache for metadata lookups
const metadataCache = new Map<string, ComponentMetadata>();

/**
 * Find component metadata by name
 */
function findComponentMetadata(componentName: string): ComponentMetadata | null {
  const cached = metadataCache.get(componentName);
  if (cached) return cached;

  const metadata = flatComponentsMetadata.find((meta) => meta.name === componentName);
  if (metadata) {
    metadataCache.set(componentName, metadata);
  }
  return metadata || null;
}

/**
 * Generate a preview specification from component metadata
 * Returns examples directly from metadata instead of parsing files
 */
export function generatePreview(
  code: string,
  imports: Record<string, any> = {},
  config: PreviewConfig = {},
): PreviewSpec {
  const { wrapperClass = "flex flex-wrap gap-4" } = config;

  try {
    return {
      type: "code",
      code,
      wrapperClass,
    };
  } catch (error) {
    return {
      type: "error",
      error: `Failed to generate preview: ${error.message}`,
    };
  }
}

/**
 * Create a preview generator function for a specific component
 * Uses metadata examples instead of markdown files
 */
export function createComponentPreviewGenerator(
  componentName: string,
  component: any,
  config: PreviewConfig = {},
) {
  return async (code: string): Promise<PreviewSpec> => {
    const { wrapperClass = "flex flex-wrap gap-4" } = config;

    try {
      const metadata = findComponentMetadata(componentName);

      if (metadata && metadata.examples.length > 0) {
        return {
          type: "examples",
          wrapperClass,
          examples: metadata.examples,
        };
      } else {
        // Fallback to code display if no examples found
        return {
          type: "code",
          code,
          wrapperClass,
        };
      }
    } catch (error) {
      return {
        type: "error",
        error: `Failed to load examples for ${componentName}: ${error.message}`,
      };
    }
  };
}

/**
 * Get examples for a specific component from metadata
 * Public API for accessing component examples
 */
export async function getComponentExamples(componentName: string): Promise<ComponentExample[]> {
  const metadata = findComponentMetadata(componentName);
  return metadata?.examples || [];
}

/**
 * Get preview data for a specific component (legacy compatibility)
 * Maps new ComponentExample format to old PreviewData format
 */
export async function getComponentPreviewData(componentName: string): Promise<any[]> {
  const metadata = findComponentMetadata(componentName);
  if (!metadata || !metadata.examples) return [];

  // Convert ComponentExample[] to legacy preview format for compatibility
  return metadata.examples.map((example) => ({
    title: example.title,
    description: example.description,
    code: example.code,
    showCode: example.showCode,
    interactive: example.interactive,
    type: example.interactive ? "interactive" : "static",
  }));
}

/**
 * Generate preview from metadata (new method)
 */
export async function generatePreviewFromMetadata(
  componentName: string,
  config: PreviewConfig = {},
): Promise<PreviewSpec> {
  const generator = createComponentPreviewGenerator(componentName, null, config);
  return await generator(""); // Empty code since we're using metadata
}

// Legacy compatibility - remove hardcoded paths since we now use metadata
export type { ComponentExample, ComponentMetadata } from "@suppers/ui-lib";
