/**
 * Utility to generate package.json content
 */
export function generatePackageJson(name: string, _template: string): string {
    const packageJson = {
      name: `@suppers/generated-${name}`,
      version: "1.0.0",
      private: true,
      type: "module",
      scripts: {
        dev: "deno task start",
        build: "deno task build",
        start: "deno run -A --watch=static/,routes/ dev.ts",
        preview: "deno run -A main.ts",
        check: "deno fmt --check && deno lint && deno check **/*.ts && deno check **/*.tsx",
        fmt: "deno fmt",
        lint: "deno lint",
      },
    };
  
    return JSON.stringify(packageJson, null, 2);
  }
  
  /**
   * Utility to generate Deno configuration for generated projects
   */
  export function generateDenoConfig(name: string, template: string): string {
    const baseConfig: {
      name: string;
      version: string;
      exports: string;
      imports: Record<string, string>;
      compilerOptions: {
        lib: string[];
        jsx: string;
        jsxImportSource: string;
      };
      tasks: Record<string, string>;
      lint: {
        rules: {
          tags: string[];
        };
      };
      exclude: string[];
    } = {
      name: `@suppers/generated-${name}`,
      version: "1.0.0",
      exports: "./main.ts",
      imports: {
        "@std/": "https://deno.land/std@0.217.0/",
        "$fresh/": "https://deno.land/x/fresh@1.6.1/",
        "preact": "https://esm.sh/preact@10.19.3",
        "preact/": "https://esm.sh/preact@10.19.3/",
        "@preact/signals": "https://esm.sh/*@preact/signals@1.2.2",
        "@preact/signals-core": "https://esm.sh/*@preact/signals-core@1.5.1",
        "tailwindcss": "npm:tailwindcss@^4.1.11"
      },
      compilerOptions: {
        lib: ["dom", "dom.asynciterable", "deno.ns"],
        jsx: "react-jsx",
        jsxImportSource: "preact",
      },
      tasks: {
        check: "deno fmt --check && deno lint && deno check **/*.ts && deno check **/*.tsx",
        cli: "echo \"import '\\$fresh/src/dev/cli.ts'\" | deno run --unstable -A -",
        manifest: "deno task cli manifest $(pwd)",
        start: "deno run -A --watch=static/,routes/ dev.ts",
        build: "deno run -A dev.ts build",
        preview: "deno run -A main.ts",
        update: "deno run -A -r https://fresh.deno.dev/update .",
      },
      lint: {
        rules: {
          tags: ["fresh", "recommended"],
        },
      },
      exclude: ["**/_fresh/*"],
    };
  
    return JSON.stringify(baseConfig, null, 2);
  }