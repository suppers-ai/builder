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

    // Check if user is owner or has write access
    const isOwner = application.owner_id === user.id;
    let hasWriteAccess = isOwner;

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

    // Delete from Supabase Storage
    const { data, error } = await supabase.storage
      .from("application-files")
      .remove([fullPath]);

    if (error) {
      console.error("❌ Delete error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: "File not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("✅ File deleted:", fullPath);

    return new Response(
      JSON.stringify({
        success: true,
        message: "File deleted successfully",
        data: {
          path: fullPath,
          deletedFiles: data,
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