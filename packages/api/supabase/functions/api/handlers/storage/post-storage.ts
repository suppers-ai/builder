import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

interface StorageUploadContext {
  user: any;
  supabase: SupabaseClient;
  supabaseAdmin: SupabaseClient;
  applicationSlug: string;
  filePath: string;
}

function validateFile(file: File, applicationSlug: string) {
  const maxSize = 500 * 1024 * 1024; // 500MB

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    const fileSizeMB = Math.round(file.size / (1024 * 1024));
    throw new Error(`File too large: ${fileSizeMB}MB. Maximum allowed: ${maxSizeMB}MB`);
  }

  // Application-specific validation
  if (applicationSlug === "recorder") {
    const allowedTypes = ['video/webm', 'video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];
    // Check if file type starts with any allowed type (to handle codec specifications like video/webm;codecs=vp9)
    const isValidType = allowedTypes.some(type => file.type.startsWith(type));
    
    if (!isValidType) {
      throw new Error(`Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }
  // Add validation for other built-in apps as needed
}

async function validateStorageLimit(supabase: SupabaseClient, userId: string, fileSize: number) {
  // Get user's current storage usage and limit
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('storage_used, storage_limit')
    .eq('id', userId)
    .single();

  if (userError) {
    throw new Error("Failed to check storage limits");
  }

  const currentStorage = userData.storage_used || 0;
  const storageLimit = userData.storage_limit || (250 * 1024 * 1024); // Default 250MB

  // Check if this upload would exceed the limit
  if (currentStorage + fileSize > storageLimit) {
    const usedMB = Math.round(currentStorage / (1024 * 1024));
    const limitMB = Math.round(storageLimit / (1024 * 1024));
    const uploadMB = Math.round(fileSize / (1024 * 1024));
    const remainingMB = Math.round((storageLimit - currentStorage) / (1024 * 1024));
    
    throw new Error(
      `Storage limit exceeded. You have used ${usedMB}MB of ${limitMB}MB. This upload (${uploadMB}MB) would exceed your remaining ${remainingMB}MB.`
    );
  }
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

      // Validate file based on application type
      try {
        validateFile(file, applicationSlug);
      } catch (error) {
        console.error("❌ File validation failed:", error.message);
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Validate storage limits before upload
      try {
        await validateStorageLimit(supabase, user.id, file.size);
      } catch (error) {
        console.error("❌ Storage limit validation failed:", error.message);
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 429,
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

      // Create storage object record in database for tracking
      const { data: storageObject, error: dbError } = await supabase
        .from('storage_objects')
        .insert({
          user_id: user.id,
          name: fileName,
          file_path: fullPath,
          file_size: file.size,
          mime_type: file.type,
          object_type: applicationSlug, // Use application slug as object type
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            application: applicationSlug
          }
        })
        .select()
        .single();

      if (dbError) {
        console.error("❌ Failed to create storage object record:", dbError.message);
        // Continue anyway, file is uploaded, just missing DB record
      }

      // Update user's storage usage
      if (storageObject || !dbError) {
        const { error: updateError } = await supabase.rpc('increment_user_storage', {
          user_id: user.id,
          size_delta: file.size
        });
          
        if (updateError) {
          console.error("❌ Failed to update user storage usage:", updateError.message);
        } else {
          console.log("✅ User storage usage updated:", file.size, "bytes for user:", user.id);
        }
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("application-files")
        .getPublicUrl(fullPath);

      console.log("✅ File uploaded:", data.path);

      return new Response(
        JSON.stringify({
          success: true,
          id: storageObject?.id || null,
          filename: fileName,
          filePath: fullPath,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
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