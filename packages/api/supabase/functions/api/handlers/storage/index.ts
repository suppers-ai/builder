import { corsHeaders } from "../../lib/cors.ts";
import { handleStorageUpload } from "./post-storage.ts";
import { handleStorageGet } from "./get-storage.ts";
import { handleStorageDelete } from "./delete-storage.ts";
import { handleStorageDownload } from "./download-storage.ts";
import { handleStorageShare } from "./share-storage.ts";
import { handleUserStorageGet } from "./get-user-storage.ts";

interface StorageContext {
  userId: string;
  supabase: SupabaseClient;
  pathSegments: string[];
}

export async function handleStorage(
  req: Request,
  context: StorageContext,
): Promise<Response> {
  const { supabase, pathSegments } = context;
  
  if (pathSegments.length === 0) {
    return new Response(
      JSON.stringify({ error: "Storage path is required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const storageType = pathSegments[0];
  const resourcePath = pathSegments.slice(1).join("/");

  console.log("🗄️ Unified storage request:", req.method, "type:", storageType, "path:", resourcePath);

  // Handle user storage info (special case)
  if (storageType === "user") {
    // GET /storage/user - Get user storage info
    if (req.method === "GET" && pathSegments.length === 1) {
      return await handleUserStorageGet(req, context);
    }
    return new Response(
      JSON.stringify({ error: `Method ${req.method} not allowed for user storage` }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // All other paths are treated as application storage (generic pattern)
  // Examples: /storage/recorder/file.webm, /storage/paint-app/image.png, etc.
  const applicationSlug = storageType;
  const filePath = resourcePath;

  console.log("🗄️ Application storage request:", req.method, "app:", applicationSlug, "path:", filePath);
  try {
    switch (req.method) {
      case "POST":
      case "PUT":
        return await handleStorageUpload(req, { userId, supabase, applicationSlug, filePath });
      
      case "GET":
      case "HEAD":
        // Check if this is a download request (has ?download=true parameter)
        const url = new URL(req.url);
        const isDownload = url.searchParams.get("download") === "true";
        
        if (isDownload) {
          return await handleStorageDownload(req, { userId, supabase, applicationSlug, filePath });
        } else {
          return await handleStorageGet(req, { userId, supabase, applicationSlug, filePath });
        }
      
      case "PATCH":
        // Handle sharing operations
        return await handleStorageShare(req, { userId, supabase, applicationSlug, filePath });
      
      case "DELETE":
        return await handleStorageDelete(req, { userId, supabase, applicationSlug, filePath });
      
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