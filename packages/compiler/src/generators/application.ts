/**
 * Application Generator
 * Main generator for new ApplicationSpec format
 */

import { copyDirectory, FileSystem, generateDenoConfig } from "../utils/mod.ts";
import { substituteVariables, validateVariableReferences } from "../utils/variables.ts";
import { generateGlobalLayout } from "./layout.ts";
import { generateComponentRegistry } from "./components.ts";
import { generateDataServices } from "./data.ts";
import { generateAuthSystem, generateLoginPage } from "./auth.ts";
import { generateApiRoutes, generateRoutes } from "./routes.ts";
import { ApplicationSpecSchema } from "../types/mod.ts";
import type { ApplicationSpec, SiteGeneratorOptions } from "../types/mod.ts";

/**
 * Generate application from new ApplicationSpec format
 */
export async function generateApplication(options: SiteGeneratorOptions): Promise<void> {
  const appName = options.name;
  const specPath = FileSystem.join("sites", `${appName}.json`);

  console.log(`🚀 Generating application from specification: ${specPath}`);

  // Read and validate the JSON spec
  if (!(await FileSystem.exists(specPath))) {
    throw new Error(`Application specification file not found: ${specPath}`);
  }

  const specContent = await FileSystem.readText(specPath);
  let spec: ApplicationSpec;

  try {
    const parsed = JSON.parse(specContent);
    spec = ApplicationSpecSchema.parse(parsed);
  } catch (error) {
    throw new Error(`Invalid application specification: ${error}`);
  }

  // Validate variable references
  const variableValidation = validateVariableReferences(spec.data, spec.variables || {});
  if (!variableValidation.valid) {
    console.warn("⚠️  Missing variables:", variableValidation.missingVariables.join(", "));
  }

  // Use the application name from the spec
  const actualAppName = spec.application.name;
  const destinationRoot = FileSystem.join("apps", "generated", actualAppName);

  console.log(`📁 Creating application: ${actualAppName}`);

  // Clean up existing generated application
  if (await FileSystem.exists(destinationRoot)) {
    console.log(`🧹 Removing existing application at ${destinationRoot}`);
    await FileSystem.remove(destinationRoot);
  }

  // Copy the template files
  const templateName = "fresh-basic"; // Default template for now
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
  const denoConfig = generateDenoConfig(actualAppName, templateName);
  await FileSystem.writeText(
    FileSystem.join(destinationRoot, "deno.json"),
    denoConfig,
  );

  // Generate services
  await generateDataServices(destinationRoot, spec);

  // Generate global layout
  await generateGlobalLayout(destinationRoot, spec);

  // Generate authentication system
  await generateAuthSystem(destinationRoot, spec);
  await generateLoginPage(destinationRoot);

  // Generate routes
  await generateRoutes(destinationRoot, spec);
  await generateApiRoutes(destinationRoot, spec);

  // Update README with application information
  await updateReadme(destinationRoot, spec);

  console.log(`✅ Application '${actualAppName}' generated successfully!`);
  console.log(`📍 Location: ${destinationRoot}`);
  console.log(`🚀 Run: cd ${destinationRoot} && deno task start`);
}

/**
 * Update README with application information
 */
async function updateReadme(
  destinationRoot: string,
  spec: ApplicationSpec,
): Promise<void> {
  const readmePath = FileSystem.join(destinationRoot, "README.md");
  const app = spec.application;

  let readmeContent = `# ${app.name}

${app.description || "Generated application with Suppers AI Builder"}

**Version:** ${app.version}  
**ID:** ${app.id}

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
- \`services/\` - Data services and API integrations
- \`lib/\` - Utility functions and authentication
- \`static/\` - Static assets

## 🔧 Configuration

### Variables
The following variables are configured for this application:
`;

  if (spec.variables) {
    for (const [key, value] of Object.entries(spec.variables)) {
      readmeContent += `- \`${key}\`: ${value}\n`;
    }
  } else {
    readmeContent += "- No variables configured\n";
  }

  readmeContent += `
### Routes
The application includes the following routes:
`;

  for (const route of spec.data.routes) {
    const permissions = route.permissions ? ` (requires: ${route.permissions.join(", ")})` : "";
    const source = route.source ? ` (static: ${route.source})` : "";
    readmeContent += `- \`${route.path}\`${permissions}${source}\n`;
  }

  readmeContent += `
### Features
- 🎨 **Modern UI**: Built with TailwindCSS and daisyUI
- 🔐 **Authentication**: Supabase Auth integration
- 📱 **Responsive Design**: Mobile-first approach
- 🚀 **Server-Side Rendering**: Fresh framework with islands architecture
- 🔒 **Route Protection**: Permission-based access control
- 📊 **Data Integration**: API services and external data sources

## 🔧 Development

### Adding New Components
Components are imported from the UI library. To add custom components:

1. Create your component in the \`components/\` directory
2. Update the component registry in the specification
3. Regenerate the application

### Authentication
The application includes authentication middleware for protected routes. Users need appropriate permissions to access protected pages.

### Data Services
Data services are automatically generated based on component data configurations. Services handle API calls and data fetching.

---

Generated with [Suppers AI Builder](https://github.com/suppers/builder) 🚀
`;

  await FileSystem.writeText(readmePath, readmeContent);
}
