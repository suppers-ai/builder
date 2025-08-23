/**
 * Metadata validation service
 * Validates metadata against type schemas and provides mapping to filter columns
 */

export interface MetadataField {
  type: "text" | "number" | "boolean" | "date" | "time" | "select" | "array" | "object";
  label: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[];
  default?: any;
  properties?: Record<string, MetadataField>;
}

export interface MetadataSchema {
  fields: Record<string, MetadataField>;
}

export interface FilterConfig {
  [key: string]: {
    label: string;
    searchable: boolean;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  filteredMetadata: Record<string, any>;
  filterMappings: Record<string, any>;
}

/**
 * Validates metadata against a schema
 */
export function validateMetadata(
  metadata: Record<string, any>,
  schema: MetadataSchema,
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    filteredMetadata: {},
    filterMappings: {},
  };

  if (!schema || !schema.fields) {
    return result;
  }

  // Validate each field in the schema
  for (const [fieldName, fieldConfig] of Object.entries(schema.fields)) {
    const value = metadata[fieldName];
    const validation = validateField(value, fieldConfig, fieldName);

    if (!validation.isValid) {
      result.isValid = false;
      result.errors.push(...validation.errors);
    } else if (validation.value !== undefined) {
      result.filteredMetadata[fieldName] = validation.value;
    }
  }

  // Check for unexpected fields
  for (const fieldName of Object.keys(metadata)) {
    if (!schema.fields[fieldName]) {
      result.errors.push(`Unexpected field: ${fieldName}`);
      result.isValid = false;
    }
  }

  return result;
}

/**
 * Validates a single field value
 */
function validateField(
  value: any,
  config: MetadataField,
  fieldName: string,
): { isValid: boolean; errors: string[]; value?: any } {
  const errors: string[] = [];

  // Check if required field is missing
  if (config.required && (value === undefined || value === null || value === "")) {
    errors.push(`Field '${fieldName}' is required`);
    return { isValid: false, errors };
  }

  // If value is undefined/null and not required, that's OK
  if (value === undefined || value === null) {
    return { isValid: true, errors: [], value: config.default };
  }

  // Type-specific validation
  switch (config.type) {
    case "text":
    case "select":
      if (typeof value !== "string") {
        errors.push(`Field '${fieldName}' must be a string`);
      } else {
        if (config.min && value.length < config.min) {
          errors.push(`Field '${fieldName}' must be at least ${config.min} characters`);
        }
        if (config.max && value.length > config.max) {
          errors.push(`Field '${fieldName}' must be at most ${config.max} characters`);
        }
        if (config.options && !config.options.includes(value)) {
          errors.push(`Field '${fieldName}' must be one of: ${config.options.join(", ")}`);
        }
      }
      break;

    case "number":
      if (typeof value !== "number" && !Number.isFinite(Number(value))) {
        errors.push(`Field '${fieldName}' must be a number`);
      } else {
        const numValue = Number(value);
        if (config.min !== undefined && numValue < config.min) {
          errors.push(`Field '${fieldName}' must be at least ${config.min}`);
        }
        if (config.max !== undefined && numValue > config.max) {
          errors.push(`Field '${fieldName}' must be at most ${config.max}`);
        }
        return { isValid: errors.length === 0, errors, value: numValue };
      }
      break;

    case "boolean":
      if (typeof value !== "boolean") {
        errors.push(`Field '${fieldName}' must be a boolean`);
      }
      break;

    case "date":
      if (typeof value === "string") {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(`Field '${fieldName}' must be a valid date`);
        }
      } else {
        errors.push(`Field '${fieldName}' must be a date string`);
      }
      break;

    case "time":
      if (typeof value === "string") {
        // Basic time format validation (HH:MM)
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
          errors.push(`Field '${fieldName}' must be in HH:MM format`);
        }
      } else {
        errors.push(`Field '${fieldName}' must be a time string`);
      }
      break;

    case "array":
      if (!Array.isArray(value)) {
        errors.push(`Field '${fieldName}' must be an array`);
      } else {
        if (config.min !== undefined && value.length < config.min) {
          errors.push(`Field '${fieldName}' must have at least ${config.min} items`);
        }
        if (config.max !== undefined && value.length > config.max) {
          errors.push(`Field '${fieldName}' must have at most ${config.max} items`);
        }
        if (config.options) {
          for (const item of value) {
            if (!config.options.includes(item)) {
              errors.push(`Field '${fieldName}' contains invalid option: ${item}`);
            }
          }
        }
      }
      break;

    case "object":
      if (typeof value !== "object" || Array.isArray(value)) {
        errors.push(`Field '${fieldName}' must be an object`);
      } else if (config.properties) {
        // Validate nested object properties
        for (const [propName, propConfig] of Object.entries(config.properties)) {
          const propValidation = validateField(
            value[propName],
            propConfig,
            `${fieldName}.${propName}`,
          );
          if (!propValidation.isValid) {
            errors.push(...propValidation.errors);
          }
        }
      }
      break;

    default:
      errors.push(`Unknown field type: ${config.type}`);
  }

  return { isValid: errors.length === 0, errors, value };
}

/**
 * Maps metadata to filter columns based on filter configuration
 */
export function mapMetadataToFilters(
  metadata: Record<string, any>,
  filterConfig: FilterConfig,
): Record<string, any> {
  const filterMappings: Record<string, any> = {};

  if (!filterConfig) return filterMappings;

  for (const [filterColumn, config] of Object.entries(filterConfig)) {
    // Find metadata field that maps to this filter column
    const metadataField = findMetadataFieldForFilter(metadata, config.label);
    if (metadataField !== undefined) {
      filterMappings[filterColumn] = metadataField;
    }
  }

  return filterMappings;
}

/**
 * Finds metadata field value that should map to a filter column
 */
function findMetadataFieldForFilter(
  metadata: Record<string, any>,
  filterLabel: string,
): any {
  // This is a simplified mapping - in practice, you might want more sophisticated logic
  // to map metadata fields to filter columns based on naming conventions or explicit mappings

  // Try to find field by exact label match first
  for (const [fieldName, value] of Object.entries(metadata)) {
    if (fieldName.toLowerCase().includes(filterLabel.toLowerCase())) {
      return value;
    }
  }

  // Try common mappings
  const commonMappings: Record<string, string[]> = {
    "star rating": ["star_rating", "rating", "stars"],
    "maximum guests": ["max_guests", "capacity", "max_occupancy"],
    "property type": ["property_type", "type", "room_type"],
    "pets allowed": ["pets_allowed", "allows_pets", "pet_friendly"],
    "has pool": ["has_pool", "pool", "amenities"],
    "duration": ["duration", "service_duration"],
    "service category": ["service_category", "category"],
    "remote available": ["remote_available", "remote_service"],
    "capacity": ["capacity", "max_capacity"],
    "venue type": ["venue_type", "type"],
    "has projector": ["has_projector", "equipment_included"],
    "has parking": ["has_parking", "parking", "amenities"],
  };

  const mappings = commonMappings[filterLabel.toLowerCase()] || [];
  for (const mapping of mappings) {
    if (metadata[mapping] !== undefined) {
      return metadata[mapping];
    }
  }

  return undefined;
}

/**
 * Merges parent and child metadata schemas (for sub-types)
 */
export function mergeMetadataSchemas(
  parentSchema: MetadataSchema | null,
  childSchema: MetadataSchema | null,
): MetadataSchema {
  if (!parentSchema) return childSchema || { fields: {} };
  if (!childSchema) return parentSchema;

  return {
    fields: {
      ...parentSchema.fields,
      ...childSchema.fields,
    },
  };
}

/**
 * Merges parent and child filter configurations (for sub-types)
 */
export function mergeFilterConfigs(
  parentConfig: FilterConfig | null,
  childConfig: FilterConfig | null,
): FilterConfig {
  if (!parentConfig) return childConfig || {};
  if (!childConfig) return parentConfig;

  return {
    ...parentConfig,
    ...childConfig,
  };
}
