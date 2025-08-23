/**
 * Product handler
 * Handles product-related operations
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

import {
  mapMetadataToFilters,
  mergeFilterConfigs,
  mergeMetadataSchemas,
  validateMetadata,
} from '../../lib/metadata-validation.ts';

import { handleProductSearch } from './methods/search.ts';
import {
  handleApplyPricingTemplate,
  handleGetProductVariables,
  handleRemoveProductTemplate,
  handleSetProductVariable,
} from '../product-variables/index.ts';

export async function handleProduct(
  req: Request,
  context: {
    userId: string;
  }
): Promise<Response> {
  const { userId } = context;
  const url = new URL(req.url);
  const pathSegments = url.pathname.split('/').filter((segment) => segment);
  const origin = req.headers.get('origin');

  // Get the product ID if it exists in the path
  const productsIndex = pathSegments.findIndex((segment) => segment === 'product') + 1;
  const productId = pathSegments[productsIndex];
  const subAction = pathSegments[productsIndex + 1];

  // Create database client
  const db = getSupabaseClient();

  // Handle search endpoint: /api/v1/product/search
  if (productId === 'search' && req.method === 'GET') {
    return await handleProductSearch(req, { 
      url, 
      isAdmin: false, // Admin search should go through admin endpoints
      userId, 
      supabase: db 
    });
  }

  // Handle product variable management endpoints
  if (productId && subAction) {
    const user = { id: userId } as any;

    switch (subAction) {
      case 'variables':
        if (req.method === 'GET') {
          return await handleGetProductVariables(req, user, productId);
        } else if (req.method === 'POST') {
          return await handleSetProductVariable(req, user, productId);
        }
        break;

      case 'apply-template':
        if (req.method === 'POST') {
          return await handleApplyPricingTemplate(req, user, productId);
        }
        break;

      case 'template':
        if (req.method === 'DELETE') {
          return await handleRemoveProductTemplate(req, user, productId);
        }
        break;
    }
  }

  try {
    switch (req.method) {
      case 'GET':
        if (productId) {
          // Get specific product
          const { data: product, error } = await db
            .from('products')
            .select(`
              *,
              variables (*),
              product_restrictions (*),
              product_pricing (
                pricing_products (
                  *,
                  pricing_formulas (*),
                  pricing_prices (*)
                )
              )
            `)
            .eq('id', productId)
            .single();

          if (error) throw error;

          if (!product) {
            return errorResponses.notFound('Product not found', origin);
          }

          // Check access permissions
          const userIsAdmin = await isAdmin(userId);
          if (!userIsAdmin && product.seller_id !== userId && product.status !== 'active') {
            return errorResponses.forbidden('Access denied to this product', origin);
          }

          return jsonResponse(product, { origin });
        } else {
          // Get all products for the user
          const { data: products, error } = await db
            .from('products')
            .select(`
              *,
              variables (*),
              product_restrictions (*),
              product_pricing (
                pricing_products (
                  *,
                  pricing_formulas (*),
                  pricing_prices (*)
                )
              )
            `)
            .eq('seller_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw error;
          return jsonResponse(products || [], { origin });
        }

      case 'POST':
        // Create new product
        const body = await parseJsonBody(req);

        // Validate entity ownership if provided
        const entityId = body.entity_id;
        if (entityId) {
          const { data: entity, error: entityError } = await db
            .from('entities')
            .select('owner_id')
            .eq('id', entityId)
            .single();

          if (entityError || !entity) {
            return errorResponses.notFound('Entity not found', origin);
          }

          if (entity.owner_id !== userId) {
            return errorResponses.forbidden('You do not own this entity', origin);
          }
        }

        const type = body.type || 'service';

        // Get type configuration to validate metadata
        let typeSchema = null;
        let filterConfig = null;

        try {
          // Get product type
          const { data: productType, error: typeError } = await db
            .from('product_types')
            .select('*')
            .eq('name', type)
            .single();

          if (typeError || !productType) {
            return errorResponses.badRequest('Invalid product type', origin);
          }

          typeSchema = productType.metadata_schema;
          filterConfig = productType.filter_config;

          // If sub_type is provided, get sub-type configuration
          if (body.sub_type) {
            const { data: subType, error: subTypeError } = await db
              .from('product_sub_types')
              .select('*')
              .eq('product_type_id', productType.id)
              .eq('name', body.sub_type)
              .single();

            if (subTypeError || !subType) {
              return errorResponses.badRequest('Invalid product sub-type', origin);
            }

            // Merge parent and child schemas
            typeSchema = mergeMetadataSchemas(typeSchema, subType.metadata_schema);
            filterConfig = mergeFilterConfigs(filterConfig, subType.filter_config);
          }
        } catch (err) {
          console.error('Error fetching type configuration:', err);
          return errorResponses.internalServerError('Failed to validate product type', origin);
        }

        // Validate metadata against schema
        let validatedMetadata = body.metadata || {};
        let filterMappings: Record<string, any> = {};

        if (typeSchema) {
          const validation = validateMetadata(body.metadata || {}, typeSchema);
          if (!validation.isValid) {
            return errorResponses.badRequest(
              `Metadata validation failed: ${validation.errors.join(', ')}`,
              origin
            );
          }
          validatedMetadata = validation.filteredMetadata;
          filterMappings = mapMetadataToFilters(validatedMetadata, filterConfig);
        }

        // Validate required fields
        const validated = validateOrThrow(body, [
          { field: 'name', required: true, type: 'string', min: 1, max: 255 },
          { field: 'description', required: false, type: 'string', max: 5000 },
          { field: 'thumbnail_url', required: false, type: 'url' },
        ]);

        const product: any = {
          seller_id: userId,
          name: validated.name,
          description: validated.description || null,
          thumbnail_url: validated.thumbnail_url || null,
          photos: body.photos || null,
          type: type,
          sub_type: body.sub_type || null,
          metadata: validatedMetadata,
          // Map metadata to filter columns
          ...Object.keys(filterMappings).reduce((acc, key) => {
            acc[key] = filterMappings[key] || null;
            return acc;
          }, {} as any),
        };

        if (entityId) {
          product.entity_id = entityId;
        }

        const { data: newProduct, error } = await db
          .from('products')
          .insert(product)
          .select()
          .single();

        if (error) throw error;
        return jsonResponse(newProduct, { status: 201, origin });

      case 'PUT':
        if (!productId) {
          return errorResponses.badRequest('Product ID required for update', origin);
        }

        // Check ownership
        const { data: existingProduct, error: checkError } = await db
          .from('products')
          .select('seller_id, type')
          .eq('id', productId)
          .single();

        if (checkError) throw checkError;

        if (!existingProduct) {
          return errorResponses.notFound('Product not found', origin);
        }

        if (existingProduct.seller_id !== userId) {
          return errorResponses.forbidden('You do not own this product', origin);
        }

        // Update product
        const updateBody = await parseJsonBody(req);

        // Validate entity ownership if updating entity_id
        const updateEntityId = updateBody.entity_id;
        if (updateEntityId) {
          const { data: entity, error: entityError } = await db
            .from('entities')
            .select('owner_id')
            .eq('id', updateEntityId)
            .single();

          if (entityError || !entity) {
            return errorResponses.notFound('Entity not found', origin);
          }

          if (entity.owner_id !== userId) {
            return errorResponses.forbidden('You do not own this entity', origin);
          }
        }

        // Similar type validation as POST for updates
        let updateTypeSchema = null;
        let updateFilterConfig = null;
        let validatedUpdateMetadata = updateBody.metadata || {};
        let updateFilterMappings: Record<string, any> = {};

        const updateType = updateBody.type;
        if (updateType) {
          try {
            // Get product type
            const { data: productType, error: typeError } = await db
              .from('product_types')
              .select('*')
              .eq('name', updateType)
              .single();

            if (typeError || !productType) {
              return errorResponses.badRequest('Invalid product type', origin);
            }

            updateTypeSchema = productType.metadata_schema;
            updateFilterConfig = productType.filter_config;

            // If sub_type is provided, get sub-type configuration
            if (updateBody.sub_type) {
              const { data: subType, error: subTypeError } = await db
                .from('product_sub_types')
                .select('*')
                .eq('product_type_id', productType.id)
                .eq('name', updateBody.sub_type)
                .single();

              if (subTypeError || !subType) {
                return errorResponses.badRequest('Invalid product sub-type', origin);
              }

              // Merge parent and child schemas
              updateTypeSchema = mergeMetadataSchemas(updateTypeSchema, subType.metadata_schema);
              updateFilterConfig = mergeFilterConfigs(updateFilterConfig, subType.filter_config);
            }

            // Validate metadata against schema
            if (updateTypeSchema && updateBody.metadata) {
              const validation = validateMetadata(updateBody.metadata, updateTypeSchema);
              if (!validation.isValid) {
                return errorResponses.badRequest(
                  `Metadata validation failed: ${validation.errors.join(', ')}`,
                  origin
                );
              }
              validatedUpdateMetadata = validation.filteredMetadata;
              updateFilterMappings = mapMetadataToFilters(
                validatedUpdateMetadata,
                updateFilterConfig
              );
            }
          } catch (err) {
            console.error('Error fetching type configuration for update:', err);
            return errorResponses.internalServerError('Failed to validate product type', origin);
          }
        }

        // Build update object
        const updateProduct: any = {};

        if (updateBody.name !== undefined) {
          updateProduct.name = updateBody.name;
        }
        if (updateBody.description !== undefined) {
          updateProduct.description = updateBody.description;
        }
        if (updateBody.thumbnail_url !== undefined) {
          updateProduct.thumbnail_url = updateBody.thumbnail_url;
        }
        if (updateBody.photos !== undefined) {
          updateProduct.photos = updateBody.photos;
        }
        if (updateType !== undefined) {
          updateProduct.type = updateType;
        }
        if (updateBody.sub_type !== undefined) {
          updateProduct.sub_type = updateBody.sub_type;
        }
        if (updateBody.metadata !== undefined) {
          updateProduct.metadata = validatedUpdateMetadata;
          // Update filter columns
          Object.keys(updateFilterMappings).forEach((key) => {
            updateProduct[key] = updateFilterMappings[key] || null;
          });
        }
        if (updateEntityId !== undefined) {
          updateProduct.entity_id = updateEntityId;
        }

        const { data: updatedProduct, error: updateError } = await db
          .from('products')
          .update(updateProduct)
          .eq('id', productId)
          .select()
          .single();

        if (updateError) throw updateError;
        return jsonResponse(updatedProduct, { origin });

      case 'DELETE':
        if (!productId) {
          return errorResponses.badRequest('Product ID required for deletion', origin);
        }

        // Check ownership or admin status
        const { data: toDelete, error: deleteCheckError } = await db
          .from('products')
          .select('seller_id')
          .eq('id', productId)
          .single();

        if (deleteCheckError) throw deleteCheckError;

        if (!toDelete) {
          return errorResponses.notFound('Product not found', origin);
        }

        // Allow deletion if user owns the product or is admin
        const userIsAdmin = await isAdmin(userId);
        if (toDelete.seller_id !== userId && !userIsAdmin) {
          return errorResponses.forbidden('You do not own this product', origin);
        }

        // Soft delete product (set status to deleted)
        const { error: deleteError } = await db
          .from('products')
          .update({ status: 'deleted' })
          .eq('id', productId);

        if (deleteError) throw deleteError;
        return noContentResponse({ origin });

      default:
        return errorResponses.methodNotAllowed('Method not allowed', origin);
    }
  } catch (error) {
    console.error('Products API Error:', error);
    return errorResponses.internalServerError(
      error instanceof Error ? error.message : 'Unknown error',
      origin
    );
  }
}