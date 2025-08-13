import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

interface StorageGetContext {
  user: any;
  supabase: SupabaseClient;
  supabaseAdmin: SupabaseClient;
  applicationSlug: string;
  filePath: string;
}

export async function handleStorageGet(
  req: Request,
  context: StorageGetContext,
): Promise<Response> {
  const { user, supabase, applicationSlug, filePath } = context;
  const url = new URL(req.url);
  const listFiles = url.searchParams.get("list") === "true";

  if (!user) {
    return new Response(
      JSON.stringify({ error: "Authentication required" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  console.log("📥 Get request for app:", applicationSlug, "file:", filePath, "list:", listFiles);

  try {
    // All applications require database entries - check database for access control
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, owner_id, slug")
      .eq("slug", applicationSlug)
      .single();

    if (appError || !application) {
      console.log("❌ Application not found:", applicationSlug);
      return new Response(
        JSON.stringify({ error: "Application not found or access denied" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if user is owner or has read access
    const isOwner = application.owner_id === user.id;
    let hasReadAccess = isOwner;
    const applicationId = application.id;

    if (!isOwner) {
      const { data: access } = await supabase
        .from("user_access")
        .select("access_level")
        .eq("application_id", application.id)
        .eq("user_id", user.id)
        .single();

      hasReadAccess = access ? ["read", "write", "admin"].includes(access.access_level) : false;
    }

    if (!hasReadAccess) {
      console.log("❌ User lacks read access:", user.id);
      return new Response(
        JSON.stringify({ error: "Read access required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (listFiles) {
      // List files from storage_objects table for accurate tracking
      console.log("📋 Listing files for user:", user.id, "application:", applicationSlug);
      
      const { data: storageObjects, error } = await supabase
        .from('storage_objects')
        .select('*')
        .eq('user_id', user.id)
        .eq('object_type', applicationSlug)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Failed to fetch storage objects:", error.message);
        return new Response(
          JSON.stringify({ error: "Failed to fetch files from database" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Calculate total storage used for this application
      const totalStorage = (storageObjects || []).reduce((total, obj) => {
        return total + (obj.file_size || 0);
      }, 0);

      // Format files without complex preview URLs
      const filesWithUrls = (storageObjects || []).map(obj => {
        return {
          id: obj.id,
          name: obj.name,
          size: obj.file_size,
          contentType: obj.mime_type,
          lastModified: obj.updated_at,
          createdAt: obj.created_at,
          path: obj.file_path,
          metadata: obj.metadata,
          isPublic: obj.is_public || false,
          shareToken: obj.share_token || null,
        };
      });

      console.log("✅ Found", storageObjects.length, "files");

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            files: filesWithUrls,
            total: storageObjects.length,
            totalStorage: totalStorage,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } else {
      // Get specific file
      if (!filePath) {
        return new Response(
          JSON.stringify({ error: "File path is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const fullPath = `${user.id}/${applicationSlug}/${filePath}`;
      console.log("📄 Getting file:", fullPath);

      // Return file metadata only - no content download from this endpoint
      const { data: storageObject, error: fetchError } = await supabase
        .from('storage_objects')
        .select('*')
        .eq('user_id', user.id)
        .eq('file_path', fullPath)
        .single();

      if (fetchError || !storageObject) {
        console.error("❌ File not found:", fetchError?.message);
        return new Response(
          JSON.stringify({ error: "File not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      console.log("✅ File info retrieved:", fullPath);

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: storageObject.id,
            name: storageObject.name,
            path: storageObject.file_path,
            size: storageObject.file_size,
            contentType: storageObject.mime_type,
            lastModified: storageObject.updated_at,
            createdAt: storageObject.created_at,
            metadata: storageObject.metadata,
            isPublic: storageObject.is_public || false,
            shareToken: storageObject.share_token || null,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("❌ Storage get error:", error);
    return new Response(
      JSON.stringify({
        error: "Get operation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}