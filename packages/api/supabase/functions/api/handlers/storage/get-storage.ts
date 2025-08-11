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
    // Verify user has access to this application
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
      // List files in the user's application folder
      const userAppFolder = `${user.id}/${applicationSlug}`;
      console.log("📋 Listing files for user app folder:", userAppFolder);
      
      const { data: files, error } = await supabase.storage
        .from("application-files")
        .list(userAppFolder, {
          limit: 100,
          offset: 0,
        });

      if (error) {
        console.error("❌ List files error:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Get public URLs for all files
      const filesWithUrls = files.map(file => {
        const fullPath = `${user.id}/${applicationSlug}/${file.name}`;
        const { data: publicUrlData } = supabase.storage
          .from("application-files")
          .getPublicUrl(fullPath);

        return {
          name: file.name,
          size: file.metadata?.size,
          contentType: file.metadata?.mimetype,
          lastModified: file.updated_at,
          publicUrl: publicUrlData.publicUrl,
          path: fullPath,
        };
      });

      console.log("✅ Found", files.length, "files");

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            files: filesWithUrls,
            total: files.length,
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

      // Check if we should return file content or just metadata
      const includeContent = url.searchParams.get("content") === "true";

      if (includeContent) {
        // Download and return file content
        const { data, error } = await supabase.storage
          .from("application-files")
          .download(fullPath);

        if (error) {
          console.error("❌ Download error:", error);
          if (error.message.includes("Object not found")) {
            return new Response(
              JSON.stringify({ error: "File not found" }),
              {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              },
            );
          }
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        // Return file content with appropriate headers
        const contentType = data.type || "application/octet-stream";
        console.log("✅ File downloaded:", fullPath, "type:", contentType);

        return new Response(data, {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filePath}"`,
          },
        });
      } else {
        // Return file metadata and public URL
        const { data: publicUrlData } = supabase.storage
          .from("application-files")
          .getPublicUrl(fullPath);

        // Get file info (this will error if file doesn't exist)
        const userAppFolder = `${user.id}/${applicationSlug}`;
        const { data, error } = await supabase.storage
          .from("application-files")
          .list(userAppFolder, {
            search: filePath.split("/").pop(), // Get just the filename
          });

        if (error) {
          console.error("❌ File info error:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        const fileInfo = data.find(f => f.name === filePath.split("/").pop());
        if (!fileInfo) {
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
              name: fileInfo.name,
              path: fullPath,
              size: fileInfo.metadata?.size,
              contentType: fileInfo.metadata?.mimetype,
              lastModified: fileInfo.updated_at,
              publicUrl: publicUrlData.publicUrl,
            },
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
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