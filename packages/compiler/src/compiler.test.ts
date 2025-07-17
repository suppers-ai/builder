// Integration tests for the compiler
import { assertEquals, assertExists, assertNotEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts";
import { fs, logger, LogLevel } from "../../shared/src/utils.ts";
import { Compiler, CompilationPhase, type CompilationOptions, type CompilationProgressEvent } from "./compiler.ts";
import { createComponentRegistry } from "../../ui-library/src/registry.ts";
import { fileManager } from "./file-manager.ts";

// Mock component registry for testing
const mockComponentRegistry = createComponentRegistry();

// Sample JSON configuration for testing
const sampleConfig = {
  "metadata": {
    "name": "test-app",
    "version": "1.0.0",
    "description": "Test application"
  },
  "components": [
    {
      "id": "header",
      "type": "Header",
      "props": {
        "title": "Test App"
      }
    },
    {
      "id": "main",
      "type": "Layout",
      "props": {
        "padding": "20px"
      }
    }
  ],
  "routes": [
    {
      "path": "/",
      "component": "main",
      "layout": "header"
    }
  ],
  "api": {
    "endpoints": [
      {
        "path": "/api/test",
        "methods": ["GET"],
        "handler": "TestHandler"
      }
    ]
  },
  "theme": {
    "primaryColor": "#007bff"
  }
};

// Create a temporary directory for testing
async function createTempDir(): Promise<string> {
  const tempDir = await Deno.makeTempDir({ prefix: "compiler-test-" });
  return tempDir;
}

// Create a sample config file for testing
async function createSampleConfig(dir: string): Promise<string> {
  const configPath = fs.joinPath(dir, "app-config.json");
  await Deno.writeTextFile(configPath, JSON.stringify(sampleConfig, null, 2));
  return configPath;
}

// Create a sample template directory for testing
async function createSampleTemplates(dir: string): Promise<string> {
  const templateDir = fs.joinPath(dir, "templates");
  
  // Create base template structure
  await fileManager.createDirectory(fs.joinPath(templateDir, "base"));
  await fileManager.createDirectory(fs.joinPath(templateDir, "base/routes"));
  await fileManager.createDirectory(fs.joinPath(templateDir, "base/islands"));
  await fileManager.createDirectory(fs.joinPath(templateDir, "base/static"));
  
  // Create sample template files
  await Deno.writeTextFile(
    fs.joinPath(templateDir, "base/deno.json"),
    JSON.stringify({
      "name": "{{app.name}}",
      "version": "{{app.version}}",
      "description": "{{app.description}}"
    }, null, 2)
  );
  
  await Deno.writeTextFile(
    fs.joinPath(templateDir, "base/routes/index.tsx"),
    `export default function Home() {
  return <div>Welcome to {{app.name}}</div>;
}`
  );
  
  return templateDir;
}

// Clean up test directories
async function cleanupTestDir(dir: string): Promise<void> {
  try {
    await Deno.remove(dir, { recursive: true });
  } catch (e) {
    // Ignore errors during cleanup
    console.warn(`Failed to clean up test directory: ${e.message}`);
  }
}

// Test the complete compilation pipeline
Deno.test({
  name: "Compiler - Complete compilation pipeline",
  async fn() {
    // Create test directories
    const testDir = await createTempDir();
    const configPath = await createSampleConfig(testDir);
    const templateDir = await createSampleTemplates(testDir);
    const outputDir = fs.joinPath(testDir, "output");
    
    try {
      // Create compiler instance
      const compiler = new Compiler(mockComponentRegistry);
      
      // Track progress events
      const progressEvents: CompilationProgressEvent[] = [];
      compiler.setProgressCallback((event) => {
        progressEvents.push({ ...event });
      });
      
      // Set compilation options
      const options: CompilationOptions = {
        templateDir,
        outputDir,
        validateProps: true,
        validateTemplates: true,
        generateLayouts: true,
        generateMiddleware: true,
        useTypeScript: true,
        optimize: true,
        logLevel: LogLevel.INFO,
        throwOnError: false,
        overwrite: true,
        verbose: true
      };
      
      // Run compilation
      const result = await compiler.compile(configPath, options);
      
      // Verify compilation result
      assertEquals(result.success, true, "Compilation should succeed");
      assertNotEquals(result.outputPath, "", "Output path should not be empty");
      assertEquals(result.phase, CompilationPhase.COMPLETE, "Compilation should complete");
      assertEquals(result.errors.length, 0, "There should be no errors");
      
      // Verify progress events
      assertNotEquals(progressEvents.length, 0, "Progress events should be emitted");
      
      // Verify that all phases were executed
      const phases = progressEvents.map(event => event.phase);
      assertEquals(phases.includes(CompilationPhase.INIT), true, "INIT phase should be executed");
      assertEquals(phases.includes(CompilationPhase.PARSE), true, "PARSE phase should be executed");
      assertEquals(phases.includes(CompilationPhase.PLAN), true, "PLAN phase should be executed");
      assertEquals(phases.includes(CompilationPhase.GENERATE), true, "GENERATE phase should be executed");
      assertEquals(phases.includes(CompilationPhase.INTEGRATE), true, "INTEGRATE phase should be executed");
      assertEquals(phases.includes(CompilationPhase.OPTIMIZE), true, "OPTIMIZE phase should be executed");
      assertEquals(phases.includes(CompilationPhase.COMPLETE), true, "COMPLETE phase should be executed");
      
      // Verify generated files
      const appDir = fs.joinPath(outputDir, "test-app");
      const exists = await fileManager.directoryExists(appDir);
      assertEquals(exists, true, "Application directory should exist");
      
      // Check for key files
      const denoJsonExists = await fileManager.fileExists(fs.joinPath(appDir, "deno.json"));
      assertEquals(denoJsonExists, true, "deno.json should exist");
      
      const indexRouteExists = await fileManager.fileExists(fs.joinPath(appDir, "routes/index.tsx"));
      assertEquals(indexRouteExists, true, "index route should exist");
      
      // Check file content
      const denoJsonContent = await Deno.readTextFile(fs.joinPath(appDir, "deno.json"));
      const denoJson = JSON.parse(denoJsonContent);
      assertEquals(denoJson.name, "test-app", "App name should be set correctly");
      assertEquals(denoJson.version, "1.0.0", "App version should be set correctly");
      
    } finally {
      // Clean up test directories
      await cleanupTestDir(testDir);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false
});

// Test compilation with invalid configuration
Deno.test({
  name: "Compiler - Invalid configuration",
  async fn() {
    // Create test directories
    const testDir = await createTempDir();
    const templateDir = await createSampleTemplates(testDir);
    const outputDir = fs.joinPath(testDir, "output");
    
    // Create invalid config
    const invalidConfigPath = fs.joinPath(testDir, "invalid-config.json");
    await Deno.writeTextFile(invalidConfigPath, `{ "metadata": { "name": "invalid-app" } }`); // Missing required fields
    
    try {
      // Create compiler instance
      const compiler = new Compiler(mockComponentRegistry);
      
      // Set compilation options
      const options: CompilationOptions = {
        templateDir,
        outputDir,
        throwOnError: false
      };
      
      // Run compilation
      const result = await compiler.compile(invalidConfigPath, options);
      
      // Verify compilation result
      assertEquals(result.success, false, "Compilation should fail");
      assertNotEquals(result.errors.length, 0, "There should be errors");
      assertEquals(result.phase, CompilationPhase.FAILED, "Compilation should fail");
      
    } finally {
      // Clean up test directories
      await cleanupTestDir(testDir);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false
});

// Test compilation with missing template directory
Deno.test({
  name: "Compiler - Missing template directory",
  async fn() {
    // Create test directories
    const testDir = await createTempDir();
    const configPath = await createSampleConfig(testDir);
    const outputDir = fs.joinPath(testDir, "output");
    const nonExistentTemplateDir = fs.joinPath(testDir, "non-existent-templates");
    
    try {
      // Create compiler instance
      const compiler = new Compiler(mockComponentRegistry);
      
      // Set compilation options
      const options: CompilationOptions = {
        templateDir: nonExistentTemplateDir,
        outputDir,
        throwOnError: false
      };
      
      // Run compilation
      const result = await compiler.compile(configPath, options);
      
      // Verify compilation result
      assertEquals(result.success, false, "Compilation should fail");
      assertNotEquals(result.errors.length, 0, "There should be errors");
      
      // Check for specific error about missing template directory
      const hasTemplateError = result.errors.some(error => 
        error.message.includes("Template directory not found") || 
        error.message.includes("not found")
      );
      assertEquals(hasTemplateError, true, "Should have error about missing template directory");
      
    } finally {
      // Clean up test directories
      await cleanupTestDir(testDir);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false
});

// Test compilation with progress reporting
Deno.test({
  name: "Compiler - Progress reporting",
  async fn() {
    // Create test directories
    const testDir = await createTempDir();
    const configPath = await createSampleConfig(testDir);
    const templateDir = await createSampleTemplates(testDir);
    const outputDir = fs.joinPath(testDir, "output");
    
    try {
      // Create compiler instance
      const compiler = new Compiler(mockComponentRegistry);
      
      // Track progress events
      const progressEvents: CompilationProgressEvent[] = [];
      compiler.setProgressCallback((event) => {
        progressEvents.push({ ...event });
      });
      
      // Set compilation options
      const options: CompilationOptions = {
        templateDir,
        outputDir,
        throwOnError: false
      };
      
      // Run compilation
      await compiler.compile(configPath, options);
      
      // Verify progress events
      assertNotEquals(progressEvents.length, 0, "Progress events should be emitted");
      
      // Verify progress percentages
      let lastProgress = -1;
      for (const event of progressEvents) {
        // Progress should generally increase (though it might reset on phase changes)
        if (event.phase === progressEvents[0].phase) {
          assertNotEquals(event.progress < 0, true, "Progress should not be negative");
          assertNotEquals(event.progress > 100, true, "Progress should not exceed 100");
        }
        
        // Operation description should not be empty
        assertNotEquals(event.operation, "", "Operation description should not be empty");
        
        lastProgress = event.progress;
      }
      
      // Final progress should be 100
      const finalEvent = progressEvents[progressEvents.length - 1];
      assertEquals(finalEvent.progress, 100, "Final progress should be 100%");
      assertEquals(finalEvent.phase, CompilationPhase.COMPLETE, "Final phase should be COMPLETE");
      
    } finally {
      // Clean up test directories
      await cleanupTestDir(testDir);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false
});