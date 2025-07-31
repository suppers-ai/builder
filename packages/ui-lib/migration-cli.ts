#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Migration CLI Tool
 * Command-line interface for DaisyUI 5 and Tailwind 4 migration
 */

import { parseArgs } from "https://deno.land/std@0.208.0/cli/parse_args.ts";
import { 
  migrateDirectory, 
  migrateFile, 
  previewMigration,
  rollbackMigrations,
  getMigrationStats,
  generateMigrationReport,
  findComponentFiles,
  type BatchMigrationResult
} from "./utils/migration-utilities.ts";
import {
  batchAnalyzeComponents,
  generateAnalysisReport,
  type EnhancedComponentAnalysis
} from "./utils/migration-analysis.ts";

interface CliOptions {
  command: string;
  directory?: string;
  file?: string;
  dryRun?: boolean;
  verbose?: boolean;
  skipBackup?: boolean;
  extensions?: string[];
  output?: string;
  help?: boolean;
}

const HELP_TEXT = `
DaisyUI 5 & Tailwind 4 Migration CLI

USAGE:
  deno run --allow-read --allow-write migration-cli.ts <command> [options]

COMMANDS:
  analyze <directory>     Analyze components for migration complexity
  migrate <directory>     Migrate all components in directory
  migrate-file <file>     Migrate a single file
  preview <file>          Preview migration changes without applying
  stats <directory>       Get migration statistics
  rollback <directory>    Rollback migrations using backup files
  help                    Show this help message

OPTIONS:
  --dry-run              Preview changes without applying them
  --verbose              Show detailed output
  --skip-backup          Don't create backup files
  --extensions           File extensions to process (default: tsx,jsx,ts,js)
  --output <file>        Save report to file
  --help                 Show help for specific command

EXAMPLES:
  # Analyze components for migration complexity
  deno run --allow-read --allow-write migration-cli.ts analyze ./components

  # Preview migration for a single file
  deno run --allow-read --allow-write migration-cli.ts preview ./components/Button.tsx

  # Migrate all components (with backup)
  deno run --allow-read --allow-write migration-cli.ts migrate ./components

  # Dry run migration to see what would change
  deno run --allow-read --allow-write migration-cli.ts migrate ./components --dry-run

  # Get migration statistics
  deno run --allow-read --allow-write migration-cli.ts stats ./components

  # Rollback migrations
  deno run --allow-read --allow-write migration-cli.ts rollback ./components
`;

function parseCliArgs(): CliOptions {
  const args = parseArgs(Deno.args, {
    boolean: ['dry-run', 'verbose', 'skip-backup', 'help'],
    string: ['extensions', 'output'],
    alias: {
      'h': 'help',
      'v': 'verbose',
      'd': 'dry-run',
      'o': 'output'
    }
  });

  const command = args._[0] as string;
  const target = args._[1] as string;

  return {
    command,
    directory: command === 'migrate' || command === 'analyze' || command === 'stats' || command === 'rollback' ? target : undefined,
    file: command === 'migrate-file' || command === 'preview' ? target : undefined,
    dryRun: args['dry-run'],
    verbose: args.verbose,
    skipBackup: args['skip-backup'],
    extensions: args.extensions ? args.extensions.split(',') : ['tsx', 'jsx', 'ts', 'js'],
    output: args.output,
    help: args.help
  };
}

async function runAnalyze(directory: string, options: CliOptions): Promise<void> {
  console.log(`🔍 Analyzing components in ${directory}...`);
  
  const files = await findComponentFiles(directory, options.extensions);
  console.log(`Found ${files.length} component files`);
  
  const result = await batchAnalyzeComponents(files, {
    includeEnhancedAnalysis: true,
    includeValidation: true,
    includeTesting: false,
    onProgress: options.verbose ? (current, total, file) => {
      console.log(`  [${current}/${total}] Analyzing ${file}`);
    } : undefined
  });
  
  console.log('\n📊 Analysis Summary:');
  console.log(`  Total Components: ${result.summary.totalComponents}`);
  console.log(`  High Complexity: ${result.summary.highComplexity}`);
  console.log(`  Medium Complexity: ${result.summary.mediumComplexity}`);
  console.log(`  Low Complexity: ${result.summary.lowComplexity}`);
  console.log(`  Estimated Time: ${Math.round(result.summary.totalEstimatedTime / 60)} hours`);
  console.log(`  Components with Issues: ${result.summary.componentsWithIssues}`);
  
  // Generate detailed report
  const report = generateAnalysisReport(result.analyses, result.validations, result.testResults);
  
  if (options.output) {
    await Deno.writeTextFile(options.output, report);
    console.log(`\n📄 Detailed report saved to ${options.output}`);
  } else if (options.verbose) {
    console.log('\n' + report);
  }
  
  // Show high complexity components
  const highComplexityComponents = result.analyses.filter(a => a.migrationComplexity === 'high');
  if (highComplexityComponents.length > 0) {
    console.log('\n⚠️  High Complexity Components:');
    highComplexityComponents.forEach(component => {
      console.log(`  • ${component.componentName} (${component.category}) - ${component.estimatedMigrationTime}min`);
      if (component.breakingChanges.length > 0) {
        component.breakingChanges.forEach(change => {
          console.log(`    - ${change.description} (${change.severity})`);
        });
      }
    });
  }
}

async function runMigrate(directory: string, options: CliOptions): Promise<void> {
  console.log(`🚀 ${options.dryRun ? 'Previewing' : 'Migrating'} components in ${directory}...`);
  
  const result = await migrateDirectory(directory, {
    dryRun: options.dryRun,
    verbose: options.verbose,
    skipBackup: options.skipBackup,
    extensions: options.extensions,
    onProgress: (current, total, file) => {
      console.log(`  [${current}/${total}] ${options.dryRun ? 'Analyzing' : 'Migrating'} ${file}`);
    }
  });
  
  console.log(`\n✅ ${result.summary}`);
  
  if (result.changes.length > 0) {
    console.log('\n📝 Files with changes:');
    result.changes.forEach(change => {
      console.log(`  • ${change.file}: ${change.changes} changes`);
    });
  }
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => {
      console.log(`  • ${error.file}: ${error.error}`);
    });
  }
  
  // Generate migration report
  const report = generateMigrationReport(result);
  
  if (options.output) {
    await Deno.writeTextFile(options.output, report);
    console.log(`\n📄 Migration report saved to ${options.output}`);
  }
}

async function runMigrateFile(file: string, options: CliOptions): Promise<void> {
  console.log(`🔧 ${options.dryRun ? 'Previewing' : 'Migrating'} ${file}...`);
  
  if (options.dryRun) {
    const preview = await previewMigration(file);
    
    console.log(`\n📋 Changes preview:`);
    console.log(`  Changes: ${preview.changes.length}`);
    console.log(`  Warnings: ${preview.warnings.length}`);
    
    if (preview.changes.length > 0) {
      console.log('\n🔄 Class changes:');
      preview.changes.forEach(change => {
        console.log(`  • ${change}`);
      });
    }
    
    if (preview.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      preview.warnings.forEach(warning => {
        console.log(`  • ${warning}`);
      });
    }
    
    if (options.verbose) {
      console.log('\n📄 Diff:');
      preview.diff.forEach(line => {
        const prefix = line.type === 'add' ? '+ ' : line.type === 'remove' ? '- ' : '  ';
        console.log(`${prefix}${line.line}`);
      });
    }
  } else {
    const result = await migrateFile(file, {
      verbose: options.verbose,
      skipBackup: options.skipBackup
    });
    
    console.log(`\n✅ Migration complete:`);
    console.log(`  Changes: ${result.changes.length}`);
    console.log(`  Warnings: ${result.warnings.length}`);
    
    if (result.changes.length > 0) {
      console.log('\n🔄 Applied changes:');
      result.changes.forEach(change => {
        console.log(`  • ${change}`);
      });
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => {
        console.log(`  • ${warning}`);
      });
    }
  }
}

async function runStats(directory: string, options: CliOptions): Promise<void> {
  console.log(`📊 Gathering migration statistics for ${directory}...`);
  
  const stats = await getMigrationStats(directory, {
    extensions: options.extensions
  });
  
  console.log('\n📈 Migration Statistics:');
  console.log(`  Total Files: ${stats.totalFiles}`);
  console.log(`  Files with DaisyUI Classes: ${stats.filesWithDaisyUIClasses}`);
  console.log(`  Files with Tailwind Classes: ${stats.filesWithTailwindClasses}`);
  console.log(`  Files with Both Frameworks: ${stats.filesWithBothFrameworks}`);
  console.log(`  Estimated Changes: ${stats.estimatedChanges}`);
  
  console.log('\n🏆 Most Common Classes:');
  stats.mostCommonClasses.slice(0, 10).forEach((classInfo, index) => {
    const typeIcon = classInfo.type === 'daisyui' ? '🌼' : classInfo.type === 'tailwind' ? '🎨' : '❓';
    console.log(`  ${index + 1}. ${typeIcon} ${classInfo.className} (${classInfo.count} uses)`);
  });
  
  if (options.output) {
    const report = `# Migration Statistics Report

## Summary
- Total Files: ${stats.totalFiles}
- Files with DaisyUI Classes: ${stats.filesWithDaisyUIClasses}
- Files with Tailwind Classes: ${stats.filesWithTailwindClasses}
- Files with Both Frameworks: ${stats.filesWithBothFrameworks}
- Estimated Changes: ${stats.estimatedChanges}

## Most Common Classes
${stats.mostCommonClasses.map((classInfo, index) => 
  `${index + 1}. **${classInfo.className}** (${classInfo.type}) - ${classInfo.count} uses`
).join('\n')}
`;
    
    await Deno.writeTextFile(options.output, report);
    console.log(`\n📄 Statistics report saved to ${options.output}`);
  }
}

async function runRollback(directory: string, options: CliOptions): Promise<void> {
  console.log(`⏪ Rolling back migrations in ${directory}...`);
  
  const result = await rollbackMigrations(directory, {
    extensions: options.extensions,
    removeBackups: !options.verbose // Keep backups if verbose mode
  });
  
  console.log(`\n✅ Rollback complete:`);
  console.log(`  Restored Files: ${result.restoredFiles.length}`);
  console.log(`  Errors: ${result.errors.length}`);
  
  if (result.restoredFiles.length > 0 && options.verbose) {
    console.log('\n📁 Restored files:');
    result.restoredFiles.forEach(file => {
      console.log(`  • ${file}`);
    });
  }
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => {
      console.log(`  • ${error.file}: ${error.error}`);
    });
  }
}

async function main(): Promise<void> {
  const options = parseCliArgs();
  
  if (options.help || !options.command) {
    console.log(HELP_TEXT);
    return;
  }
  
  try {
    switch (options.command) {
      case 'analyze':
        if (!options.directory) {
          console.error('❌ Error: Directory path required for analyze command');
          Deno.exit(1);
        }
        await runAnalyze(options.directory, options);
        break;
        
      case 'migrate':
        if (!options.directory) {
          console.error('❌ Error: Directory path required for migrate command');
          Deno.exit(1);
        }
        await runMigrate(options.directory, options);
        break;
        
      case 'migrate-file':
        if (!options.file) {
          console.error('❌ Error: File path required for migrate-file command');
          Deno.exit(1);
        }
        await runMigrateFile(options.file, options);
        break;
        
      case 'preview':
        if (!options.file) {
          console.error('❌ Error: File path required for preview command');
          Deno.exit(1);
        }
        await runMigrateFile(options.file, { ...options, dryRun: true });
        break;
        
      case 'stats':
        if (!options.directory) {
          console.error('❌ Error: Directory path required for stats command');
          Deno.exit(1);
        }
        await runStats(options.directory, options);
        break;
        
      case 'rollback':
        if (!options.directory) {
          console.error('❌ Error: Directory path required for rollback command');
          Deno.exit(1);
        }
        await runRollback(options.directory, options);
        break;
        
      case 'help':
        console.log(HELP_TEXT);
        break;
        
      default:
        console.error(`❌ Error: Unknown command '${options.command}'`);
        console.log('\nUse --help to see available commands');
        Deno.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${(error as Error).message}`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}