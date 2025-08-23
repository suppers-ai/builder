// Pricing Variables Types
// Types for the new pricing system with admin configuration and user simplification

export type VariableValueType = "number" | "percentage" | "boolean" | "string" | "time" | "date";
export type VariableCategory = "pricing" | "capacity" | "features" | "time" | "restrictions";

export interface ValidationRules {
  min?: number;
  max?: number;
  required?: boolean;
  step?: number;
  pattern?: string;
}

export interface GlobalVariableDefinition {
  id: string;
  variable_id: string; // e.g., 'basePrice', 'weekendSurcharge'
  name: string; // User-friendly name: "Base Price"
  description: string; // "The standard price before any adjustments"
  category: VariableCategory;
  value_type: VariableValueType;
  default_value?: string;
  validation_rules?: ValidationRules;
  display_order: number;
  is_system: boolean; // System variables cannot be deleted
  created_at: string;
  updated_at: string;
}

export interface ProductVariableValue {
  id: string;
  product_id: string;
  variable_id: string; // Reference to GlobalVariableDefinition.variable_id
  value: string; // Stored as string, converted based on value_type
  created_at: string;
  updated_at: string;
}

// Enhanced pricing product with template information
export interface AdminPricingProduct {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  is_template: boolean; // True for system templates
  template_category?: string; // e.g., 'restaurant', 'hotel', 'event'
  variable_ids: string[]; // Which variables this template uses
  created_at: string;
  updated_at: string;
}

// For simplified user interface - combines definition and value
export interface UserVariableInput {
  variable_id: string;
  name: string; // User-friendly name from definition
  description: string;
  category: VariableCategory;
  value_type: VariableValueType;
  current_value?: string;
  default_value?: string;
  validation_rules?: ValidationRules;
  display_order: number;
  required: boolean;
}

// Template selection for users
export interface PricingTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview_variables: UserVariableInput[]; // Show which variables user will need to set
  estimated_setup_time: number; // Minutes
  complexity_level: "simple" | "moderate" | "advanced";
}

// API request types
export interface CreateVariableDefinitionRequest {
  variable_id: string;
  name: string;
  description: string;
  category: VariableCategory;
  value_type: VariableValueType;
  default_value?: string;
  validation_rules?: ValidationRules;
  display_order?: number;
}

export interface UpdateVariableDefinitionRequest {
  name?: string;
  description?: string;
  category?: VariableCategory;
  value_type?: VariableValueType;
  default_value?: string;
  validation_rules?: ValidationRules;
  display_order?: number;
}

export interface SetProductVariableRequest {
  variable_id: string;
  value: string;
}

export interface ApplyPricingTemplateRequest {
  template_id: string;
  variable_values: Record<string, string>; // variable_id -> value
}

// API response types
export interface VariableDefinitionListResponse {
  variables: GlobalVariableDefinition[];
  total: number;
  categories: VariableCategory[];
}

export interface PricingTemplateListResponse {
  templates: PricingTemplate[];
  categories: string[];
}

export interface ProductVariablesResponse {
  product_id: string;
  variables: UserVariableInput[];
  applied_template?: {
    id: string;
    name: string;
    category: string;
  };
}
