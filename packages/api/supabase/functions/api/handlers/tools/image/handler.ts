/**
 * Image tools handler - processes image manipulation requests
 */

import { corsHeaders, errorResponses, jsonResponse } from "../../../_common/index.ts";
import type { ImageToolRequest, ImageToolResponse } from "./types.ts";
import { checkDependencies, getTool, getToolsInfo } from "./tools-registry.ts";
import {
  bytesToBase64,
  cleanupTempFiles,
  ensureDir,
  generateTempPath,
  isValidImageFormat,
  writeBytesToFile,
} from "./utils.ts";

/**
 * Main image tools handler
 */
export async function handleImageTools(req: Request): Promise<Response> {
  const origin = req.headers.get('origin');
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathSegments = url.pathname.split("/").filter((segment) => segment);

  // Extract tool action from path: /api/v1/tools/image/{action}
  const action = pathSegments[pathSegments.length - 1];

  try {
    switch (req.method) {
      case "GET":
        return await handleGetRequest(action, url);
      case "POST":
        return await handlePostRequest(action, req);
      default:
        return errorResponses.methodNotAllowed(`Method ${req.method} not allowed`, origin || undefined);
    }
  } catch (error) {
    console.error("Image tools handler error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

/**
 * Handles GET requests (info, status, list tools)
 */
async function handleGetRequest(action: string, url: URL): Promise<Response> {
  switch (action) {
    case "tools":
    case "list":
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            tools: getToolsInfo(),
            usage: {
              endpoint: "/api/v1/tools/image/process",
              method: "POST",
              contentType: "multipart/form-data or application/json",
              parameters: {
                tool: "Tool name (thumbnail, resize, convert)",
                image: "Image file or base64 data",
                options: "Tool-specific options object",
              },
            },
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );

    case "status":
      const dependencies = await checkDependencies();
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            status: dependencies.allReady ? "ready" : "dependencies_missing",
            dependencies,
            availableTools: getToolsInfo().length,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );

    case "health":
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            status: "healthy",
            timestamp: new Date().toISOString(),
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );

    default:
      return new Response(
        JSON.stringify({
          error: `Unknown action: ${action}. Available actions: tools, status, health`,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
  }
}

/**
 * Handles POST requests (image processing)
 */
async function handlePostRequest(action: string, req: Request): Promise<Response> {
  if (action !== "process") {
    return new Response(
      JSON.stringify({
        error: `POST action '${action}' not supported. Use 'process' for image processing.`,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Check dependencies first
  const dependencies = await checkDependencies();
  if (!dependencies.allReady) {
    return new Response(
      JSON.stringify({
        error: "Required dependencies not available",
        missing: dependencies.missing,
      }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    return await handleMultipartRequest(req);
  } else if (contentType.includes("application/json")) {
    return await handleJsonRequest(req);
  } else {
    return new Response(
      JSON.stringify({
        error: "Unsupported content type. Use multipart/form-data or application/json",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

/**
 * Handles multipart form data requests
 */
async function handleMultipartRequest(req: Request): Promise<Response> {
  const formData = await req.formData();
  const tool = formData.get("tool") as string;
  const imageFile = formData.get("image") as File;
  const optionsStr = formData.get("options") as string;

  if (!tool) {
    return new Response(
      JSON.stringify({ error: "Tool parameter is required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (!imageFile) {
    return new Response(
      JSON.stringify({ error: "Image file is required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  let options = {};
  if (optionsStr) {
    try {
      options = JSON.parse(optionsStr);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid options JSON" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  }

  // Validate image file
  if (!isValidImageFormat(imageFile.name)) {
    return new Response(
      JSON.stringify({ error: "Unsupported image format" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const imageBytes = new Uint8Array(await imageFile.arrayBuffer());
  return await processImage({ tool, inputBuffer: imageBytes, options, outputFormat: "buffer" });
}

/**
 * Handles JSON requests
 */
async function handleJsonRequest(req: Request): Promise<Response> {
  const body = await req.json();
  const { tool, image, options = {}, outputFormat = "base64" } = body;

  if (!tool) {
    return new Response(
      JSON.stringify({ error: "Tool parameter is required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (!image) {
    return new Response(
      JSON.stringify({ error: "Image data is required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  let inputBuffer: Uint8Array;

  if (typeof image === "string") {
    // Assume base64 encoded image
    try {
      inputBuffer = Uint8Array.from(atob(image), (c) => c.charCodeAt(0));
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid base64 image data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } else {
    return new Response(
      JSON.stringify({ error: "Image must be base64 string for JSON requests" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return await processImage({ tool, inputBuffer, options, outputFormat });
}

/**
 * Processes the image using the specified tool
 */
async function processImage(request: ImageToolRequest): Promise<Response> {
  const toolHandler = getTool(request.tool);

  if (!toolHandler) {
    return new Response(
      JSON.stringify({
        error: `Unknown tool: ${request.tool}`,
        availableTools: getToolsInfo().map((t) => t.name),
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    // Merge with default options
    const finalOptions = { ...toolHandler.defaultOptions, ...request.options };

    // Process the image
    const input = request.inputPath || request.inputBuffer!;
    const result = await toolHandler.process(input, finalOptions);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Image processing failed",
          details: result.error,
        }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Prepare response based on output format
    const responseData: any = {
      success: true,
      tool: request.tool,
      metadata: result.metadata,
    };

    if (request.outputFormat === "buffer" && result.outputBuffer) {
      // Return binary data
      return new Response(result.outputBuffer, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": getContentType(finalOptions.format || "jpeg"),
          "Content-Disposition": `attachment; filename="processed.${
            finalOptions.format || "jpeg"
          }"`,
        },
      });
    } else if (request.outputFormat === "base64" && result.outputBuffer) {
      responseData.data = bytesToBase64(result.outputBuffer);
    } else if (result.outputPath) {
      responseData.outputPath = result.outputPath;
    }

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Image processing error:", error);
    return new Response(
      JSON.stringify({
        error: "Image processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

/**
 * Gets the appropriate content type for image format
 */
function getContentType(format: string): string {
  switch (format.toLowerCase()) {
    case "jpeg":
    case "jpg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "bmp":
      return "image/bmp";
    case "tiff":
    case "tif":
      return "image/tiff";
    default:
      return "application/octet-stream";
  }
}
