import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

interface StorageDeleteContext {
  user: any;
  supabase: SupabaseClient;
  supabaseAdmin: SupabaseClient;
  applicationSlug: string;
  filePath: string;
}

export async function handleStorageDelete(
  req: Request,
  context: StorageDeleteContext,
): Promise<Response> {
  const { user, supabase, applicationSlug, filePath } = context;

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

  console.log("🗑️ Delete request for app:", applicationSlug, "file:", filePath);

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

    // Check if user is owner or has write access
    const isOwner = application.owner_id === user.id;
    let hasWriteAccess = isOwner;
    const applicationId = application.id;

    if (!isOwner) {
      const { data: access } = await supabase
        .from("user_access")
        .select("access_level")
        .eq("application_id", application.id)
        .eq("user_id", user.id)
        .single();

      hasWriteAccess = access ? ["write", "admin"].includes(access.access_level) : false;
    }

    if (!hasWriteAccess) {
      console.log("❌ User lacks write access:", user.id);
      return new Response(
        JSON.stringify({ error: "Write access required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const fullPath = `${user.id}/${applicationSlug}/${filePath}`;
    console.log("🗂️ Deleting file:", fullPath);

    // First, get the storage object record to get file size for storage update
    const { data: storageObject, error: fetchError } = await supabase
      .from('storage_objects')
      .select('id, file_size, file_path')
      .eq('user_id', user.id)
      .eq('file_path', fullPath)
      .single();

    if (fetchError || !storageObject) {
      console.error("❌ Storage object not found:", fetchError?.message);
      return new Response(
        JSON.stringify({ error: "File not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Delete the record from storage_objects table
    const { error: dbDeleteError } = await supabase
      .from('storage_objects')
      .delete()
      .eq('id', storageObject.id)
      .eq('user_id', user.id);

    if (dbDeleteError) {
      console.error("❌ Failed to delete storage object record:", dbDeleteError.message);
      return new Response(
        JSON.stringify({ error: "Failed to delete file record" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update user's storage usage
    const { error: storageUpdateError } = await supabase.rpc('increment_user_storage', {
      user_id: user.id,
      size_delta: -storageObject.file_size // Negative to reduce storage used
    });

    if (storageUpdateError) {
      console.error("❌ Failed to update user storage:", storageUpdateError.message);
      // Continue anyway - file will be deleted but storage counter might be off
    } else {
      console.log("✅ User storage usage updated:", -storageObject.file_size, "bytes for user:", user.id);
    }

    // Delete from Supabase Storage
    const { data, error } = await supabase.storage
      .from("application-files")
      .remove([fullPath]);

    if (error) {
      console.error("❌ Storage delete error:", error.message);
      // Even if storage delete fails, the database record is gone, so return success
      console.warn("File deleted from database but storage delete failed - this is a cleanup issue");
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}