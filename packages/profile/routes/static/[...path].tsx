import { Context } from "fresh";

export const handler = {
  async GET(ctx: Context<any>) {
    const { path } = ctx.params;
    
    // Set aggressive caching headers for static assets
    const headers = new Headers({
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    try {
      // Try to read the file from the static directory
      const filePath = `./static/${path}`;
      const file = await Deno.readFile(filePath);
      
      // Determine content type based on file extension
      const ext = path.split('.').pop()?.toLowerCase();
      let contentType = "application/octet-stream";
      
      switch (ext) {
        case "css":
          contentType = "text/css";
          break;
        case "js":
          contentType = "application/javascript";
          break;
        case "json":
          contentType = "application/json";
          break;
        case "png":
          contentType = "image/png";
          break;
        case "jpg":
        case "jpeg":
          contentType = "image/jpeg";
          break;
        case "gif":
          contentType = "image/gif";
          break;
        case "svg":
          contentType = "image/svg+xml";
          break;
        case "ico":
          contentType = "image/x-icon";
          break;
        case "webp":
          contentType = "image/webp";
          break;
        case "mp4":
          contentType = "video/mp4";
          break;
        case "webm":
          contentType = "video/webm";
          break;
        case "woff":
        case "woff2":
          contentType = "font/woff2";
          break;
        case "ttf":
          contentType = "font/ttf";
          break;
        case "otf":
          contentType = "font/otf";
          break;
      }
      
      headers.set("Content-Type", contentType);
      
      return new Response(file, {
        status: 200,
        headers,
      });
    } catch (error) {
      // File not found
      return new Response("Not Found", { status: 404 });
    }
  },
  
  OPTIONS() {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  },
};