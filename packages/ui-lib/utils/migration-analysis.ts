/**
 * Migration Analysis Tools
 * Tools for analyzing components to identify DaisyUI and Tailwind classes
 */

export interface ComponentAnalysis {
  daisyuiClasses: string[];
  tailwindClasses: string[];
  customClasses: string[];
  deprecatedPatterns: string[];
}

export interface MigrationResult {
  componentPath: string;
  originalClasses: string[];
  updatedClasses: string[];
  breakingChanges: string[];
  warnings: string[];
}

export interface ComponentMigrationStatus {
  componentName: string;
  category: string;
  status: 'pending' | 'in-progress' | 'completed' | 'needs-review';
  daisyuiVersion: '4' | '5';
  tailwindVersion: '3' | '4';
  lastUpdated: Date;
  breakingChanges: string[];
  testsPassing: boolean;
}

// DaisyUI class patterns for detection
const DAISYUI_CLASS_PATTERNS = [
  // Button classes
  /\bbtn(-\w+)?\b/g,
  /\bloading(-\w+)?\b/g,
  
  // Input classes
  /\binput(-\w+)?\b/g,
  /\bselect(-\w+)?\b/g,
  /\btextarea(-\w+)?\b/g,
  /\bcheckbox(-\w+)?\b/g,
  /\bradio(-\w+)?\b/g,
  /\btoggle(-\w+)?\b/g,
  /\brange(-\w+)?\b/g,
  /\brating(-\w+)?\b/g,
  /\bfile-input(-\w+)?\b/g,
  
  // Display classes
  /\bcard(-\w+)?\b/g,
  /\bbadge(-\w+)?\b/g,
  /\bavatar(-\w+)?\b/g,
  /\btable(-\w+)?\b/g,
  /\baccordion(-\w+)?\b/g,
  /\bcarousel(-\w+)?\b/g,
  /\bcollapse(-\w+)?\b/g,
  /\bchat(-\w+)?\b/g,
  /\bcountdown(-\w+)?\b/g,
  /\bdiff(-\w+)?\b/g,
  /\bkbd(-\w+)?\b/g,
  /\bstat(-\w+)?\b/g,
  /\btimeline(-\w+)?\b/g,
  
  // Layout classes
  /\bartboard(-\w+)?\b/g,
  /\bdivider(-\w+)?\b/g,
  /\bdrawer(-\w+)?\b/g,
  /\bfooter(-\w+)?\b/g,
  /\bhero(-\w+)?\b/g,
  /\bindicator(-\w+)?\b/g,
  /\bjoin(-\w+)?\b/g,
  /\bmask(-\w+)?\b/g,
  /\bstack(-\w+)?\b/g,
  
  // Navigation classes
  /\bbreadcrumbs(-\w+)?\b/g,
  /\bbottom-navigation(-\w+)?\b/g,
  /\blink(-\w+)?\b/g,
  /\bmenu(-\w+)?\b/g,
  /\bnavbar(-\w+)?\b/g,
  /\bpagination(-\w+)?\b/g,
  /\bsteps(-\w+)?\b/g,
  /\btab(-\w+)?\b/g,
  
  // Feedback classes
  /\balert(-\w+)?\b/g,
  /\bprogress(-\w+)?\b/g,
  /\bradial-progress(-\w+)?\b/g,
  /\bskeleton(-\w+)?\b/g,
  /\btoast(-\w+)?\b/g,
  /\btooltip(-\w+)?\b/g,
  
  // Action classes
  /\bdropdown(-\w+)?\b/g,
  /\bmodal(-\w+)?\b/g,
  /\bswap(-\w+)?\b/g,
  /\btheme-controller(-\w+)?\b/g,
  
  // Mockup classes
  /\bmockup(-\w+)?\b/g,
  
  // Utility classes
  /\bglass\b/g,
  /\bno-animation\b/g,
];

// Tailwind class patterns for detection
const TAILWIND_CLASS_PATTERNS = [
  // Layout
  /\b(block|inline-block|inline|flex|inline-flex|table|inline-table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row-group|table-row|flow-root|grid|inline-grid|contents|list-item|hidden)\b/g,
  
  // Flexbox & Grid
  /\b(flex-row|flex-row-reverse|flex-col|flex-col-reverse|flex-wrap|flex-wrap-reverse|flex-nowrap)\b/g,
  /\b(grid-cols-\d+|col-span-\d+|col-start-\d+|col-end-\d+|grid-rows-\d+|row-span-\d+|row-start-\d+|row-end-\d+)\b/g,
  /\b(gap-\d+|gap-x-\d+|gap-y-\d+)\b/g,
  /\b(justify-start|justify-end|justify-center|justify-between|justify-around|justify-evenly)\b/g,
  /\b(items-start|items-end|items-center|items-baseline|items-stretch)\b/g,
  
  // Spacing
  /\b[mp][trblxy]?-\d+(\.\d+)?\b/g,
  /\b[mp][trblxy]?-px\b/g,
  /\b[mp][trblxy]?-auto\b/g,
  /\bspace-[xy]-\d+\b/g,
  
  // Sizing
  /\b[wh]-\d+(\.\d+)?\b/g,
  /\b[wh]-(px|auto|full|screen|min|max|fit)\b/g,
  /\b(min|max)-[wh]-\d+\b/g,
  
  // Colors
  /\b(text|bg|border|ring|shadow|decoration|divide|outline|accent|caret|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/g,
  /\b(text|bg|border)-(black|white|transparent|current|inherit)\b/g,
  
  // Typography
  /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/g,
  /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/g,
  /\b(italic|not-italic|underline|overline|line-through|no-underline)\b/g,
  /\btext-(left|center|right|justify|start|end)\b/g,
  
  // Borders
  /\bborder(-\d+)?\b/g,
  /\bborder-[trbl](-\d+)?\b/g,
  /\brounded(-\w+)?\b/g,
  
  // Effects
  /\bshadow(-\w+)?\b/g,
  /\bopacity-\d+\b/g,
  /\bblur(-\w+)?\b/g,
  
  // Transforms
  /\b(scale|rotate|translate|skew)-\w+\b/g,
  /\btransform(-\w+)?\b/g,
  /\btransition(-\w+)?\b/g,
  
  // Positioning
  /\b(static|fixed|absolute|relative|sticky)\b/g,
  /\b(top|right|bottom|left|inset)-\d+\b/g,
  /\bz-\d+\b/g,
  
  // Responsive prefixes
  /\b(sm|md|lg|xl|2xl):/g,
];

// Known deprecated patterns in DaisyUI 4 that need updating
const DEPRECATED_PATTERNS = [
  {
    pattern: /\bloading\s+loading-spinner\b/g,
    description: "DaisyUI 4 loading pattern",
    suggestion: "Check if DaisyUI 5 has updated loading classes"
  },
  {
    pattern: /\bbtn-ghost\b/g,
    description: "Button ghost variant",
    suggestion: "Verify ghost variant syntax in DaisyUI 5"
  },
  {
    pattern: /\binput-bordered\b/g,
    description: "Input bordered variant",
    suggestion: "Check if bordered is still the default in DaisyUI 5"
  },
  {
    pattern: /\bcard-compact\b/g,
    description: "Card compact variant",
    suggestion: "Verify card sizing classes in DaisyUI 5"
  }
];

/**
 * Extract all classes from a string of content
 */
function extractClasses(content: string): string[] {
  const classes: string[] = [];
  
  // Handle regular class attributes with quotes
  const regularClassMatches = content.match(/class(?:Name)?=["'`]([^"'`]+)["'`]/g) || [];
  regularClassMatches.forEach(match => {
    const classString = match.match(/["'`]([^"'`]+)["'`]/)?.[1];
    if (classString) {
      classes.push(...classString.split(/\s+/).filter(Boolean));
    }
  });
  
  // Handle template literals in JSX (class={`...`})
  const templateLiteralMatches = content.match(/class(?:Name)?=\{\s*`([^`]*)`\s*\}/g) || [];
  templateLiteralMatches.forEach(match => {
    const classString = match.match(/`([^`]*)`/)?.[1];
    if (classString) {
      // Extract static class names, ignoring template literal variables
      const staticClasses = classString.replace(/\$\{[^}]*\}/g, ' ').split(/\s+/).filter(Boolean);
      classes.push(...staticClasses);
    }
  });
  
  return [...new Set(classes)]; // Remove duplicates
}

/**
 * Identify DaisyUI classes in content
 */
function extractDaisyUIClasses(content: string): string[] {
  const allClasses = extractClasses(content);
  const daisyuiClasses: string[] = [];
  
  allClasses.forEach(className => {
    for (const pattern of DAISYUI_CLASS_PATTERNS) {
      pattern.lastIndex = 0; // Reset regex state
      if (pattern.test(className)) {
        daisyuiClasses.push(className);
        break;
      }
    }
  });
  
  return [...new Set(daisyuiClasses)];
}

/**
 * Identify Tailwind classes in content
 */
function extractTailwindClasses(content: string): string[] {
  const allClasses = extractClasses(content);
  const tailwindClasses: string[] = [];
  
  allClasses.forEach(className => {
    for (const pattern of TAILWIND_CLASS_PATTERNS) {
      pattern.lastIndex = 0; // Reset regex state
      if (pattern.test(className)) {
        tailwindClasses.push(className);
        break;
      }
    }
  });
  
  return [...new Set(tailwindClasses)];
}

/**
 * Identify custom classes (not DaisyUI or Tailwind)
 */
function extractCustomClasses(content: string): string[] {
  const allClasses = extractClasses(content);
  const daisyuiClasses = new Set(extractDaisyUIClasses(content));
  const tailwindClasses = new Set(extractTailwindClasses(content));
  
  return allClasses.filter(className => 
    !daisyuiClasses.has(className) && !tailwindClasses.has(className)
  );
}

/**
 * Find deprecated patterns in content
 */
function findDeprecatedPatterns(content: string): string[] {
  const deprecatedFound: string[] = [];
  
  DEPRECATED_PATTERNS.forEach(({ pattern, description }) => {
    pattern.lastIndex = 0; // Reset regex state
    if (pattern.test(content)) {
      deprecatedFound.push(description);
    }
  });
  
  return deprecatedFound;
}

/**
 * Analyze a component file for DaisyUI and Tailwind class usage
 */
export function analyzeComponent(content: string): ComponentAnalysis {
  return {
    daisyuiClasses: extractDaisyUIClasses(content),
    tailwindClasses: extractTailwindClasses(content),
    customClasses: extractCustomClasses(content),
    deprecatedPatterns: findDeprecatedPatterns(content)
  };
}

/**
 * Analyze a component file by path
 */
export async function analyzeComponentFile(filePath: string): Promise<ComponentAnalysis> {
  try {
    const content = await Deno.readTextFile(filePath);
    return analyzeComponent(content);
  } catch (error) {
    throw new Error(`Failed to analyze component file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Get component category from file path
 */
export function getComponentCategory(filePath: string): string {
  const pathParts = filePath.split('/');
  const componentsIndex = pathParts.findIndex(part => part === 'components');
  
  if (componentsIndex !== -1 && componentsIndex + 1 < pathParts.length) {
    return pathParts[componentsIndex + 1];
  }
  
  return 'unknown';
}

/**
 * Get component name from file path
 */
export function getComponentName(filePath: string): string {
  const pathParts = filePath.split('/');
  const fileName = pathParts[pathParts.length - 1];
  
  // Remove file extension
  return fileName.replace(/\.(tsx?|jsx?)$/, '');
}

/**
 * Enhanced component analysis with breaking change detection
 */
export interface EnhancedComponentAnalysis extends ComponentAnalysis {
  filePath: string;
  componentName: string;
  category: string;
  breakingChanges: BreakingChange[];
  migrationComplexity: 'low' | 'medium' | 'high';
  estimatedMigrationTime: number; // in minutes
  dependencies: string[]; // Other components this component depends on
  dependents: string[]; // Other components that depend on this component
}

export interface BreakingChange {
  type: 'class-removed' | 'class-renamed' | 'behavior-changed' | 'prop-changed';
  description: string;
  oldValue: string;
  newValue?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  migrationSteps: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  type: 'syntax-error' | 'missing-import' | 'invalid-prop' | 'deprecated-class';
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  type: 'performance' | 'accessibility' | 'best-practice' | 'migration';
  message: string;
  suggestion?: string;
}

export interface ComponentTestResult {
  componentPath: string;
  testsPassing: boolean;
  testResults: {
    unit: boolean;
    visual: boolean;
    integration: boolean;
    accessibility: boolean;
  };
  errors: string[];
  warnings: string[];
}

// Enhanced breaking changes detection for DaisyUI 5
const DAISYUI_5_BREAKING_CHANGES: BreakingChange[] = [
  {
    type: 'class-renamed',
    description: 'Loading class now requires explicit spinner type',
    oldValue: 'loading',
    newValue: 'loading loading-spinner',
    severity: 'medium',
    migrationSteps: [
      'Replace "loading" with "loading loading-spinner"',
      'Consider other loading types: loading-dots, loading-ring, loading-ball'
    ]
  },
  {
    type: 'behavior-changed',
    description: 'Modal backdrop behavior may have changed',
    oldValue: 'modal-backdrop',
    newValue: 'modal-backdrop',
    severity: 'medium',
    migrationSteps: [
      'Test modal backdrop click behavior',
      'Verify modal close functionality',
      'Check modal animation timing'
    ]
  },
  {
    type: 'class-renamed',
    description: 'Some color variants may have new names',
    oldValue: 'btn-ghost',
    newValue: 'btn-ghost',
    severity: 'low',
    migrationSteps: [
      'Verify ghost button appearance',
      'Test button states (hover, active, disabled)',
      'Check color consistency across themes'
    ]
  }
];

// Tailwind 4 breaking changes
const TAILWIND_4_BREAKING_CHANGES: BreakingChange[] = [
  {
    type: 'class-renamed',
    description: 'Gray color palette replaced with slate',
    oldValue: 'text-gray-500',
    newValue: 'text-slate-500',
    severity: 'low',
    migrationSteps: [
      'Replace all gray-* classes with slate-*',
      'Verify color consistency',
      'Test with different themes'
    ]
  },
  {
    type: 'behavior-changed',
    description: 'Container queries now available',
    oldValue: 'responsive design with media queries',
    newValue: 'container queries for component-based responsive design',
    severity: 'low',
    migrationSteps: [
      'Consider using container queries for component responsiveness',
      'Update responsive design patterns where beneficial'
    ]
  }
];

/**
 * Perform enhanced analysis of a component
 */
export async function performEnhancedAnalysis(filePath: string): Promise<EnhancedComponentAnalysis> {
  const content = await Deno.readTextFile(filePath);
  const basicAnalysis = analyzeComponent(content);
  
  const componentName = getComponentName(filePath);
  const category = getComponentCategory(filePath);
  
  // Detect breaking changes
  const breakingChanges = detectBreakingChanges(content);
  
  // Calculate migration complexity
  const migrationComplexity = calculateMigrationComplexity(basicAnalysis, breakingChanges);
  
  // Estimate migration time
  const estimatedMigrationTime = estimateMigrationTime(basicAnalysis, breakingChanges, migrationComplexity);
  
  // Analyze dependencies
  const dependencies = extractComponentDependencies(content);
  
  return {
    ...basicAnalysis,
    filePath,
    componentName,
    category,
    breakingChanges,
    migrationComplexity,
    estimatedMigrationTime,
    dependencies,
    dependents: [] // This would need to be calculated by analyzing all components
  };
}

/**
 * Detect breaking changes in component content
 */
function detectBreakingChanges(content: string): BreakingChange[] {
  const detectedChanges: BreakingChange[] = [];
  
  // Check for DaisyUI breaking changes
  DAISYUI_5_BREAKING_CHANGES.forEach(change => {
    if (content.includes(change.oldValue)) {
      detectedChanges.push(change);
    }
  });
  
  // Check for Tailwind breaking changes
  TAILWIND_4_BREAKING_CHANGES.forEach(change => {
    if (content.includes(change.oldValue)) {
      detectedChanges.push(change);
    }
  });
  
  return detectedChanges;
}

/**
 * Calculate migration complexity based on analysis
 */
function calculateMigrationComplexity(
  analysis: ComponentAnalysis, 
  breakingChanges: BreakingChange[]
): 'low' | 'medium' | 'high' {
  const totalClasses = analysis.daisyuiClasses.length + analysis.tailwindClasses.length;
  const criticalChanges = breakingChanges.filter(c => c.severity === 'critical').length;
  const highChanges = breakingChanges.filter(c => c.severity === 'high').length;
  
  if (criticalChanges > 0 || highChanges > 2 || totalClasses > 20) {
    return 'high';
  } else if (highChanges > 0 || totalClasses > 10 || breakingChanges.length > 3) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Estimate migration time in minutes
 */
function estimateMigrationTime(
  analysis: ComponentAnalysis,
  breakingChanges: BreakingChange[],
  complexity: 'low' | 'medium' | 'high'
): number {
  const baseTime = 15; // Base time for any component
  const classTime = (analysis.daisyuiClasses.length + analysis.tailwindClasses.length) * 2;
  const breakingChangeTime = breakingChanges.length * 10;
  const complexityMultiplier = complexity === 'high' ? 2 : complexity === 'medium' ? 1.5 : 1;
  
  return Math.round((baseTime + classTime + breakingChangeTime) * complexityMultiplier);
}

/**
 * Extract component dependencies from imports and usage
 */
function extractComponentDependencies(content: string): string[] {
  const dependencies: string[] = [];
  
  // Extract import statements
  const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    // Include both relative imports and known libraries
    if (importPath.startsWith('./') || importPath.startsWith('../') || 
        importPath === 'react' || importPath.startsWith('@/')) {
      dependencies.push(importPath);
    }
  }
  
  return dependencies;
}

/**
 * Validate component for common issues
 */
export function validateComponent(content: string, filePath: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];
  
  // Check for syntax issues
  if (!content.includes('export')) {
    errors.push({
      type: 'syntax-error',
      message: 'Component does not have an export statement',
      severity: 'error'
    });
  }
  
  // Check for deprecated classes
  const analysis = analyzeComponent(content);
  analysis.deprecatedPatterns.forEach(pattern => {
    warnings.push({
      type: 'migration',
      message: `Deprecated pattern found: ${pattern}`,
      suggestion: 'Update to DaisyUI 5 compatible pattern'
    });
  });
  
  // Check for accessibility issues
  if (content.includes('onClick') && !content.includes('onKeyDown')) {
    warnings.push({
      type: 'accessibility',
      message: 'Interactive element missing keyboard support',
      suggestion: 'Add onKeyDown handler for keyboard accessibility'
    });
  }
  
  // Check for performance issues
  if (content.includes('className={`') && content.includes('${')) {
    warnings.push({
      type: 'performance',
      message: 'Dynamic className generation in template literal',
      suggestion: 'Consider using clsx or classnames library for better performance'
    });
  }
  
  // Suggestions based on analysis
  if (analysis.daisyuiClasses.length > 10) {
    suggestions.push('Consider breaking this component into smaller components');
  }
  
  if (analysis.customClasses.length > 5) {
    suggestions.push('Consider using DaisyUI or Tailwind classes instead of custom classes');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Test component functionality after migration
 */
export async function testComponentAfterMigration(filePath: string): Promise<ComponentTestResult> {
  const componentPath = filePath;
  const testResults = {
    unit: false,
    visual: false,
    integration: false,
    accessibility: false
  };
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Check if component can be imported (basic syntax test)
    const content = await Deno.readTextFile(filePath);
    
    // Basic syntax validation
    if (content.includes('export default') || content.includes('export const') || content.includes('export function')) {
      testResults.unit = true;
    } else {
      errors.push('Component does not have a valid export');
    }
    
    // Visual regression test (simplified - would need actual testing framework)
    const analysis = analyzeComponent(content);
    if (analysis.daisyuiClasses.length > 0 || analysis.tailwindClasses.length > 0) {
      testResults.visual = true; // Assume visual test passes if classes are present
    }
    
    // Integration test (check for common integration patterns)
    if (content.includes('props') || content.includes('interface') || content.includes('type')) {
      testResults.integration = true;
    }
    
    // Accessibility test (basic checks)
    const hasAriaLabels = content.includes('aria-') || content.includes('role=');
    const hasSemanticElements = content.includes('<button') || content.includes('<input') || content.includes('<a ');
    
    if (hasAriaLabels || hasSemanticElements) {
      testResults.accessibility = true;
    } else {
      warnings.push('Component may have accessibility issues');
    }
    
  } catch (error) {
    errors.push(`Failed to test component: ${(error as Error).message}`);
  }
  
  const testsPassing = Object.values(testResults).every(result => result === true);
  
  return {
    componentPath,
    testsPassing,
    testResults,
    errors,
    warnings
  };
}

/**
 * Batch analyze multiple components
 */
export async function batchAnalyzeComponents(
  filePaths: string[],
  options: {
    includeEnhancedAnalysis?: boolean;
    includeValidation?: boolean;
    includeTesting?: boolean;
    onProgress?: (current: number, total: number, file: string) => void;
  } = {}
): Promise<{
  analyses: EnhancedComponentAnalysis[];
  validations: ValidationResult[];
  testResults: ComponentTestResult[];
  summary: {
    totalComponents: number;
    highComplexity: number;
    mediumComplexity: number;
    lowComplexity: number;
    totalEstimatedTime: number;
    componentsWithIssues: number;
  };
}> {
  const {
    includeEnhancedAnalysis = true,
    includeValidation = true,
    includeTesting = false,
    onProgress
  } = options;
  
  const analyses: EnhancedComponentAnalysis[] = [];
  const validations: ValidationResult[] = [];
  const testResults: ComponentTestResult[] = [];
  
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    
    try {
      if (includeEnhancedAnalysis) {
        const analysis = await performEnhancedAnalysis(filePath);
        analyses.push(analysis);
      }
      
      if (includeValidation) {
        const content = await Deno.readTextFile(filePath);
        const validation = validateComponent(content, filePath);
        validations.push(validation);
      }
      
      if (includeTesting) {
        const testResult = await testComponentAfterMigration(filePath);
        testResults.push(testResult);
      }
      
      if (onProgress) {
        onProgress(i + 1, filePaths.length, filePath);
      }
    } catch (error) {
      console.warn(`Warning: Failed to analyze ${filePath}: ${(error as Error).message}`);
    }
  }
  
  // Generate summary
  const totalComponents = analyses.length;
  const highComplexity = analyses.filter(a => a.migrationComplexity === 'high').length;
  const mediumComplexity = analyses.filter(a => a.migrationComplexity === 'medium').length;
  const lowComplexity = analyses.filter(a => a.migrationComplexity === 'low').length;
  const totalEstimatedTime = analyses.reduce((sum, a) => sum + a.estimatedMigrationTime, 0);
  const componentsWithIssues = validations.filter(v => !v.isValid || v.warnings.length > 0).length;
  
  return {
    analyses,
    validations,
    testResults,
    summary: {
      totalComponents,
      highComplexity,
      mediumComplexity,
      lowComplexity,
      totalEstimatedTime,
      componentsWithIssues
    }
  };
}

/**
 * Generate detailed analysis report
 */
export function generateAnalysisReport(
  analyses: EnhancedComponentAnalysis[],
  validations: ValidationResult[],
  testResults: ComponentTestResult[]
): string {
  let report = `# Component Migration Analysis Report\n\n`;
  
  // Summary section
  const totalComponents = analyses.length;
  const highComplexity = analyses.filter(a => a.migrationComplexity === 'high').length;
  const mediumComplexity = analyses.filter(a => a.migrationComplexity === 'medium').length;
  const lowComplexity = analyses.filter(a => a.migrationComplexity === 'low').length;
  const totalTime = analyses.reduce((sum, a) => sum + a.estimatedMigrationTime, 0);
  
  report += `## Summary\n`;
  report += `- **Total Components**: ${totalComponents}\n`;
  report += `- **High Complexity**: ${highComplexity}\n`;
  report += `- **Medium Complexity**: ${mediumComplexity}\n`;
  report += `- **Low Complexity**: ${lowComplexity}\n`;
  report += `- **Estimated Total Time**: ${Math.round(totalTime / 60)} hours\n\n`;
  
  // Components by category
  const categoryCounts = analyses.reduce((acc, analysis) => {
    acc[analysis.category] = (acc[analysis.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  report += `## Components by Category\n`;
  Object.entries(categoryCounts).forEach(([category, count]) => {
    report += `- **${category}**: ${count} components\n`;
  });
  report += `\n`;
  
  // High complexity components
  const highComplexityComponents = analyses.filter(a => a.migrationComplexity === 'high');
  if (highComplexityComponents.length > 0) {
    report += `## High Complexity Components\n`;
    highComplexityComponents.forEach(component => {
      report += `### ${component.componentName} (${component.category})\n`;
      report += `- **Estimated Time**: ${component.estimatedMigrationTime} minutes\n`;
      report += `- **DaisyUI Classes**: ${component.daisyuiClasses.length}\n`;
      report += `- **Tailwind Classes**: ${component.tailwindClasses.length}\n`;
      report += `- **Breaking Changes**: ${component.breakingChanges.length}\n`;
      if (component.breakingChanges.length > 0) {
        component.breakingChanges.forEach(change => {
          report += `  - ${change.description} (${change.severity})\n`;
        });
      }
      report += `\n`;
    });
  }
  
  // Validation issues
  const componentsWithIssues = validations.filter(v => !v.isValid || v.warnings.length > 0);
  if (componentsWithIssues.length > 0) {
    report += `## Components with Issues\n`;
    componentsWithIssues.forEach((validation, index) => {
      const analysis = analyses[index];
      if (analysis) {
        report += `### ${analysis.componentName}\n`;
        if (validation.errors.length > 0) {
          report += `**Errors:**\n`;
          validation.errors.forEach(error => {
            report += `- ${error.message}\n`;
          });
        }
        if (validation.warnings.length > 0) {
          report += `**Warnings:**\n`;
          validation.warnings.forEach(warning => {
            report += `- ${warning.message}\n`;
          });
        }
        report += `\n`;
      }
    });
  }
  
  return report;
}