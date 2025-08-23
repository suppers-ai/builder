import { errorResponses, jsonResponse } from "../../_common/index.ts";
import type { SupabaseClient } from "@supabase/supabase-js";


interface StorageDeleteContext {
  userId: string;
  supabase: SupabaseClient;
  applicationSlug: string;
  filePath: string;
}

export async function handleStorageDelete(
  req: Request,
  context: StorageDeleteContext,
): Promise<Response> {
  const { userId, supabase, applicationSlug, filePath } = context;
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

  console.log("🗑️ Delete request for app:", applicationSlug, "file:", filePath);

  try {
    const fullPath = `${userId}/${applicationSlug}/${filePath}`;
    console.log("🗂️ Deleting file:", fullPath);

    // First, get the storage object record to get file size for storage update
    const { data: storageObject, error: fetchError } = await supabase
      .from("storage_objects")
      .select("id, file_size, file_path")
      .eq("user_id", userId)
      .eq("file_path", fullPath)
      .single();

    if (fetchError || !storageObject) {
      console.error("❌ Storage object not found:", fetchError?.message);
      return new Response(
        JSON.stringify({ error: "File not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Delete the record from storage_objects table
    const { error: dbDeleteError } = await supabase
      .from("storage_objects")
      .delete()
      .eq("id", storageObject.id)
      .eq("user_id", userId);

    if (dbDeleteError) {
      console.error("❌ Failed to delete storage object record:", dbDeleteError.message);
      return new Response(
        JSON.stringify({ error: "Failed to delete file record" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Update user's storage usage
    const { error: storageUpdateError } = await supabase.rpc("increment_user_storage", {
      user_id: userId,
      size_delta: -storageObject.file_size, // Negative to reduce storage used
    });

    if (storageUpdateError) {
      console.error("❌ Failed to update user storage:", storageUpdateError.message);
      // Continue anyway - file will be deleted but storage counter might be off
    } else {
      console.log(
        "✅ User storage usage updated:",
        -storageObject.file_size,
        "bytes for user:",
        userId,
      );
    }

    // Delete from Supabase Storage
    const { data, error } = await supabase.storage
      .from("application-files")
      .remove([fullPath]);

    if (error) {
      console.error("❌ Storage delete error:", error.message);
      // Even if storage delete fails, the database record is gone, so return success
      console.warn(
        "File deleted from database but storage delete failed - this is a cleanup issue",
      );
    }

    console.log("✅ File deleted:", fullPath);

    return new Response(
      JSON.stringify({
        success: true,
        message: "File deleted successfully",
        data: {
          path: fullPath,
          fileSize: storageObject.file_size,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Storage delete error:", error);
    return new Response(
      JSON.stringify({
        error: "Delete operation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
