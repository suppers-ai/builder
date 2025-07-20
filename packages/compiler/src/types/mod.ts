/**
 * Types module for the compiler
 */

import { z } from "zod";

// Site Generator Schema - migrated from schema.d.ts
export interface SiteGeneratorOptions {
  name: string;
  // TODO: not sure if these are needed ?
  withSupabase?: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  enableSSO?: boolean;
  authProviders?: string[];
}

// Library Schema for component resolution
export const LibrarySchema = z.object({
  name: z.string(),
  priority: z.number().optional().default(1),
  type: z.string().optional().default("component-library"),
});

export type Library = z.infer<typeof LibrarySchema>;

// Application Info Schema
export const ApplicationInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  id: z.string(),
});

export type ApplicationInfo = z.infer<typeof ApplicationInfoSchema>;

// Variables Schema
export const VariablesSchema = z.record(z.string());

export type Variables = z.infer<typeof VariablesSchema>;

// Compiler Info Schema
export const CompilerInfoSchema = z.object({
  id: z.string(),
  version: z.string(),
});

export type CompilerInfo = z.infer<typeof CompilerInfoSchema>;

// Head Meta Schema
export const HeadMetaSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

export type HeadMeta = z.infer<typeof HeadMetaSchema>;

// Head Schema
export const HeadSchema = z.object({
  meta: HeadMetaSchema.optional(),
});

export type Head = z.infer<typeof HeadSchema>;

// Component Schema (recursive)
export const ComponentSchema: z.ZodType<ComponentDefinition> = z.lazy(() => z.object({
  id: z.string(),
  props: z.record(z.any()).optional(),
  components: z.array(ComponentSchema).optional(),
}));

export interface ComponentDefinition {
  id: string;
  props?: Record<string, any>;
  components?: ComponentDefinition[];
}

// Layout Component Schema
export const LayoutComponentSchema = z.object({
  component: ComponentSchema,
});

export type LayoutComponent = z.infer<typeof LayoutComponentSchema>;

// Global Config Schema
export const GlobalConfigSchema = z.object({
  head: HeadSchema.optional(),
  menu: LayoutComponentSchema.optional(),
  header: LayoutComponentSchema.optional(),
  footer: LayoutComponentSchema.optional(),
});

export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;

// Data Configuration Schema
export const DataConfigSchema = z.object({
  url: z.string().optional(),
  endpoint: z.string(),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).default("GET"),
});

export type DataConfig = z.infer<typeof DataConfigSchema>;

// Route Override Schema
export const RouteOverrideSchema = z.object({
  head: HeadSchema.optional(),
});

export type RouteOverride = z.infer<typeof RouteOverrideSchema>;

// Route Schema
export const RouteSchema = z.object({
  path: z.string(),
  type: z.enum(["page"]),
  source: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  override: RouteOverrideSchema.optional(),
  components: z.array(ComponentSchema).optional(),
});

export type Route = z.infer<typeof RouteSchema>;

// Data Schema (wrapper for global and routes)
export const DataSchema = z.object({
  global: GlobalConfigSchema.optional(),
  routes: z.array(RouteSchema),
});

export type Data = z.infer<typeof DataSchema>;

// Application Specification Schema (new format)
export const ApplicationSpecSchema = z.object({
  application: ApplicationInfoSchema,
  variables: VariablesSchema.optional(),
  compiler: CompilerInfoSchema,
  data: DataSchema,
});

export type ApplicationSpec = z.infer<typeof ApplicationSpecSchema>;

// Remove legacy schemas - not needed for new project

// Template types
export type TemplateType = "fresh-basic";

// File operation types for Deno
export interface FileOperation {
  path: string;
  content: string | Uint8Array;
}

export interface DirectoryCopyOptions {
  source: string;
  destination: string;
  exclude?: string[];
}
