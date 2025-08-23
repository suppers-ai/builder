/**
 * Purchase handler
 * Handles purchase-related operations
 */

import {
  errorResponses,
  jsonResponse,
  getSupabaseClient,
} from '../../_common/index.ts';

export async function handlePurchase(
  req: Request,
  context: {
    userId: string;
  }
): Promise<Response> {
  const { userId } = context;
  const url = new URL(req.url);
  const pathSegments = url.pathname.split('/').filter((segment) => segment);
  const origin = req.headers.get('origin');

  // Get the purchase ID if it exists in the path
  const purchaseIdIndex = pathSegments.findIndex((segment) => segment === 'purchase') + 1;
  const purchaseId = pathSegments[purchaseIdIndex];

  // Create database client
  const db = getSupabaseClient();

  try {
    switch (req.method) {
      case 'GET':
        if (purchaseId) {
          // Get specific purchase
          const { data: purchase, error } = await db
            .from('purchases')
            .select('*, products(*)')
            .eq('id', purchaseId)
            .single();

          if (error) throw error;
          
          // Verify the purchase belongs to the user
          if (purchase && purchase.buyer_id !== userId) {
            return errorResponses.forbidden('Access denied to this purchase', origin);
          }

          if (!purchase) {
            return errorResponses.notFound('Purchase not found', origin);
          }

          return jsonResponse(purchase, { origin });
        } else {
          // Get all purchases for the user
          const { data: purchases, error } = await db
            .from('purchases')
            .select('*, products(*)')
            .eq('buyer_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw error;
          return jsonResponse(purchases || [], { origin });
        }

      case 'POST':
        // TODO: Implement purchase creation
        // Should collect product and pricing information
        // Create Stripe payment intent
        // Save purchase in database
        return errorResponses.notImplemented(
          'Purchase creation not yet implemented',
          origin
        );

      case 'PUT':
        if (!purchaseId) {
          return errorResponses.badRequest('Purchase ID required for update', origin);
        }
        
        // TODO: Implement purchase update
        // Should handle payment confirmation and status updates
        return errorResponses.notImplemented(
          'Purchase update not yet implemented',
          origin
        );

      case 'DELETE':
        // Purchases should not be deleted, only cancelled
        return errorResponses.methodNotAllowed(
          'Purchases cannot be deleted. Use PUT to update status.',
          origin
        );

      default:
        return errorResponses.methodNotAllowed('Method not allowed', origin);
    }
  } catch (error) {
    console.error('Purchases API Error:', error);
    return errorResponses.internalServerError(
      error instanceof Error ? error.message : 'Unknown error',
      origin
    );
  }
}