/**
 * Main API entry point
 * Handles routing to resource-specific handlers
 */

import {
  createHandler,
  createRouter,
  config,
  errorResponse,
  getAuthContext,
  handleOptionsRequest,
  middleware,
  type HandlerContext,
} from './_common/index.ts';

// Import resource handlers
import { handleApplications } from './handlers/applications/index.ts';
import { handleUserRequest } from './handlers/user/index.ts';
import { handleUsers } from './handlers/users/index.ts';
import { handleStorage } from './handlers/storage/index.ts';
import { handleShare } from './handlers/share/index.ts';
import { handleAdmin } from './handlers/admin/index.ts';
import { handleTools } from './handlers/tools/index.ts';
import { handleEntity } from './handlers/entity/index.ts';
import { handleProduct } from './handlers/product/index.ts';
import { handlePrice } from './handlers/price/index.ts';
import { handlePurchase } from './handlers/purchase/index.ts';
import { handleImageUpload } from './handlers/upload/index.ts';
import { createServiceClient } from './_common/database.ts';

console.log('🚀 API Edge Function loaded');

// Create main API handler
const apiHandler = createHandler([
  // Health check endpoint
  {
    method: 'GET',
    pattern: 'health',
    handler: () => {
      return new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  },

  // API version check
  {
    method: 'GET',
    pattern: 'api/version',
    handler: () => {
      return new Response(JSON.stringify({ version: config.api.version }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  },

  // Applications resource
  {
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    pattern: 'api/v1/applications/*',
    requireAuth: true,
    handler: async (context: HandlerContext) => {
      return handleApplications(context.request);
    },
  },

  // User resource
  {
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    pattern: 'api/v1/user/*',
    requireAuth: true,
    handler: async (context: HandlerContext) => {
      return handleUserRequest(context.request);
    },
  },

  // Users resource
  {
    method: ['GET', 'POST'],
    pattern: 'api/v1/users/*',
    requireAuth: true,
    handler: async (context: HandlerContext) => {
      return handleUsers(context.request);
    },
  },

  // Storage resource
  {
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    pattern: 'api/v1/storage/*',
    requireAuth: true,
    handler: async (context: HandlerContext) => {
      if (!context.auth || !context.auth.user.id) {
        throw new Error('Authentication context missing');
      }
      const userId = context.auth.user.id;
      const pathSegments = context.pathSegments.slice(3); // Remove api/v1/storage
      return handleStorage(context.request, { userId, pathSegments });
    },
  },

  // Share resource (public, no auth required)
  {
    method: ['GET', 'POST'],
    pattern: 'api/v1/share/*',
    requireAuth: false,
    handler: async (context: HandlerContext) => {
      const pathSegments = context.pathSegments.slice(3); // Remove api/v1/share
      return handleShare(context.request, { pathSegments });
    },
  },

  // Admin resource
  {
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    pattern: 'api/v1/admin/*',
    requireAuth: true,
    requireAdmin: true,
    handler: async (context: HandlerContext) => {
      // Since requireAuth is true, auth should always be present
      if (!context.auth || !context.auth.user.id) {
        throw new Error('Authentication context missing');
      }
      const userId = context.auth.user.id;
      const pathSegments = context.pathSegments.slice(3); // Remove api/v1/admin
      return handleAdmin(context.request, { userId, pathSegments });
    },
  },

  // Tools resource
  {
    method: ['GET', 'POST'],
    pattern: 'api/v1/tools/*',
    requireAuth: true,
    handler: async (context: HandlerContext) => {
      const pathSegments = context.pathSegments.slice(3); // Remove api/v1/tools
      return handleTools(context.request, pathSegments);
    },
  },

  // Entity resource
  {
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    pattern: 'api/v1/entity/*',
    requireAuth: true,
    handler: async (context: HandlerContext) => {
      if (!context.auth || !context.auth.user.id) {
        throw new Error('Authentication context missing');
      }
      const userId = context.auth.user.id;
      return handleEntity(context.request, { userId });
    },
  },

  // Product resource
  {
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    pattern: 'api/v1/product/*',
    requireAuth: true,
    handler: async (context: HandlerContext) => {
      if (!context.auth || !context.auth.user.id) {
        throw new Error('Authentication context missing');
      }
      const userId = context.auth.user.id;
      return handleProduct(context.request, { userId });
    },
  },

  // Price resource
  {
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    pattern: 'api/v1/price/*',
    requireAuth: true,
    handler: async (context: HandlerContext) => {
      if (!context.auth || !context.auth.user.id) {
        throw new Error('Authentication context missing');
      }
      const userId = context.auth.user.id;
      return handlePrice(context.request, { userId });
    },
  },

  // Purchase resource
  {
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    pattern: 'api/v1/purchase/*',
    requireAuth: true,
    handler: async (context: HandlerContext) => {
      if (!context.auth || !context.auth.user.id) {
        throw new Error('Authentication context missing');
      }
      const userId = context.auth.user.id;
      return handlePurchase(context.request, { userId });
    },
  },

  // Image upload endpoint
  {
    method: 'POST',
    pattern: 'api/upload-image',
    requireAuth: true,
    handler: async (context: HandlerContext) => {
      if (!context.auth || !context.auth.user.id) {
        throw new Error('Authentication context missing');
      }
      const userId = context.auth.user.id;
      return handleImageUpload(context.request, { userId });
    },
  },

  // Catch-all for unmatched routes
  {
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    pattern: '*',
    handler: (context: HandlerContext) => {
      const availableResources = [
        'applications',
        'user',
        'users',
        'storage',
        'share',
        'admin',
        'tools',
        'entity',
        'product',
        'price',
        'purchase',
        'upload-image',
      ];
      
      return errorResponse(
        `Unknown resource. Available resources: ${availableResources.join(', ')}`,
        { status: 404, origin: context.origin || undefined }
      );
    },
  },
]);

// Export the handler for Deno.serve
Deno.serve(apiHandler);