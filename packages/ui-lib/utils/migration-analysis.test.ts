/**
 * Tests for Migration Analysis Tools
 */

import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { 
  analyzeComponent,
  analyzeComponentFile,
  getComponentCategory,
  getComponentName,
  performEnhancedAnalysis,
  validateComponent,
  testComponentAfterMigration,
  batchAnalyzeComponents,
  generateAnalysisReport,
  type ComponentAnalysis,
  type EnhancedComponentAnalysis,
  type ValidationResult,
  type ComponentTestResult
} from "./migration-analysis.ts";

Deno.test("analyzeComponent - should identify DaisyUI classes", () => {
  const content = `
    <button class="btn btn-primary loading">
      Click me
    </button>
  `;
  
  const analysis = analyzeComponent(content);
  
  assertEquals(analysis.daisyuiClasses.includes('btn'), true);
  assertEquals(analysis.daisyuiClasses.includes('btn-primary'), true);
  assertEquals(analysis.daisyuiClasses.includes('loading'), true);
});

Deno.test("analyzeComponent - should identify Tailwind classes", () => {
  const content = `
    <div class="flex items-center justify-between p-4 bg-gray-100 text-gray-800">
      Content
    </div>
  `;
  
  const analysis = analyzeComponent(content);
  
  assertEquals(analysis.tailwindClasses.includes('flex'), true);
  assertEquals(analysis.tailwindClasses.includes('items-center'), true);
  assertEquals(analysis.tailwindClasses.includes('justify-between'), true);
  assertEquals(analysis.tailwindClasses.includes('p-4'), true);
  assertEquals(analysis.tailwindClasses.includes('bg-gray-100'), true);
  assertEquals(analysis.tailwindClasses.includes('text-gray-800'), true);
});

Deno.test("analyzeComponent - should identify custom classes", () => {
  const content = `
    <div class="btn custom-button my-special-class flex">
      Content
    </div>
  `;
  
  const analysis = analyzeComponent(content);
  
  assertEquals(analysis.customClasses.includes('custom-button'), true);
  assertEquals(analysis.customClasses.includes('my-special-class'), true);
  assertEquals(analysis.customClasses.includes('btn'), false); // Should be in daisyui
  assertEquals(analysis.customClasses.includes('flex'), false); // Should be in tailwind
});

Deno.test("analyzeComponent - should detect deprecated patterns", () => {
  const content = `
    <button class="btn-ghost">Ghost Button</button>
    <input class="input-bordered" />
  `;
  
  const analysis = analyzeComponent(content);
  
  assertEquals(analysis.deprecatedPatterns.length > 0, true);
  assertEquals(analysis.deprecatedPatterns.some(p => p.includes('ghost')), true);
  assertEquals(analysis.deprecatedPatterns.some(p => p.includes('bordered')), true);
});

Deno.test("getComponentCategory - should extract category from file path", () => {
  const filePath = "packages/ui-lib/components/action/button/Button.tsx";
  const category = getComponentCategory(filePath);
  
  assertEquals(category, "action");
});

Deno.test("getComponentName - should extract component name from file path", () => {
  const filePath = "packages/ui-lib/components/action/button/Button.tsx";
  const name = getComponentName(filePath);
  
  assertEquals(name, "Button");
});

Deno.test("performEnhancedAnalysis - should provide comprehensive analysis", async () => {
  const testContent = `
import React from 'react';

export default function TestComponent() {
  return (
    <div class="btn btn-primary loading text-gray-500 custom-class">
      <span class="loading loading-spinner">Loading...</span>
    </div>
  );
}
  `;
  
  const testFile = './test-enhanced-analysis.tsx';
  await Deno.writeTextFile(testFile, testContent);
  
  try {
    const analysis = await performEnhancedAnalysis(testFile);
    
    assertEquals(analysis.componentName, 'test-enhanced-analysis');
    assertEquals(analysis.daisyuiClasses.length > 0, true);
    assertEquals(analysis.tailwindClasses.length > 0, true);
    assertEquals(analysis.customClasses.length > 0, true);
    assertEquals(analysis.migrationComplexity, 'low'); // Should be low complexity
    assertEquals(analysis.estimatedMigrationTime > 0, true);
    assertEquals(analysis.dependencies.length, 1); // React import
  } finally {
    try {
      await Deno.remove(testFile);
    } catch {
      // Ignore cleanup errors
    }
  }
});

Deno.test("validateComponent - should identify validation issues", () => {
  const content = `
    <div class="btn-ghost" onClick={() => console.log('clicked')}>
      <span class="loading">Loading...</span>
    </div>
  `;
  
  const validation = validateComponent(content, 'test.tsx');
  
  assertEquals(validation.isValid, false); // No export statement
  assertEquals(validation.errors.length > 0, true);
  assertEquals(validation.warnings.length > 0, true);
});

Deno.test("validateComponent - should pass for valid component", () => {
  const content = `
import React from 'react';

export default function ValidComponent() {
  return (
    <button 
      class="btn btn-primary" 
      onClick={() => console.log('clicked')}
      onKeyDown={(e) => e.key === 'Enter' && console.log('clicked')}
    >
      Click me
    </button>
  );
}
  `;
  
  const validation = validateComponent(content, 'ValidComponent.tsx');
  
  assertEquals(validation.isValid, true);
  assertEquals(validation.errors.length, 0);
});

Deno.test("testComponentAfterMigration - should test component functionality", async () => {
  const testContent = `
import React from 'react';

export default function TestComponent(props: { title: string }) {
  return (
    <button class="btn btn-primary" aria-label="Test button">
      {props.title}
    </button>
  );
}
  `;
  
  const testFile = './test-component-testing.tsx';
  await Deno.writeTextFile(testFile, testContent);
  
  try {
    const testResult = await testComponentAfterMigration(testFile);
    
    assertEquals(testResult.componentPath, testFile);
    assertEquals(testResult.testResults.unit, true); // Has export
    assertEquals(testResult.testResults.visual, true); // Has classes
    assertEquals(testResult.testResults.integration, true); // Has props
    assertEquals(testResult.testResults.accessibility, true); // Has aria-label
    assertEquals(testResult.testsPassing, true);
  } finally {
    try {
      await Deno.remove(testFile);
    } catch {
      // Ignore cleanup errors
    }
  }
});

Deno.test("batchAnalyzeComponents - should analyze multiple components", async () => {
  // Create test files
  const testFiles = [
    './test-batch-1.tsx',
    './test-batch-2.tsx',
    './test-batch-3.tsx'
  ];
  
  const testContents = [
    `export default function Component1() { return <div class="btn">Test</div>; }`,
    `export default function Component2() { return <div class="card flex">Test</div>; }`,
    `export default function Component3() { return <div class="loading text-gray-500">Test</div>; }`
  ];
  
  // Write test files
  for (let i = 0; i < testFiles.length; i++) {
    await Deno.writeTextFile(testFiles[i], testContents[i]);
  }
  
  try {
    const result = await batchAnalyzeComponents(testFiles, {
      includeEnhancedAnalysis: true,
      includeValidation: true,
      includeTesting: false
    });
    
    assertEquals(result.analyses.length, 3);
    assertEquals(result.validations.length, 3);
    assertEquals(result.summary.totalComponents, 3);
    assertEquals(result.summary.totalEstimatedTime > 0, true);
  } finally {
    // Clean up test files
    for (const file of testFiles) {
      try {
        await Deno.remove(file);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
});

Deno.test("generateAnalysisReport - should create detailed report", () => {
  const mockAnalyses: EnhancedComponentAnalysis[] = [
    {
      filePath: './Component1.tsx',
      componentName: 'Component1',
      category: 'action',
      daisyuiClasses: ['btn', 'btn-primary'],
      tailwindClasses: ['flex', 'p-4'],
      customClasses: ['custom-class'],
      deprecatedPatterns: [],
      breakingChanges: [],
      migrationComplexity: 'low',
      estimatedMigrationTime: 20,
      dependencies: [],
      dependents: []
    },
    {
      filePath: './Component2.tsx',
      componentName: 'Component2',
      category: 'display',
      daisyuiClasses: ['card', 'card-body', 'loading'],
      tailwindClasses: ['bg-gray-100', 'text-gray-800'],
      customClasses: [],
      deprecatedPatterns: ['loading pattern'],
      breakingChanges: [{
        type: 'class-renamed',
        description: 'Loading class needs update',
        oldValue: 'loading',
        newValue: 'loading loading-spinner',
        severity: 'medium',
        migrationSteps: ['Update loading class']
      }],
      migrationComplexity: 'high',
      estimatedMigrationTime: 45,
      dependencies: [],
      dependents: []
    }
  ];
  
  const mockValidations: ValidationResult[] = [
    {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    },
    {
      isValid: false,
      errors: [{
        type: 'deprecated-class',
        message: 'Uses deprecated class',
        severity: 'error'
      }],
      warnings: [{
        type: 'migration',
        message: 'Needs migration',
        suggestion: 'Update classes'
      }],
      suggestions: ['Consider refactoring']
    }
  ];
  
  const report = generateAnalysisReport(mockAnalyses, mockValidations, []);
  
  assertStringIncludes(report, '# Component Migration Analysis Report');
  assertStringIncludes(report, 'Total Components**: 2');
  assertStringIncludes(report, 'High Complexity**: 1');
  assertStringIncludes(report, 'Low Complexity**: 1');
  assertStringIncludes(report, 'action**: 1');
  assertStringIncludes(report, 'display**: 1');
  assertStringIncludes(report, 'Component2');
  assertStringIncludes(report, 'Uses deprecated class');
});

Deno.test("analyzeComponentFile - should handle file reading", async () => {
  const testContent = `
export default function FileComponent() {
  return <div class="btn loading">Test</div>;
}
  `;
  
  const testFile = './test-file-analysis.tsx';
  await Deno.writeTextFile(testFile, testContent);
  
  try {
    const analysis = await analyzeComponentFile(testFile);
    
    assertEquals(analysis.daisyuiClasses.includes('btn'), true);
    assertEquals(analysis.daisyuiClasses.includes('loading'), true);
  } finally {
    try {
      await Deno.remove(testFile);
    } catch {
      // Ignore cleanup errors
    }
  }
});

Deno.test("analyzeComponent - should handle className attribute", () => {
  const content = `
    <div className="btn btn-ghost flex items-center">
      Content
    </div>
  `;
  
  const analysis = analyzeComponent(content);
  
  assertEquals(analysis.daisyuiClasses.includes('btn'), true);
  assertEquals(analysis.daisyuiClasses.includes('btn-ghost'), true);
  assertEquals(analysis.tailwindClasses.includes('flex'), true);
  assertEquals(analysis.tailwindClasses.includes('items-center'), true);
});

Deno.test("analyzeComponent - should handle template literals", () => {
  const content = `
    <div class={\`btn \${isLoading ? 'loading' : ''} flex\`}>
      Content
    </div>
  `;
  
  const analysis = analyzeComponent(content);
  
  assertEquals(analysis.daisyuiClasses.includes('btn'), true);
  // Note: 'loading' is inside a template literal variable, so it won't be detected as a static class
  assertEquals(analysis.tailwindClasses.includes('flex'), true);
});

Deno.test("analyzeComponent - should handle complex class combinations", () => {
  const content = `
    <div class="btn btn-primary btn-lg loading">
      <span class="loading loading-spinner loading-sm"></span>
      <div class="flex flex-col items-center justify-center p-4 m-2 bg-gray-100 text-gray-800 rounded-lg shadow-md">
        <p class="text-sm font-medium">Complex component</p>
      </div>
    </div>
  `;
  
  const analysis = analyzeComponent(content);
  
  // DaisyUI classes
  assertEquals(analysis.daisyuiClasses.includes('btn'), true);
  assertEquals(analysis.daisyuiClasses.includes('btn-primary'), true);
  assertEquals(analysis.daisyuiClasses.includes('btn-lg'), true);
  assertEquals(analysis.daisyuiClasses.includes('loading'), true);
  assertEquals(analysis.daisyuiClasses.includes('loading-spinner'), true);
  assertEquals(analysis.daisyuiClasses.includes('loading-sm'), true);
  
  // Tailwind classes
  assertEquals(analysis.tailwindClasses.includes('flex'), true);
  assertEquals(analysis.tailwindClasses.includes('flex-col'), true);
  assertEquals(analysis.tailwindClasses.includes('items-center'), true);
  assertEquals(analysis.tailwindClasses.includes('justify-center'), true);
  assertEquals(analysis.tailwindClasses.includes('p-4'), true);
  assertEquals(analysis.tailwindClasses.includes('m-2'), true);
  assertEquals(analysis.tailwindClasses.includes('bg-gray-100'), true);
  assertEquals(analysis.tailwindClasses.includes('text-gray-800'), true);
  assertEquals(analysis.tailwindClasses.includes('rounded-lg'), true);
  assertEquals(analysis.tailwindClasses.includes('shadow-md'), true);
  assertEquals(analysis.tailwindClasses.includes('text-sm'), true);
  assertEquals(analysis.tailwindClasses.includes('font-medium'), true);
});