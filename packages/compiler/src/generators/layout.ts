/**
 * Layout Generator
 * Generates global layout system with header, footer, menu components
 */

import { FileSystem } from "../utils/mod.ts";
import type {
  ApplicationSpec,
  ComponentDefinition,
  GlobalConfig,
  Head,
  HeadMeta,
} from "../types/mod.ts";

/**
 * Generate global layout component
 */
export async function generateGlobalLayout(
  destinationRoot: string,
  spec: ApplicationSpec,
): Promise<void> {
  const globalConfig = spec.data.global;

  if (!globalConfig) {
    console.log("⚠️  No global configuration found, skipping layout generation");
    return;
  }

  console.log("🏗️  Generating global layout...");

  // Generate _layout.tsx file
  const layoutContent = generateLayoutContent(globalConfig, spec);
  const layoutPath = FileSystem.join(destinationRoot, "routes", "_layout.tsx");

  await FileSystem.writeText(layoutPath, layoutContent);
  console.log("  📄 Generated _layout.tsx");
}

/**
 * Generate the layout TSX content
 */
function generateLayoutContent(
  globalConfig: GlobalConfig,
  spec: ApplicationSpec,
): string {
  const imports: string[] = [];
  const components: string[] = [];

  // Add Fresh imports
  imports.push('import { PageProps } from "$fresh/server.ts";');
  imports.push('import { Head } from "$fresh/runtime.ts";');

  // Process header component
  if (globalConfig.header?.component) {
    const headerImport = generateComponentImport(globalConfig.header.component);
    if (headerImport) {
      imports.push(headerImport);
    }
    components.push(generateComponentElement(globalConfig.header.component, "header"));
  }

  // Process menu component
  if (globalConfig.menu?.component) {
    const menuImport = generateComponentImport(globalConfig.menu.component);
    if (menuImport) {
      imports.push(menuImport);
    }
    components.push(generateComponentElement(globalConfig.menu.component, "menu"));
  }

  // Process footer component
  if (globalConfig.footer?.component) {
    const footerImport = generateComponentImport(globalConfig.footer.component);
    if (footerImport) {
      imports.push(footerImport);
    }
    components.push(generateComponentElement(globalConfig.footer.component, "footer"));
  }

  // Generate head metadata
  const headMeta = generateHeadMeta(globalConfig.head);

  // Generate layout structure
  return `${imports.join("\n")}

export default function Layout(props: PageProps) {
  return (
    <>
      <Head>
        ${headMeta}
      </Head>
      <div class="min-h-screen flex flex-col">
        ${components.filter((c) => c.includes("header") || c.includes("menu")).join("\n        ")}
        
        <main class="flex-1">
          <props.Component />
        </main>
        
        ${components.filter((c) => c.includes("footer")).join("\n        ")}
      </div>
    </>
  );
}
`;
}

/**
 * Generate component import statement
 */
function generateComponentImport(component: ComponentDefinition): string | null {
  if (!component.id) return null;

  // Default to ui-lib for now
  const libraryName = "jsr:@suppers/ui-lib";
  return `import { ${component.id} } from "${libraryName}";`;
}

/**
 * Generate component element with props
 */
function generateComponentElement(component: ComponentDefinition, section: string): string {
  const props = component.props
    ? Object.entries(component.props)
      .map(([key, value]) => `${key}={${JSON.stringify(value)}}`)
      .join(" ")
    : "";

  const nestedComponents = component.components
    ? component.components.map((child) => generateComponentElement(child, section)).join(
      "\n          ",
    )
    : "";

  if (nestedComponents) {
    return `<${component.id} ${props}>
          ${nestedComponents}
        </${component.id}>`;
  }

  return `<${component.id} ${props} />`;
}

/**
 * Generate head metadata
 */
function generateHeadMeta(head?: Head): string {
  if (!head?.meta) {
    return "<title>Generated App</title>";
  }

  const meta = head.meta;
  const metaTags: string[] = [];

  if (meta.title) {
    metaTags.push(`<title>${meta.title}</title>`);
  }

  if (meta.description) {
    metaTags.push(`<meta name="description" content="${meta.description}" />`);
  }

  return metaTags.join("\n        ");
}

/**
 * Generate route-specific head overrides
 */
export function generateHeadOverrides(
  routeOverrides?: { head?: Head },
  globalHead?: Head,
): string {
  const overrides = routeOverrides?.head?.meta;
  const global = globalHead?.meta;

  if (!overrides && !global) {
    return "<title>Generated Page</title>";
  }

  const metaTags: string[] = [];

  // Use override title if available, otherwise use global title
  const title = overrides?.title || global?.title || "Generated Page";
  metaTags.push(`<title>${title}</title>`);

  // Use override description if available, otherwise use global description
  const description = overrides?.description || global?.description;
  if (description) {
    metaTags.push(`<meta name="description" content="${description}" />`);
  }

  return metaTags.join("\n        ");
}
