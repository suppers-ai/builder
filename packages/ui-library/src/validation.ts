// Component prop validation utilities

import type { JSONSchema } from '@json-app-compiler/shared';
import type { 
  ComponentPropSchema, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  ComponentRegistryEntry 
} from './types.ts';

/**
 * Validates component props against a schema
 */
export function validateComponentProps(
  props: Record<string, unknown>,
  schema: ComponentPropSchema
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check required props
  for (const [propName, propDef] of Object.entries(schema)) {
    if (propDef.required && !(propName in props)) {
      errors.push({
        field: propName,
        message: `Required prop '${propName}' is missing`,
        expected: propDef.type,
        code: 'MISSING_REQUIRED_PROP'
      });
    }
  }

  // Validate existing props
  for (const [propName, propValue] of Object.entries(props)) {
    const propDef = schema[propName];
    
    if (!propDef) {
      warnings.push({
        field: propName,
        message: `Unknown prop '${propName}'`,
        suggestion: 'Check component documentation for valid props'
      });
      continue;
    }

    const validation = validatePropValue(propValue, propDef, propName);
    errors.push(...validation.errors);
    warnings.push(...validation.warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates a single prop value against its definition
 */
function validatePropValue(
  value: unknown,
  propDef: ComponentPropSchema[string],
  propName: string
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Type validation
  if (!validateType(value, propDef.type)) {
    errors.push({
      field: propName,
      message: `Invalid type for prop '${propName}'. Expected ${propDef.type}, got ${typeof value}`,
      value,
      expected: propDef.type,
      code: 'INVALID_TYPE'
    });
    return { valid: false, errors, warnings };
  }

  // Enum validation
  if (propDef.enum && !propDef.enum.includes(value)) {
    errors.push({
      field: propName,
      message: `Invalid value for prop '${propName}'. Must be one of: ${propDef.enum.join(', ')}`,
      value,
      expected: propDef.enum.join(' | '),
      code: 'INVALID_ENUM_VALUE'
    });
  }

  // String validations
  if (propDef.type === 'string' && typeof value === 'string') {
    if (propDef.pattern && !new RegExp(propDef.pattern).test(value)) {
      errors.push({
        field: propName,
        message: `String value for prop '${propName}' does not match required pattern`,
        value,
        expected: propDef.pattern,
        code: 'PATTERN_MISMATCH'
      });
    }

    if (propDef.minLength !== undefined && value.length < propDef.minLength) {
      errors.push({
        field: propName,
        message: `String value for prop '${propName}' is too short. Minimum length: ${propDef.minLength}`,
        value,
        expected: `length >= ${propDef.minLength}`,
        code: 'STRING_TOO_SHORT'
      });
    }

    if (propDef.maxLength !== undefined && value.length > propDef.maxLength) {
      errors.push({
        field: propName,
        message: `String value for prop '${propName}' is too long. Maximum length: ${propDef.maxLength}`,
        value,
        expected: `length <= ${propDef.maxLength}`,
        code: 'STRING_TOO_LONG'
      });
    }
  }

  // Number validations
  if (propDef.type === 'number' && typeof value === 'number') {
    if (propDef.min !== undefined && value < propDef.min) {
      errors.push({
        field: propName,
        message: `Number value for prop '${propName}' is too small. Minimum: ${propDef.min}`,
        value,
        expected: `>= ${propDef.min}`,
        code: 'NUMBER_TOO_SMALL'
      });
    }

    if (propDef.max !== undefined && value > propDef.max) {
      errors.push({
        field: propName,
        message: `Number value for prop '${propName}' is too large. Maximum: ${propDef.max}`,
        value,
        expected: `<= ${propDef.max}`,
        code: 'NUMBER_TOO_LARGE'
      });
    }
  }

  // Array validations
  if (propDef.type === 'array' && Array.isArray(value)) {
    if (propDef.min !== undefined && value.length < propDef.min) {
      errors.push({
        field: propName,
        message: `Array value for prop '${propName}' has too few items. Minimum: ${propDef.min}`,
        value,
        expected: `length >= ${propDef.min}`,
        code: 'ARRAY_TOO_SHORT'
      });
    }

    if (propDef.max !== undefined && value.length > propDef.max) {
      errors.push({
        field: propName,
        message: `Array value for prop '${propName}' has too many items. Maximum: ${propDef.max}`,
        value,
        expected: `length <= ${propDef.max}`,
        code: 'ARRAY_TOO_LONG'
      });
    }

    // Validate array items if schema provided
    if (propDef.items) {
      value.forEach((item, index) => {
        const itemValidation = validatePropValue(item, propDef.items!, `${propName}[${index}]`);
        errors.push(...itemValidation.errors);
        warnings.push(...itemValidation.warnings);
      });
    }
  }

  // Object validations
  if (propDef.type === 'object' && typeof value === 'object' && value !== null) {
    if (propDef.properties) {
      const objectValidation = validateComponentProps(
        value as Record<string, unknown>,
        propDef.properties
      );
      errors.push(...objectValidation.errors.map(err => ({
        ...err,
        field: `${propName}.${err.field}`
      })));
      warnings.push(...objectValidation.warnings.map(warn => ({
        ...warn,
        field: `${propName}.${warn.field}`
      })));
    }
  }

  // Custom validation
  if (propDef.validation) {
    const customResult = propDef.validation(value);
    if (typeof customResult === 'string') {
      errors.push({
        field: propName,
        message: customResult,
        value,
        code: 'CUSTOM_VALIDATION_FAILED'
      });
    } else if (customResult === false) {
      errors.push({
        field: propName,
        message: `Custom validation failed for prop '${propName}'`,
        value,
        code: 'CUSTOM_VALIDATION_FAILED'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates the type of a value
 */
function validateType(value: unknown, expectedType: string): boolean {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'function':
      return typeof value === 'function';
    case 'node':
      // For JSX nodes - simplified check
      return value === null || value === undefined || 
             typeof value === 'string' || typeof value === 'number' ||
             typeof value === 'boolean' || Array.isArray(value) ||
             (typeof value === 'object' && value !== null);
    case 'element':
      // For JSX elements - simplified check
      return typeof value === 'object' && value !== null;
    default:
      return false;
  }
}

/**
 * Converts component prop schema to JSON schema
 */
export function propSchemaToJsonSchema(propSchema: ComponentPropSchema): JSONSchema {
  const properties: Record<string, JSONSchema> = {};
  const required: string[] = [];

  for (const [propName, propDef] of Object.entries(propSchema)) {
    if (propDef.required) {
      required.push(propName);
    }

    const jsonSchemaProp: JSONSchema = {
      type: mapPropTypeToJsonSchemaType(propDef.type),
      description: propDef.description
    };

    if (propDef.default !== undefined) {
      jsonSchemaProp.default = propDef.default;
    }

    if (propDef.enum) {
      jsonSchemaProp.enum = propDef.enum;
    }

    if (propDef.pattern) {
      jsonSchemaProp.pattern = propDef.pattern;
    }

    if (propDef.min !== undefined) {
      jsonSchemaProp.minimum = propDef.min;
    }

    if (propDef.max !== undefined) {
      jsonSchemaProp.maximum = propDef.max;
    }

    if (propDef.minLength !== undefined) {
      jsonSchemaProp.minLength = propDef.minLength;
    }

    if (propDef.maxLength !== undefined) {
      jsonSchemaProp.maxLength = propDef.maxLength;
    }

    if (propDef.items) {
      jsonSchemaProp.items = propSchemaToJsonSchema({ item: propDef.items }).properties!.item;
    }

    if (propDef.properties) {
      const nestedSchema = propSchemaToJsonSchema(propDef.properties);
      jsonSchemaProp.properties = nestedSchema.properties;
      jsonSchemaProp.required = nestedSchema.required;
    }

    properties[propName] = jsonSchemaProp;
  }

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
    additionalProperties: false
  };
}

/**
 * Maps component prop types to JSON schema types
 */
function mapPropTypeToJsonSchemaType(propType: string): string | string[] {
  switch (propType) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'array':
    case 'object':
      return propType;
    case 'function':
      return 'object'; // Functions can't be serialized in JSON
    case 'node':
    case 'element':
      return ['string', 'number', 'boolean', 'array', 'object', 'null'];
    default:
      return 'object';
  }
}

/**
 * Validates a component registry entry
 */
export function validateRegistryEntry(
  name: string,
  entry: ComponentRegistryEntry
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate component name
  if (!name || typeof name !== 'string') {
    errors.push({
      field: 'name',
      message: 'Component name must be a non-empty string',
      value: name,
      code: 'INVALID_COMPONENT_NAME'
    });
  } else if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    errors.push({
      field: 'name',
      message: 'Component name must start with uppercase letter and contain only alphanumeric characters',
      value: name,
      code: 'INVALID_COMPONENT_NAME_FORMAT'
    });
  }

  // Validate component function
  if (typeof entry.component !== 'function') {
    errors.push({
      field: 'component',
      message: 'Component must be a function',
      value: typeof entry.component,
      expected: 'function',
      code: 'INVALID_COMPONENT_TYPE'
    });
  }

  // Validate metadata
  if (!entry.metadata) {
    errors.push({
      field: 'metadata',
      message: 'Component metadata is required',
      code: 'MISSING_METADATA'
    });
  } else {
    if (!entry.metadata.name || typeof entry.metadata.name !== 'string') {
      errors.push({
        field: 'metadata.name',
        message: 'Component metadata name is required and must be a string',
        code: 'INVALID_METADATA_NAME'
      });
    }

    if (!entry.metadata.description || typeof entry.metadata.description !== 'string') {
      errors.push({
        field: 'metadata.description',
        message: 'Component metadata description is required and must be a string',
        code: 'INVALID_METADATA_DESCRIPTION'
      });
    }

    if (!entry.metadata.version || typeof entry.metadata.version !== 'string') {
      errors.push({
        field: 'metadata.version',
        message: 'Component metadata version is required and must be a string',
        code: 'INVALID_METADATA_VERSION'
      });
    }
  }

  // Validate prop schema
  if (!entry.propSchema || typeof entry.propSchema !== 'object') {
    errors.push({
      field: 'propSchema',
      message: 'Component prop schema is required and must be an object',
      code: 'INVALID_PROP_SCHEMA'
    });
  }

  // Validate JSON schema
  if (!entry.jsonSchema || typeof entry.jsonSchema !== 'object') {
    errors.push({
      field: 'jsonSchema',
      message: 'Component JSON schema is required and must be an object',
      code: 'INVALID_JSON_SCHEMA'
    });
  }

  // Validate dependencies
  if (!Array.isArray(entry.dependencies)) {
    errors.push({
      field: 'dependencies',
      message: 'Component dependencies must be an array',
      value: typeof entry.dependencies,
      expected: 'array',
      code: 'INVALID_DEPENDENCIES'
    });
  } else {
    entry.dependencies.forEach((dep, index) => {
      if (typeof dep !== 'string') {
        errors.push({
          field: `dependencies[${index}]`,
          message: 'Dependency must be a string',
          value: typeof dep,
          expected: 'string',
          code: 'INVALID_DEPENDENCY_TYPE'
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}