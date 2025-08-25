import { errorResponses, jsonResponse } from "../../_common/index.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

interface StorageUpdateContext {
  userId: string;
  supabase: SupabaseClient;
  applicationSlug: string;
  filePath: string;
}

interface UpdateRequest {
  name?: string;
  emoji?: string;
  parent_folder_id?: string | null;
  is_favorite?: boolean;
  tags?: string[];
  description?: string;
  metadata?: Record<string, any>;
}

export async function handleStorageUpdate(
  req: Request,
  context: StorageUpdateContext,
): Promise<Response> {
  const { userId, supabase, applicationSlug, filePath } = context;
  const origin = req.headers.get('origin');

  if (!userId) {
    return errorResponses.unauthorized("Authentication required", origin || undefined);
  }

  console.log("📝 Updating storage object:", { applicationSlug, filePath, userId });

  try {
    // Parse the update request
    const updateData = await req.json() as UpdateRequest;
    
    // Extract the object ID from the file path (e.g., "objects/uuid" -> "uuid")
    const pathParts = filePath.split('/');
    const objectId = pathParts[pathParts.length - 1];

    if (!objectId) {
      return errorResponses.badRequest("Object ID is required", origin || undefined);
    }

    // Look up the application ID from the slug
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id")
      .eq("slug", applicationSlug)
      .single();

    if (appError || !application) {
      console.error("❌ Application not found:", appError);
      return errorResponses.notFound("Application not found", origin || undefined);
    }

    const applicationId = application.id;

    // First, verify that the object exists and belongs to the user
    const { data: existingObject, error: fetchError } = await supabase
      .from("storage_objects")
      .select("*")
      .eq("id", objectId)
      .eq("user_id", userId)
      .eq("application_id", applicationId)
      .single();

    if (fetchError || !existingObject) {
      console.error("❌ Object not found:", fetchError);
      return errorResponses.notFound("Object not found", origin || undefined);
    }

    // Prepare the update payload
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that were provided in the request
    if (updateData.name !== undefined) {
      updatePayload.name = updateData.name;
    }
    if (updateData.emoji !== undefined) {
      updatePayload.emoji = updateData.emoji;
    }
    if (updateData.parent_folder_id !== undefined) {
      updatePayload.parent_folder_id = updateData.parent_folder_id;
    }
    if (updateData.is_favorite !== undefined) {
      updatePayload.is_favorite = updateData.is_favorite;
    }
    if (updateData.tags !== undefined) {
      updatePayload.tags = updateData.tags;
    }
    if (updateData.description !== undefined) {
      updatePayload.description = updateData.description;
    }
    if (updateData.metadata !== undefined) {
      // Merge with existing metadata
      updatePayload.metadata = {
        ...existingObject.metadata,
        ...updateData.metadata,
      };
    }

    // Update the object
    const { data: updatedObject, error: updateError } = await supabase
      .from("storage_objects")
      .update(updatePayload)
      .eq("id", objectId)
      .eq("user_id", userId)
      .eq("application_id", applicationId)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Update failed:", updateError);
      return errorResponses.internalServerError(
        `Failed to update object: ${updateError.message}`,
        origin || undefined
      );
    }

    console.log("✅ Storage object updated successfully:", updatedObject.id);

    return jsonResponse(
      {
        success: true,
        data: updatedObject,
      },
      200,
      origin || undefined
    );
  } catch (error) {
    console.error("❌ Storage update error:", error);
    return errorResponses.internalServerError(
      error instanceof Error ? error.message : "Failed to update storage object",
      origin || undefined
    );
  }
}