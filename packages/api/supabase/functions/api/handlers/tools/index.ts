/**
 * Tools handler - routes requests to specific tool handlers
 */

import { corsHeaders } from "../../lib/cors.ts";
import { handleImageTools } from "./image/index.ts";

/**
 * Main tools handler that routes to specific tool categories
 */
export async function handleTools(req: Request, pathSegments: string[]): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Path format: /api/v1/tools/{category}/{action}
    const [category, ...rest] = pathSegments;

    if (!category) {
      return await getToolsOverview();
    }

    switch (category) {
      case "image":
        return await handleImageTools(req);

      // Future tool categories can be added here:
      // case "video":
      //   return await handleVideoTools(req);
      // case "audio":
      //   return await handleAudioTools(req);
      // case "document":
      //   return await handleDocumentTools(req);

      default:
        return new Response(
          JSON.stringify({
            error: `Unknown tool category: ${category}`,
            availableCategories: ["image"]
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
    }
  } catch (error) {
    console.error("Tools handler error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
}

/**
 * Returns overview of all available tools
 */
async function getToolsOverview(): Promise<Response> {
  try {
    const overview = {
      success: true,
      data: {
        version: "1.0.0",
        description: "Suppers AI Builder Tools API",
        categories: {
          image: {
            description: "Image processing and manipulation tools",
            endpoint: "/api/v1/tools/image",
            tools: ["thumbnail", "resize", "convert"],
            status: "available"
          }
          // Future categories:
          // video: {
          //   description: "Video processing and editing tools",
          //   endpoint: "/api/v1/tools/video", 
          //   tools: ["thumbnail", "trim", "compress"],
          //   status: "coming_soon"
          // },
          // audio: {
          //   description: "Audio processing and conversion tools",
          //   endpoint: "/api/v1/tools/audio",
          //   tools: ["convert", "normalize", "trim"],
          //   status: "coming_soon"
          // }
        },
        usage: {
          listTools: "GET /api/v1/tools/{category}/tools",
          checkStatus: "GET /api/v1/tools/{category}/status",
          processContent: "POST /api/v1/tools/{category}/process"
        }
      }
    };

    return new Response(
      JSON.stringify(overview),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Tools overview error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to get tools overview",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
}