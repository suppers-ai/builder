// Command-line interface for the JSON App Compiler
import { parse } from "https://deno.land/std@0.170.0/flags/mod.ts";
import { fs, logger, LogLevel } from "../../shared/src/utils.ts";
import { Compiler, CompilationPhase, type CompilationOptions, type CompilationProgressEvent } from "./compiler.ts";
import { createComponentRegistry } from "../../ui-library/src/registry.ts";

// CLI options interface
interface CliOptions {
  config: string;
  output: string;
  template: string;
  verbose: boolean;
  quiet: boolean;
  help: boolean;
  version: boolean;
  dryRun: boolean;
  overwrite: boolean;
  optimize: boolean;
  noValidate: boolean;
  noLayouts: boolean;
  noMiddleware: boolean;
  noTypeScript: boolean;
}

// CLI version
const VERSION = "1.0.0";

// Help text
const HELP_TEXT = `JSON App Compiler - Generate Fresh applications from JSON configurations

USAGE:
  deno run -A cli.ts [OPTIONS] --config <FILE> --output <DIR> --template <DIR>

OPTIONS:
  -c, --config <FILE>       Path to the JSON configuration file (required)
  -o, --output <DIR>        Path to the output directory (required)
  -t, --template <DIR>      Path to the template directory (required)
  -v, --verbose             Enable verbose output
  -q, --quiet               Suppress all output except errors
  --dry-run                 Perform a dry run without writing files
  --overwrite               Overwrite existing files
  --no-optimize             Disable output optimization
  --no-validate             Disable validation of components and templates
  --no-layouts              Disable layout generation
  --no-middleware           Disable middleware generation
  --no-typescript           Use JavaScript instead of TypeScript
  --version                 Print version information
  --help                    Print this help message

EXAMPLES:
  deno run -A cli.ts --config app.json --output ./dist --template ./templates
  deno run -A cli.ts -c app.json -o ./dist -t ./templates --verbose
  deno run -A cli.ts --config app.json --output ./dist --template ./templates --dry-run
`;

/**
 * Parse command-line arguments
 * 
 * @returns Parsed CLI options
 */
function parseArgs(): CliOptions {
  const args = parse(Deno.args, {
    string: ["config", "output", "template"],
    boolean: [
      "verbose", "quiet", "help", "version", "dry-run", "overwrite",
      "optimize", "no-optimize", "no-validate", "no-layouts", "no-middleware", "no-typescript"
    ],
    alias: {
      c: "config",
      o: "output",
      t: "template",
      v: "verbose",
      q: "quiet",
      h: "help"
    },
    default: {
      verbose: false,
      quiet: false,
      help: false,
      version: false,
      "dry-run": false,
      overwrite: false,
      optimize: true
    }
  });
  
  return {
    config: args.config || "",
    output: args.output || "",
    template: args.template || "",
    verbose: args.verbose,
    quiet: args.quiet,
    help: args.help,
    version: args.version,
    dryRun: args["dry-run"],
    overwrite: args.overwrite,
    optimize: !args["no-optimize"],
    noValidate: args["no-validate"],
    noLayouts: args["no-layouts"],
    noMiddleware: args["no-middleware"],
    noTypeScript: args["no-typescript"]
  };
}

/**
 * Print progress bar
 * 
 * @param progress Progress percentage (0-100)
 * @param width Width of the progress bar
 * @returns Progress bar string
 */
function progressBar(progress: number, width = 30): string {
  const completed = Math.floor(progress / 100 * width);
  const remaining = width - completed;
  
  return `[${"=".repeat(completed)}${" ".repeat(remaining)}] ${progress.toFixed(0)}%`;
}

/**
 * Format compilation phase for display
 * 
 * @param phase Compilation phase
 * @returns Formatted phase string
 */
function formatPhase(phase: CompilationPhase): string {
  return phase.charAt(0).toUpperCase() + phase.slice(1).toLowerCase();
}

/**
 * Run the compiler with CLI options
 * 
 * @param options CLI options
 * @returns Exit code (0 for success, 1 for failure)
 */
async function runCompiler(options: CliOptions): Promise<number> {
  try {
    // Validate required options
    if (!options.config) {
      console.error("Error: Missing required option: --config");
      return 1;
    }
    
    if (!options.output) {
      console.error("Error: Missing required option: --output");
      return 1;
    }
    
    if (!options.template) {
      console.error("Error: Missing required option: --template");
      return 1;
    }
    
    // Check if config file exists
    try {
      await Deno.stat(options.config);
    } catch (error) {
      console.error(`Error: Config file not found: ${options.config}`);
      return 1;
    }
    
    // Check if template directory exists
    try {
      const templateStat = await Deno.stat(options.template);
      if (!templateStat.isDirectory) {
        console.error(`Error: Template path is not a directory: ${options.template}`);
        return 1;
      }
    } catch (error) {
      console.error(`Error: Template directory not found: ${options.template}`);
      return 1;
    }
    
    // Create output directory if it doesn't exist
    try {
      await Deno.mkdir(options.output, { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.AlreadyExists)) {
        console.error(`Error: Failed to create output directory: ${options.output}`);
        return 1;
      }
    }
    
    // Set log level based on CLI options
    let logLevel = LogLevel.INFO;
    if (options.verbose) {
      logLevel = LogLevel.DEBUG;
    } else if (options.quiet) {
      logLevel = LogLevel.ERROR;
    }
    logger.setLevel(logLevel);
    
    // Create component registry
    const componentRegistry = createComponentRegistry();
    
    // Create compiler instance
    const compiler = new Compiler(componentRegistry);
    
    // Set up progress reporting
    if (!options.quiet) {
      let lastOperation = "";
      
      compiler.setProgressCallback((event: CompilationProgressEvent) => {
        // Clear previous line if operation changed
        if (lastOperation !== event.operation) {
          Deno.stdout.writeSync(new TextEncoder().encode("\r\x1b[K"));
        }
        
        // Print progress
        const phaseText = formatPhase(event.phase);
        const progressText = progressBar(event.progress);
        Deno.stdout.writeSync(new TextEncoder().encode(
          `\r${phaseText}: ${progressText} - ${event.operation}`
        ));
        
        lastOperation = event.operation;
        
        // Print errors and warnings
        for (const error of event.errors) {
          console.error(`\nError: ${error.message}`);
        }
        
        for (const warning of event.warnings) {
          console.warn(`\nWarning: ${warning}`);
        }
      });
    }
    
    // Set compilation options
    const compilationOptions: CompilationOptions = {
      templateDir: options.template,
      outputDir: options.output,
      validateProps: !options.noValidate,
      validateTemplates: !options.noValidate,
      generateLayouts: !options.noLayouts,
      generateMiddleware: !options.noMiddleware,
      useTypeScript: !options.noTypeScript,
      optimize: options.optimize,
      logLevel,
      throwOnError: false,
      overwrite: options.overwrite,
      verbose: options.verbose,
      dryRun: options.dryRun
    };
    
    // Run compilation
    console.log(`Compiling ${options.config} to ${options.output}...`);
    const startTime = Date.now();
    const result = await compiler.compile(options.config, compilationOptions);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // Print final line break after progress reporting
    if (!options.quiet) {
      console.log();
    }
    
    // Print result
    if (result.success) {
      console.log(`\nCompilation successful! (${duration.toFixed(2)}s)`);
      console.log(`Output: ${result.outputPath}`);
      
      if (result.warnings.length > 0) {
        console.log(`\nWarnings: ${result.warnings.length}`);
        for (const warning of result.warnings) {
          console.warn(`- ${warning}`);
        }
      }
      
      return 0;
    } else {
      console.error(`\nCompilation failed! (${duration.toFixed(2)}s)`);
      console.error(`Phase: ${formatPhase(result.phase)}`);
      console.error(`Errors: ${result.errors.length}`);
      
      for (const error of result.errors) {
        console.error(`- ${error.message}`);
        
        if (error.location) {
          if (error.location.file) {
            console.error(`  File: ${error.location.file}`);
          }
          
          if (error.location.line !== undefined) {
            console.error(`  Line: ${error.location.line}`);
          }
          
          if (error.location.path) {
            console.error(`  Path: ${error.location.path}`);
          }
        }
        
        if (error.suggestions && error.suggestions.length > 0) {
          console.error(`  Suggestions:`);
          for (const suggestion of error.suggestions) {
            console.error(`    - ${suggestion}`);
          }
        }
      }
      
      return 1;
    }
  } catch (error) {
    console.error(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

/**
 * Main CLI entry point
 */
export async function main(): Promise<void> {
  const options = parseArgs();
  
  // Handle --help
  if (options.help) {
    console.log(HELP_TEXT);
    Deno.exit(0);
  }
  
  // Handle --version
  if (options.version) {
    console.log(`JSON App Compiler v${VERSION}`);
    Deno.exit(0);
  }
  
  // Run compiler
  const exitCode = await runCompiler(options);
  Deno.exit(exitCode);
}

// Run main function if this file is executed directly
if (import.meta.main) {
  main();
}