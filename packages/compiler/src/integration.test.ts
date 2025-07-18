// Integration tests for the compiler with performance optimizations
import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { Compiler } from "./compiler.ts";
import { performanceCache } from "./performance-cache.ts";
import { fileManager } from "./file-manager.ts";
import type { AppConfig, ComponentRegistry } from "../../shared/src/types.ts";

// Create a mock component registry for testing
function createMockComponentRegistry(): ComponentRegistry {
  return {
    Button: {
      component: () => null,
      propSchema: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          variant: { type: 'string', enum: ['primary', 'secondary'] },
          size: { type: 'string', enum: ['sm', 'md', 'lg'] }
        }
      },
      dependencies: []
    },
    Input: {
      component: () => null,
      propSchema: {
        type: 'object',
        properties: {
          placeholder: { type: 'string' },
          type: { type: 'string', enum: ['text', 'email', 'password'] }
        }
      },
      dependencies: []
    },
    Card: {
      component: () => null,
      propSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' }
        }
      },
      dependencies: []
    }
  };
}

Deno.test("Integration - Performance Cache Usage", async () => {
  const registry = createMockComponentRegistry();
  const compiler = new Compiler(registry);
  
  // Initialize cache
  await performanceCache.initialize();
  
  const testConfig: AppConfig = {
    metadata: {
      name: 'test-app',
      version: '1.0.0',
      description: 'Test application'
    },
    components: [
      {
        id: 'header-button',
        type: 'Button',
        props: { label: 'Click Me', variant: 'primary' }
      },
      {
        id: 'search-input',
        type: 'Input',
        props: { placeholder: 'Search...', type: 'text' }
      }
    ],
    routes: [
      {
        path: '/',
        component: 'header-button'
      }
    ]
  };
  
  const configPath = "/tmp/test-config.json";
  const outputDir = "/tmp/test-output";
  const templateDir = "packages/templates";
  
  try {
    // Write test config
    await Deno.writeTextFile(configPath, JSON.stringify(testConfig, null, 2));
    
    // Clean output directory
    try {
      await Deno.remove(outputDir, { recursive: true });
    } catch {
      // Ignore if doesn't exist
    }
    
    // First compilation (cache miss)
    const start1 = performance.now();
    const result1 = await compiler.compile(configPath, {
      templateDir,
      outputDir: outputDir + "-1",
      logLevel: 'ERROR',
      optimize: true
    });
    const end1 = performance.now();
    const time1 = end1 - start1;
    
    // Check cache statistics after first compilation
    const stats1 = performanceCache.getStats();
    console.log(`\n📊 After first compilation:`);
    console.log(`Components cached: ${stats1.components.size}`);
    console.log(`Templates cached: ${stats1.templates.size}`);
    console.log(`Files cached: ${stats1.files.size}`);
    console.log(`Time: ${time1.toFixed(2)}ms`);
    
    // Second compilation (cache hit)
    const start2 = performance.now();
    const result2 = await compiler.compile(configPath, {
      templateDir,
      outputDir: outputDir + "-2",
      logLevel: 'ERROR',
      optimize: true
    });
    const end2 = performance.now();
    const time2 = end2 - start2;
    
    // Check cache statistics after second compilation
    const stats2 = performanceCache.getStats();
    console.log(`\n📊 After second compilation:`);
    console.log(`Components cached: ${stats2.components.size}`);
    console.log(`Templates cached: ${stats2.templates.size}`);
    console.log(`Files cached: ${stats2.files.size}`);
    console.log(`Time: ${time2.toFixed(2)}ms`);
    
    if (time1 > 0 && time2 > 0) {
      console.log(`Speedup: ${(time1 / time2).toFixed(2)}x`);
    }
    
    // Both compilations should succeed
    assert(result1.success, `First compilation failed: ${result1.errors.map(e => e.message).join(', ')}`);
    assert(result2.success, `Second compilation failed: ${result2.errors.map(e => e.message).join(', ')}`);
    
    // Cache should have entries after compilations
    assert(stats2.components.size >= stats1.components.size, "Component cache should grow or stay same");
    
  } finally {
    // Cleanup
    try {
      await Deno.remove(configPath);
    } catch {
      // Ignore cleanup errors
    }
    try {
      await Deno.remove(outputDir + "-1", { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
    try {
      await Deno.remove(outputDir + "-2", { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
    
    performanceCache.clear();
  }
});

Deno.test("Integration - Parallel File Operations", async () => {
  const testDir = "/tmp/parallel-test";
  
  try {
    // Clean up any existing test directory
    try {
      await Deno.remove(testDir, { recursive: true });
    } catch {
      // Ignore if doesn't exist
    }
    
    await Deno.mkdir(testDir, { recursive: true });
    
    // Test parallel file creation
    const fileSpecs = Array.from({ length: 10 }, (_, i) => ({
      path: `${testDir}/file-${i}.txt`,
      content: `Content for file ${i}\n`.repeat(10)
    }));
    
    const start = performance.now();
    const results = await fileManager.createFilesParallel(fileSpecs, { verbose: false });
    const end = performance.now();
    
    console.log(`\n📊 Parallel File Operations:`);
    console.log(`Created ${results.length} files in ${(end - start).toFixed(2)}ms`);
    console.log(`Success rate: ${results.filter(r => r.success).length}/${results.length}`);
    
    // All files should be created successfully
    assertEquals(results.length, 10);
    assert(results.every(r => r.success), "All file operations should succeed");
    
    // Verify files exist
    for (const spec of fileSpecs) {
      const exists = await fileManager.fileExists(spec.path);
      assert(exists, `File should exist: ${spec.path}`);
    }
    
  } finally {
    // Clean up
    try {
      await Deno.remove(testDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  }
});

Deno.test("Integration - File Existence Caching", async () => {
  const testFile = "/tmp/cache-test-file.txt";
  
  try {
    // Create test file
    await Deno.writeTextFile(testFile, "test content");
    
    // First check (cache miss)
    const start1 = performance.now();
    const exists1 = await fileManager.fileExists(testFile);
    const end1 = performance.now();
    const time1 = end1 - start1;
    
    // Second check (cache hit)
    const start2 = performance.now();
    const exists2 = await fileManager.fileExists(testFile);
    const end2 = performance.now();
    const time2 = end2 - start2;
    
    console.log(`\n📊 File Existence Caching:`);
    console.log(`First check: ${time1.toFixed(3)}ms`);
    console.log(`Second check: ${time2.toFixed(3)}ms`);
    if (time1 > 0 && time2 > 0) {
      console.log(`Speedup: ${(time1 / time2).toFixed(2)}x`);
    }
    
    assertEquals(exists1, true);
    assertEquals(exists2, true);
    
    // Second check should be faster (cached)
    if (time1 > 0.1 && time2 > 0) { // Only check if times are meaningful
      assert(time2 <= time1, "Cached check should be faster or equal");
    }
    
  } finally {
    try {
      await Deno.remove(testFile);
    } catch {
      // Ignore cleanup errors
    }
  }
});

Deno.test("Integration - Cache Memory Management", async () => {
  // Test that cache properly manages memory and doesn't grow indefinitely
  await performanceCache.initialize();
  
  const initialStats = performanceCache.getStats();
  
  // Add many components to test cache eviction
  for (let i = 0; i < 50; i++) {
    const component = {
      id: `test-component-${i}`,
      type: 'Button',
      props: { label: `Button ${i}` }
    };
    
    const result = {
      success: true,
      componentType: component.type,
      props: component.props,
      errors: [],
      warnings: [],
      dependencies: []
    };
    
    performanceCache.cacheComponent(component, result);
  }
  
  const afterAddingStats = performanceCache.getStats();
  
  console.log(`\n📊 Cache Memory Management:`);
  console.log(`Initial components: ${initialStats.components.size}`);
  console.log(`After adding 50: ${afterAddingStats.components.size}`);
  console.log(`Max allowed: ${afterAddingStats.components.maxSize}`);
  
  // Cache should respect size limits
  assert(afterAddingStats.components.size <= afterAddingStats.components.maxSize);
  
  // Clear cache
  performanceCache.clear();
  
  const afterClearStats = performanceCache.getStats();
  assertEquals(afterClearStats.components.size, 0);
  assertEquals(afterClearStats.templates.size, 0);
  assertEquals(afterClearStats.files.size, 0);
});

Deno.test("Integration - Performance Optimization Pipeline", async () => {
  const registry = createMockComponentRegistry();
  const compiler = new Compiler(registry);
  
  const testConfig: AppConfig = {
    metadata: {
      name: 'optimized-app',
      version: '1.0.0',
      description: 'App with optimization pipeline'
    },
    components: [
      {
        id: 'main-button',
        type: 'Button',
        props: { label: 'Main Action', variant: 'primary' }
      },
      {
        id: 'info-card',
        type: 'Card',
        props: { title: 'Information', content: 'Some content here' }
      }
    ],
    routes: [
      {
        path: '/',
        component: 'main-button'
      },
      {
        path: '/info',
        component: 'info-card'
      }
    ]
  };
  
  const configPath = "/tmp/optimized-config.json";
  const outputDir = "/tmp/optimized-output";
  const templateDir = "packages/templates";
  
  try {
    // Write test config
    await Deno.writeTextFile(configPath, JSON.stringify(testConfig, null, 2));
    
    // Clean output directory
    try {
      await Deno.remove(outputDir, { recursive: true });
    } catch {
      // Ignore if doesn't exist
    }
    
    // Compile with optimization enabled
    const start = performance.now();
    const result = await compiler.compile(configPath, {
      templateDir,
      outputDir,
      logLevel: 'INFO',
      optimize: true
    });
    const end = performance.now();
    
    console.log(`\n📊 Optimized Compilation:`);
    console.log(`Time: ${(end - start).toFixed(2)}ms`);
    console.log(`Success: ${result.success}`);
    console.log(`Errors: ${result.errors.length}`);
    console.log(`Warnings: ${result.warnings.length}`);
    
    // Compilation should succeed
    assert(result.success, `Compilation failed: ${result.errors.map(e => e.message).join(', ')}`);
    
    // Should complete in reasonable time
    assert((end - start) < 30000, "Compilation should complete within 30 seconds");
    
  } finally {
    // Cleanup
    try {
      await Deno.remove(configPath);
    } catch {
      // Ignore cleanup errors
    }
    try {
      await Deno.remove(outputDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  }
});