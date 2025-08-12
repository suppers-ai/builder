import { Context } from "fresh";
import {
  corsHeaders,
  createErrorResponse,
  createSuccessResponse,
  authenticateRequest,
  validateFile,
  validateStorageLimit,
  createFilePath,
  generateRecordingId,
} from "../../lib/api-utils.ts";

export const handler = {
  // Handle preflight OPTIONS request
  OPTIONS() {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  },

  async GET(ctx: Context<unknown>) {
    try {
      const { userId, supabase } = await authenticateRequest(ctx);
      
      const folderPath = `${userId}/recorder`;

      const { data: files, error: listError } = await supabase.storage
        .from('application-files')
        .list(folderPath, {
          limit: 100,
          offset: 0,
        });

      if (listError) {
        console.error("Failed to list files:", listError.message);
        
        if (listError.message.includes("exp") || listError.message.includes("expired")) {
          return createErrorResponse("Your session has expired. Please log in again.", 401, "TOKEN_EXPIRED");
        }

        return createErrorResponse("Failed to list recordings", 500);
      }

      // Get recordings from storage_objects table
      const { data: storageObjects, error: dbError } = await supabase
        .from('storage_objects')
        .select('*')
        .eq('user_id', userId)
        .eq('object_type', 'recording')
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error("Failed to fetch storage objects:", dbError.message);
        return createErrorResponse("Failed to fetch recordings from database", 500);
      }

      // Calculate total storage used for recordings
      const totalStorage = (storageObjects || []).reduce((total, obj) => {
        return total + (obj.file_size || 0);
      }, 0);

      const recordings = (storageObjects || []).map(obj => {
        return {
          id: obj.id,
          name: obj.name,
          size: obj.file_size,
          createdAt: new Date(obj.created_at).toISOString(),
          updatedAt: new Date(obj.updated_at).toISOString(),
          filePath: obj.file_path,
          mimeType: obj.mime_type,
          duration: obj.metadata?.duration || 0,
        };
      });

      return createSuccessResponse({
        success: true,
        recordings: recordings,
        totalStorage: totalStorage
      });

    } catch (error) {
      console.error("List recordings error:", error);
      
      const message = error instanceof Error ? error.message : "Unknown error";
      
      if (message.includes("Authentication") || message.includes("Authorization")) {
        return createErrorResponse(message, 401);
      }
      
      if (message.includes("Token does not match")) {
        return createErrorResponse(message, 403, "USER_MISMATCH");
      }
      
      if (message.includes("expired")) {
        return createErrorResponse(message, 401, "TOKEN_EXPIRED");
      }

      return createErrorResponse("Failed to list recordings", 500);
    }
  },

  async POST(ctx: Context<unknown>) {
    try {
      const { userId, supabase } = await authenticateRequest(ctx);

      const formData = await ctx.req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return createErrorResponse("No file provided", 400);
      }

      validateFile(file);

      // Validate storage limits before upload
      await validateStorageLimit(supabase, userId, file.size);

      const filePath = createFilePath(userId, file.name);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('application-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload to Supabase failed:", uploadError.message);

        if (uploadError.message.includes("exp") || uploadError.message.includes("expired")) {
          return createErrorResponse("Your session has expired. Please log in again.", 401, "TOKEN_EXPIRED");
        }

        return createErrorResponse("Failed to upload to cloud storage", 500);
      }

      // Create storage object record in database
      const { data: storageObject, error: dbError } = await supabase
        .from('storage_objects')
        .insert({
          user_id: userId,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          object_type: 'recording',
          metadata: {
            duration: 0, // Will be updated later if duration is available
            originalName: file.name,
            uploadedAt: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (dbError) {
        console.error("Failed to create storage object record:", dbError.message);
        // Continue anyway, file is uploaded, just missing DB record
      }

      // Update user's storage usage
      if (storageObject) {
        const { error: updateError } = await supabase.rpc('increment_user_storage', {
          user_id: userId,
          size_delta: file.size
        });
          
        if (updateError) {
          console.error("Failed to update user storage usage:", updateError.message);
        }
      }

      const recordingId = storageObject?.id || generateRecordingId();

      return createSuccessResponse({
        success: true,
        id: recordingId,
        filename: file.name,
        filePath: filePath,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        storageData: uploadData,
      });

    } catch (error) {
      console.error("Upload error:", error);
      
      const message = error instanceof Error ? error.message : "Unknown error";
      
      if (message.includes("Authentication") || message.includes("Authorization")) {
        return createErrorResponse(message, 401);
      }
      
      if (message.includes("Token does not match")) {
        return createErrorResponse(message, 403, "USER_MISMATCH");
      }
      
      if (message.includes("expired")) {
        return createErrorResponse(message, 401, "TOKEN_EXPIRED");
      }
      
      if (message.includes("Invalid file type") || message.includes("File too large")) {
        return createErrorResponse(message, 400);
      }

      return createErrorResponse("Upload failed", 500);
    }
  },
};