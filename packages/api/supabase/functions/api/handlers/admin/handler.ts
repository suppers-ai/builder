/**
 * Admin handler
 * Routes admin requests to appropriate handlers
 */

import {
  createRouter,
  errorResponse,
  successResponse,
  ForbiddenError,
  NotFoundError,
  isAdmin,
  getSupabaseClient,
  type HandlerContext,
} from '../../_common/index.ts';

import { getAdminDashboard } from './dashboard.ts';
import { handleAdminApplications } from './applications.ts';
import { handleAdminUsers } from './users.ts';
import { handleAdminEntities } from './entities.ts';
import { handleAdminEntityTypes } from './entity-types.ts';
import { handleAdminProductTypes } from './product-types.ts';
import {
  handleClonePricingProduct,
  handleCreatePricingProduct,
  handleCreateVariableDefinition,
  handleDeletePricingProduct,
  handleDeleteVariableDefinition,
  handleGetPricingProducts,
  handleGetPricingTemplates,
  handleGetVariableDefinitions,
  handleUpdatePricingProduct,
  handleUpdateVariableDefinition,
} from './pricing-products.ts';

/**
 * Admin handler context
 */
export interface AdminContext {
  userId: string;
  pathSegments: string[];
}

/**
 * Main admin request handler
 */
export async function handleAdmin(
  req: Request,
  context: AdminContext
): Promise<Response> {
  const { userId, pathSegments } = context;
  const supabase = getSupabaseClient();
  const method = req.method;
  const url = new URL(req.url);

  console.log('🔧 Admin handler - method:', method, 'pathSegments:', pathSegments, 'userId:', userId);
  
  if (!userId || userId === 'undefined' || userId === '') {
    console.log('❌ Admin access denied: No user provided or invalid user ID:', userId);
    throw new ForbiddenError('Authentication required');
  }

  // Verify admin role
  const adminStatus = await isAdmin(userId);
  console.log('🔍 User admin status:', adminStatus, 'for userId:', userId);

  if (!adminStatus) {
    console.log('❌ Admin access denied: User is not an admin');
    throw new ForbiddenError('Admin access required');
  }

  try {
    // Route based on the first path segment
    const [endpoint, ...rest] = pathSegments;

    console.log('🎯 Routing admin request to endpoint:', endpoint, 'with rest:', rest);

    switch (endpoint) {
      case 'dashboard':
        if (method === 'GET') {
          return await getAdminDashboard(supabase, url, 'admin');
        }
        break;

      case 'applications':
        return await handleAdminApplications(req, supabase, rest);

      case 'users':
        return await handleAdminUsers(req, supabase, rest);

      case 'entities':
        return await handleAdminEntities(req, { supabase, userId });

      case 'entity-types':
        return await handleAdminEntityTypes(req, { supabase, userId }, rest);

      case 'product-types':
        return await handleAdminProductTypes(req, { supabase, userId }, rest);

      case 'pricing-products':
        return await handlePricingProductsRoutes(req, { supabase, userId }, rest);

      case 'variable-definitions':
        return await handleVariableDefinitionsRoutes(req, { supabase, userId }, rest);

      case 'pricing-templates':
        if (method === 'GET') {
          return await handleGetPricingTemplates(req, { id: userId } as any);
        }
        break;

      case 'subscriptions':
        return errorResponse('Admin subscription endpoints not yet implemented', {
          status: 501,
          origin: req.headers.get('origin') || undefined,
        });

      default:
        const availableEndpoints = [
          'dashboard',
          'applications',
          'users',
          'entities',
          'entity-types',
          'product-types',
          'pricing-products',
          'variable-definitions',
          'pricing-templates',
          'subscriptions',
        ];
        
        throw new NotFoundError(
          `Admin endpoint '${endpoint}'. Available: ${availableEndpoints.join(', ')}`
        );
    }

    return errorResponse(`Method ${method} not allowed for endpoint ${endpoint}`, {
      status: 405,
      origin: req.headers.get('origin') || undefined,
    });
  } catch (error) {
    console.error('Admin handler error:', error);
    throw error;
  }
}

/**
 * Pricing products routes handler
 */
async function handlePricingProductsRoutes(
  req: Request,
  context: { supabase: any; userId: string },
  pathSegments: string[]
): Promise<Response> {
  const method = req.method;
  const user = { id: context.userId } as any;

  if (pathSegments.length === 0) {
    // /admin/pricing-products
    if (method === 'GET') {
      return await handleGetPricingProducts(req, user);
    } else if (method === 'POST') {
      return await handleCreatePricingProduct(req, user);
    }
  } else if (pathSegments.length === 1) {
    // /admin/pricing-products/:id
    const pricingProductId = pathSegments[0];
    if (method === 'PUT') {
      return await handleUpdatePricingProduct(req, user, pricingProductId);
    } else if (method === 'DELETE') {
      return await handleDeletePricingProduct(req, user, pricingProductId);
    }
  } else if (pathSegments.length === 2 && pathSegments[1] === 'clone') {
    // /admin/pricing-products/:id/clone
    const pricingProductId = pathSegments[0];
    if (method === 'POST') {
      return await handleClonePricingProduct(req, user, pricingProductId);
    }
  }

  return errorResponse(`Method ${method} not allowed for this pricing products endpoint`, {
    status: 405,
    origin: req.headers.get('origin') || undefined,
  });
}

/**
 * Variable definitions routes handler
 */
async function handleVariableDefinitionsRoutes(
  req: Request,
  context: { supabase: any; userId: string },
  pathSegments: string[]
): Promise<Response> {
  const method = req.method;
  const user = { id: context.userId } as any;

  if (pathSegments.length === 0) {
    // /admin/variable-definitions
    if (method === 'GET') {
      return await handleGetVariableDefinitions(req, user);
    } else if (method === 'POST') {
      return await handleCreateVariableDefinition(req, user);
    }
  } else if (pathSegments.length === 1) {
    // /admin/variable-definitions/:id
    const variableId = pathSegments[0];
    if (method === 'PUT') {
      return await handleUpdateVariableDefinition(req, user, variableId);
    } else if (method === 'DELETE') {
      return await handleDeleteVariableDefinition(req, user, variableId);
    }
  }

  return errorResponse(`Method ${method} not allowed for this variable definitions endpoint`, {
    status: 405,
    origin: req.headers.get('origin') || undefined,
  });
}