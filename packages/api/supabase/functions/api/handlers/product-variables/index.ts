import { createErrorResponse, createResponse } from "../../response-utils.ts";
import { User } from "../../types.ts";
import { getSupabaseClient } from "../../_common/index.ts";

// =============================================
// PRODUCT VARIABLE MANAGEMENT (USER-FACING)
// =============================================

export async function handleGetProductVariables(
  req: Request,
  user: User,
  productId: string,
): Promise<Response> {
  try {
    const supabase = getSupabaseClient();
    // First verify the product belongs to the user
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("seller_id")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return createErrorResponse("Product not found", 404);
    }

    if (product.seller_id !== user.id) {
      return createErrorResponse("Unauthorized", 403);
    }

    // Get product variables with system variable definitions
    const { data: productVars, error: productVarsError } = await supabase
      .from("variables")
      .select("*")
      .eq("product_id", productId)
      .eq("is_system", false);

    if (productVarsError) {
      console.error("Error fetching product variables:", productVarsError);
      return createErrorResponse("Failed to fetch product variables", 500);
    }

    // Get system variable definitions for these variables
    const variableIds = (productVars || []).map(v => v.variable_id);
    const { data: systemVars, error: systemVarsError } = await supabase
      .from("variables")
      .select("*")
      .in("variable_id", variableIds)
      .eq("is_system", true)
      .order("display_order");

    const variablesError = systemVarsError;
    const variablesData = (productVars || []).map(pv => {
      const sysDef = systemVars?.find(sv => sv.variable_id === pv.variable_id);
      return {
        ...pv,
        system_definition: sysDef
      };
    });

    if (variablesError) {
      console.error("Error fetching product variables:", variablesError);
      return createErrorResponse("Failed to fetch product variables", 500);
    }

    // Transform to UserVariableInput format
    const variables: any[] = (variablesData || []).map((variable) => ({
      variable_id: variable.variable_id,
      name: variable.system_definition?.name || variable.name,
      description: variable.system_definition?.description || variable.description,
      category: variable.system_definition?.category || variable.category,
      value_type: variable.system_definition?.value_type || variable.value_type,
      current_value: variable.value,
      default_value: variable.system_definition?.default_value,
      validation_rules: variable.system_definition?.validation_rules || variable.validation_rules,
      display_order: variable.system_definition?.display_order || variable.display_order,
      required: variable.system_definition?.validation_rules?.required || false,
    }));

    // Check if there's an applied template (stored in product metadata)
    const { data: productData, error: productDataError } = await supabase
      .from("products")
      .select("metadata")
      .eq("id", productId)
      .single();

    let appliedTemplate = null;
    if (!productDataError && productData?.metadata?.applied_template) {
      appliedTemplate = productData.metadata.applied_template;
    }

    const response = {
      product_id: productId,
      variables,
      applied_template: appliedTemplate,
    };

    return createResponse(response);
  } catch (error) {
    console.error("Error in handleGetProductVariables:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function handleSetProductVariable(
  req: Request,
  user: User,
  productId: string,
): Promise<Response> {
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();
    const { variable_id, value } = body;

    if (!variable_id) {
      return createErrorResponse("Variable ID is required", 400);
    }

    // Verify the product belongs to the user
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("seller_id")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return createErrorResponse("Product not found", 404);
    }

    if (product.seller_id !== user.id) {
      return createErrorResponse("Unauthorized", 403);
    }

    // Verify the system variable definition exists
    const { data: variableDefinition, error: defError } = await supabase
      .from("variables")
      .select("*")
      .eq("variable_id", variable_id)
      .eq("is_system", true)
      .single();

    if (defError || !variableDefinition) {
      return createErrorResponse("Variable definition not found", 404);
    }

    // Validate the value against the variable definition
    const validationError = validateVariableValue(value, variableDefinition);
    if (validationError) {
      return createErrorResponse(validationError, 400);
    }

    // Upsert the variable value
    const { error: upsertError } = await supabase
      .from("product_variables")
      .upsert({
        product_id: productId,
        variable_id: variable_id,
        value: value,
      }, {
        onConflict: "product_id,variable_id",
      });

    if (upsertError) {
      console.error("Error upserting variable:", upsertError);
      return createErrorResponse("Failed to set variable value", 500);
    }

    return createResponse({ success: true });
  } catch (error) {
    console.error("Error in handleSetProductVariable:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function handleApplyPricingTemplate(
  req: Request,
  user: User,
  productId: string,
): Promise<Response> {
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();
    const { template_id, variable_values } = body;

    if (!template_id) {
      return createErrorResponse("Template ID is required", 400);
    }

    // Verify the product belongs to the user
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("seller_id, metadata")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return createErrorResponse("Product not found", 404);
    }

    if (product.seller_id !== user.id) {
      return createErrorResponse("Unauthorized", 403);
    }

    // Get the template
    const { data: template, error: templateError } = await supabase
      .from("pricing_products")
      .select("*")
      .eq("id", template_id)
      .single();

    if (templateError || !template) {
      return createErrorResponse("Template not found", 404);
    }

    // Clear existing variables for this product
    const { error: deleteError } = await supabase
      .from("variables")
      .delete()
      .eq("product_id", productId);

    if (deleteError) {
      console.error("Error clearing existing variables:", deleteError);
      return createErrorResponse("Failed to clear existing variables", 500);
    }

    // Get system variable definitions for the template
    const { data: variableDefinitions, error: defsError } = await supabase
      .from("variables")
      .select("*")
      .in("variable_id", template.variable_ids || [])
      .eq("is_system", true);

    if (defsError) {
      console.error("Error fetching variable definitions:", defsError);
      return createErrorResponse("Failed to fetch variable definitions", 500);
    }

    // Insert new variables with provided values
    const variablesToInsert = (variableDefinitions || []).map((def) => ({
      product_id: productId,
      variable_id: def.variable_id,
      name: def.name,
      description: def.description,
      value_type: def.value_type,
      value: variable_values[def.variable_id] || def.default_value || "",
      category: def.category,
      validation_rules: def.validation_rules,
      display_order: def.display_order,
    }));

    if (variablesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("variables")
        .insert(variablesToInsert);

      if (insertError) {
        console.error("Error inserting variables:", insertError);
        return createErrorResponse("Failed to apply template variables", 500);
      }
    }

    // Update product metadata to track applied template
    const updatedMetadata = {
      ...product.metadata,
      applied_template: {
        id: template.id,
        name: template.name,
        category: template.template_category || "general",
      },
    };

    const { error: updateError } = await supabase
      .from("products")
      .update({ metadata: updatedMetadata })
      .eq("id", productId);

    if (updateError) {
      console.error("Error updating product metadata:", updateError);
      // This is not critical, continue
    }

    // Return the new variables configuration
    return await handleGetProductVariables(req, user, productId);
  } catch (error) {
    console.error("Error in handleApplyPricingTemplate:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function handleRemoveProductTemplate(
  req: Request,
  user: User,
  productId: string,
): Promise<Response> {
  try {
    const supabase = getSupabaseClient();
    // Verify the product belongs to the user
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("seller_id, metadata")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return createErrorResponse("Product not found", 404);
    }

    if (product.seller_id !== user.id) {
      return createErrorResponse("Unauthorized", 403);
    }

    // Clear all variables for this product
    const { error: deleteError } = await supabase
      .from("variables")
      .delete()
      .eq("product_id", productId);

    if (deleteError) {
      console.error("Error clearing variables:", deleteError);
      return createErrorResponse("Failed to clear variables", 500);
    }

    // Remove applied template from metadata
    const updatedMetadata = { ...product.metadata };
    delete updatedMetadata.applied_template;

    const { error: updateError } = await supabase
      .from("products")
      .update({ metadata: updatedMetadata })
      .eq("id", productId);

    if (updateError) {
      console.error("Error updating product metadata:", updateError);
      // This is not critical, continue
    }

    return createResponse({ success: true });
  } catch (error) {
    console.error("Error in handleRemoveProductTemplate:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

function validateVariableValue(value: string, definition: any): string | null {
  const rules = definition.validation_rules || {};

  // Required check
  if (rules.required && (!value || value.trim() === "")) {
    return `${definition.name} is required`;
  }

  // Type-specific validation
  switch (definition.value_type) {
    case "number":
    case "percentage":
      const numValue = Number(value);
      if (value && isNaN(numValue)) {
        return `${definition.name} must be a valid number`;
      }
      if (rules.min !== undefined && numValue < rules.min) {
        return `${definition.name} must be at least ${rules.min}`;
      }
      if (rules.max !== undefined && numValue > rules.max) {
        return `${definition.name} must be at most ${rules.max}`;
      }
      break;

    case "string":
      if (rules.pattern && value && !new RegExp(rules.pattern).test(value)) {
        return `${definition.name} format is invalid`;
      }
      break;

    case "boolean":
      if (value && value !== "true" && value !== "false") {
        return `${definition.name} must be true or false`;
      }
      break;
  }

  return null; // No validation errors
}
