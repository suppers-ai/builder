import { errorResponses, jsonResponse, corsHeaders } from "../../_common/index.ts";
import type { SupabaseClient } from "@supabase/supabase-js";


interface StorageDownloadContext {
  userId: string;
  supabase: SupabaseClient;
  applicationSlug: string;
  filePath: string;
  userEmail?: string;
  shareToken?: string;
}

export async function handleStorageDownload(
  req: Request,
  context: StorageDownloadContext,
): Promise<Response> {
  const { userId, supabase, applicationSlug, filePath, userEmail, shareToken } = context;
  const origin = req.headers.get('origin');

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Authentication required" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (!filePath) {
    return new Response(
      JSON.stringify({ error: "File path is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const fullPath = `${userId}/${applicationSlug}/${filePath}`;
    console.log("📄 Downloading file:", fullPath);

    // For HEAD requests, we just check permissions and bandwidth limits without downloading
    const isHeadRequest = req.method === "HEAD";

    // Get file info from database first to check size for bandwidth limits
    const { data: storageObject, error: fetchError } = await supabase
      .from("storage_objects")
      .select("file_size, mime_type, user_id, share_token, shared_with_emails")
      .eq("file_path", fullPath)
      .single();

    if (
      storageObject?.user_id !== userId || storageObject?.share_token !== shareToken ||
      !storageObject?.shared_with_emails?.includes(userEmail)
    ) {
      return new Response(
        JSON.stringify({ error: "You are not authorized to delete this file" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (fetchError || !storageObject) {
      console.error("❌ File not found in database:", fetchError);
      return new Response(
        JSON.stringify({ error: "File not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const fileSize = storageObject.file_size;
    const contentType = storageObject.mime_type || "application/octet-stream";
    console.log("📊 Checking bandwidth limits for download:", fileSize, "bytes for user:", userId);

    // Check bandwidth limits before allowing download
    try {
      // Get user's current bandwidth usage and limit
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("bandwidth_used, bandwidth_limit")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("❌ Failed to fetch user bandwidth info:", userError.message);
        return new Response(
          JSON.stringify({ error: "Failed to check bandwidth limits" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
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
        console.log(
          "❌ Bandwidth limit exceeded:",
          usedMB,
          "MB of",
          limitMB,
          "MB. This download would exceed your remaining",
          remainingMB,
          "MB.",
        );

        return new Response(
          JSON.stringify({
            error:
              `Bandwidth limit exceeded. You have used ${usedMB}MB of ${limitMB}MB. This download (${downloadMB}MB) would exceed your remaining ${remainingMB}MB.`,
            code: "BANDWIDTH_LIMIT_EXCEEDED",
          }),
          {
            status: 429,
            headers: { "Content-Type": "application/json" },
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
      const { error: bandwidthError } = await supabase.rpc("increment_user_bandwidth", {
        user_id: userId,
        bandwidth_delta: fileSize,
      });

      if (bandwidthError) {
        console.error("❌ Failed to track bandwidth usage:", bandwidthError.message);
        return new Response(
          JSON.stringify({ error: "Failed to track bandwidth usage" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      } else {
        console.log("✅ Bandwidth usage tracked:", fileSize, "bytes for user:", userId);
      }
    } catch (bandwidthTrackingError) {
      console.error("❌ Bandwidth tracking error:", bandwidthTrackingError);
      return new Response(
        JSON.stringify({ error: "Failed to process bandwidth tracking" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
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
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
