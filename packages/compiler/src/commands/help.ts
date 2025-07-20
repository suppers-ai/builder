export function handleHelp(): void {
  console.log("Welcome to Suppers AI Builder v2.0.0 (Deno)");
  console.log("");
  console.log("🚀 Generate applications: builder generate <app-name>");
  console.log("✅ Validate specifications: builder validate <spec-name>");
  console.log("📚 Get help: builder --help");
  console.log("🔐 Enable Supabase: builder generate <app-name> --with-supabase");
  console.log("");
  console.log("Features:");
  console.log(
    "  • ApplicationSpec format - Full featured with global layouts, variables, permissions",
  );
  console.log("  • Variable substitution with ${{VARIABLE_NAME}} syntax");
  console.log("  • Component nesting and custom HTML support");
  console.log("  • Route protection and authentication");
  console.log("  • Data integration with external APIs");
  console.log("");
  console.log("Examples:");
  console.log("  builder generate my-blog");
  console.log("  builder validate my-blog");
  console.log("  builder generate my-app --with-supabase --auth-providers google,github");
}
