import { corsHeaders, errorResponses, getSupabaseClient } from "../../_common/index.ts";

interface ShareContext {
  pathSegments: string[];
}

export async function handleShare(
  req: Request,
  context: ShareContext,
): Promise<Response> {
  const { pathSegments } = context;
  const supabase = getSupabaseClient();
  const origin = req.headers.get('origin');

  if (pathSegments.length < 2) {
    return errorResponses.badRequest("Invalid share URL format", origin || undefined);
  }

  const shareType = pathSegments[0]; // 'public' or 'token'
  console.log("🔗 Share request:", req.method, "type:", shareType, "path:", pathSegments);

  try {
    if (shareType === "file") {
      // Direct file access by ID: /share/file/{id}
      const fileId = pathSegments[1];
      
      if (!fileId) {
        return errorResponses.badRequest("File ID is required", origin || undefined);
      }

      // Find the file by ID and check if it's public
      const { data: storageObject, error } = await supabase
        .from("storage_objects")
        .select("*")
        .eq("id", fileId)
        .eq("is_public", true)
        .single();

      if (error || !storageObject) {
        console.error("❌ Public file not found:", error?.message);
        return errorResponses.notFound("File not found or not publicly accessible", origin || undefined);
      }

      // Download the file from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("application-files")
        .download(storageObject.file_path);

      if (downloadError) {
        console.error("❌ Failed to download file:", downloadError.message);
        return errorResponses.internalServerError("Failed to retrieve file", origin || undefined);
      }

      // Return file with appropriate headers
      const headers = {
        ...corsHeaders,
        "Content-Type": storageObject.mime_type || "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": `inline; filename="${storageObject.name}"`,
      };

      console.log("✅ Serving public file by ID:", storageObject.file_path);
      return new Response(fileData, {
        status: 200,
        headers,
      });
    } else if (shareType === "public") {
      // Public sharing: /share/public/{app}/{filename}
      if (pathSegments.length < 3) {
        return errorResponses.badRequest("Public share URL requires app and filename", origin || undefined);
      }

      const applicationSlug = pathSegments[1];
      const filename = pathSegments.slice(2).join("/");

      // Find the public file
      const { data: storageObject, error } = await supabase
        .from("storage_objects")
        .select("*")
        .eq("name", filename)
        .eq("is_public", true)
        .single();

      if (error || !storageObject) {
        console.error("❌ Public file not found:", error?.message);
        return errorResponses.notFound("File not found or not publicly accessible", origin || undefined);
      }

      // Download the file from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("application-files")
        .download(storageObject.file_path);

      if (downloadError) {
        console.error("❌ Failed to download public file:", downloadError.message);
        return errorResponses.internalServerError("Failed to retrieve file", origin || undefined);
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
        return errorResponses.badRequest("Share token is required", origin || undefined);
      }

      // Find the file by share token
      const { data: storageObject, error } = await supabase
        .from("storage_objects")
        .select("*")
        .eq("share_token", shareToken)
        .single();

      if (error || !storageObject) {
        console.error("❌ Shared file not found:", error?.message);
        return errorResponses.notFound("Invalid or expired share link", origin || undefined);
      }

      // Download the file from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("application-files")
        .download(storageObject.file_path);

      if (downloadError) {
        console.error("❌ Failed to download shared file:", downloadError.message);
        return errorResponses.internalServerError("Failed to retrieve file", origin || undefined);
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
      return errorResponses.badRequest("Invalid share type. Must be 'public' or 'token'", origin || undefined);
    }
  } catch (error) {
    console.error("❌ Share handler error:", error);
    return errorResponses.internalServerError(
      error instanceof Error ? error.message : "Unknown error",
      origin || undefined
    );
  }
}
