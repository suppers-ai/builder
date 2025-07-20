import { generateApplication } from "../generators/application.ts";
import type { SiteGeneratorOptions } from "../types/mod.ts";

export interface GenerateOptions {
  withSupabase?: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  enableSSO?: boolean;
  authProviders?: string[];
}

export async function handleGenerate(options: GenerateOptions, name: string): Promise<void> {
  const generatorOptions: SiteGeneratorOptions = {
    name,
    withSupabase: options.withSupabase,
    supabaseUrl: typeof options.supabaseUrl === "string" ? options.supabaseUrl : undefined,
    supabaseAnonKey: typeof options.supabaseAnonKey === "string"
      ? options.supabaseAnonKey
      : undefined,
    enableSSO: options.enableSSO,
    authProviders: Array.isArray(options.authProviders) ? options.authProviders : undefined,
  };

  try {
    await generateApplication(generatorOptions);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error generating application:", errorMessage);
    Deno.exit(1);
  }
} 