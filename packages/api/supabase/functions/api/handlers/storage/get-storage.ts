import { errorResponses, jsonResponse } from "../../_common/index.ts";
import type { SupabaseClient } from "@supabase/supabase-js";


interface StorageGetContext {
  userId: string;
  supabase: SupabaseClient;
  applicationSlug: string;
  filePath: string;
  shareToken?: string;
  userEmail?: string;
}

export async function handleStorageGet(
  req: Request,
  context: StorageGetContext,
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

  console.log("📥 Get request for app:", applicationSlug, "file:", filePath);

  try {
    // If no file path specified, list all files for the application
    if (!filePath) {
      const pathPrefix = `${userId}/${applicationSlug}/`;
      
      console.log("📂 Listing files for:", pathPrefix);
      
      const { data: storageObjects, error: listError } = await supabase
        .from("storage_objects")
        .select("*")
        .like("file_path", `${pathPrefix}%`)
        .eq("user_id", userId);

      if (listError) {
        console.error("❌ List error:", listError.message);
        return new Response(
          JSON.stringify({ error: "Failed to list files", message: listError.message }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const files = (storageObjects || []).map((obj: any) => ({
        id: obj.id,
        name: obj.name,
        path: obj.file_path,
        size: obj.file_size,
        contentType: obj.mime_type,
        lastModified: obj.updated_at,
        createdAt: obj.created_at,
        metadata: obj.metadata || {},
        isPublic: obj.is_public || false,
        shareToken: obj.share_token || null,
      }));

      console.log(`✅ Listed ${files.length} files`);

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            files,
            totalCount: files.length,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Get specific file

    const fullPath = `${userId}/${applicationSlug}/${filePath}`;
    console.log("📄 Getting file:", fullPath);

    // Return file metadata only - no content download from this endpoint
    const { data: storageObject, error: fetchError } = await supabase
      .from("storage_objects")
      .select("*")
      .eq("file_path", fullPath)
      .single();

    // Check authorization: user owns the file OR has valid share token OR is in shared emails
    const isOwner = storageObject?.user_id === userId;
    const hasValidShareToken = shareToken && storageObject?.share_token === shareToken;
    const isSharedViaEmail = userEmail && storageObject?.shared_with_emails?.includes(userEmail);
    
    if (!isOwner && !hasValidShareToken && !isSharedViaEmail) {
      return new Response(
        JSON.stringify({ error: "You are not authorized to access this file" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (fetchError || !storageObject) {
      console.error("❌ File not found:", fetchError?.message);
      return new Response(
        JSON.stringify({ error: "File not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Storage get error:", error);
    return new Response(
      JSON.stringify({
        error: "Get operation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
