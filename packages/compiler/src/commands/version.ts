export function handleVersion(): void {
  console.log("Suppers AI Builder v2.0.0 (Deno)");
  console.log("Runtime: Deno", Deno.version.deno);
  console.log("TypeScript:", Deno.version.typescript);
} 