import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

interface ShareContext {
  supabase: SupabaseClient;
  pathSegments: string[];
}

export async function handleShare(
  req: Request,
  context: ShareContext,
): Promise<Response> {
  const { supabase, pathSegments } = context;
  
  if (pathSegments.length < 2) {
    return new Response(
      JSON.stringify({ error: "Invalid share URL format" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const shareType = pathSegments[0]; // 'public' or 'token'
  console.log("🔗 Share request:", req.method, "type:", shareType, "path:", pathSegments);

  try {
    if (shareType === "public") {
      // Public sharing: /share/public/{app}/{filename}
      if (pathSegments.length < 3) {
        return new Response(
          JSON.stringify({ error: "Public share URL requires app and filename" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const applicationSlug = pathSegments[1];
      const filename = pathSegments.slice(2).join("/");
      
      // Find the public file
      const { data: storageObject, error } = await supabase
        .from('storage_objects')
        .select('*')
        .eq('object_type', applicationSlug)
        .eq('name', filename)
        .eq('is_public', true)
        .single();

      if (error || !storageObject) {
        console.error("❌ Public file not found:", error?.message);
        return new Response(
          JSON.stringify({ error: "File not found or not publicly accessible" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Download the file from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("application-files")
        .download(storageObject.file_path);

      if (downloadError) {
        console.error("❌ Failed to download public file:", downloadError.message);
        return new Response(
          JSON.stringify({ error: "Failed to retrieve file" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Return file with cache headers for public content
      const cacheHeaders = {
        ...corsHeaders,
        "Content-Type": storageObject.mime_type || "application/octet-stream",
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
        "ETag": `"${storageObject.id}"`,
        "Last-Modified": new Date(storageObject.updated_at).toUTCString(),
        "Content-Disposition": `inline; filename="${storageObject.name}"`,
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
      };

      console.log("✅ Serving public file:", storageObject.file_path);
      return new Response(fileData, {
        status: 200,
        headers: cacheHeaders,
      });

    } else if (shareType === "token") {
      // Token-based sharing: /share/token/{token}
      const shareToken = pathSegments[1];
      
      if (!shareToken) {
        return new Response(
          JSON.stringify({ error: "Share token is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Find the file by share token
      const { data: storageObject, error } = await supabase
        .from('storage_objects')
        .select('*')
        .eq('share_token', shareToken)
        .single();

      if (error || !storageObject) {
        console.error("❌ Shared file not found:", error?.message);
        return new Response(
          JSON.stringify({ error: "Invalid or expired share link" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Download the file from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("application-files")
        .download(storageObject.file_path);

      if (downloadError) {
        console.error("❌ Failed to download shared file:", downloadError.message);
        return new Response(
          JSON.stringify({ error: "Failed to retrieve file" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Return file with limited cache headers for token-based content
      const cacheHeaders = {
        ...corsHeaders,
        "Content-Type": storageObject.mime_type || "application/octet-stream",
        "Cache-Control": "private, max-age=300", // Cache for 5 minutes only
        "Content-Disposition": `inline; filename="${storageObject.name}"`,
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
      };

      console.log("✅ Serving shared file via token:", storageObject.file_path);
      return new Response(fileData, {
        status: 200,
        headers: cacheHeaders,
      });

    } else {
      return new Response(
        JSON.stringify({ error: "Invalid share type. Must be 'public' or 'token'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("❌ Share handler error:", error);
    return new Response(
      JSON.stringify({
        error: "Share operation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}