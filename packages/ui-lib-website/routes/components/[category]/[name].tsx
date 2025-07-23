/**
 * Dynamic component route handler
 * Handles URLs like /components/action/button, /components/display/card, etc.
 * Uses metadata-driven approach for automatic component discovery
 */

import type { PageProps } from "fresh";
import { createComponentRoute } from "../../../shared/lib/component-route-generator.tsx";
import { flatComponentsMetadata, ComponentMetadata } from "@suppers/ui-lib";

/**
 * Convert URL-friendly component name to PascalCase component name
 * Examples: "button" -> "Button", "theme-controller" -> "ThemeController"
 */
function urlToComponentName(urlName: string): string {
  return urlName
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/**
 * Find component metadata by category and URL name
 */
function findComponentMetadata(category: string, name: string): ComponentMetadata | null {
  const expectedPath = `/components/${category}/${name}`;
  return flatComponentsMetadata.find(meta => meta.path === expectedPath) || null;
}

/**
 * Dynamically import component from UI library based on component name and metadata
 */
async function dynamicComponentImport(componentName: string, metadata: ComponentMetadata): Promise<{ Static: any; Interactive?: any }> {
  try {
    const module = await import("@suppers/ui-lib");
    const component = (module as any)[componentName];
    
    if (!component) {
      throw new Error(`Component ${componentName} not found in @suppers/ui-lib`);
    }
    
    return {
      Static: component,
      Interactive: metadata.interactive ? component : undefined,
    };
  } catch (error) {
    console.error(`Failed to import component ${componentName}:`, error);
    throw error;
  }
}

export default async function DynamicComponentPage(props: PageProps) {
  const { category, name } = props.params;
  
  try {
    // Find component metadata to validate it exists
    const metadata = findComponentMetadata(category, name);
    
    if (!metadata) {
      // Return 404 for non-existent components
      return (
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-4xl font-bold mb-4">Component Not Found</h1>
          <p class="text-lg text-gray-600 mb-8">
            The component "{name}" in category "{category}" was not found.
          </p>
          <a href="/components" class="btn btn-primary">
            Back to Components
          </a>
        </div>
      );
    }
    
    // Convert URL name to component name and dynamically import
    const componentName = urlToComponentName(name);
    const components = await dynamicComponentImport(componentName, metadata);
    
    // Create the component route using the existing generator
    const ComponentRoute = createComponentRoute({
      componentName: metadata.name, // Use name from metadata for consistency
      category,
      StaticComponent: components.Static,
      InteractiveComponent: components.Interactive,
    });
    
    // Render the component page
    return ComponentRoute(props);
  } catch (error) {
    console.error(`Error loading component ${category}/${name}:`, error);
    
    // Return error page for import failures
    return (
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold mb-4">Component Load Error</h1>
        <p class="text-lg text-gray-600 mb-8">
          Failed to load the component "{name}" in category "{category}".
        </p>
        <p class="text-sm text-gray-500 mb-8">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <a href="/components" class="btn btn-primary">
          Back to Components
        </a>
      </div>
    );
  }
}