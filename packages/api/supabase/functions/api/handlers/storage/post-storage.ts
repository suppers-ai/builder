import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

interface StorageUploadContext {
  user: any;
  supabase: SupabaseClient;
  supabaseAdmin: SupabaseClient;
  applicationSlug: string;
  filePath: string;
}

export async function handleStorageUpload(
  req: Request,
  context: StorageUploadContext,
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

  console.log("📤 Upload request for app:", applicationSlug, "file:", filePath);

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

    // Check if request is multipart form data (file upload)
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get("file") as File;
      
      if (!file) {
        return new Response(
          JSON.stringify({ error: "No file provided" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const fileBuffer = await file.arrayBuffer();
      const fileName = filePath || file.name;
      const fullPath = `${user.id}/${applicationSlug}/${fileName}`;

      console.log("📁 Uploading file:", fullPath, "size:", fileBuffer.byteLength);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("application-files")
        .upload(fullPath, fileBuffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        console.error("❌ Upload error:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("application-files")
        .getPublicUrl(fullPath);

      console.log("✅ File uploaded:", data.path);

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            path: data.path,
            publicUrl: publicUrlData.publicUrl,
            fullPath: data.fullPath,
          },
        }),
        {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } else {
      // Handle raw file content upload (for text files, JSON, etc.)
      if (!filePath) {
        return new Response(
          JSON.stringify({ error: "File path is required for direct content upload" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const contentBuffer = await req.arrayBuffer();
      const fullPath = `${user.id}/${applicationSlug}/${filePath}`;

      console.log("📝 Uploading content to:", fullPath, "size:", contentBuffer.byteLength);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("application-files")
        .upload(fullPath, contentBuffer, {
          contentType: contentType || "application/octet-stream",
          upsert: true,
        });

      if (error) {
        console.error("❌ Upload error:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("application-files")
        .getPublicUrl(fullPath);

      console.log("✅ Content uploaded:", data.path);

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            path: data.path,
            publicUrl: publicUrlData.publicUrl,
            fullPath: data.fullPath,
          },
        }),
        {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("❌ Storage upload error:", error);
    return new Response(
      JSON.stringify({
        error: "Upload failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}