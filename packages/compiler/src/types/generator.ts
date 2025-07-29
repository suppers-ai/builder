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

// Variables Schema
export const VariablesSchema = z.record(z.string());

export type Variables = z.infer<typeof VariablesSchema>;

// Compiler Info Schema
export const CompilerInfoSchema = z.object({
  id: z.string(),
  version: z.string(),
});

export type CompilerInfo = z.infer<typeof CompilerInfoSchema>;