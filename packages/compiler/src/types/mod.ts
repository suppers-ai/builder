/**
 * Types module for the compiler
 */

// Generator types
export type { CompilerInfo, Library, SiteGeneratorOptions, Variables } from "./generator.ts";
export { CompilerInfoSchema, LibrarySchema, VariablesSchema } from "./generator.ts";

// Application types
export type { ApplicationInfo, ApplicationSpec } from "./application.ts";
export { ApplicationInfoSchema, ApplicationSpecSchema } from "./application.ts";

// Component types
export type { ComponentDefinition, LayoutComponent } from "./component.ts";
export { ComponentSchema, LayoutComponentSchema } from "./component.ts";

// Route types
export type { Data, DataConfig, Route, RouteOverride } from "./route.ts";
export { DataConfigSchema, DataSchema, RouteOverrideSchema, RouteSchema } from "./route.ts";

// Layout types
export type { GlobalConfig, Head, HeadMeta } from "./layout.ts";
export { GlobalConfigSchema, HeadMetaSchema, HeadSchema } from "./layout.ts";

// File system types
export type { DirectoryCopyOptions, FileOperation, TemplateType } from "./file-system.ts";
