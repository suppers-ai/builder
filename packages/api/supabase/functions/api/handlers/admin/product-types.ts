import type { SupabaseClient } from "@supabase/supabase-js";
import { corsHeaders } from "../../_common/index.ts";

export interface ProductTypeContext {
  supabase: SupabaseClient;
  userId: string;
}

/**
 * Handle product type management requests
 */
export async function handleAdminProductTypes(
  req: Request,
  context: ProductTypeContext,
  pathSegments: string[],
): Promise<Response> {
  const { supabase } = context;
  const method = req.method;
  const url = new URL(req.url);

  console.log("🏷️ Product types handler - method:", method, "pathSegments:", pathSegments);

  try {
    const [productTypeId, subEndpoint, subProductTypeId] = pathSegments;

    switch (method) {
      case "GET":
        if (!productTypeId) {
          // GET /api/v1/admin/product-types - Get all product types
          return await getAllProductTypes(supabase);
        } else if (subEndpoint === "sub-types" && !subProductTypeId) {
          // GET /api/v1/admin/product-types/:id/sub-types - Get sub-types for product type
          return await getProductSubTypes(supabase, productTypeId);
        } else if (!subEndpoint) {
          // GET /api/v1/admin/product-types/:id - Get specific product type
          return await getProductType(supabase, productTypeId);
        }
        break;

      case "POST":
        if (!productTypeId) {
          // POST /api/v1/admin/product-types - Create new product type
          const body = await req.json();
          return await createProductType(supabase, body);
        } else if (subEndpoint === "sub-types") {
          // POST /api/v1/admin/product-types/:id/sub-types - Create sub-type for product type
          const body = await req.json();
          return await createProductSubType(supabase, productTypeId, body);
        }
        break;

      case "PUT":
        if (productTypeId && !subEndpoint) {
          // PUT /api/v1/admin/product-types/:id - Update product type
          const body = await req.json();
          return await updateProductType(supabase, productTypeId, body);
        } else if (subEndpoint === "sub-types" && subProductTypeId) {
          // PUT /api/v1/admin/product-types/:id/sub-types/:subId - Update product sub-type
          const body = await req.json();
          return await updateProductSubType(supabase, subProductTypeId, body);
        }
        break;

      case "DELETE":
        if (productTypeId && !subEndpoint) {
          // DELETE /api/v1/admin/product-types/:id - Delete product type
          return await deleteProductType(supabase, productTypeId);
        } else if (subEndpoint === "sub-types" && subProductTypeId) {
          // DELETE /api/v1/admin/product-types/:id/sub-types/:subId - Delete product sub-type
          return await deleteProductSubType(supabase, subProductTypeId);
        }
        break;
    }

    return new Response(JSON.stringify({ error: "Invalid endpoint or method" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Product types handler error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

/**
 * Get all product types
 */
async function getAllProductTypes(supabase: SupabaseClient): Promise<Response> {
  const { data, error } = await supabase
    .from("product_types")
    .select(`
      *,
      product_sub_types (*)
    `)
    .order("name");

  if (error) {
    console.error("Error fetching product types:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch product types" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Get specific product type
 */
async function getProductType(supabase: SupabaseClient, id: string): Promise<Response> {
  const { data, error } = await supabase
    .from("product_types")
    .select(`
      *,
      product_sub_types (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product type:", error);
    return new Response(JSON.stringify({ error: "Product type not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Create new product type
 */
async function createProductType(supabase: SupabaseClient, body: any): Promise<Response> {
  const { name, description, metadata_schema, filter_config } = body;

  if (!name) {
    return new Response(JSON.stringify({ error: "Name is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from("product_types")
    .insert({
      name,
      description,
      metadata_schema,
      filter_config,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating product type:", error);
    return new Response(JSON.stringify({ error: "Failed to create product type" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Update product type
 */
async function updateProductType(
  supabase: SupabaseClient,
  id: string,
  body: any,
): Promise<Response> {
  const { name, description, metadata_schema, filter_config } = body;

  const { data, error } = await supabase
    .from("product_types")
    .update({
      name,
      description,
      metadata_schema,
      filter_config,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product type:", error);
    return new Response(JSON.stringify({ error: "Failed to update product type" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Delete product type
 */
async function deleteProductType(supabase: SupabaseClient, id: string): Promise<Response> {
  const { error } = await supabase
    .from("product_types")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting product type:", error);
    return new Response(JSON.stringify({ error: "Failed to delete product type" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ message: "Product type deleted successfully" }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Get product sub-types for a specific product type
 */
async function getProductSubTypes(
  supabase: SupabaseClient,
  productTypeId: string,
): Promise<Response> {
  const { data, error } = await supabase
    .from("product_sub_types")
    .select("*")
    .eq("product_type_id", productTypeId)
    .order("name");

  if (error) {
    console.error("Error fetching product sub-types:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch product sub-types" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Create product sub-type
 */
async function createProductSubType(
  supabase: SupabaseClient,
  productTypeId: string,
  body: any,
): Promise<Response> {
  const { name, description, metadata_schema, filter_config } = body;

  if (!name) {
    return new Response(JSON.stringify({ error: "Name is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from("product_sub_types")
    .insert({
      product_type_id: productTypeId,
      name,
      description,
      metadata_schema,
      filter_config,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating product sub-type:", error);
    return new Response(JSON.stringify({ error: "Failed to create product sub-type" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Update product sub-type
 */
async function updateProductSubType(
  supabase: SupabaseClient,
  id: string,
  body: any,
): Promise<Response> {
  const { name, description, metadata_schema, filter_config } = body;

  const { data, error } = await supabase
    .from("product_sub_types")
    .update({
      name,
      description,
      metadata_schema,
      filter_config,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product sub-type:", error);
    return new Response(JSON.stringify({ error: "Failed to update product sub-type" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Delete product sub-type
 */
async function deleteProductSubType(supabase: SupabaseClient, id: string): Promise<Response> {
  const { error } = await supabase
    .from("product_sub_types")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting product sub-type:", error);
    return new Response(JSON.stringify({ error: "Failed to delete product sub-type" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ message: "Product sub-type deleted successfully" }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
