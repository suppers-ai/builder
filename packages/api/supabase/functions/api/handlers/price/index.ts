/**
 * Price handler
 * Handles pricing product operations
 */

import {
  errorResponses,
  jsonResponse,
  noContentResponse,
  getSupabaseClient,
  parseJsonBody,
  validateOrThrow,
  isAdmin,
} from '../../_common/index.ts';

export async function handlePrice(
  req: Request,
  context: {
    userId: string;
  }
): Promise<Response> {
  const { userId } = context;
  const url = new URL(req.url);
  const pathSegments = url.pathname.split('/').filter((segment) => segment);
  const origin = req.headers.get('origin');

  // Get the pricing product ID if it exists in the path
  const priceIndex = pathSegments.findIndex((segment) => segment === 'price') + 1;
  const pricingId = pathSegments[priceIndex];

  // Create database client
  const db = getSupabaseClient();

  try {
    switch (req.method) {
      case 'GET':
        if (pricingId) {
          // Get specific pricing product
          const { data: pricingProduct, error } = await db
            .from('pricing_products')
            .select('*, pricing_formulas(*), pricing_prices(*)')
            .eq('id', pricingId)
            .single();

          if (error) throw error;
          
          if (!pricingProduct) {
            return errorResponses.notFound('Pricing product not found', origin);
          }

          return jsonResponse(pricingProduct, { origin });
        } else {
          // Get all pricing products
          const { data: pricingProducts, error } = await db
            .from('pricing_products')
            .select('*, pricing_formulas(*), pricing_prices(*)')
            .order('created_at', { ascending: false });

          if (error) throw error;
          return jsonResponse(pricingProducts || [], { origin });
        }

      case 'POST':
        // Create new pricing product
        const body = await parseJsonBody(req);
        
        const validated = validateOrThrow(body, [
          { field: 'name', required: true, type: 'string', min: 1, max: 255 },
          { field: 'description', required: false, type: 'string', max: 1000 },
        ]);

        const pricingProduct = {
          name: validated.name,
          description: validated.description || null,
          owner_id: userId,
        };

        const { data: newPricingProduct, error } = await db
          .from('pricing_products')
          .insert(pricingProduct)
          .select()
          .single();

        if (error) throw error;
        return jsonResponse(newPricingProduct, { status: 201, origin });

      case 'PUT':
        if (!pricingId) {
          return errorResponses.badRequest(
            'Pricing product ID required for update',
            origin
          );
        }

        // Update pricing product
        const updateBody = await parseJsonBody(req);
        
        const validatedUpdate = validateOrThrow(updateBody, [
          { field: 'name', required: false, type: 'string', min: 1, max: 255 },
          { field: 'description', required: false, type: 'string', max: 1000 },
        ]);

        // Check ownership
        const { data: existing, error: checkError } = await db
          .from('pricing_products')
          .select('owner_id')
          .eq('id', pricingId)
          .single();

        if (checkError) throw checkError;
        
        if (!existing) {
          return errorResponses.notFound('Pricing product not found', origin);
        }

        if (existing.owner_id !== userId) {
          return errorResponses.forbidden(
            'You do not have permission to update this pricing product',
            origin
          );
        }

        const { data: updatedPricingProduct, error: updateError } = await db
          .from('pricing_products')
          .update(validatedUpdate)
          .eq('id', pricingId)
          .select()
          .single();

        if (updateError) throw updateError;
        return jsonResponse(updatedPricingProduct, { origin });

      case 'DELETE':
        if (!pricingId) {
          return errorResponses.badRequest(
            'Pricing product ID required for deletion',
            origin
          );
        }

        // Check ownership or admin status
        const { data: toDelete, error: deleteCheckError } = await db
          .from('pricing_products')
          .select('owner_id')
          .eq('id', pricingId)
          .single();

        if (deleteCheckError) throw deleteCheckError;
        
        if (!toDelete) {
          return errorResponses.notFound('Pricing product not found', origin);
        }

        // Allow deletion if user owns the product or is admin
        const userIsAdmin = await isAdmin(userId);
        if (toDelete.owner_id !== userId && !userIsAdmin) {
          return errorResponses.forbidden(
            'You do not have permission to delete this pricing product',
            origin
          );
        }

        const { error: deleteError } = await db
          .from('pricing_products')
          .delete()
          .eq('id', pricingId);
        if (deleteError) throw deleteError;
        
        return noContentResponse({ origin });

      default:
        return errorResponses.methodNotAllowed('Method not allowed', origin);
    }
  } catch (error) {
    console.error('Pricing API Error:', error);

    // Check if this is a session/auth related error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isAuthError =
      errorMessage.includes('JWT') ||
      errorMessage.includes('token') ||
      errorMessage.includes('unauthorized');

    if (isAuthError) {
      return errorResponses.unauthorized(
        'Your session has expired. Please log in again.',
        origin
      );
    }

    return errorResponses.internalServerError(errorMessage, origin);
  }
}