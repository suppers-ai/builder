/**
 * Entity handler
 * Handles entity-related operations
 */

import {
  errorResponses,
  getSupabaseClient,
} from '../../_common/index.ts';

import { handleEntityGet } from './methods/get.ts';
import { handleEntityPost } from './methods/post.ts';
import { handleEntityPut } from './methods/put.ts';
import { handleEntityDelete } from './methods/delete.ts';
import { handleEntitySearch } from './methods/search.ts';

export async function handleEntity(
  req: Request,
  context: { userId: string }
): Promise<Response> {
  const { userId } = context;
  const url = new URL(req.url);
  const pathSegments = url.pathname.split('/').filter((segment) => segment);
  const origin = req.headers.get('origin');

  // Remove 'api', 'v1', 'entity'
  const entityIndex = pathSegments.findIndex((segment) => segment === 'entity') + 1;
  const entityId = pathSegments[entityIndex];
  const subAction = pathSegments[entityIndex + 1];
  const subId = pathSegments[entityIndex + 2];

  // Get Supabase client
  const supabase = getSupabaseClient();

  // Handle search endpoint: /api/v1/entity/search
  if (entityId === 'search' && req.method === 'GET') {
    return await handleEntitySearch(req, { 
      url, 
      userId, 
      supabase 
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleEntityGet({
          url,
          userId,
          supabase,
          entityId,
          subAction,
          subId,
        });

      case 'POST':
        return await handleEntityPost(req, {
          url,
          userId,
          supabase,
          entityId,
          subAction,
          subId,
        });

      case 'PUT':
        return await handleEntityPut(req, {
          url,
          userId,
          supabase,
          entityId,
          subAction,
          subId,
        });

      case 'DELETE':
        return await handleEntityDelete({
          url,
          userId,
          supabase,
          entityId,
          subAction,
          subId,
        });

      default:
        return errorResponses.methodNotAllowed('Method not allowed', origin || undefined);
    }
  } catch (error) {
    console.error('Entity handler error:', error);
    return errorResponses.internalServerError(
      error instanceof Error ? error.message : 'Unknown error',
      origin || undefined
    );
  }
}