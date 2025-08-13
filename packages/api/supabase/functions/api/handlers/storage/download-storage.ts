import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

interface StorageDownloadContext {
  user: any;
  supabase: SupabaseClient;
  supabaseAdmin: SupabaseClient;
  applicationSlug: string;
  filePath: string;
}

export async function handleStorageDownload(
  req: Request,
  context: StorageDownloadContext,
): Promise<Response> {
  let { user, supabase, applicationSlug, filePath } = context;
  const url = new URL(req.url);

  // Handle authentication from query parameters for video previews
  // This allows video elements to load content without CORS issues
  const tokenFromQuery = url.searchParams.get("token");
  const userIdFromQuery = url.searchParams.get("userId");
  
  if (!user && tokenFromQuery && userIdFromQuery) {
    // Validate the token and get user info
    const { data: tokenUser, error: tokenError } = await supabase.auth.getUser(tokenFromQuery);
    
    if (!tokenError && tokenUser?.user?.id === userIdFromQuery) {
      user = tokenUser.user;
      console.log("✅ Authenticated via query token for user:", user.id);
    }
  }

  if (!user) {
    return new Response(
      JSON.stringify({ error: "Authentication required" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (!filePath) {
    return new Response(
      JSON.stringify({ error: "File path is required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  console.log("📥 Download request for app:", applicationSlug, "file:", filePath);

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

    const fullPath = `${user.id}/${applicationSlug}/${filePath}`;
    console.log("📄 Downloading file:", fullPath);

    // For HEAD requests, we just check permissions and bandwidth limits without downloading
    const isHeadRequest = req.method === "HEAD";
    
    // Get file info from database first to check size for bandwidth limits
    const { data: storageObject, error: fetchError } = await supabase
      .from('storage_objects')
      .select('file_size, mime_type')
      .eq('user_id', user.id)
      .eq('file_path', fullPath)
      .single();

    if (fetchError || !storageObject) {
      console.error("❌ File not found in database:", fetchError?.message);
      return new Response(
        JSON.stringify({ error: "File not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const fileSize = storageObject.file_size;
    const contentType = storageObject.mime_type || "application/octet-stream";
    console.log("📊 Checking bandwidth limits for download:", fileSize, "bytes for user:", user.id);

    // Check bandwidth limits before allowing download
    try {
      // Get user's current bandwidth usage and limit
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('bandwidth_used, bandwidth_limit')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error("❌ Failed to fetch user bandwidth info:", userError.message);
        return new Response(
          JSON.stringify({ error: "Failed to check bandwidth limits" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const currentBandwidth = userData.bandwidth_used || 0;
      const bandwidthLimit = userData.bandwidth_limit || (250 * 1024 * 1024); // Default 250MB

      // Check if this download would exceed the limit
      if (currentBandwidth + fileSize > bandwidthLimit) {
        const usedMB = Math.round(currentBandwidth / (1024 * 1024));
        const limitMB = Math.round(bandwidthLimit / (1024 * 1024));
        const downloadMB = Math.round(fileSize / (1024 * 1024));
        const remainingMB = Math.round((bandwidthLimit - currentBandwidth) / (1024 * 1024));
        console.log("❌ Bandwidth limit exceeded:", usedMB, "MB of", limitMB, "MB. This download would exceed your remaining", remainingMB, "MB.");
        
        return new Response(
          JSON.stringify({
            error: `Bandwidth limit exceeded. You have used ${usedMB}MB of ${limitMB}MB. This download (${downloadMB}MB) would exceed your remaining ${remainingMB}MB.`,
            code: "BANDWIDTH_LIMIT_EXCEEDED"
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // For HEAD requests, we don't download or track bandwidth, just return success
      if (isHeadRequest) {
        console.log("✅ HEAD request passed bandwidth check for:", fullPath);
        return new Response(null, {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": contentType,
            "Content-Length": fileSize.toString(),
          },
        });
      }

      // Track bandwidth usage before serving file (only for actual downloads, not HEAD)
      const { error: bandwidthError } = await supabase.rpc('increment_user_bandwidth', {
        user_id: user.id,
        bandwidth_delta: fileSize
      });

      if (bandwidthError) {
        console.error("❌ Failed to track bandwidth usage:", bandwidthError.message);
        return new Response(
          JSON.stringify({ error: "Failed to track bandwidth usage" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      } else {
        console.log("✅ Bandwidth usage tracked:", fileSize, "bytes for user:", user.id);
      }
    } catch (bandwidthTrackingError) {
      console.error("❌ Bandwidth tracking error:", bandwidthTrackingError);
      return new Response(
        JSON.stringify({ error: "Failed to process bandwidth tracking" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Download file from Supabase Storage (only for non-HEAD requests)
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
    console.log("✅ File downloaded:", fullPath, "type:", contentType, "size:", fileSize);

    return new Response(data, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filePath}"`,
      },
    });
  } catch (error) {
    console.error("❌ Storage download error:", error);
    return new Response(
      JSON.stringify({
        error: "Download operation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}