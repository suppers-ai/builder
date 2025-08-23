/**
 * Entity GET method handler
 * Handles retrieving entities for regular users
 */

import { errorResponses, jsonResponse } from '../../../_common/index.ts';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function handleEntityGet({
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
  
  try {
    let data: any;
    let error: any;

    if (!entityId) {
      // Check if we need to filter by applicationId
      const applicationId = url.searchParams.get('applicationId');
      
      if (applicationId) {
        // GET /entity?applicationId={id} - List user's entities connected to an application
        const result = await supabase
          .from('entities')
          .select('*')
          .eq('owner_id', userId)
          .contains('connected_application_ids', [applicationId])
          .order('created_at', { ascending: false });
        
        data = result.data;
        error = result.error;
      } else {
        // GET /entity - List all user's entities
        const result = await supabase
          .from('entities')
          .select('*')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false });

        data = result.data;
        error = result.error;
      }
    } else {
      // GET /entity/{entityId} - Get specific entity
      const result = await supabase
        .from('entities')
        .select('*')
        .eq('id', entityId)
        .single();
      
      data = result.data;
      error = result.error;

      // Check ownership for single entity access
      if (data && data.owner_id !== userId && data.status !== 'active') {
        return errorResponses.forbidden('Access denied to this entity', origin);
      }
    }

    if (error) {
      console.error('Entity fetch error:', error);
      return errorResponses.internalServerError(error.message, origin);
    }

    return jsonResponse(data || [], { origin });
  } catch (error) {
    console.error('Entity GET error:', error);
    return errorResponses.internalServerError(
      error instanceof Error ? error.message : 'Unknown error',
      origin
    );
  }
}