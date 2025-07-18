// Parallel processing system for independent compilation tasks
import { logger } from "../../shared/src/utils.ts";
import type { CompilationError } from "../../shared/src/types.ts";

/**
 * Task definition for parallel processing
 */
export interface ParallelTask<T = unknown, R = unknown> {
  /** Unique task identifier */
  id: string;
  /** Task description for logging */
  description: string;
  /** Task execution function */
  execute: (input: T) => Promise<R>;
  /** Task input data */
  input: T;
  /** Task dependencies (other task IDs that must complete first) */
  dependencies?: string[];
  /** Task priority (higher numbers run first) */
  priority?: number;
}

/**
 * Result of a parallel task execution
 */
export interface TaskResult<R = unknown> {
  /** Task ID */
  id: string;
  /** Whether the task was successful */
  success: boolean;
  /** Task result data */
  result?: R;
  /** Any errors that occurred */
  errors: CompilationError[];
  /** Execution time in milliseconds */
  executionTime: number;
}

/**
 * Batch processing result
 */
export interface BatchResult<R = unknown> {
  /** Whether all tasks were successful */
  success: boolean;
  /** Results of individual tasks */
  results: TaskResult<R>[];
  /** Total execution time in milliseconds */
  totalTime: number;
  /** Number of tasks that succeeded */
  successCount: number;
  /** Number of tasks that failed */
  failureCount: number;
}

/**
 * Parallel processing options
 */
export interface ParallelProcessingOptions {
  /** Maximum number of concurrent tasks (default: CPU cores) */
  maxConcurrency?: number;
  /** Whether to stop on first error (default: false) */
  stopOnError?: boolean;
  /** Timeout for individual tasks in milliseconds (default: 30 seconds) */
  taskTimeout?: number;
  /** Whether to log task progress (default: true) */
  logProgress?: boolean;
}

/**
 * Task execution context
 */
interface TaskContext<T, R> {
  task: ParallelTask<T, R>;
  startTime: number;
  promise: Promise<TaskResult<R>>;
}

/**
 * Parallel processor for compilation tasks
 */
export class ParallelProcessor {
  private maxConcurrency: number;
  private runningTasks = new Set<string>();
  private completedTasks = new Set<string>();
  private taskResults = new Map<string, TaskResult>();
  
  constructor(options: ParallelProcessingOptions = {}) {
    this.maxConcurrency = options.maxConcurrency ?? navigator.hardwareConcurrency ?? 4;
  }
  
  /**
   * Execute tasks in parallel with dependency resolution
   */
  async executeTasks<T, R>(
    tasks: ParallelTask<T, R>[],
    options: ParallelProcessingOptions = {}
  ): Promise<BatchResult<R>> {
    const {
      stopOnError = false,
      taskTimeout = 30000,
      logProgress = true
    } = options;
    
    const startTime = Date.now();
    const results: TaskResult<R>[] = [];
    const taskMap = new Map<string, ParallelTask<T, R>>();
    const dependencyGraph = new Map<string, string[]>();
    
    // Build task map and dependency graph
    for (const task of tasks) {
      taskMap.set(task.id, task);
      dependencyGraph.set(task.id, task.dependencies || []);
    }
    
    // Validate dependencies
    const validationErrors = this.validateDependencies(tasks);
    if (validationErrors.length > 0) {
      return {
        success: false,
        results: validationErrors.map(error => ({
          id: 'validation',
          success: false,
          errors: [error],
          executionTime: 0
        })),
        totalTime: Date.now() - startTime,
        successCount: 0,
        failureCount: validationErrors.length
      };
    }
    
    // Sort tasks by priority
    const sortedTasks = [...tasks].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    if (logProgress) {
      logger.info(`Starting parallel execution of ${tasks.length} tasks with max concurrency ${this.maxConcurrency}`);
    }
    
    // Execute tasks in batches
    const pendingTasks = new Set(sortedTasks.map(t => t.id));
    const runningContexts = new Map<string, TaskContext<T, R>>();
    
    while (pendingTasks.size > 0 || runningContexts.size > 0) {
      // Start new tasks if we have capacity and ready tasks
      while (runningContexts.size < this.maxConcurrency && pendingTasks.size > 0) {
        const readyTask = this.findReadyTask(pendingTasks, dependencyGraph);
        
        if (!readyTask) {
          // No ready tasks, wait for running tasks to complete
          break;
        }
        
        const task = taskMap.get(readyTask)!;
        pendingTasks.delete(readyTask);
        
        // Start the task
        const context = this.startTask(task, taskTimeout);
        runningContexts.set(readyTask, context);
        
        if (logProgress) {
          logger.debug(`Started task: ${task.description} (${readyTask})`);
        }
      }
      
      // Wait for at least one task to complete
      if (runningContexts.size > 0) {
        const completedContext = await this.waitForAnyTask(runningContexts);
        const result = await completedContext.promise;
        
        results.push(result);
        runningContexts.delete(result.id);
        this.completedTasks.add(result.id);
        
        if (logProgress) {
          const status = result.success ? 'completed' : 'failed';
          logger.debug(`Task ${status}: ${result.id} (${result.executionTime}ms)`);
        }
        
        // Stop on error if requested
        if (!result.success && stopOnError) {
          // Cancel remaining tasks
          for (const [id, context] of runningContexts) {
            try {
              // Note: We can't actually cancel promises in JavaScript
              // In a real implementation, you might use AbortController
              logger.warn(`Stopping execution due to error, task ${id} may still be running`);
            } catch {
              // Ignore cancellation errors
            }
          }
          break;
        }
      }
    }
    
    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    if (logProgress) {
      logger.info(`Parallel execution completed: ${successCount} succeeded, ${failureCount} failed (${totalTime}ms)`);
    }
    
    return {
      success: failureCount === 0,
      results,
      totalTime,
      successCount,
      failureCount
    };
  }
  
  /**
   * Execute a batch of independent tasks (no dependencies)
   */
  async executeBatch<T, R>(
    tasks: Array<{
      id: string;
      description: string;
      execute: (input: T) => Promise<R>;
      input: T;
    }>,
    options: ParallelProcessingOptions = {}
  ): Promise<BatchResult<R>> {
    const parallelTasks: ParallelTask<T, R>[] = tasks.map(task => ({
      ...task,
      dependencies: []
    }));
    
    return this.executeTasks(parallelTasks, options);
  }
  
  /**
   * Execute tasks with a worker pool pattern
   */
  async executeWithWorkerPool<T, R>(
    taskInputs: T[],
    worker: (input: T) => Promise<R>,
    options: ParallelProcessingOptions = {}
  ): Promise<BatchResult<R>> {
    const tasks: ParallelTask<T, R>[] = taskInputs.map((input, index) => ({
      id: `task-${index}`,
      description: `Worker task ${index}`,
      execute: worker,
      input
    }));
    
    return this.executeBatch(tasks, options);
  }
  
  /**
   * Validate task dependencies
   */
  private validateDependencies<T, R>(tasks: ParallelTask<T, R>[]): CompilationError[] {
    const errors: CompilationError[] = [];
    const taskIds = new Set(tasks.map(t => t.id));
    
    // Check for duplicate task IDs
    const seenIds = new Set<string>();
    for (const task of tasks) {
      if (seenIds.has(task.id)) {
        errors.push({
          type: 'validation',
          message: `Duplicate task ID: ${task.id}`
        });
      }
      seenIds.add(task.id);
    }
    
    // Check for invalid dependencies
    for (const task of tasks) {
      if (task.dependencies) {
        for (const dep of task.dependencies) {
          if (!taskIds.has(dep)) {
            errors.push({
              type: 'dependency',
              message: `Task ${task.id} depends on non-existent task: ${dep}`
            });
          }
        }
      }
    }
    
    // Check for circular dependencies
    const circularDeps = this.findCircularDependencies(tasks);
    for (const cycle of circularDeps) {
      errors.push({
        type: 'dependency',
        message: `Circular dependency detected: ${cycle.join(' -> ')}`
      });
    }
    
    return errors;
  }
  
  /**
   * Find circular dependencies in task graph
   */
  private findCircularDependencies<T, R>(tasks: ParallelTask<T, R>[]): string[][] {
    const graph = new Map<string, string[]>();
    const cycles: string[][] = [];
    
    // Build adjacency list
    for (const task of tasks) {
      graph.set(task.id, task.dependencies || []);
    }
    
    // DFS to detect cycles
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];
    
    const dfs = (node: string): boolean => {
      if (recursionStack.has(node)) {
        // Found a cycle
        const cycleStart = path.indexOf(node);
        cycles.push([...path.slice(cycleStart), node]);
        return true;
      }
      
      if (visited.has(node)) {
        return false;
      }
      
      visited.add(node);
      recursionStack.add(node);
      path.push(node);
      
      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) {
          return true;
        }
      }
      
      recursionStack.delete(node);
      path.pop();
      return false;
    };
    
    for (const task of tasks) {
      if (!visited.has(task.id)) {
        dfs(task.id);
      }
    }
    
    return cycles;
  }
  
  /**
   * Find a task that's ready to execute (all dependencies completed)
   */
  private findReadyTask(
    pendingTasks: Set<string>,
    dependencyGraph: Map<string, string[]>
  ): string | null {
    for (const taskId of pendingTasks) {
      const dependencies = dependencyGraph.get(taskId) || [];
      const allDepsCompleted = dependencies.every(dep => this.completedTasks.has(dep));
      
      if (allDepsCompleted) {
        return taskId;
      }
    }
    
    return null;
  }
  
  /**
   * Start executing a task
   */
  private startTask<T, R>(
    task: ParallelTask<T, R>,
    timeout: number
  ): TaskContext<T, R> {
    const startTime = Date.now();
    
    const promise = this.executeTaskWithTimeout(task, timeout, startTime);
    
    return {
      task,
      startTime,
      promise
    };
  }
  
  /**
   * Execute a task with timeout
   */
  private async executeTaskWithTimeout<T, R>(
    task: ParallelTask<T, R>,
    timeout: number,
    startTime: number
  ): Promise<TaskResult<R>> {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Task timeout after ${timeout}ms`));
        }, timeout);
      });
      
      // Race between task execution and timeout
      const result = await Promise.race([
        task.execute(task.input),
        timeoutPromise
      ]);
      
      return {
        id: task.id,
        success: true,
        result,
        errors: [],
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        id: task.id,
        success: false,
        errors: [{
          type: 'general',
          message: `Task ${task.id} failed: ${errorMessage}`
        }],
        executionTime: Date.now() - startTime
      };
    }
  }
  
  /**
   * Wait for any running task to complete
   */
  private async waitForAnyTask<T, R>(
    runningContexts: Map<string, TaskContext<T, R>>
  ): Promise<TaskContext<T, R>> {
    const promises = Array.from(runningContexts.values()).map(async context => {
      await context.promise;
      return context;
    });
    
    return Promise.race(promises);
  }
  
  /**
   * Get current processing statistics
   */
  getStats(): {
    maxConcurrency: number;
    runningTasks: number;
    completedTasks: number;
  } {
    return {
      maxConcurrency: this.maxConcurrency,
      runningTasks: this.runningTasks.size,
      completedTasks: this.completedTasks.size
    };
  }
  
  /**
   * Reset the processor state
   */
  reset(): void {
    this.runningTasks.clear();
    this.completedTasks.clear();
    this.taskResults.clear();
  }
}

// Export a default instance
export const parallelProcessor = new ParallelProcessor();