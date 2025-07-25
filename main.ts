const pkgRelative = Deno.env.get("APP_PACKAGE");
if (!pkgRelative) {
  throw new Error("APP_PACKAGE is not set");
}

const pkgMainPath = `./${pkgRelative}/main.ts` as const;

// Dynamically import the chosen package’s main module.
const mod = await import(pkgMainPath);

export const app = mod.app;

// If executed directly (not just imported by Deploy), start the server so you
// can test the built bundle locally.
if (import.meta.main) {
  const port = Number(Deno.env.get("PORT") ?? "8000");
  await mod.app.listen({ port });
} 