// Performance tests and benchmarks for optimization validation
import { assertEquals, assertExists, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { performanceCache } from "./performance-cache.ts";
import { parallelProcessor } from "./parallel-processor.ts";
import { fileManager } from "./file-manager.ts";
import { Compiler } from "./compiler.ts";
import { createMockComponentRegistry } from "../../ui-library/src/registry.test.ts";
import type { ComponentDefinition, AppConfig } from "../../shared/src/types.ts";

/**
 * Benchmark result
 */
interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
}

/**
 * Run a benchmark function multiple times and collect statistics
 */
async function benchmark(
  name: string,
  fn: () => Promise<void>,
  iterations: number = 100
): Promise<BenchmarkResult> {
  const times: number[] = [];
  
  // Warm up
  for (let i = 0; i < 5; i++) {
    await fn();
  }
  
  // Run benchmark
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const averageTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const opsPerSecond = 1000 / averageTime;
  
  return {
    name,
    iterations,
    totalTime,
    averageTime,
    minTime,
    maxTime,
    opsPerSecond
  };
}

/**
 * Create test component definitions
 */
function createTestComponents(count: number): ComponentDefinition[] {
  const components: ComponentDefinition[] = [];
  
  for (let i = 0; i < count; i++) {
    components.push({
      id: `component-${i}`,
      type: i % 2 === 0 ? 'Button' : 'Input',
      props: {
        label: `Test Component ${i}`,
        variant: i % 3 === 0 ? 'primary' : 'secondary',
        size: i % 2 === 0 ? 'md' : 'lg'
      }
    });
  }
  
  return components;
}

/**
 * Create test app configuration
 */
function createTestAppConfig(componentCount: number = 50): AppConfig {
  return {
    metadata: {
      name: 'test-app',
      version: '1.0.0',
      description: 'Test application for benchmarking'
    },
    components: createTestComponents(componentCount),
    routes: [
      {
        path: '/',
        component: 'component-0'
      },
      {
        path: '/about',
        component: 'component-1'
      }
    ],
    api: {
      endpoints: [
        {
          path: '/api/test',
          methods: ['GET', 'POST'],
          handler: 'TestHandler'
        }
      ]
    }
  };
}

Deno.test("Performance Cache - Component Resolution Caching", async () => {
  const cache = new (performanceCache.constructor as any)();
  await cache.initialize();
  
  const testComponent: ComponentDefinition = {
    id: 'test-button',
    type: 'Button',
    props: { label: 'Test', variant: 'primary' }
  };
  
  // Benchmark without cache
  const withoutCacheResult = await benchmark(
    "Component resolution without cache",
    async () => {
      // Simulate component resolution work
      const hash = JSON.stringify(testComponent);
      const result = {
        success: true,
        componentType: testComponent.type,
        props: testComponent.props,
        errors: [],
        warnings: [],
        dependencies: []
      };
      // Don't cache the result
    },
    50
  );
  
  // Benchmark with cache
  const withCacheResult = await benchmark(
    "Component resolution with cache",
    async () => {
      let cachedResult = cache.getCachedComponent(testComponent);
      if (!cachedResult) {
        // Simulate component resolution work
        const result = {
          success: true,
          componentType: testComponent.type,
          props: testComponent.props,
          errors: [],
          warnings: [],
          dependencies: []
        };
        cache.cacheComponent(testComponent, result);
        cachedResult = result;
      }
    },
    50
  );
  
  console.log(`\n📊 Component Resolution Caching Benchmark:`);
  console.log(`Without cache: ${withoutCacheResult.averageTime.toFixed(2)}ms avg`);
  console.log(`With cache: ${withCacheResult.averageTime.toFixed(2)}ms avg`);
  console.log(`Speedup: ${(withoutCacheResult.averageTime / withCacheResult.averageTime).toFixed(2)}x`);
  
  // Cache should provide significant speedup after first resolution
  assert(withCacheResult.averageTime < withoutCacheResult.averageTime);
  
  cache.clear();
});

Deno.test("Performance Cache - Template Processing Caching", async () => {
  const cache = new (performanceCache.constructor as any)();
  await cache.initialize();
  
  const templatePath = "/tmp/test-template.tsx";
  const templateContext = {
    app: { name: 'test-app', version: '1.0.0' },
    metadata: { name: 'test-app', version: '1.0.0' }
  };
  
  // Create a temporary template file
  const templateContent = `
    import { Component } from 'fresh';
    
    export default function {{app.name}}() {
      return <div>{{app.name}} v{{app.version}}</div>;
    }
  `;
  
  try {
    await Deno.writeTextFile(templatePath, templateContent);
    
    // Benchmark without cache
    const withoutCacheResult = await benchmark(
      "Template processing without cache",
      async () => {
        // Simulate template processing work
        const processed = templateContent
          .replace(/\{\{app\.name\}\}/g, templateContext.app.name)
          .replace(/\{\{app\.version\}\}/g, templateContext.app.version);
        // Don't cache the result
      },
      50
    );
    
    // Benchmark with cache
    const withCacheResult = await benchmark(
      "Template processing with cache",
      async () => {
        let cachedContent = await cache.getCachedTemplate(templatePath, templateContext);
        if (!cachedContent) {
          // Simulate template processing work
          const processed = templateContent
            .replace(/\{\{app\.name\}\}/g, templateContext.app.name)
            .replace(/\{\{app\.version\}\}/g, templateContext.app.version);
          await cache.cacheTemplate(templatePath, templateContext, processed);
          cachedContent = processed;
        }
      },
      50
    );
    
    console.log(`\n📊 Template Processing Caching Benchmark:`);
    console.log(`Without cache: ${withoutCacheResult.averageTime.toFixed(2)}ms avg`);
    console.log(`With cache: ${withCacheResult.averageTime.toFixed(2)}ms avg`);
    console.log(`Speedup: ${(withoutCacheResult.averageTime / withCacheResult.averageTime).toFixed(2)}x`);
    
    // Cache should provide speedup after first processing
    assert(withCacheResult.averageTime < withoutCacheResult.averageTime);
    
  } finally {
    try {
      await Deno.remove(templatePath);
    } catch {
      // Ignore cleanup errors
    }
    cache.clear();
  }
});

Deno.test("Parallel Processing - Task Execution Performance", async () => {
  const processor = new (parallelProcessor.constructor as any)();
  
  // Create CPU-intensive tasks
  const createTask = (id: number) => ({
    id: `task-${id}`,
    description: `CPU intensive task ${id}`,
    execute: async () => {
      // Simulate CPU work
      let sum = 0;
      for (let i = 0; i < 100000; i++) {
        sum += Math.sqrt(i);
      }
      return sum;
    },
    input: id
  });
  
  const taskCount = 20;
  const tasks = Array.from({ length: taskCount }, (_, i) => createTask(i));
  
  // Benchmark sequential execution
  const sequentialResult = await benchmark(
    "Sequential task execution",
    async () => {
      for (const task of tasks) {
        await task.execute();
      }
    },
    5
  );
  
  // Benchmark parallel execution
  const parallelResult = await benchmark(
    "Parallel task execution",
    async () => {
      await processor.executeBatch(tasks, {
        maxConcurrency: 4,
        stopOnError: false,
        logProgress: false
      });
    },
    5
  );
  
  console.log(`\n📊 Parallel Processing Benchmark (${taskCount} tasks):`);
  console.log(`Sequential: ${sequentialResult.averageTime.toFixed(2)}ms avg`);
  console.log(`Parallel: ${parallelResult.averageTime.toFixed(2)}ms avg`);
  console.log(`Speedup: ${(sequentialResult.averageTime / parallelResult.averageTime).toFixed(2)}x`);
  
  // Parallel execution should be faster for CPU-intensive tasks
  assert(parallelResult.averageTime < sequentialResult.averageTime);
});

Deno.test("File Operations - Parallel vs Sequential", async () => {
  const testDir = "/tmp/perf-test";
  const fileCount = 20;
  
  try {
    // Clean up any existing test directory
    try {
      await Deno.remove(testDir, { recursive: true });
    } catch {
      // Ignore if doesn't exist
    }
    
    await Deno.mkdir(testDir, { recursive: true });
    
    // Create test files
    const fileSpecs = Array.from({ length: fileCount }, (_, i) => ({
      path: `${testDir}/test-file-${i}.txt`,
      content: `Test content for file ${i}\n`.repeat(100)
    }));
    
    // Benchmark sequential file creation
    const sequentialResult = await benchmark(
      "Sequential file creation",
      async () => {
        // Clean up first
        for (const spec of fileSpecs) {
          try {
            await Deno.remove(spec.path);
          } catch {
            // Ignore if doesn't exist
          }
        }
        
        // Create files sequentially
        for (const spec of fileSpecs) {
          await fileManager.createFile(spec.path, spec.content, { verbose: false });
        }
      },
      10
    );
    
    // Benchmark parallel file creation
    const parallelResult = await benchmark(
      "Parallel file creation",
      async () => {
        // Clean up first
        for (const spec of fileSpecs) {
          try {
            await Deno.remove(spec.path);
          } catch {
            // Ignore if doesn't exist
          }
        }
        
        // Create files in parallel
        await fileManager.createFilesParallel(fileSpecs, { verbose: false });
      },
      10
    );
    
    console.log(`\n📊 File Operations Benchmark (${fileCount} files):`);
    console.log(`Sequential: ${sequentialResult.averageTime.toFixed(2)}ms avg`);
    console.log(`Parallel: ${parallelResult.averageTime.toFixed(2)}ms avg`);
    console.log(`Speedup: ${(sequentialResult.averageTime / parallelResult.averageTime).toFixed(2)}x`);
    
    // Parallel should be faster for I/O operations
    assert(parallelResult.averageTime < sequentialResult.averageTime);
    
  } finally {
    // Clean up
    try {
      await Deno.remove(testDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  }
});

Deno.test("End-to-End Compilation Performance", async () => {
  const registry = createMockComponentRegistry();
  const compiler = new Compiler(registry);
  
  const testConfigPath = "/tmp/test-config.json";
  const testOutputDir = "/tmp/test-output";
  const testTemplateDir = "packages/templates";
  
  try {
    // Create test configuration
    const testConfig = createTestAppConfig(100); // Large config for performance testing
    await Deno.writeTextFile(testConfigPath, JSON.stringify(testConfig, null, 2));
    
    // Clean up output directory
    try {
      await Deno.remove(testOutputDir, { recursive: true });
    } catch {
      // Ignore if doesn't exist
    }
    
    // Benchmark compilation
    const compilationResult = await benchmark(
      "Full compilation pipeline",
      async () => {
        // Clean up output directory
        try {
          await Deno.remove(testOutputDir, { recursive: true });
        } catch {
          // Ignore if doesn't exist
        }
        
        const result = await compiler.compile(testConfigPath, {
          templateDir: testTemplateDir,
          outputDir: testOutputDir,
          logLevel: 'ERROR', // Reduce logging for benchmarking
          optimize: true
        });
        
        assert(result.success, `Compilation failed: ${result.errors.map(e => e.message).join(', ')}`);
      },
      5
    );
    
    console.log(`\n📊 End-to-End Compilation Benchmark:`);
    console.log(`Average time: ${compilationResult.averageTime.toFixed(2)}ms`);
    console.log(`Min time: ${compilationResult.minTime.toFixed(2)}ms`);
    console.log(`Max time: ${compilationResult.maxTime.toFixed(2)}ms`);
    console.log(`Throughput: ${compilationResult.opsPerSecond.toFixed(2)} compilations/second`);
    
    // Compilation should complete in reasonable time
    assert(compilationResult.averageTime < 10000, "Compilation taking too long (>10s)");
    
  } finally {
    // Clean up
    try {
      await Deno.remove(testConfigPath);
    } catch {
      // Ignore cleanup errors
    }
    try {
      await Deno.remove(testOutputDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  }
});

Deno.test("Cache Performance Statistics", async () => {
  const cache = new (performanceCache.constructor as any)();
  await cache.initialize();
  
  // Add some test data to cache
  const testComponents = createTestComponents(100);
  
  for (const component of testComponents) {
    const result = {
      success: true,
      componentType: component.type,
      props: component.props,
      errors: [],
      warnings: [],
      dependencies: []
    };
    cache.cacheComponent(component, result);
  }
  
  // Test cache statistics
  const stats = cache.getStats();
  
  console.log(`\n📊 Cache Statistics:`);
  console.log(`Components: ${stats.components.size}/${stats.components.maxSize}`);
  console.log(`Templates: ${stats.templates.size}/${stats.templates.maxSize}`);
  console.log(`Files: ${stats.files.size}/${stats.files.maxSize}`);
  
  assertEquals(stats.components.size, 100);
  assert(stats.components.size <= stats.components.maxSize);
  assert(stats.templates.size <= stats.templates.maxSize);
  assert(stats.files.size <= stats.files.maxSize);
  
  cache.clear();
});

Deno.test("Memory Usage Optimization", async () => {
  // Test that our optimizations don't cause memory leaks
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  const cache = new (performanceCache.constructor as any)();
  await cache.initialize();
  
  // Create and cache many components
  for (let i = 0; i < 1000; i++) {
    const component: ComponentDefinition = {
      id: `component-${i}`,
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
    
    cache.cacheComponent(component, result);
  }
  
  const afterCachingMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  // Clear cache
  cache.clear();
  
  // Force garbage collection if available
  if ((globalThis as any).gc) {
    (globalThis as any).gc();
  }
  
  const afterClearMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  console.log(`\n📊 Memory Usage:`);
  console.log(`Initial: ${(initialMemory / 1024 / 1024).toFixed(2)} MB`);
  console.log(`After caching: ${(afterCachingMemory / 1024 / 1024).toFixed(2)} MB`);
  console.log(`After clear: ${(afterClearMemory / 1024 / 1024).toFixed(2)} MB`);
  
  // Memory should be released after clearing cache
  if (initialMemory > 0 && afterClearMemory > 0) {
    const memoryIncrease = afterClearMemory - initialMemory;
    const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;
    
    console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB (${memoryIncreasePercent.toFixed(1)}%)`);
    
    // Memory increase should be reasonable (less than 50% of initial)
    assert(memoryIncreasePercent < 50, "Memory usage increased too much after operations");
  }
});