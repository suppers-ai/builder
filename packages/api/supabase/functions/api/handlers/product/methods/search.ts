import { corsHeaders } from "../../../_common/index.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function handleProductSearch(req: Request, {
  url,
  isAdmin,
  userId,
  supabase,
}: {
  url: URL;
  isAdmin: boolean;
  userId: string;
  supabase: SupabaseClient;
}) {
  // Extract search parameters
  const searchParams = url.searchParams;
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type");
  const subType = searchParams.get("sub_type");
  const status = searchParams.get("status") || "active";
  const sellerId = searchParams.get("seller_id");
  const entityId = searchParams.get("entity_id");

  // Filter parameters
  const filterNumeric1 = searchParams.get("filter_numeric_1");
  const filterNumeric2 = searchParams.get("filter_numeric_2");
  const filterText1 = searchParams.get("filter_text_1");
  const filterText2 = searchParams.get("filter_text_2");
  const filterBoolean1 = searchParams.get("filter_boolean_1");
  const filterBoolean2 = searchParams.get("filter_boolean_2");
  const filterDate1 = searchParams.get("filter_date_1");
  const filterDate2 = searchParams.get("filter_date_2");

  // Price range filters (if product has pricing)
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");

  // Pagination
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = (page - 1) * limit;

  try {
    let queryBuilder = supabase
      .from("products")
      .select(
        `
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
      `,
        { count: "exact" },
      );

    // Base filters
    if (!isAdmin) {
      queryBuilder = queryBuilder.eq("status", status);
    } else if (status !== "all") {
      queryBuilder = queryBuilder.eq("status", status);
    }

    // Owner filter for non-admin users
    if (!isAdmin && !sellerId) {
      queryBuilder = queryBuilder.eq("seller_id", userId);
    } else if (sellerId) {
      queryBuilder = queryBuilder.eq("seller_id", sellerId);
    }

    // Text search in name and description
    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Type filters
    if (type) {
      queryBuilder = queryBuilder.eq("type", type);
    }
    if (subType) {
      queryBuilder = queryBuilder.eq("sub_type", subType);
    }

    // Entity association filter
    if (entityId) {
      queryBuilder = queryBuilder.eq("entity_id", entityId);
    }

    // Filter column searches
    if (filterNumeric1) {
      const value = parseFloat(filterNumeric1);
      if (!isNaN(value)) {
        queryBuilder = queryBuilder.eq("filter_numeric_1", value);
      }
    }
    if (filterNumeric2) {
      const value = parseFloat(filterNumeric2);
      if (!isNaN(value)) {
        queryBuilder = queryBuilder.eq("filter_numeric_2", value);
      }
    }
    if (filterText1) {
      queryBuilder = queryBuilder.ilike("filter_text_1", `%${filterText1}%`);
    }
    if (filterText2) {
      queryBuilder = queryBuilder.ilike("filter_text_2", `%${filterText2}%`);
    }
    if (filterBoolean1 !== null && filterBoolean1 !== "") {
      queryBuilder = queryBuilder.eq("filter_boolean_1", filterBoolean1 === "true");
    }
    if (filterBoolean2 !== null && filterBoolean2 !== "") {
      queryBuilder = queryBuilder.eq("filter_boolean_2", filterBoolean2 === "true");
    }
    if (filterDate1) {
      queryBuilder = queryBuilder.gte("filter_date_1", filterDate1);
    }
    if (filterDate2) {
      queryBuilder = queryBuilder.lte("filter_date_2", filterDate2);
    }

    // Apply pagination and ordering
    const orderBy = searchParams.get("order_by") || "created_at";
    const orderDirection = searchParams.get("order_direction") === "asc"
      ? "ascending"
      : "descending";

    queryBuilder = queryBuilder
      .order(orderBy, { ascending: orderDirection === "ascending" })
      .range(offset, offset + limit - 1);

    const { data: products, error, count } = await queryBuilder;

    if (error) throw error;

    // Apply additional filtering based on pricing if specified
    let filteredProducts = products || [];
    if (minPrice || maxPrice) {
      filteredProducts = filteredProducts.filter((product) => {
        // Extract pricing information if available
        const pricing = product.product_pricing?.[0]?.pricing_products?.pricing_prices?.[0];
        if (pricing?.amount && typeof pricing.amount === "object") {
          // Assume USD for now, but this could be made configurable
          const price = pricing.amount.USD;
          if (price) {
            const numPrice = parseFloat(price);
            if (minPrice && numPrice < parseFloat(minPrice)) return false;
            if (maxPrice && numPrice > parseFloat(maxPrice)) return false;
          }
        }
        return true;
      });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return new Response(
      JSON.stringify({
        data: filteredProducts,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        search: {
          query,
          type,
          subType,
          sellerId,
          entityId,
          priceRange: minPrice || maxPrice
            ? {
              min: minPrice ? parseFloat(minPrice) : undefined,
              max: maxPrice ? parseFloat(maxPrice) : undefined,
            }
            : null,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Product search error:", error);
    return new Response(
      JSON.stringify({
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}
