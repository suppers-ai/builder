import { createErrorResponse, createResponse } from "../../response-utils.ts";
import { User } from "../../types.ts";
import { getSupabaseClient } from "../../_common/index.ts";

// =============================================
// PRICING PRODUCTS (TEMPLATES) MANAGEMENT
// =============================================

export async function handleGetPricingProducts(
  req: Request,
  user: User,
): Promise<Response> {
  try {
    const supabase = getSupabaseClient();
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const is_template = url.searchParams.get("is_template");

    let query = supabase
      .from("pricing_products")
      .select(`
        id,
        owner_id,
        name,
        description,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

    // Filter by category if provided
    if (category) {
      query = query.eq("template_category", category);
    }

    // Filter templates vs user-created
    if (is_template === "true") {
      query = query.eq("owner_id", "00000000-0000-0000-0000-000000000000");
    } else if (is_template === "false") {
      query = query.neq("owner_id", "00000000-0000-0000-0000-000000000000");
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching pricing products:", error);
      return createErrorResponse("Failed to fetch pricing products", 500);
    }

    return createResponse({
      pricing_products: data || [],
      total: data?.length || 0,
    });
  } catch (error) {
    console.error("Error in handleGetPricingProducts:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function handleCreatePricingProduct(
  req: Request,
  user: User,
): Promise<Response> {
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();
    const { name, description, template_category, variable_ids } = body;

    if (!name || !description) {
      return createErrorResponse("Name and description are required", 400);
    }

    const { data, error } = await supabase
      .from("pricing_products")
      .insert({
        owner_id: user.id,
        name,
        description,
        template_category,
        variable_ids: variable_ids || [],
        is_template: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating pricing product:", error);
      return createErrorResponse("Failed to create pricing product", 500);
    }

    return createResponse(data, 201);
  } catch (error) {
    console.error("Error in handleCreatePricingProduct:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function handleUpdatePricingProduct(
  req: Request,
  user: User,
  pricingProductId: string,
): Promise<Response> {
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();
    const { name, description, template_category, variable_ids } = body;

    // Check ownership
    const { data: existing, error: checkError } = await supabase
      .from("pricing_products")
      .select("owner_id")
      .eq("id", pricingProductId)
      .single();

    if (checkError || !existing) {
      return createErrorResponse("Pricing product not found", 404);
    }

    if (existing.owner_id !== user.id) {
      return createErrorResponse("Unauthorized", 403);
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (template_category !== undefined) updates.template_category = template_category;
    if (variable_ids !== undefined) updates.variable_ids = variable_ids;

    const { data, error } = await supabase
      .from("pricing_products")
      .update(updates)
      .eq("id", pricingProductId)
      .select()
      .single();

    if (error) {
      console.error("Error updating pricing product:", error);
      return createErrorResponse("Failed to update pricing product", 500);
    }

    return createResponse(data);
  } catch (error) {
    console.error("Error in handleUpdatePricingProduct:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function handleDeletePricingProduct(
  req: Request,
  user: User,
  pricingProductId: string,
): Promise<Response> {
  try {
    const supabase = getSupabaseClient();
    // Check ownership
    const { data: existing, error: checkError } = await supabase
      .from("pricing_products")
      .select("owner_id")
      .eq("id", pricingProductId)
      .single();

    if (checkError || !existing) {
      return createErrorResponse("Pricing product not found", 404);
    }

    if (existing.owner_id !== user.id) {
      return createErrorResponse("Unauthorized", 403);
    }

    const { error } = await supabase
      .from("pricing_products")
      .delete()
      .eq("id", pricingProductId);

    if (error) {
      console.error("Error deleting pricing product:", error);
      return createErrorResponse("Failed to delete pricing product", 500);
    }

    return createResponse({ success: true });
  } catch (error) {
    console.error("Error in handleDeletePricingProduct:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function handleClonePricingProduct(
  req: Request,
  user: User,
  pricingProductId: string,
): Promise<Response> {
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return createErrorResponse("Name is required for cloned product", 400);
    }

    // Get the original pricing product
    const { data: original, error: fetchError } = await supabase
      .from("pricing_products")
      .select("*")
      .eq("id", pricingProductId)
      .single();

    if (fetchError || !original) {
      return createErrorResponse("Original pricing product not found", 404);
    }

    // Clone the pricing product
    const { data: cloned, error: cloneError } = await supabase
      .from("pricing_products")
      .insert({
        owner_id: user.id,
        name,
        description: `Copy of ${original.description}`,
        template_category: original.template_category,
        variable_ids: original.variable_ids,
        is_template: false,
      })
      .select()
      .single();

    if (cloneError) {
      console.error("Error cloning pricing product:", cloneError);
      return createErrorResponse("Failed to clone pricing product", 500);
    }

    // TODO: Also clone associated formulas and prices

    return createResponse(cloned, 201);
  } catch (error) {
    console.error("Error in handleClonePricingProduct:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

// =============================================
// VARIABLE DEFINITIONS MANAGEMENT
// =============================================

export async function handleGetVariableDefinitions(
  req: Request,
  user: User,
): Promise<Response> {
  try {
    const supabase = getSupabaseClient();
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    let query = supabase
      .from("global_variable_definitions")
      .select("*")
      .order("display_order", { ascending: true });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching variable definitions:", error);
      return createErrorResponse("Failed to fetch variable definitions", 500);
    }

    // Get unique categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("global_variable_definitions")
      .select("category")
      .order("category");

    const categories = [...new Set(categoriesData?.map((row) => row.category) || [])];

    const response = {
      variables: data || [],
      total: data?.length || 0,
      categories: categories as any[],
    };

    return createResponse(response);
  } catch (error) {
    console.error("Error in handleGetVariableDefinitions:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function handleCreateVariableDefinition(
  req: Request,
  user: User,
): Promise<Response> {
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();
    const {
      variable_id,
      name,
      description,
      category,
      value_type,
      default_value,
      validation_rules,
      display_order,
    } = body;

    if (!variable_id || !name || !description || !category || !value_type) {
      return createErrorResponse("Missing required fields", 400);
    }

    const { data, error } = await supabase
      .from("global_variable_definitions")
      .insert({
        variable_id,
        name,
        description,
        category,
        value_type,
        default_value,
        validation_rules: validation_rules || {},
        display_order: display_order || 0,
        is_system: false,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") { // Unique constraint violation
        return createErrorResponse("Variable ID already exists", 400);
      }
      console.error("Error creating variable definition:", error);
      return createErrorResponse("Failed to create variable definition", 500);
    }

    return createResponse(data, 201);
  } catch (error) {
    console.error("Error in handleCreateVariableDefinition:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function handleUpdateVariableDefinition(
  req: Request,
  user: User,
  variableId: string,
): Promise<Response> {
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();

    // Check if variable exists and is not system-protected
    const { data: existing, error: checkError } = await supabase
      .from("global_variable_definitions")
      .select("is_system")
      .eq("id", variableId)
      .single();

    if (checkError || !existing) {
      return createErrorResponse("Variable definition not found", 404);
    }

    if (existing.is_system) {
      return createErrorResponse("Cannot modify system variables", 403);
    }

    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.category !== undefined) updates.category = body.category;
    if (body.value_type !== undefined) updates.value_type = body.value_type;
    if (body.default_value !== undefined) updates.default_value = body.default_value;
    if (body.validation_rules !== undefined) updates.validation_rules = body.validation_rules;
    if (body.display_order !== undefined) updates.display_order = body.display_order;

    const { data, error } = await supabase
      .from("global_variable_definitions")
      .update(updates)
      .eq("id", variableId)
      .select()
      .single();

    if (error) {
      console.error("Error updating variable definition:", error);
      return createErrorResponse("Failed to update variable definition", 500);
    }

    return createResponse(data);
  } catch (error) {
    console.error("Error in handleUpdateVariableDefinition:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function handleDeleteVariableDefinition(
  req: Request,
  user: User,
  variableId: string,
): Promise<Response> {
  try {
    const supabase = getSupabaseClient();
    // Check if variable exists and is not system-protected
    const { data: existing, error: checkError } = await supabase
      .from("global_variable_definitions")
      .select("is_system")
      .eq("id", variableId)
      .single();

    if (checkError || !existing) {
      return createErrorResponse("Variable definition not found", 404);
    }

    if (existing.is_system) {
      return createErrorResponse("Cannot delete system variables", 403);
    }

    const { error } = await supabase
      .from("global_variable_definitions")
      .delete()
      .eq("id", variableId);

    if (error) {
      console.error("Error deleting variable definition:", error);
      return createErrorResponse("Failed to delete variable definition", 500);
    }

    return createResponse({ success: true });
  } catch (error) {
    console.error("Error in handleDeleteVariableDefinition:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

// =============================================
// TEMPLATES FOR USER SELECTION
// =============================================

export async function handleGetPricingTemplates(
  req: Request,
  user: User,
): Promise<Response> {
  try {
    const supabase = getSupabaseClient();
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    // Get system templates (owner_id = 00000000-0000-0000-0000-000000000000)
    let query = supabase
      .from("pricing_products")
      .select(`
        id,
        name,
        description,
        template_category,
        variable_ids
      `)
      .eq("owner_id", "00000000-0000-0000-0000-000000000000")
      .order("name");

    if (category) {
      query = query.eq("template_category", category);
    }

    const { data: templatesData, error: templatesError } = await query;

    if (templatesError) {
      console.error("Error fetching pricing templates:", templatesError);
      return createErrorResponse("Failed to fetch pricing templates", 500);
    }

    // Get variable definitions for templates
    const { data: variablesData, error: variablesError } = await supabase
      .from("global_variable_definitions")
      .select("*")
      .order("display_order");

    if (variablesError) {
      console.error("Error fetching variable definitions:", variablesError);
      return createErrorResponse("Failed to fetch variable definitions", 500);
    }

    // Transform to PricingTemplate format
    const templates: any[] = (templatesData || []).map((template) => {
      const templateVariables = (variablesData || []).filter((variable) =>
        template.variable_ids?.includes(variable.variable_id)
      );

      return {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.template_category || "general",
        preview_variables: templateVariables.map((variable) => ({
          variable_id: variable.variable_id,
          name: variable.name,
          description: variable.description,
          category: variable.category,
          value_type: variable.value_type,
          default_value: variable.default_value,
          validation_rules: variable.validation_rules,
          display_order: variable.display_order,
          required: variable.validation_rules?.required || false,
        })),
        estimated_setup_time: Math.max(2, templateVariables.length), // Estimate based on variable count
        complexity_level: templateVariables.length <= 3
          ? "simple"
          : templateVariables.length <= 6
          ? "moderate"
          : "advanced",
      };
    });

    // Get unique categories
    const categories = [
      ...new Set(templatesData?.map((t) => t.template_category).filter(Boolean) || []),
    ];

    const response = {
      templates,
      categories,
    };

    return createResponse(response);
  } catch (error) {
    console.error("Error in handleGetPricingTemplates:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
