/**
 * Deno-based Site Generator
 * Migrated from Nx Tree API to native Deno file operations
 */

import { copyDirectory, FileSystem, generateDenoConfig } from "../utils/mod.ts";
import { SiteSpecSchema } from "../types/mod.ts";
import type {
  ComponentDefinition,
  Library,
  SiteGeneratorOptions,
  SiteSpec,
  TemplateType,
} from "../types/mod.ts";

/**
 * Generate a site from a JSON specification
 */
export async function generateSite(options: SiteGeneratorOptions): Promise<void> {
  const siteName = options.name;
  const siteSpecPath = FileSystem.join("sites", `${siteName}.json`);

  console.log(`🚀 Generating site from specification: ${siteSpecPath}`);

  // Read and validate the JSON spec
  if (!(await FileSystem.exists(siteSpecPath))) {
    throw new Error(`Site specification file not found: ${siteSpecPath}`);
  }

  const siteSpecContent = await FileSystem.readText(siteSpecPath);
  let siteSpec: SiteSpec;

  try {
    const parsed = JSON.parse(siteSpecContent);
    siteSpec = SiteSpecSchema.parse(parsed);
  } catch (error) {
    throw new Error(`Invalid site specification: ${error}`);
  }

  // Use the site name from the spec
  const actualSiteName = siteSpec.site.name;
  const destinationRoot = FileSystem.join("apps", "generated", actualSiteName);

  console.log(`📁 Creating project: ${actualSiteName}`);

  // Clean up existing generated project
  if (await FileSystem.exists(destinationRoot)) {
    console.log(`🧹 Removing existing project at ${destinationRoot}`);
    await FileSystem.remove(destinationRoot);
  }

  // Determine template to use based on options
  let templateName: TemplateType = siteSpec.template as TemplateType;

  // Only fresh-basic template is supported now
  if (templateName !== "fresh-basic") {
    templateName = "fresh-basic";
    console.log("📋 Using fresh-basic template (only supported template)");
  }

  // Copy the template files
  const templateRoot = FileSystem.join("packages", "templates", templateName);
  if (!(await FileSystem.exists(templateRoot))) {
    throw new Error(`Template not found: ${templateRoot}`);
  }

  console.log(`📋 Copying template files from ${templateName}...`);
  await copyDirectory({
    source: templateRoot,
    destination: destinationRoot,
    exclude: ["_fresh", "node_modules", ".git"],
  });

  // Generate Deno configuration
  console.log("⚙️ Generating deno.json configuration...");
  const denoConfig = generateDenoConfig(actualSiteName, templateName);
  await FileSystem.writeText(
    FileSystem.join(destinationRoot, "deno.json"),
    denoConfig,
  );

  // Generate pages based on specification
  console.log("📄 Generating pages from specification...");
  await generatePages(destinationRoot, siteSpec, templateName);

  // Update README with project information
  await updateReadme(destinationRoot, siteSpec, options);

  console.log(`✅ Site '${actualSiteName}' generated successfully!`);
  console.log(`📍 Location: ${destinationRoot}`);
  console.log(`🚀 Run: cd ${destinationRoot} && deno task start`);
}

/**
 * Generate pages based on site specification
 */
async function generatePages(
  destinationRoot: string,
  siteSpec: SiteSpec,
  templateName: TemplateType,
): Promise<void> {
  for (const page of siteSpec.pages) {
    const pageDir = FileSystem.join(destinationRoot, "routes", page.path);

    // Generate the page content
    const pageContent = generatePageContent(
      page.components,
      siteSpec.libraries || [],
      templateName,
    );

    const pageFile = FileSystem.join(pageDir, "index.tsx");
    await FileSystem.writeText(pageFile, pageContent);

    console.log(`  📄 Generated page: ${page.path}`);
  }
}

/**
 * Generate Fresh page content with components
 */
function generatePageContent(
  components: ComponentDefinition[],
  libraries: Library[],
  templateName: TemplateType,
): string {
  const imports: string[] = [];
  const componentElements: string[] = [];

  // Add Fresh imports
  if (templateName.startsWith("fresh")) {
    imports.push('import { PageProps } from "$fresh/server.ts";');
    imports.push('import { Head } from "$fresh/runtime.ts";');
  }

  for (const component of components) {
    // Resolve which library to import from
    const libraryName = resolveComponentLibrary(
      component.type,
      libraries,
    );

    // Import the component from the resolved library
    imports.push(`import { ${component.type} } from "${libraryName}";`);

    // Create the component element with props
    const props = Object.entries(component.inputs)
      .map(([key, value]) => `${key}={${JSON.stringify(value)}}`)
      .join(" ");

    componentElements.push(`        <${component.type} ${props} />`);
  }

  // Generate Fresh page structure
  return `${imports.join("\n")}

export default function Page(props: PageProps) {
  return (
    <>
      <Head>
        <title>Generated Page</title>
      </Head>
      <div>
${componentElements.join("\n")}
      </div>
    </>
  );
}
`;
}

/**
 * Resolve which library to use for a component
 */
function resolveComponentLibrary(
  _componentType: string,
  libraries: Library[],
): string {
  // Sort by priority (lower number = higher priority)
  const sortedLibraries = libraries
    .filter((lib) => lib.type === "component-library")
    .sort((a, b) => (a.priority || 1) - (b.priority || 1));

  // For now, always use the first library
  // Future: could check which library actually exports the component
  return sortedLibraries[0]?.name || "jsr:@suppers/ui-lib";
}

/**
 * Update README with project information
 */
async function updateReadme(
  destinationRoot: string,
  siteSpec: SiteSpec,
  options: SiteGeneratorOptions,
): Promise<void> {
  const readmePath = FileSystem.join(destinationRoot, "README.md");

  let readmeContent = `# ${siteSpec.site.name}

${siteSpec.site.description || "Generated application with Suppers AI Builder"}

## 🚀 Getting Started

1. **Install Deno** (if not already installed):
   \`\`\`bash
   curl -fsSL https://deno.land/install.sh | sh
   \`\`\`

2. **Start the development server**:
   \`\`\`bash
   deno task start
   \`\`\`

3. **Open your browser** and navigate to \`http://localhost:8000\`

## 📋 Available Tasks

- \`deno task start\` - Start development server
- \`deno task build\` - Build for production
- \`deno task preview\` - Preview production build
- \`deno task check\` - Type check, lint, and format
- \`deno task fmt\` - Format code
- \`deno task lint\` - Lint code

## 🏗️ Project Structure

- \`routes/\` - Fresh routes (file-based routing)
- \`islands/\` - Interactive client-side components
- \`components/\` - Server-side components
- \`static/\` - Static assets
- \`lib/\` - Utility functions

`;

  readmeContent += `

---

Generated with [Suppers AI Builder](https://github.com/suppers/builder) 🚀
`;

  await FileSystem.writeText(readmePath, readmeContent);
}
