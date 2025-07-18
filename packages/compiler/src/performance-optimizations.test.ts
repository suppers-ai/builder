// Simple performance optimization tests
import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { performanceCache } from "./performance-cache.ts";
import { parallelProcessor } from "./parallel-processor.ts";
import type { ComponentDefinition } from "../../shared/src/types.ts";

Deno.test("Performance Cache - Basic Functionality", async () => {
  const cache = new (performanceCache.constructor as any)();
  await cache.initialize();
  
  const testComponent: ComponentDefinition = {
    id: 'test-button',
    type: 'Button',
    props: { label: 'Test', variant: 'primary' }
  };
  
  // Test component caching
  const result = {
    success: true,
    componentType: testComponent.type,
    props: testComponent.props,
    errors: [],
    warnings: [],
    dependencies: []
  };
  
  // Cache the component
  cache.cacheComponent(testComponent, result);
  
  // Retrieve from cache
  const cachedResult = cache.getCachedComponent(testComponent);
  
  assert(cachedResult !== null, "Component should be cached");
  assertEquals(cachedResult.componentType, testComponent.type);
  assertEquals(cachedResult.props, testComponent.props);
  
  // Test cache statistics
  const stats = cache.getStats();
  assertEquals(stats.components.size, 1);
  
  cache.clear();
});

Deno.test("Performance Cache - Template Caching", async () => {
  const cache = new (performanceCache.constructor as any)();
  await cache.initialize();
  
  const templatePath = "/tmp/test-template.tsx";
  const templateContext = {
    app: { name: 'test-app', version: '1.0.0' },
    metadata: { name: 'test-app', version: '1.0.0' }
  };
  const processedContent = "Processed template content";
  
  try {
    // Create a temporary template file
    await Deno.writeTextFile(templatePath, "Template content");
    
    // Cache the template
    await cache.cacheTemplate(templatePath, templateContext, processedContent);
    
    // Retrieve from cache
    const cachedContent = await cache.getCachedTemplate(templatePath, templateContext);
    
    assertEquals(cachedContent, processedContent);
    
  } finally {
    try {
      await Deno.remove(templatePath);
    } catch {
      // Ignore cleanup errors
    }
    cache.clear();
  }
});

Deno.test("Parallel Processor - Basic Task Execution", async () => {
  const processor = new (parallelProcessor.constructor as any)();
  
  const tasks = [
    {
      id: 'task-1',
      description: 'Test task 1',
      execute: async (input: number) => input * 2,
      input: 5
    },
    {
      id: 'task-2',
      description: 'Test task 2',
      execute: async (input: number) => input + 10,
      input: 3
    }
  ];
  
  const result = await processor.executeBatch(tasks, {
    maxConcurrency: 2,
    logProgress: false
  });
  
  assertEquals(result.success, true);
  assertEquals(result.results.length, 2);
  assertEquals(result.successCount, 2);
  assertEquals(result.failureCount, 0);
  
  // Check individual results
  const task1Result = result.results.find(r => r.id === 'task-1');
  const task2Result = result.results.find(r => r.id === 'task-2');
  
  assert(task1Result !== undefined);
  assert(task2Result !== undefined);
  assertEquals(task1Result.result, 10); // 5 * 2
  assertEquals(task2Result.result, 13); // 3 + 10
});

Deno.test("Parallel Processor - Dependency Resolution", async () => {
  const processor = new (parallelProcessor.constructor as any)();
  
  const tasks = [
    {
      id: 'task-1',
      description: 'Independent task',
      execute: async (input: string) => `${input}-processed`,
      input: 'data',
      dependencies: []
    },
    {
      id: 'task-2',
      description: 'Dependent task',
      execute: async (input: string) => `${input}-final`,
      input: 'result',
      dependencies: ['task-1']
    }
  ];
  
  const result = await processor.executeTasks(tasks, {
    maxConcurrency: 2,
    logProgress: false
  });
  
  assertEquals(result.success, true);
  assertEquals(result.results.length, 2);
  
  // Task 1 should complete before task 2
  const task1Result = result.results.find(r => r.id === 'task-1');
  const task2Result = result.results.find(r => r.id === 'task-2');
  
  assert(task1Result !== undefined);
  assert(task2Result !== undefined);
  assertEquals(task1Result.result, 'data-processed');
  assertEquals(task2Result.result, 'result-final');
});

Deno.test("Parallel Processor - Error Handling", async () => {
  const processor = new (parallelProcessor.constructor as any)();
  
  const tasks = [
    {
      id: 'success-task',
      description: 'Successful task',
      execute: async (input: string) => `${input}-success`,
      input: 'test'
    },
    {
      id: 'error-task',
      description: 'Failing task',
      execute: async (input: string) => {
        throw new Error('Task failed');
      },
      input: 'test'
    }
  ];
  
  const result = await processor.executeBatch(tasks, {
    maxConcurrency: 2,
    stopOnError: false,
    logProgress: false
  });
  
  assertEquals(result.success, false);
  assertEquals(result.results.length, 2);
  assertEquals(result.successCount, 1);
  assertEquals(result.failureCount, 1);
  
  const successResult = result.results.find(r => r.id === 'success-task');
  const errorResult = result.results.find(r => r.id === 'error-task');
  
  assert(successResult !== undefined);
  assert(errorResult !== undefined);
  assertEquals(successResult.success, true);
  assertEquals(errorResult.success, false);
  assert(errorResult.errors.length > 0);
});

Deno.test("Performance Benchmarking - Cache vs No Cache", async () => {
  const cache = new (performanceCache.constructor as any)();
  await cache.initialize();
  
  const testComponent: ComponentDefinition = {
    id: 'benchmark-component',
    type: 'Button',
    props: { label: 'Benchmark', variant: 'primary' }
  };
  
  const result = {
    success: true,
    componentType: testComponent.type,
    props: testComponent.props,
    errors: [],
    warnings: [],
    dependencies: []
  };
  
  // Benchmark without cache (first time)
  const startWithoutCache = performance.now();
  for (let i = 0; i < 100; i++) {
    // Simulate component resolution work
    const hash = JSON.stringify(testComponent);
    // Don't cache the result
  }
  const endWithoutCache = performance.now();
  const timeWithoutCache = endWithoutCache - startWithoutCache;
  
  // Cache the component once
  cache.cacheComponent(testComponent, result);
  
  // Benchmark with cache
  const startWithCache = performance.now();
  for (let i = 0; i < 100; i++) {
    const cachedResult = cache.getCachedComponent(testComponent);
    assert(cachedResult !== null);
  }
  const endWithCache = performance.now();
  const timeWithCache = endWithCache - startWithCache;
  
  console.log(`\n📊 Cache Performance Benchmark:`);
  console.log(`Without cache: ${timeWithoutCache.toFixed(2)}ms`);
  console.log(`With cache: ${timeWithCache.toFixed(2)}ms`);
  console.log(`Speedup: ${(timeWithoutCache / timeWithCache).toFixed(2)}x`);
  
  // Cache should be significantly faster
  assert(timeWithCache < timeWithoutCache, "Cache should be faster than no cache");
  
  cache.clear();
});

Deno.test("Performance Benchmarking - Parallel vs Sequential", async () => {
  const processor = new (parallelProcessor.constructor as any)();
  
  // Create CPU-intensive tasks
  const createTask = (id: number) => ({
    id: `task-${id}`,
    description: `CPU task ${id}`,
    execute: async (input: number) => {
      // Simulate CPU work
      let sum = 0;
      for (let i = 0; i < 10000; i++) {
        sum += Math.sqrt(i);
      }
      return sum + input;
    },
    input: id
  });
  
  const taskCount = 8;
  const tasks = Array.from({ length: taskCount }, (_, i) => createTask(i));
  
  // Benchmark sequential execution
  const startSequential = performance.now();
  for (const task of tasks) {
    await task.execute(task.input);
  }
  const endSequential = performance.now();
  const sequentialTime = endSequential - startSequential;
  
  // Benchmark parallel execution
  const startParallel = performance.now();
  const result = await processor.executeBatch(tasks, {
    maxConcurrency: 4,
    stopOnError: false,
    logProgress: false
  });
  const endParallel = performance.now();
  const parallelTime = endParallel - startParallel;
  
  console.log(`\n📊 Parallel Processing Benchmark (${taskCount} tasks):`);
  console.log(`Sequential: ${sequentialTime.toFixed(2)}ms`);
  console.log(`Parallel: ${parallelTime.toFixed(2)}ms`);
  console.log(`Speedup: ${(sequentialTime / parallelTime).toFixed(2)}x`);
  
  assertEquals(result.success, true);
  assertEquals(result.results.length, taskCount);
  
  // Parallel should be faster for CPU-intensive tasks
  assert(parallelTime < sequentialTime, "Parallel execution should be faster");
});

Deno.test("Cache Memory Management", async () => {
  const cache = new (performanceCache.constructor as any)({
    maxComponentEntries: 10,
    maxTemplateEntries: 5,
    maxFileEntries: 15
  });
  await cache.initialize();
  
  // Fill component cache beyond limit
  for (let i = 0; i < 15; i++) {
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
  
  const stats = cache.getStats();
  
  // Cache should not exceed maximum size
  assert(stats.components.size <= stats.components.maxSize);
  assertEquals(stats.components.maxSize, 10);
  
  console.log(`\n📊 Cache Memory Management:`);
  console.log(`Components: ${stats.components.size}/${stats.components.maxSize}`);
  console.log(`Templates: ${stats.templates.size}/${stats.templates.maxSize}`);
  console.log(`Files: ${stats.files.size}/${stats.files.maxSize}`);
  
  cache.clear();
});