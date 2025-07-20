import { FileSystem } from "../utils/mod.ts";

export async function handleValidate(name: string): Promise<void> {
  try {
    const specPath = FileSystem.join("sites", `${name}.json`);

    if (!(await FileSystem.exists(specPath))) {
      throw new Error(`Specification file not found: ${specPath}`);
    }

    const specContent = await FileSystem.readText(specPath);
    const parsed = JSON.parse(specContent);

    // Import schemas dynamically
    const { ApplicationSpecSchema } = await import("../types/mod.ts");
    const { validateVariableReferences } = await import("../utils/variables.ts");

    try {
      const spec = ApplicationSpecSchema.parse(parsed);

      // Validate variables
      const variableValidation = validateVariableReferences(spec.data, spec.variables || {});
      if (!variableValidation.valid) {
        console.warn("⚠️  Missing variables:", variableValidation.missingVariables.join(", "));
      }

      console.log(`✅ Specification is valid (ApplicationSpec)`);
      console.log(`📝 Application: ${spec.application.name} v${spec.application.version}`);
      console.log(`🔧 Compiler: ${spec.compiler.id} v${spec.compiler.version}`);
      console.log(`📄 Routes: ${spec.data.routes.length}`);
    } catch (error) {
      console.error("❌ Invalid ApplicationSpec format:", error);
      Deno.exit(1);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error validating specification:", errorMessage);
    Deno.exit(1);
  }
}
