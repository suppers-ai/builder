/**
 * Types module for the compiler
 */

// Generator types
export type {
  SiteGeneratorOptions,
  Library,
  Variables,
  CompilerInfo,
} from "./generator.ts";
export {
  LibrarySchema,
  VariablesSchema,
  CompilerInfoSchema,
} from "./generator.ts";

// Application types
export type {
  ApplicationInfo,
  ApplicationSpec,
} from "./application.ts";
export {
  ApplicationInfoSchema,
  ApplicationSpecSchema,
} from "./application.ts";

// Component types
export type {
  ComponentDefinition,
  LayoutComponent,
} from "./component.ts";
export {
  ComponentSchema,
  LayoutComponentSchema,
} from "./component.ts";

// Route types
export type {
  DataConfig,
  RouteOverride,
  Route,
  Data,
} from "./route.ts";
export {
  DataConfigSchema,
  RouteOverrideSchema,
  RouteSchema,
  DataSchema,
} from "./route.ts";

// Layout types
export type {
  HeadMeta,
  Head,
  GlobalConfig,
} from "./layout.ts";
export {
  HeadMetaSchema,
  HeadSchema,
  GlobalConfigSchema,
} from "./layout.ts";

// File system types
export type {
  TemplateType,
  FileOperation,
  DirectoryCopyOptions,
} from "./file-system.ts";
