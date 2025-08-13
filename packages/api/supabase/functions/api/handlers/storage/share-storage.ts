import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

interface StorageShareContext {
  user: any;
  supabase: SupabaseClient;
  supabaseAdmin: SupabaseClient;
  applicationSlug: string;
  filePath: string;
}

interface ShareRequest {
  action: 'create_token' | 'remove_token' | 'make_public' | 'make_private' | 'make_private_only';
}

// Generate a secure random token
function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 32;
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

export async function handleStorageShare(
  req: Request,
  context: StorageShareContext,
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

  console.log("🔗 Share request for app:", applicationSlug, "file:", filePath);

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
    console.log("🔗 Managing sharing for file:", fullPath);

    // Get the storage object
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

    // Parse the request body
    const shareRequest: ShareRequest = await req.json();
    
    let updates: any = {
      updated_at: new Date().toISOString()
    };

    switch (shareRequest.action) {
      case 'create_token':
        // Generate a new share token (don't change public setting)
        const shareToken = generateShareToken();
        updates.share_token = shareToken;
        break;

      case 'remove_token':
        // Remove the share token (don't change public setting)
        updates.share_token = null;
        break;

      case 'make_public':
        // Make file publicly accessible (keep existing token if any)
        updates.is_public = true;
        break;

      case 'make_private':
        // Make file private (remove both public and token access)
        updates.is_public = false;
        updates.share_token = null;
        break;

      case 'make_private_only':
        // Turn off public access but keep token if it exists
        updates.is_public = false;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action. Must be: create_token, remove_token, make_public, make_private, or make_private_only" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
    }

    // Update the storage object
    const { data: updatedObject, error: updateError } = await supabase
      .from('storage_objects')
      .update(updates)
      .eq('id', storageObject.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Failed to update sharing settings:", updateError.message);
      return new Response(
        JSON.stringify({ error: "Failed to update sharing settings" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("✅ Sharing settings updated for:", fullPath);

    // Generate share URLs that point to the recorder share pages
    // These URLs will show a proper video preview page, not just serve the file
    let shareUrls: any = {};

    if (updatedObject.is_public) {
      shareUrls.publicUrl = `http://localhost:8002/share/public/${applicationSlug}/${filePath}`;
    }

    if (updatedObject.share_token) {
      shareUrls.tokenUrl = `http://localhost:8002/share/${updatedObject.share_token}`;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: updatedObject.id,
          name: updatedObject.name,
          isPublic: updatedObject.is_public,
          shareToken: updatedObject.share_token,
          shareUrls: shareUrls,
          action: shareRequest.action,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Storage share error:", error);
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