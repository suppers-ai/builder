/**
 * Entity search method handler
 * Handles searching entities for regular users
 */

import { errorResponses, jsonResponse } from '../../../_common/index.ts';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function handleEntitySearch(
  req: Request,
  {
    url,
    userId,
    supabase,
  }: {
    url: URL;
    userId: string;
    supabase: SupabaseClient;
  }
) {
  const origin = url.origin;

  // Extract search parameters
  const searchParams = url.searchParams;
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type');
  const subType = searchParams.get('sub_type');
  const status = searchParams.get('status') || 'active';

  // Geographic search parameters
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = parseFloat(searchParams.get('radius') || '10');
  const unit = searchParams.get('unit') || 'km'; // km or miles

  // Filter parameters
  const filterNumeric1 = searchParams.get('filter_numeric_1');
  const filterNumeric2 = searchParams.get('filter_numeric_2');
  const filterText1 = searchParams.get('filter_text_1');
  const filterText2 = searchParams.get('filter_text_2');
  const filterBoolean1 = searchParams.get('filter_boolean_1');
  const filterBoolean2 = searchParams.get('filter_boolean_2');
  const filterDate1 = searchParams.get('filter_date_1');
  const filterDate2 = searchParams.get('filter_date_2');

  // Pagination
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = (page - 1) * limit;

  try {
    let queryBuilder = supabase
      .from('entities')
      .select(
        `
        *,
        variables (*)
      `,
        { count: 'exact' }
      );

    // Regular users can only see active entities or their own
    queryBuilder = queryBuilder.or(`status.eq.${status},owner_id.eq.${userId}`);

    // Text search in name and description
    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Type filters
    if (type) {
      queryBuilder = queryBuilder.eq('type', type);
    }
    if (subType) {
      queryBuilder = queryBuilder.eq('sub_type', subType);
    }

    // Geographic search
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (!isNaN(latitude) && !isNaN(longitude)) {
        // Convert radius to meters (PostGIS uses meters)
        const radiusInMeters = unit === 'miles' ? radius * 1609.34 : radius * 1000;

        // For geographic search, we need to use a different approach
        // Use RPC function if available, or filter in application
        // Note: This requires a stored procedure 'nearby_entities' to be defined in the database
        console.warn('Geographic search requires a PostGIS function. Filtering by location is not implemented.');
        // TODO: Implement location-based filtering either via:
        // 1. A stored procedure in the database
        // 2. Manual distance calculation in the application
      }
    }

    // Apply custom filter columns
    if (filterNumeric1) queryBuilder = queryBuilder.eq('filter_numeric_1', filterNumeric1);
    if (filterNumeric2) queryBuilder = queryBuilder.eq('filter_numeric_2', filterNumeric2);
    if (filterText1) queryBuilder = queryBuilder.eq('filter_text_1', filterText1);
    if (filterText2) queryBuilder = queryBuilder.eq('filter_text_2', filterText2);
    if (filterBoolean1 !== null) queryBuilder = queryBuilder.eq('filter_boolean_1', filterBoolean1 === 'true');
    if (filterBoolean2 !== null) queryBuilder = queryBuilder.eq('filter_boolean_2', filterBoolean2 === 'true');
    if (filterDate1) queryBuilder = queryBuilder.gte('filter_date_1', filterDate1);
    if (filterDate2) queryBuilder = queryBuilder.lte('filter_date_2', filterDate2);

    // Apply pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('Entity search error:', error);
      return errorResponses.internalServerError(error.message, origin);
    }

    return jsonResponse(
      {
        entities: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      { origin }
    );
  } catch (error) {
    console.error('Entity search error:', error);
    return errorResponses.internalServerError(
      error instanceof Error ? error.message : 'Unknown error',
      origin
    );
  }
}