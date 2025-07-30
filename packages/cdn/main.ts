#!/usr/bin/env deno run -A
/**
 * Simple CDN server for serving static assets
 */

import { serveAsset } from "./lib/asset-handler.ts";

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle root path - show available assets
  if (pathname === "/" || pathname === "") {
    return await handleHomePage();
  }

  // Remove leading slash and get the asset path
  const assetPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;

  // Handle different HTTP methods
  switch (request.method) {
    case "GET":
      return await handleAssetRequest(assetPath, request);
    
    case "HEAD":
      return await handleHeadRequest(assetPath, request);
    
    case "OPTIONS":
      return handleOptionsRequest();
    
    default:
      return new Response("Method Not Allowed", {
        status: 405,
        headers: {
          "Allow": "GET, HEAD, OPTIONS",
          "Access-Control-Allow-Origin": "*",
        }
      });
  }
}

async function handleHomePage(): Promise<Response> {
  // Get list of available assets
  const assets: string[] = [];
  
  try {
    for await (const entry of Deno.readDir("./static")) {
      if (entry.isDirectory) {
        for await (const file of Deno.readDir(`./static/${entry.name}`)) {
          if (file.isFile) {
            assets.push(`${entry.name}/${file.name}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error reading static directory:", error);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Suppers CDN</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
        h1 { color: #333; }
        .asset-list { list-style: none; padding: 0; }
        .asset-item { margin: 0.5rem 0; padding: 0.5rem; background: #f5f5f5; border-radius: 4px; }
        .asset-link { text-decoration: none; color: #0066cc; font-family: monospace; }
        .asset-link:hover { text-decoration: underline; }
        .stats { background: #e8f4f8; padding: 1rem; border-radius: 4px; margin: 1rem 0; }
    </style>
</head>
<body>
    <h1>🚀 Suppers CDN</h1>
    <div class="stats">
        <p><strong>Total Assets:</strong> ${assets.length}</p>
        <p><strong>Status:</strong> ✅ Online</p>
    </div>
    
    <h2>📁 Available Assets</h2>
    <ul class="asset-list">
        ${assets.map(asset => `
            <li class="asset-item">
                <a href="/${asset}" class="asset-link" target="_blank">/${asset}</a>
            </li>
        `).join('')}
    </ul>
    
    <h2>📋 API Usage</h2>
    <pre><code>GET  /{asset-path}     - Serve asset
HEAD /{asset-path}     - Get asset metadata  
OPTIONS /{asset-path}  - CORS preflight</code></pre>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300", // 5 minutes
    }
  });
}

async function handleAssetRequest(assetPath: string, request: Request): Promise<Response> {
  try {
    const ifNoneMatch = request.headers.get("If-None-Match") || undefined;
    const response = await serveAsset(assetPath, "./static", ifNoneMatch);
    return response;
  } catch (error) {
    console.error("Error serving asset:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { 
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}

async function handleHeadRequest(assetPath: string, request: Request): Promise<Response> {
  try {
    const ifNoneMatch = request.headers.get("If-None-Match") || undefined;
    const response = await serveAsset(assetPath, "./static", ifNoneMatch);
    
    if (response.body) {
      const reader = response.body.getReader();
      try {
        await reader.cancel();
      } finally {
        reader.releaseLock();
      }
    }
    
    return new Response(null, {
      status: response.status,
      headers: response.headers
    });
  } catch (error) {
    console.error("Error serving asset (HEAD):", error);
    return new Response(null, {
      status: 500,
      headers: { 
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}

function handleOptionsRequest(): Response {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, If-None-Match",
      "Access-Control-Max-Age": "86400",
    }
  });
}

// Start the server
if (import.meta.main) {
  const port = parseInt(Deno.env.get("PORT") || Deno.env.get("CDN_PORT") || "8080");
  
  console.log(`🚀 CDN Server starting on port ${port}`);
  console.log(`📁 Serving static assets from ./static/`);
  console.log(`🌐 Home page: http://localhost:${port}/`);

  Deno.serve({ port }, handleRequest);
}