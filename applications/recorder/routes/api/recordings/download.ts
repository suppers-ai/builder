import { Context } from "fresh";
import {
  corsHeaders,
  createErrorResponse,
  createSuccessResponse,
  authenticateRequest,
} from "../../../lib/api-utils.ts";

export const handler = {
  OPTIONS() {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  },

  async POST(ctx: Context<unknown>) {
    try {
      const { userId, supabase } = await authenticateRequest(ctx);

      const body = await ctx.req.json();
      const { filePath } = body;

      if (!filePath || typeof filePath !== 'string') {
        return createErrorResponse("File path is required", 400);
      }

      // Verify the file path belongs to the current user
      if (!filePath.startsWith(`${userId}/recorder/`)) {
        return createErrorResponse("Access denied", 403);
      }

      // Generate a signed URL for download
      const { data, error } = await supabase.storage
        .from('application-files')
        .createSignedUrl(filePath, 3600); // 1 hour expiration

      if (error) {
        console.error("Failed to create signed URL:", error.message);
        
        if (error.message.includes("exp") || error.message.includes("expired")) {
          return createErrorResponse("Your session has expired. Please log in again.", 401, "TOKEN_EXPIRED");
        }

        return createErrorResponse("Failed to generate download URL", 500);
      }

      return createSuccessResponse({
        success: true,
        downloadUrl: data.signedUrl,
      });

    } catch (error) {
      console.error("Download URL generation error:", error);
      
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

      return createErrorResponse("Failed to generate download URL", 500);
    }
  },
};