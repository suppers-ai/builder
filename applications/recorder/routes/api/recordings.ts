import { Context } from "fresh";
import {
  corsHeaders,
  createErrorResponse,
  createSuccessResponse,
  authenticateRequest,
  validateFile,
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

      const recordings = (files || []).map(file => {
        const fullPath = `${folderPath}/${file.name}`;
        return {
          id: file.name,
          name: file.name,
          size: file.metadata?.size || 0,
          createdAt: file.created_at ? new Date(file.created_at).toISOString() : new Date().toISOString(),
          updatedAt: file.updated_at ? new Date(file.updated_at).toISOString() : new Date().toISOString(),
          filePath: fullPath,
          mimeType: file.metadata?.mimetype || 'video/webm',
        };
      });

      return createSuccessResponse({
        success: true,
        recordings: recordings
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

      const recordingId = generateRecordingId();

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