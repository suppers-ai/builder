/**
 * Application Schema Definitions
 * Zod schemas for application specifications and related data structures
 */

import { z } from "zod";

// Application Info Schema
export const ApplicationInfoSchema = z.object({
  name: z.string().min(1, "Application name is required"),
  version: z.string().min(1, "Version is required"),
  description: z.string().optional(),
  id: z.string().min(1, "Application ID is required"),
});

// Variables Schema
export const VariablesSchema = z.record(z.string());

// Compiler Info Schema
export const CompilerInfoSchema = z.object({
  id: z.string().min(1, "Compiler ID is required"),
  version: z.string().min(1, "Compiler version is required"),
});

// Head Meta Schema
export const HeadMetaSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

// Head Schema
export const HeadSchema = z.object({
  meta: HeadMetaSchema.optional(),
});

// Component Schema (recursive)
export const ComponentSchema: z.ZodType<{
  id: string;
  props?: Record<string, any>;
  components?: any[];
}> = z.lazy(() => z.object({
  id: z.string().min(1, "Component ID is required"),
  props: z.record(z.any()).optional(),
  components: z.array(ComponentSchema).optional(),
}));

// Layout Component Schema
export const LayoutComponentSchema = z.object({
  component: ComponentSchema,
});

// Global Config Schema
export const GlobalConfigSchema = z.object({
  head: HeadSchema.optional(),
  menu: LayoutComponentSchema.optional(),
  header: LayoutComponentSchema.optional(),
  footer: LayoutComponentSchema.optional(),
});

// Data Configuration Schema
export const DataConfigSchema = z.object({
  url: z.string().url().optional(),
  endpoint: z.string().min(1, "Endpoint is required"),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).default("GET"),
});

// Route Override Schema
export const RouteOverrideSchema = z.object({
  head: HeadSchema.optional(),
});

// Route Schema
export const RouteSchema = z.object({
  path: z.string().min(1, "Route path is required"),
  type: z.enum(["page"]),
  source: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  override: RouteOverrideSchema.optional(),
  components: z.array(ComponentSchema).optional(),
});

// Data Schema (wrapper for global and routes)
export const DataSchema = z.object({
  global: GlobalConfigSchema.optional(),
  routes: z.array(RouteSchema).min(1, "At least one route is required"),
});

// Application Specification Schema (main schema)
export const ApplicationSpecSchema = z.object({
  application: ApplicationInfoSchema,
  variables: VariablesSchema.optional(),
  compiler: CompilerInfoSchema,
  data: DataSchema,
});

// Library Schema for component resolution
export const LibrarySchema = z.object({
  name: z.string().min(1, "Library name is required"),
  priority: z.number().int().positive().optional().default(1),
  type: z.string().optional().default("component-library"),
});

// Site Generator Options Schema
export const SiteGeneratorOptionsSchema = z.object({
  name: z.string().min(1, "Site name is required"),
  withSupabase: z.boolean().optional().default(false),
  supabaseUrl: z.string().url().optional(),
  supabaseAnonKey: z.string().optional(),
  enableSSO: z.boolean().optional().default(false),
  authProviders: z.array(z.string()).optional().default([]),
});

// Component Registry Schema
export const ComponentRegistrySchema = z.record(z.object({
  source: z.string().min(1, "Component source is required"),
  type: z.enum(["ui-lib", "custom", "html"]),
  imports: z.array(z.string()).optional().default([]),
}));

// Variable Validation Result Schema
export const VariableValidationResultSchema = z.object({
  valid: z.boolean(),
  missingVariables: z.array(z.string()),
});

// Component Validation Result Schema
export const ComponentValidationResultSchema = z.object({
  valid: z.boolean(),
  missingComponents: z.array(z.string()),
});

// Generation Result Schema
export const GenerationResultSchema = z.object({
  success: z.boolean(),
  applicationName: z.string(),
  outputPath: z.string(),
  errors: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
});

// File Operation Schema
export const FileOperationSchema = z.object({
  path: z.string().min(1, "File path is required"),
  content: z.union([z.string(), z.instanceof(Uint8Array)]),
});

// Directory Copy Options Schema
export const DirectoryCopyOptionsSchema = z.object({
  source: z.string().min(1, "Source path is required"),
  destination: z.string().min(1, "Destination path is required"),
  exclude: z.array(z.string()).optional().default([]),
});

// Template Type Schema
export const TemplateTypeSchema = z.enum(["fresh-basic"]);

// Export inferred types
export type ApplicationInfo = z.infer<typeof ApplicationInfoSchema>;
export type Variables = z.infer<typeof VariablesSchema>;
export type CompilerInfo = z.infer<typeof CompilerInfoSchema>;
export type HeadMeta = z.infer<typeof HeadMetaSchema>;
export type Head = z.infer<typeof HeadSchema>;
export type ComponentDefinition = z.infer<typeof ComponentSchema>;
export type LayoutComponent = z.infer<typeof LayoutComponentSchema>;
export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;
export type DataConfig = z.infer<typeof DataConfigSchema>;
export type RouteOverride = z.infer<typeof RouteOverrideSchema>;
export type Route = z.infer<typeof RouteSchema>;
export type Data = z.infer<typeof DataSchema>;
export type ApplicationSpec = z.infer<typeof ApplicationSpecSchema>;
export type Library = z.infer<typeof LibrarySchema>;
export type SiteGeneratorOptions = z.infer<typeof SiteGeneratorOptionsSchema>;
export type ComponentRegistry = z.infer<typeof ComponentRegistrySchema>;
export type VariableValidationResult = z.infer<typeof VariableValidationResultSchema>;
export type ComponentValidationResult = z.infer<typeof ComponentValidationResultSchema>;
export type GenerationResult = z.infer<typeof GenerationResultSchema>;
export type FileOperation = z.infer<typeof FileOperationSchema>;
export type DirectoryCopyOptions = z.infer<typeof DirectoryCopyOptionsSchema>;
export type TemplateType = z.infer<typeof TemplateTypeSchema>;