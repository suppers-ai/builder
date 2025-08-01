#!/usr/bin/env deno run -A --watch=static/,routes/,islands/,components/,lib/,hooks/,providers/,pages/
import { loadSync } from "@std/dotenv";
import { Builder } from "fresh/dev";
import { tailwind } from "@fresh/plugin-tailwind";
import { PORTS } from "@suppers/shared";
import { ensureDir } from "@std/fs/ensure_dir.ts";
import { copy } from "@std/fs/copy.ts";
import { walk } from "@std/fs/walk.ts";

// Load environment variables
try {
    loadSync({
        envPath: "../../.env.local",
        defaultsPath: "../../.env",
        export: true,
    });
    console.log('env variables loaded')
} catch {
    // Ignore if no env files
    console.log('No env variables found')
}

const builder = new Builder({ target: "safari12" });

// Configure the tailwind plugin for Fresh 2.0
tailwind(builder);

// Create optimized assets for the browser when
// running `deno run -A dev.ts build`
if (Deno.args.includes("build")) {
    await builder.build();
    
    // Copy static files to _fresh directory AFTER build
    try {
        await ensureDir("_fresh/static");
        
        // Copy static files individually to avoid overwriting existing files
        for await (const entry of walk("static", { includeDirs: false })) {
            const relativePath = entry.path.replace("static/", "");
            const destPath = `_fresh/static/${relativePath}`;
            
            try {
                await ensureDir(destPath.substring(0, destPath.lastIndexOf("/")));
                await copy(entry.path, destPath, { overwrite: false });
            } catch (error) {
                // File already exists, skip
                console.log(`Skipping existing file: ${destPath}`);
            }
        }
        console.log("Static files copied to _fresh directory after build");
    } catch (error) {
        console.error("Error copying static files:", error);
    }
} else {
    // Start the development server
    await builder.listen(() => import("./main.ts").then(m => m.app), {
        port: parseInt(Deno.env.get("CDN_PORT") || PORTS.CDN.toString()),
    });
}