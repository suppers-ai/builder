// Compiler core functionality
import { ConfigParser, configParser, ConfigParseError } from "./config-parser.ts";
import { ComponentResolver, createComponentResolver } from "./component-resolver.ts";
import { ComponentImportGenerator, createImportGenerator } from "./component-import-generator.ts";
import { RouteGenerator, createRouteGenerator } from "./route-generator.ts";
import { Compiler, createCompiler, CompilationPhase } from "./compiler.ts";
import { main as cliMain } from "./cli.ts";

// Export the compiler
export { Compiler, createCompiler, CompilationPhase };
export type { 
  CompilationOptions, 
  CompilationResult, 
  CompilationProgressEvent,
  ProgressCallback,
  PipelinePhase
} from "./compiler.ts";

// Export the config parser
export { ConfigParser, configParser, ConfigParseError };
export type { ParseOptions, ParseResult } from "./config-parser.ts";

// Export the component resolver
export { ComponentResolver, createComponentResolver };
export type { 
  ComponentResolutionOptions, 
  ComponentResolutionResult,
  ComponentImport
} from "./component-resolver.ts";

// Export the component import generator
export { ComponentImportGenerator, createImportGenerator };
export type {
  ImportGenerationOptions,
  ImportGenerationResult
} from "./component-import-generator.ts";

// Export the route generator
export { RouteGenerator, createRouteGenerator };
export type {
  RouteGenerationOptions,
  RouteGenerationResult
} from "./route-generator.ts";

// Export the CLI
export { cliMain };