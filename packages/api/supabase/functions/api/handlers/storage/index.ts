import { corsHeaders } from "../../lib/cors.ts";
import { handleStorageUpload } from "./post-storage.ts";
import { handleStorageGet } from "./get-storage.ts";
import { handleStorageDelete } from "./delete-storage.ts";

interface StorageContext {
  user: any;
  supabase: any;
  supabaseAdmin: any;
  pathSegments: string[];
}

export async function handleStorage(
  req: Request,
  context: StorageContext,
): Promise<Response> {
  const { pathSegments } = context;
  
  if (pathSegments.length === 0) {
    return new Response(
      JSON.stringify({ error: "Application slug is required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const applicationSlug = pathSegments[0];
  const filePath = pathSegments.slice(1).join("/");

  console.log("🗄️ Storage request:", req.method, "slug:", applicationSlug, "path:", filePath);

  try {
    switch (req.method) {
      case "POST":
      case "PUT":
        return await handleStorageUpload(req, { ...context, applicationSlug, filePath });
      
      case "GET":
        return await handleStorageGet(req, { ...context, applicationSlug, filePath });
      
      case "DELETE":
        return await handleStorageDelete(req, { ...context, applicationSlug, filePath });
      
      default:
        return new Response(
          JSON.stringify({ error: `Method ${req.method} not allowed` }),
          {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
    }
  } catch (error) {
    console.error("Storage handler error:", error);
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