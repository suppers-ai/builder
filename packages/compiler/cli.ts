#!/usr/bin/env deno run --allow-all

/**
 * Suppers AI Builder CLI
 *
 * Command-line interface for generating sites with the Suppers AI Builder.
 */

import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import { handleGenerate, handleHelp, handleValidate, handleVersion } from "./src/commands/mod.ts";

await new Command()
  .name("builder")
  .version("2.0.0")
  .description("Suppers AI Builder - Generate modern applications with Supabase backend")
  .command("generate")
  .alias("g")
  .description("Generate a new site from a specification file")
  .arguments("<name:string>")
  .option("--with-supabase [withSupabase:boolean]", "Enable Supabase integration", {
    default: false,
  })
  .option("--supabase-url [supabaseUrl:string]", "Supabase project URL")
  .option("--supabase-anon-key [supabaseAnonKey:string]", "Supabase anonymous key")
  .option("--enable-sso [enableSSO:boolean]", "Enable SSO functionality", { default: false })
  .option("--auth-providers [authProviders:string[]]", "OAuth providers to enable", {
    default: ["google"],
  })
  .action(async (options: any, name: string) => {
    await handleGenerate(options, name);
  })
  .command("validate")
  .alias("v")
  .description("Validate a specification file")
  .arguments("<name:string>")
  .action(async (_options, name: string) => {
    await handleValidate(name);
  })
  .command("version")
  .description("Show version information")
  .action(() => {
    handleVersion();
  })
  .action(() => {
    handleHelp();
  })
  .parse(Deno.args);
