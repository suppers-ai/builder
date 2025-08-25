import { errorResponses, jsonResponse } from "../../_common/index.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

interface StorageUploadContext {
  userId: string;
  supabase: SupabaseClient;
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
    const allowedTypes = ["video/webm", "video/mp4", "video/avi", "video/mov", "video/quicktime"];
    // Check if file type starts with any allowed type (to handle codec specifications like video/webm;codecs=vp9)
    const isValidType = allowedTypes.some((type) => file.type.startsWith(type));

    if (!isValidType) {
      throw new Error(`Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(", ")}`);
    }
  }
  // Add validation for other built-in apps as needed
}

async function validateStorageLimit(supabase: SupabaseClient, userId: string, fileSize: number) {
  // Get user's current storage usage and limit
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("storage_used, storage_limit")
    .eq("id", userId)
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
      `Storage limit exceeded. You have used ${usedMB}MB of ${limitMB}MB. This upload (${uploadMB}MB) would exceed your remaining ${remainingMB}MB.`,
    );
  }
}

export async function handleStorageUpload(
  req: Request,
  context: StorageUploadContext,
): Promise<Response> {
  const { userId, supabase, applicationSlug, filePath } = context;

  const origin = req.headers.get('origin');
  
  if (!userId) {
    return errorResponses.unauthorized("Authentication required", origin || undefined);
  }

  console.log("📤 Upload request for app:", applicationSlug, "file:", filePath);

  try {
    // Check if application exists
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, slug")
      .eq("slug", applicationSlug)
      .single();

    if (appError || !application) {
      console.log("❌ Application not found or not owned by user:", applicationSlug);
      return errorResponses.notFound("Application not found", origin || undefined);
    }

    // Check if request is multipart form data (file upload)
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return errorResponses.badRequest("No file provided", origin || undefined);
      }

      // Validate file based on application type
      try {
        validateFile(file, applicationSlug);
      } catch (error) {
        console.error("❌ File validation failed:", error instanceof Error ? error.message : String(error));
        return errorResponses.badRequest(
          error instanceof Error ? error.message : String(error),
          origin || undefined
        );
      }

      // Validate storage limits before upload
      try {
        await validateStorageLimit(supabase, userId, file.size);
      } catch (error) {
        console.error("❌ Storage limit validation failed:", error instanceof Error ? error.message : String(error));
        return errorResponses.tooManyRequests(
          error instanceof Error ? error.message : String(error),
          origin || undefined
        );
      }

      const fileBuffer = await file.arrayBuffer();
      const fileName = filePath || file.name;
      const fullPath = `${userId}/${applicationSlug}/${fileName}`;

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
        return errorResponses.internalServerError(error.message, origin || undefined);
      }

      // Get parent_folder_id from form data if provided
      const parentFolderId = formData.get("parent_folder_id") as string || null;
      const objectType = formData.get("object_type") as string || "file";

      // Create storage object record in database for tracking
      const { data: storageObject, error: dbError } = await supabase
        .from("storage_objects")
        .insert({
          user_id: userId,
          name: fileName,
          file_path: fullPath,
          file_size: file.size,
          mime_type: file.type,
          object_type: objectType,
          parent_folder_id: parentFolderId,
          application_id: application.id,
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            application: applicationSlug,
          },
        })
        .select()
        .single();

      if (dbError) {
        console.error("❌ Failed to create storage object record:", dbError.message);
        // Continue anyway, file is uploaded, just missing DB record
      }

      // Update user's storage usage
      if (storageObject || !dbError) {
        const { error: updateError } = await supabase.rpc("increment_user_storage", {
          user_id: userId,
          size_delta: file.size,
        });

        if (updateError) {
          console.error("❌ Failed to update user storage usage:", updateError.message);
        } else {
          console.log("✅ User storage usage updated:", file.size, "bytes for user:", userId);
        }
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("application-files")
        .getPublicUrl(fullPath);

      console.log("✅ File uploaded:", data.path);

      return jsonResponse({
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
      }, { status: 201, origin: origin || undefined });
    } else if (contentType.includes("application/json")) {
      // Handle JSON content (folder creation or metadata updates)
      const jsonData = await req.json();
      
      // Check if this is a folder creation request
      if (jsonData.contentType === "application/x-folder" || jsonData.object_type === "folder") {
        const folderName = jsonData.name;
        const folderPath = jsonData.path || filePath;
        const metadata = jsonData.metadata || {};
        const parentFolderId = jsonData.parent_folder_id || null;
        
        console.log("📁 Creating folder:", folderName, "at path:", folderPath, "parent:", parentFolderId);
        
        // Create folder record in database
        const { data: folderObject, error: dbError } = await supabase
          .from("storage_objects")
          .insert({
            user_id: userId,
            name: folderName,
            file_path: folderPath,
            file_size: 0,
            mime_type: "application/x-folder",
            object_type: "folder",
            parent_folder_id: parentFolderId,
            application_id: application.id,
            metadata: {
              ...metadata,
              createdAt: new Date().toISOString(),
              application: applicationSlug,
            },
          })
          .select()
          .single();
        
        if (dbError) {
          console.error("❌ Failed to create folder record:", dbError.message);
          return errorResponses.internalServerError(dbError.message, origin || undefined);
        }
        
        console.log("✅ Folder created:", folderName);
        
        return jsonResponse({
          success: true,
          data: {
            id: folderObject.id,
            name: folderName,
            path: folderPath,
            isFolder: true,
            metadata: folderObject.metadata,
          },
        }, { status: 201, origin: origin || undefined });
      }
      
      // Handle other JSON content
      return errorResponses.badRequest("Unsupported JSON content", origin || undefined);
    } else {
      // Handle raw file content upload (for text files, etc.)
      if (!filePath) {
        return errorResponses.badRequest("File path is required for direct content upload", origin || undefined);
      }

      const contentBuffer = await req.arrayBuffer();
      const fullPath = `${userId}/${applicationSlug}/${filePath}`;

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
        return errorResponses.internalServerError(error.message, origin || undefined);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("application-files")
        .getPublicUrl(fullPath);

      console.log("✅ Content uploaded:", data.path);

      return jsonResponse({
        success: true,
        data: {
          path: data.path,
          publicUrl: publicUrlData.publicUrl,
          fullPath: data.fullPath,
        },
      }, { status: 201, origin: origin || undefined });
    }
  } catch (error) {
    console.error("❌ Storage upload error:", error);
    return errorResponses.internalServerError(
      error instanceof Error ? error.message : "Unknown error",
      origin || undefined
    );
  }
}
