/**
 * Component Resolution System
 * Enhanced component system with nested components, custom HTML, and external sources
 */

import { FileSystem } from "../utils/mod.ts";
import { substituteVariables } from "../utils/variables.ts";
import type { ComponentDefinition, Variables } from "../types/mod.ts";

/**
 * Component registry for tracking available components
 */
export interface ComponentRegistry {
  [componentId: string]: {
    source: string;
    type: "ui-lib" | "custom" | "html";
    imports?: string[];
  };
}

/**
 * Default component registry
 */
const DEFAULT_REGISTRY: ComponentRegistry = {
  "Hero": { source: "jsr:@suppers/ui-lib", type: "ui-lib" },
  "Button": { source: "jsr:@suppers/ui-lib", type: "ui-lib" },
  "BlogPostList": { source: "jsr:@suppers/ui-lib", type: "ui-lib" },
  "PostEditor": { source: "jsr:@suppers/ui-lib", type: "ui-lib" },
  "Header": { source: "jsr:@suppers/ui-lib", type: "ui-lib" },
  "Footer": { source: "jsr:@suppers/ui-lib", type: "ui-lib" },
  "Menu": { source: "jsr:@suppers/ui-lib", type: "ui-lib" },
  "HomePage": { source: "jsr:@suppers/ui-lib", type: "ui-lib" },
  "CustomHtml": { source: "built-in", type: "html" },
};

/**
 * Generate component imports for a list of components
 */
export function generateComponentImports(
  components: ComponentDefinition[],
  registry: ComponentRegistry = DEFAULT_REGISTRY,
): string[] {
  const imports = new Map<string, Set<string>>();

  function collectImports(comps: ComponentDefinition[]): void {
    for (const component of comps) {
      const registryEntry = registry[component.id];

      if (registryEntry && registryEntry.type === "ui-lib") {
        const source = registryEntry.source;
        if (!imports.has(source)) {
          imports.set(source, new Set());
        }
        imports.get(source)!.add(component.id);
      }

      // Recursively collect imports from nested components
      if (component.components) {
        collectImports(component.components);
      }
    }
  }

  collectImports(components);

  // Generate import statements
  const importStatements: string[] = [];
  for (const [source, componentNames] of imports) {
    const components = Array.from(componentNames).sort();
    importStatements.push(`import { ${components.join(", ")} } from "${source}";`);
  }

  return importStatements;
}

/**
 * Generate component elements with proper nesting
 */
export function generateComponentElements(
  components: ComponentDefinition[],
  variables: Variables = {},
  registry: ComponentRegistry = DEFAULT_REGISTRY,
  indentLevel = 0,
): string[] {
  const elements: string[] = [];
  const indent = "  ".repeat(indentLevel);

  for (const component of components) {
    const registryEntry = registry[component.id];

    if (registryEntry?.type === "html") {
      // Handle custom HTML components
      elements.push(generateCustomHtmlComponent(component, variables, indent));
    } else {
      // Handle regular components
      elements.push(generateRegularComponent(component, variables, registry, indent));
    }
  }

  return elements;
}

/**
 * Generate a custom HTML component
 */
function generateCustomHtmlComponent(
  component: ComponentDefinition,
  variables: Variables,
  indent: string,
): string {
  if (component.id === "CustomHtml" && component.props?.html) {
    const htmlContent = substituteVariables(component.props.html, variables);
    return `${indent}<div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(htmlContent)} }} />`;
  }

  return `${indent}<!-- Unknown custom HTML component: ${component.id} -->`;
}

/**
 * Generate a regular component element
 */
function generateRegularComponent(
  component: ComponentDefinition,
  variables: Variables,
  registry: ComponentRegistry,
  indent: string,
): string {
  // Substitute variables in props
  const processedProps = component.props ? substituteVariables(component.props, variables) : {};

  // Generate props string
  const propsString = Object.entries(processedProps)
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `${key}="${value}"`;
      } else {
        return `${key}={${JSON.stringify(value)}}`;
      }
    })
    .join(" ");

  // Handle nested components
  if (component.components && component.components.length > 0) {
    const nestedElements = generateComponentElements(
      component.components,
      variables,
      registry,
      indent.length / 2 + 1,
    );

    return `${indent}<${component.id}${propsString ? " " + propsString : ""}>
${nestedElements.join("\n")}
${indent}</${component.id}>`;
  } else {
    return `${indent}<${component.id}${propsString ? " " + propsString : ""} />`;
  }
}

/**
 * Validate component existence in registry
 */
export function validateComponents(
  components: ComponentDefinition[],
  registry: ComponentRegistry = DEFAULT_REGISTRY,
): { valid: boolean; missingComponents: string[] } {
  const missing = new Set<string>();

  function validate(comps: ComponentDefinition[]): void {
    for (const component of comps) {
      if (!registry[component.id]) {
        missing.add(component.id);
      }

      if (component.components) {
        validate(component.components);
      }
    }
  }

  validate(components);

  return {
    valid: missing.size === 0,
    missingComponents: Array.from(missing),
  };
}

/**
 * Generate component registry from ui-lib
 */
export async function generateComponentRegistry(
  uiLibPath: string,
): Promise<ComponentRegistry> {
  const registry: ComponentRegistry = { ...DEFAULT_REGISTRY };

  // Check if ui-lib components directory exists
  const componentsPath = FileSystem.join(uiLibPath, "src", "components");

  if (await FileSystem.exists(componentsPath)) {
    // Discover components from ui-lib structure
    const categories = await FileSystem.listDir(componentsPath);

    for (const category of categories) {
      const categoryPath = FileSystem.join(componentsPath, category);

      if (await FileSystem.isDirectory(categoryPath)) {
        const componentFiles = await FileSystem.listDir(categoryPath);

        for (const file of componentFiles) {
          if (file.endsWith(".tsx") || file.endsWith(".ts")) {
            const componentName = file.replace(/\.(tsx|ts)$/, "");

            // Skip index files
            if (componentName !== "index") {
              registry[componentName] = {
                source: "jsr:@suppers/ui-lib",
                type: "ui-lib",
              };
            }
          }
        }
      }
    }
  }

  return registry;
}

/**
 * Create component page content with proper structure
 */
export function generatePageWithComponents(
  components: ComponentDefinition[],
  variables: Variables = {},
  registry: ComponentRegistry = DEFAULT_REGISTRY,
): string {
  const imports = generateComponentImports(components, registry);
  const elements = generateComponentElements(components, variables, registry, 2);

  // Add Fresh imports
  const freshImports = [
    'import { PageProps } from "$fresh/server.ts";',
    'import { Head } from "$fresh/runtime.ts";',
  ];

  return `${[...freshImports, ...imports].join("\n")}

export default function Page(props: PageProps) {
  return (
    <>
      <div class="container mx-auto px-4 py-8">
${elements.join("\n")}
      </div>
    </>
  );
}
`;
}

/**
 * Generate service imports for data-enabled components
 */
export function generateServiceImports(
  components: ComponentDefinition[],
): string[] {
  const serviceImports: string[] = [];

  function collectServiceImports(comps: ComponentDefinition[]): void {
    for (const component of comps) {
      // Check if component has data configuration
      if (component.props?.data) {
        serviceImports.push('import { dataService } from "../services/data.ts";');
        break; // Only need to import once
      }

      if (component.components) {
        collectServiceImports(component.components);
      }
    }
  }

  collectServiceImports(components);

  return serviceImports;
}
