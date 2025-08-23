/**
 * Entity DELETE method handler
 * Handles deleting entities for regular users
 */

import { errorResponses, successResponse } from '../../../_common/index.ts';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function handleEntityDelete({
  url,
  userId,
  supabase,
  entityId,
  subAction,
  subId,
}: {
  url: URL;
  userId: string;
  supabase: SupabaseClient;
  entityId: string;
  subAction: string;
  subId: string;
}) {
  const origin = url.origin;

  if (!entityId || subAction) {
    return errorResponses.badRequest('Entity ID is required for deletion', origin);
  }

  try {
    // Users can only delete their own entities
    const { error } = await supabase
      .from('entities')
      .delete()
      .eq('owner_id', userId)
      .eq('id', entityId);

    if (error) {
      console.error('Entity deletion error:', error);
      return errorResponses.internalServerError(error.message, origin);
    }

    return successResponse({ success: true }, { origin });
  } catch (error) {
    console.error('Entity DELETE error:', error);
    return errorResponses.internalServerError(
      error instanceof Error ? error.message : 'Unknown error',
      origin
    );
  }
}