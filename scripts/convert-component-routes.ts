#!/usr/bin/env deno run --allow-read --allow-write
/**
 * Automated converter script to extract component route content and generate .examples.md files
 */

import { join, dirname, basename } from "jsr:@std/path@^1.0.8";

interface ComponentExample {
  title: string;
  description: string;
  code: string;
}

interface ApiProp {
  name: string;
  type: string;
  default?: string;
  description: string;
  required?: boolean;
}

interface ExtractedComponentData {
  title: string;
  description: string;
  category: string;
  examples: ComponentExample[];
  apiProps?: ApiProp[];
  usageNotes?: string[];
  accessibilityNotes?: string[];
  relatedComponents?: Array<{ name: string; path: string }>;
}

/**
 * Extract component data from a TSX route file using regex parsing
 */
async function extractComponentData(filePath: string): Promise<ExtractedComponentData | null> {
  try {
    const content = await Deno.readTextFile(filePath);
    
    // Extract component name from file path
    const fileName = basename(filePath, '.tsx');
    const category = filePath.includes('/action/') ? 'Actions' :
                    filePath.includes('/display/') ? 'Display' :
                    filePath.includes('/feedback/') ? 'Feedback' :
                    filePath.includes('/input/') ? 'Input' :
                    filePath.includes('/layout/') ? 'Layout' :
                    filePath.includes('/navigation/') ? 'Navigation' :
                    filePath.includes('/mockup/') ? 'Mockup' : 'Components';
    
    // Extract title from ComponentPageTemplate props
    const titleMatch = content.match(/title="([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : toTitleCase(fileName);
    
    // Extract description
    const descriptionMatch = content.match(/description="([^"]+)"/);
    const description = descriptionMatch ? descriptionMatch[1] : `${title} component for user interfaces`;
    
    // Extract examples array
    const examples = extractExamples(content);
    
    // Extract API props
    const apiProps = extractApiProps(content);
    
    // Extract usage notes
    const usageNotes = extractStringArray(content, 'usageNotes');
    
    // Extract accessibility notes
    const accessibilityNotes = extractStringArray(content, 'accessibilityNotes');
    
    // Extract related components
    const relatedComponents = extractRelatedComponents(content);
    
    return {
      title,
      description,
      category,
      examples,
      apiProps: apiProps.length > 0 ? apiProps : undefined,
      usageNotes: usageNotes.length > 0 ? usageNotes : undefined,
      accessibilityNotes: accessibilityNotes.length > 0 ? accessibilityNotes : undefined,
      relatedComponents: relatedComponents.length > 0 ? relatedComponents : undefined,
    };
    
  } catch (error) {
    console.error(`Failed to extract data from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Extract examples from the content
 */
function extractExamples(content: string): ComponentExample[] {
  const examples: ComponentExample[] = [];
  
  // Find the examples array definition
  const examplesMatch = content.match(/const examples = \[([\s\S]*?)\];/);
  if (!examplesMatch) return examples;
  
  const examplesContent = examplesMatch[1];
  
  // Split by object boundaries (looking for title: pattern)
  const exampleMatches = examplesContent.split(/(?=\s*title:\s*")/);
  
  for (const exampleText of exampleMatches) {
    if (!exampleText.trim()) continue;
    
    // Extract title
    const titleMatch = exampleText.match(/title:\s*"([^"]+)"/);
    if (!titleMatch) continue;
    const title = titleMatch[1];
    
    // Extract description
    const descMatch = exampleText.match(/description:\s*"([^"]+)"/);
    const description = descMatch ? descMatch[1] : '';
    
    // Extract code (between backticks)
    const codeMatch = exampleText.match(/code:\s*`([^`]+)`/) || 
                     exampleText.match(/code:\s*"([^"]+)"/) ||
                     exampleText.match(/code:\s*`([\s\S]*?)`/);
    const code = codeMatch ? codeMatch[1].trim() : '';
    
    if (title && code) {
      examples.push({ title, description, code });
    }
  }
  
  return examples;
}

/**
 * Extract API props from the content
 */
function extractApiProps(content: string): ApiProp[] {
  const apiProps: ApiProp[] = [];
  
  // Find the apiProps array definition
  const apiPropsMatch = content.match(/const apiProps = \[([\s\S]*?)\];/);
  if (!apiPropsMatch) return apiProps;
  
  const apiPropsContent = apiPropsMatch[1];
  
  // Split by object boundaries
  const propMatches = apiPropsContent.split(/(?=\s*name:\s*")/);
  
  for (const propText of propMatches) {
    if (!propText.trim()) continue;
    
    const nameMatch = propText.match(/name:\s*"([^"]+)"/);
    if (!nameMatch) continue;
    
    const typeMatch = propText.match(/type:\s*"([^"]+)"/) || 
                     propText.match(/type:\s*'([^']+)'/) ||
                     propText.match(/type:\s*`([^`]+)`/);
    const descMatch = propText.match(/description:\s*"([^"]+)"/);
    const defaultMatch = propText.match(/default:\s*"([^"]+)"/);
    const requiredMatch = propText.match(/required:\s*(true|false)/);
    
    if (nameMatch && typeMatch) {
      const prop: ApiProp = {
        name: nameMatch[1],
        type: typeMatch[1],
        description: descMatch ? descMatch[1] : '',
      };
      
      if (defaultMatch) prop.default = defaultMatch[1];
      if (requiredMatch) prop.required = requiredMatch[1] === 'true';
      
      apiProps.push(prop);
    }
  }
  
  return apiProps;
}

/**
 * Extract string arrays like usageNotes
 */
function extractStringArray(content: string, arrayName: string): string[] {
  const pattern = new RegExp(`const ${arrayName} = \\[(\\s[\\s\\S]*?)\\];`);
  const match = content.match(pattern);
  if (!match) return [];
  
  const arrayContent = match[1];
  const stringMatches = arrayContent.match(/"([^"]+)"/g) || [];
  
  return stringMatches.map(match => match.slice(1, -1)); // Remove quotes
}

/**
 * Extract related components
 */
function extractRelatedComponents(content: string): Array<{ name: string; path: string }> {
  const relatedComponents: Array<{ name: string; path: string }> = [];
  
  const relatedMatch = content.match(/const relatedComponents = \[([\s\S]*?)\];/);
  if (!relatedMatch) return relatedComponents;
  
  const relatedContent = relatedMatch[1];
  const componentMatches = relatedContent.split(/(?=\s*name:\s*")/);
  
  for (const componentText of componentMatches) {
    const nameMatch = componentText.match(/name:\s*"([^"]+)"/);
    const pathMatch = componentText.match(/path:\s*"([^"]+)"/);
    
    if (nameMatch && pathMatch) {
      relatedComponents.push({
        name: nameMatch[1],
        path: pathMatch[1],
      });
    }
  }
  
  return relatedComponents;
}

/**
 * Convert kebab-case to Title Case
 */
function toTitleCase(kebabCase: string): string {
  return kebabCase
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate markdown content from extracted data
 */
function generateMarkdown(data: ExtractedComponentData): string {
  const frontmatter: any = {
    title: data.title,
    description: data.description,
    category: data.category,
  };
  
  if (data.apiProps) {
    frontmatter.apiProps = data.apiProps;
  }
  
  if (data.usageNotes) {
    frontmatter.usageNotes = data.usageNotes;
  }
  
  if (data.accessibilityNotes) {
    frontmatter.accessibilityNotes = data.accessibilityNotes;
  }
  
  if (data.relatedComponents) {
    frontmatter.relatedComponents = data.relatedComponents;
  }
  
  let markdown = '---\n';
  markdown += generateYAML(frontmatter);
  markdown += '---\n\n';
  
  // Add examples
  for (const example of data.examples) {
    markdown += `## ${example.title}\n\n`;
    if (example.description) {
      markdown += `${example.description}\n\n`;
    }
    markdown += '```tsx\n';
    markdown += example.code + '\n';
    markdown += '```\n\n';
  }
  
  return markdown;
}

/**
 * Generate YAML from object
 */
function generateYAML(obj: any, indent = 0): string {
  const spaces = '  '.repeat(indent);
  let yaml = '';
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    
    yaml += `${spaces}${key}:`;
    
    if (Array.isArray(value)) {
      yaml += '\n';
      for (const item of value) {
        if (typeof item === 'string') {
          yaml += `${spaces}  - "${item}"\n`;
        } else if (typeof item === 'object') {
          yaml += `${spaces}  -`;
          const itemYaml = generateYAML(item, indent + 2);
          if (itemYaml.trim()) {
            yaml += '\n' + itemYaml;
          } else {
            yaml += ' {}\n';
          }
        }
      }
    } else if (typeof value === 'object') {
      yaml += '\n';
      yaml += generateYAML(value, indent + 1);
    } else if (typeof value === 'string') {
      yaml += ` "${value}"\n`;
    } else {
      yaml += ` ${value}\n`;
    }
  }
  
  return yaml;
}

/**
 * Main converter function
 */
async function convertComponentRoutes() {
  console.log('🔄 Starting component route conversion...');
  
  // Find all component route files (assuming script is run from project root or any subdirectory)
  const currentDir = Deno.cwd();
  let projectRoot = currentDir;
  
  // Find project root by looking for packages directory
  while (!await Deno.stat(join(projectRoot, 'packages')).then(() => true).catch(() => false)) {
    const parent = dirname(projectRoot);
    if (parent === projectRoot) break; // We've reached the root
    projectRoot = parent;
  }
  
  const routesDir = join(projectRoot, 'packages/ui-lib-website/routes/components');
  console.log(`🔍 Looking for components in: ${routesDir}`);
  const componentFiles: string[] = [];
  
  // Recursively find all .tsx files
  async function findTsxFiles(dir: string) {
    try {
      for await (const entry of Deno.readDir(dir)) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory) {
          await findTsxFiles(fullPath);
        } else if (entry.name.endsWith('.tsx') && entry.name !== 'index.tsx') {
          componentFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Cannot read directory ${dir}:`, error.message);
    }
  }
  
  await findTsxFiles(routesDir);
  console.log(`📁 Found ${componentFiles.length} component route files`);
  
  let convertedCount = 0;
  let skippedCount = 0;
  
  // Process each component file
  for (const filePath of componentFiles) {
    const relativePath = filePath.replace(projectRoot, '');
    console.log(`📝 Processing: ${relativePath}`);
    
    // Skip button.tsx since it's already converted
    if (filePath.includes('button.tsx')) {
      console.log('   ⏭️  Skipping (already converted)');
      skippedCount++;
      continue;
    }
    
    try {
      const data = await extractComponentData(filePath);
      
      if (!data || data.examples.length === 0) {
        console.log('   ⚠️  No examples found, skipping');
        skippedCount++;
        continue;
      }
      
      // Determine target markdown file path
      const fileName = basename(filePath, '.tsx');
      const category = filePath.includes('/action/') ? 'action' :
                      filePath.includes('/display/') ? 'display' :
                      filePath.includes('/feedback/') ? 'feedback' :
                      filePath.includes('/input/') ? 'input' :
                      filePath.includes('/layout/') ? 'layout' :
                      filePath.includes('/navigation/') ? 'navigation' :
                      filePath.includes('/mockup/') ? 'mockup' : 'other';
      
      const componentName = toTitleCase(fileName);
      const targetDir = join(projectRoot, `packages/ui-lib/components/${category}/${fileName}`);
      const targetFile = join(targetDir, `${componentName}.examples.md`);
      
      // Check if target directory exists
      try {
        await Deno.stat(targetDir);
      } catch {
        console.log(`   ❌ Target directory not found: ${targetDir}`);
        skippedCount++;
        continue;
      }
      
      // Generate markdown content
      const markdown = generateMarkdown(data);
      
      // Write the markdown file
      await Deno.writeTextFile(targetFile, markdown);
      console.log(`   ✅ Generated: ${componentName}.examples.md (${data.examples.length} examples)`);
      convertedCount++;
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      skippedCount++;
    }
  }
  
  console.log('\n🎉 Conversion completed!');
  console.log(`✅ Converted: ${convertedCount} files`);
  console.log(`⏭️  Skipped: ${skippedCount} files`);
  console.log(`📁 Total: ${componentFiles.length} files`);
}

if (import.meta.main) {
  await convertComponentRoutes();
}