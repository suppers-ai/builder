/**
 * Template engine for processing placeholder variables in template files
 */

export interface TemplateContext {
  [key: string]: unknown;
}

export interface TemplateOptions {
  /** Whether to throw an error for undefined variables (default: false) */
  strict?: boolean;
  /** Custom placeholder pattern (default: {{variable}}) */
  pattern?: RegExp;
  /** Conditional inclusion flags */
  conditionals?: Record<string, boolean>;
}

/**
 * Default placeholder pattern: {{variable}} or {{object.property}}
 */
const DEFAULT_PATTERN = /\{\{([^}]+)\}\}/g;

/**
 * Conditional inclusion pattern: {{#if condition}}...{{/if}}
 */
const CONDITIONAL_PATTERN = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

/**
 * Process template string by replacing placeholders with values from context
 */
export function processTemplate(
  template: string,
  context: TemplateContext,
  options: TemplateOptions = {}
): string {
  const { strict = false, pattern = DEFAULT_PATTERN, conditionals = {} } = options;
  
  let result = template;
  
  // First, process conditional blocks
  result = processConditionals(result, conditionals);
  
  // Then process variable placeholders
  result = result.replace(pattern, (match, variable) => {
    const value = getNestedValue(context, variable.trim());
    
    if (value === undefined) {
      if (strict) {
        throw new Error(`Undefined template variable: ${variable}`);
      }
      return match; // Keep original placeholder if not strict
    }
    
    return String(value);
  });
  
  return result;
}

/**
 * Process conditional inclusion blocks
 */
function processConditionals(
  template: string,
  conditionals: Record<string, boolean>
): string {
  return template.replace(CONDITIONAL_PATTERN, (match, condition, content) => {
    const conditionName = condition.trim();
    const shouldInclude = conditionals[conditionName] ?? false;
    
    return shouldInclude ? content : '';
  });
}

/**
 * Get nested property value from object using dot notation
 */
function getNestedValue(obj: TemplateContext, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}

/**
 * Validate template string for syntax errors
 */
export function validateTemplate(template: string): string[] {
  const errors: string[] = [];
  
  // Check for malformed placeholders by looking for single braces
  // Remove all valid double braces first, then check for remaining single braces
  let tempTemplate = template;
  tempTemplate = tempTemplate.replace(/\{\{[^}]*\}\}/g, ''); // Remove valid placeholders
  const singleBraces = tempTemplate.match(/[{}]/g);
  if (singleBraces && singleBraces.length > 0) {
    errors.push(`Malformed placeholders found: unmatched braces`);
  }
  
  // Check for unmatched conditional blocks
  const openIfs = (template.match(/\{\{#if\s+[^}]+\}\}/g) || []).length;
  const closeIfs = (template.match(/\{\{\/if\}\}/g) || []).length;
  if (openIfs !== closeIfs) {
    errors.push(`Unmatched conditional blocks: ${openIfs} opening, ${closeIfs} closing`);
  }
  
  return errors;
}

/**
 * Extract all placeholder variables from a template
 */
export function extractVariables(template: string): string[] {
  const variables = new Set<string>();
  
  // Extract regular variables
  const matches = template.matchAll(DEFAULT_PATTERN);
  for (const match of matches) {
    if (match[1]) {
      const variable = match[1].trim();
      // Skip conditional syntax
      if (!variable.startsWith('#if') && !variable.startsWith('/if')) {
        variables.add(variable);
      }
    }
  }
  
  // Extract conditional variables
  const conditionalMatches = template.matchAll(CONDITIONAL_PATTERN);
  for (const match of conditionalMatches) {
    if (match[1]) {
      variables.add(`#${match[1].trim()}`);
    }
  }
  
  return Array.from(variables);
}

/**
 * File processing utilities
 */
export interface FileProcessingOptions extends TemplateOptions {
  /** File extensions to process (default: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md']) */
  extensions?: string[];
  /** Whether to process binary files (default: false) */
  processBinary?: boolean;
}

/**
 * Check if a file should be processed based on its extension
 */
export function shouldProcessFile(
  filePath: string,
  options: FileProcessingOptions = {}
): boolean {
  const { 
    extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html', '.css'],
    processBinary = false 
  } = options;
  
  if (processBinary) {
    return true;
  }
  
  const ext = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
  return extensions.includes(ext);
}

/**
 * Process a file's content with template replacement
 */
export async function processFile(
  filePath: string,
  context: TemplateContext,
  options: FileProcessingOptions = {}
): Promise<string> {
  if (!shouldProcessFile(filePath, options)) {
    // For non-processable files, read as binary and return as-is
    const content = await Deno.readFile(filePath);
    return new TextDecoder().decode(content);
  }
  
  const content = await Deno.readTextFile(filePath);
  return processTemplate(content, context, options);
}

/**
 * Batch process multiple templates with the same context
 */
export function processTemplates(
  templates: Record<string, string>,
  context: TemplateContext,
  options: TemplateOptions = {}
): Record<string, string> {
  const results: Record<string, string> = {};
  
  for (const [key, template] of Object.entries(templates)) {
    results[key] = processTemplate(template, context, options);
  }
  
  return results;
}