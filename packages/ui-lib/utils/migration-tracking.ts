/**
 * Migration Tracking System
 * System to monitor and track migration progress across components
 */

import { analyzeComponentFile, getComponentCategory, getComponentName } from "./migration-analysis.ts";

export interface ComponentMigrationStatus {
  componentName: string;
  category: string;
  filePath: string;
  status: 'pending' | 'in-progress' | 'completed' | 'needs-review';
  daisyuiVersion: '4' | '5';
  tailwindVersion: '3' | '4';
  lastUpdated: Date;
  breakingChanges: string[];
  testsPassing: boolean;
  daisyuiClasses: string[];
  tailwindClasses: string[];
  deprecatedPatterns: string[];
}

export interface CategoryMigrationSummary {
  category: string;
  totalComponents: number;
  completedComponents: number;
  pendingComponents: number;
  inProgressComponents: number;
  needsReviewComponents: number;
  estimatedHours: number;
  blockers: string[];
}

export interface MigrationProgress {
  totalComponents: number;
  completedComponents: number;
  pendingComponents: number;
  inProgressComponents: number;
  needsReviewComponents: number;
  categories: CategoryMigrationSummary[];
  lastUpdated: Date;
}

export class MigrationTracker {
  private statusFile: string;
  private componentStatuses: Map<string, ComponentMigrationStatus> = new Map();

  constructor(statusFile: string = 'packages/ui-lib/migration-status.json') {
    this.statusFile = statusFile;
  }

  /**
   * Load migration status from file
   */
  async loadStatus(): Promise<void> {
    try {
      const content = await Deno.readTextFile(this.statusFile);
      const data = JSON.parse(content);
      
      this.componentStatuses.clear();
      data.components?.forEach((status: any) => {
        // Convert date strings back to Date objects
        status.lastUpdated = new Date(status.lastUpdated);
        this.componentStatuses.set(status.filePath, status);
      });
    } catch (error) {
      // File doesn't exist or is invalid, start fresh
      console.log(`Migration status file not found or invalid, starting fresh: ${error.message}`);
      this.componentStatuses.clear();
    }
  }

  /**
   * Save migration status to file
   */
  async saveStatus(): Promise<void> {
    const data = {
      lastUpdated: new Date().toISOString(),
      components: Array.from(this.componentStatuses.values())
    };

    try {
      // Ensure directory exists
      const dir = this.statusFile.split('/').slice(0, -1).join('/');
      await Deno.mkdir(dir, { recursive: true });
      
      await Deno.writeTextFile(this.statusFile, JSON.stringify(data, null, 2));
    } catch (error) {
      throw new Error(`Failed to save migration status: ${error.message}`);
    }
  }

  /**
   * Initialize tracking for a component file
   */
  async initializeComponent(filePath: string): Promise<ComponentMigrationStatus> {
    try {
      const analysis = await analyzeComponentFile(filePath);
      const componentName = getComponentName(filePath);
      const category = getComponentCategory(filePath);

      const status: ComponentMigrationStatus = {
        componentName,
        category,
        filePath,
        status: 'pending',
        daisyuiVersion: '4', // Assume starting from DaisyUI 4
        tailwindVersion: '3', // Assume starting from Tailwind 3
        lastUpdated: new Date(),
        breakingChanges: [],
        testsPassing: false,
        daisyuiClasses: analysis.daisyuiClasses,
        tailwindClasses: analysis.tailwindClasses,
        deprecatedPatterns: analysis.deprecatedPatterns
      };

      this.componentStatuses.set(filePath, status);
      return status;
    } catch (error) {
      throw new Error(`Failed to initialize component ${filePath}: ${error.message}`);
    }
  }

  /**
   * Update component status
   */
  updateComponentStatus(
    filePath: string,
    updates: Partial<ComponentMigrationStatus>
  ): void {
    const existing = this.componentStatuses.get(filePath);
    if (!existing) {
      throw new Error(`Component ${filePath} not found in tracking system`);
    }

    const updated: ComponentMigrationStatus = {
      ...existing,
      ...updates,
      lastUpdated: new Date()
    };

    this.componentStatuses.set(filePath, updated);
  }

  /**
   * Mark component as completed
   */
  markComponentCompleted(filePath: string, testsPassing: boolean = true): void {
    this.updateComponentStatus(filePath, {
      status: 'completed',
      daisyuiVersion: '5',
      tailwindVersion: '4',
      testsPassing
    });
  }

  /**
   * Mark component as in progress
   */
  markComponentInProgress(filePath: string): void {
    this.updateComponentStatus(filePath, {
      status: 'in-progress'
    });
  }

  /**
   * Mark component as needing review
   */
  markComponentNeedsReview(filePath: string, reason: string): void {
    const existing = this.componentStatuses.get(filePath);
    const breakingChanges = existing?.breakingChanges || [];
    
    this.updateComponentStatus(filePath, {
      status: 'needs-review',
      breakingChanges: [...breakingChanges, reason]
    });
  }

  /**
   * Get component status
   */
  getComponentStatus(filePath: string): ComponentMigrationStatus | undefined {
    return this.componentStatuses.get(filePath);
  }

  /**
   * Get all component statuses
   */
  getAllComponentStatuses(): ComponentMigrationStatus[] {
    return Array.from(this.componentStatuses.values());
  }

  /**
   * Get components by status
   */
  getComponentsByStatus(status: ComponentMigrationStatus['status']): ComponentMigrationStatus[] {
    return this.getAllComponentStatuses().filter(comp => comp.status === status);
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(category: string): ComponentMigrationStatus[] {
    return this.getAllComponentStatuses().filter(comp => comp.category === category);
  }

  /**
   * Generate category summary
   */
  getCategorySummary(category: string): CategoryMigrationSummary {
    const components = this.getComponentsByCategory(category);
    
    return {
      category,
      totalComponents: components.length,
      completedComponents: components.filter(c => c.status === 'completed').length,
      pendingComponents: components.filter(c => c.status === 'pending').length,
      inProgressComponents: components.filter(c => c.status === 'in-progress').length,
      needsReviewComponents: components.filter(c => c.status === 'needs-review').length,
      estimatedHours: this.estimateHoursForCategory(components),
      blockers: this.getBlockersForCategory(components)
    };
  }

  /**
   * Generate overall migration progress
   */
  getMigrationProgress(): MigrationProgress {
    const allComponents = this.getAllComponentStatuses();
    const categories = [...new Set(allComponents.map(c => c.category))];
    
    return {
      totalComponents: allComponents.length,
      completedComponents: allComponents.filter(c => c.status === 'completed').length,
      pendingComponents: allComponents.filter(c => c.status === 'pending').length,
      inProgressComponents: allComponents.filter(c => c.status === 'in-progress').length,
      needsReviewComponents: allComponents.filter(c => c.status === 'needs-review').length,
      categories: categories.map(cat => this.getCategorySummary(cat)),
      lastUpdated: new Date()
    };
  }

  /**
   * Estimate hours needed for a category
   */
  private estimateHoursForCategory(components: ComponentMigrationStatus[]): number {
    // Simple estimation based on component complexity
    let totalHours = 0;
    
    components.forEach(component => {
      if (component.status === 'completed') return;
      
      // Base hours per component
      let hours = 2;
      
      // Add time for deprecated patterns
      hours += component.deprecatedPatterns.length * 0.5;
      
      // Add time for breaking changes
      hours += component.breakingChanges.length * 1;
      
      // Add time based on number of classes to migrate
      const totalClasses = component.daisyuiClasses.length + component.tailwindClasses.length;
      hours += Math.ceil(totalClasses / 10) * 0.5;
      
      totalHours += hours;
    });
    
    return Math.ceil(totalHours);
  }

  /**
   * Get blockers for a category
   */
  private getBlockersForCategory(components: ComponentMigrationStatus[]): string[] {
    const blockers: string[] = [];
    
    components.forEach(component => {
      if (component.status === 'needs-review') {
        blockers.push(`${component.componentName}: ${component.breakingChanges.join(', ')}`);
      }
      
      if (component.deprecatedPatterns.length > 0) {
        blockers.push(`${component.componentName}: deprecated patterns found`);
      }
    });
    
    return [...new Set(blockers)];
  }

  /**
   * Initialize tracking for all components in a directory
   */
  async initializeDirectory(directory: string): Promise<void> {
    const extensions = ['.tsx', '.jsx'];
    const files: string[] = [];
    
    async function walkDirectory(dir: string) {
      try {
        for await (const entry of Deno.readDir(dir)) {
          const fullPath = `${dir}/${entry.name}`;
          
          if (entry.isDirectory) {
            await walkDirectory(fullPath);
          } else if (entry.isFile) {
            const hasValidExtension = extensions.some(ext => entry.name.endsWith(ext));
            // Skip test files, schema files, and metadata files
            const isComponentFile = !entry.name.includes('.test.') && 
                                  !entry.name.includes('.schema.') &&
                                  !entry.name.includes('.metadata.') &&
                                  !entry.name.includes('.playwright.');
            
            if (hasValidExtension && isComponentFile) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
      }
    }
    
    await walkDirectory(directory);
    
    console.log(`Initializing tracking for ${files.length} component files...`);
    
    for (const filePath of files) {
      try {
        await this.initializeComponent(filePath);
        console.log(`✓ Initialized ${filePath}`);
      } catch (error) {
        console.error(`✗ Failed to initialize ${filePath}: ${error.message}`);
      }
    }
    
    await this.saveStatus();
    console.log(`Migration tracking initialized for ${this.componentStatuses.size} components`);
  }

  /**
   * Print migration progress report
   */
  printProgressReport(): void {
    const progress = this.getMigrationProgress();
    
    console.log('\n=== Migration Progress Report ===');
    console.log(`Total Components: ${progress.totalComponents}`);
    console.log(`Completed: ${progress.completedComponents} (${Math.round(progress.completedComponents / progress.totalComponents * 100)}%)`);
    console.log(`In Progress: ${progress.inProgressComponents}`);
    console.log(`Pending: ${progress.pendingComponents}`);
    console.log(`Needs Review: ${progress.needsReviewComponents}`);
    
    console.log('\n=== Category Breakdown ===');
    progress.categories.forEach(category => {
      console.log(`\n${category.category.toUpperCase()}:`);
      console.log(`  Total: ${category.totalComponents}`);
      console.log(`  Completed: ${category.completedComponents}`);
      console.log(`  In Progress: ${category.inProgressComponents}`);
      console.log(`  Pending: ${category.pendingComponents}`);
      console.log(`  Needs Review: ${category.needsReviewComponents}`);
      console.log(`  Estimated Hours: ${category.estimatedHours}`);
      
      if (category.blockers.length > 0) {
        console.log(`  Blockers:`);
        category.blockers.forEach(blocker => {
          console.log(`    - ${blocker}`);
        });
      }
    });
    
    console.log(`\nLast Updated: ${progress.lastUpdated.toISOString()}`);
  }
}