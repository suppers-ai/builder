// JSON schema validation system with detailed error reporting

import { JSONSchema, schemas } from './schemas.ts';
import { ValidationSeverity } from './enums.ts';
import type { CompilationError, ErrorLocation } from './types.ts';

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Validation error interface
export interface ValidationError {
  message: string;
  path: string;
  value?: unknown;
  severity: ValidationSeverity;
  code: string;
  suggestions?: string[];
}

// Validation context for tracking path and providing better errors
interface ValidationContext {
  path: string[];
  rootValue: unknown;
  strict?: boolean;
}

// Main validator class
export class JSONValidator {
  private schemas: Map<string, JSONSchema> = new Map();

  constructor() {
    // Register built-in schemas
    const schemaEntries = Object.keys(schemas) as Array<keyof typeof schemas>;
    schemaEntries.forEach((name) => {
      this.registerSchema(name, schemas[name]);
    });
  }

  // Register a new schema
  registerSchema(name: string, schema: JSONSchema): void {
    this.schemas.set(name, schema);
  }

  // Get a registered schema
  getSchema(name: string): JSONSchema | undefined {
    return this.schemas.get(name);
  }

  // Validate data against a schema
  validate(data: unknown, schema: JSONSchema | string, strict = true): ValidationResult {
    const resolvedSchema = typeof schema === 'string' ? this.getSchema(schema) : schema;
    
    if (!resolvedSchema) {
      return {
        valid: false,
        errors: [{
          message: `Schema not found: ${schema}`,
          path: '',
          severity: ValidationSeverity.ERROR,
          code: 'SCHEMA_NOT_FOUND',
        }],
        warnings: [],
      };
    }

    const context: ValidationContext = {
      path: [],
      rootValue: data,
      strict,
    };

    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    this.validateValue(data, resolvedSchema, context, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Validate a specific value against a schema
  private validateValue(
    value: unknown,
    schema: JSONSchema,
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // Handle schema references
    if (schema.$ref) {
      const refSchema = this.resolveReference(schema.$ref, context);
      if (refSchema) {
        this.validateValue(value, refSchema, context, errors, warnings);
      } else {
        errors.push({
          message: `Cannot resolve schema reference: ${schema.$ref}`,
          path: this.getPath(context),
          value,
          severity: ValidationSeverity.ERROR,
          code: 'INVALID_REFERENCE',
        });
      }
      return;
    }

    // Handle conditional schemas
    if (schema.if) {
      const conditionResult = this.testCondition(value, schema.if, context);
      const targetSchema = conditionResult ? schema.then : schema.else;
      if (targetSchema) {
        this.validateValue(value, targetSchema, context, errors, warnings);
      }
    }

    // Handle oneOf, anyOf, allOf
    if (schema.oneOf) {
      this.validateOneOf(value, schema.oneOf, context, errors, warnings);
    } else if (schema.anyOf) {
      this.validateAnyOf(value, schema.anyOf, context, errors, warnings);
    } else if (schema.allOf) {
      this.validateAllOf(value, schema.allOf, context, errors, warnings);
    }

    // Handle not
    if (schema.not) {
      const notResult = this.testCondition(value, schema.not, context);
      if (notResult) {
        errors.push({
          message: 'Value matches forbidden schema',
          path: this.getPath(context),
          value,
          severity: ValidationSeverity.ERROR,
          code: 'FORBIDDEN_VALUE',
        });
      }
    }

    // Handle const
    if (schema.const !== undefined) {
      if (!this.deepEqual(value, schema.const)) {
        errors.push({
          message: `Value must be exactly: ${JSON.stringify(schema.const)}`,
          path: this.getPath(context),
          value,
          severity: ValidationSeverity.ERROR,
          code: 'CONST_VIOLATION',
        });
      }
    }

    // Handle enum
    if (schema.enum) {
      if (!schema.enum.some(enumValue => this.deepEqual(value, enumValue))) {
        errors.push({
          message: `Value must be one of: ${schema.enum.map(v => JSON.stringify(v)).join(', ')}`,
          path: this.getPath(context),
          value,
          severity: ValidationSeverity.ERROR,
          code: 'ENUM_VIOLATION',
          suggestions: schema.enum.map(v => JSON.stringify(v)),
        });
      }
    }

    // Type validation
    if (schema.type) {
      this.validateType(value, schema.type, context, errors, warnings);
    }

    // Type-specific validations
    if (typeof value === 'string') {
      this.validateString(value, schema, context, errors, warnings);
    } else if (typeof value === 'number') {
      this.validateNumber(value, schema, context, errors, warnings);
    } else if (Array.isArray(value)) {
      this.validateArray(value, schema, context, errors, warnings);
    } else if (value !== null && typeof value === 'object') {
      this.validateObject(value as Record<string, unknown>, schema, context, errors, warnings);
    }
  }

  // Validate type
  private validateType(
    value: unknown,
    type: string | string[],
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    const types = Array.isArray(type) ? type : [type];
    const actualType = this.getType(value);

    if (types.indexOf(actualType) === -1) {
      errors.push({
        message: `Expected type ${types.join(' or ')}, got ${actualType}`,
        path: this.getPath(context),
        value,
        severity: ValidationSeverity.ERROR,
        code: 'TYPE_MISMATCH',
        suggestions: types,
      });
    }
  }

  // Validate string
  private validateString(
    value: string,
    schema: JSONSchema,
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({
        message: `String must be at least ${schema.minLength} characters long`,
        path: this.getPath(context),
        value,
        severity: ValidationSeverity.ERROR,
        code: 'MIN_LENGTH_VIOLATION',
      });
    }

    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push({
        message: `String must be at most ${schema.maxLength} characters long`,
        path: this.getPath(context),
        value,
        severity: ValidationSeverity.ERROR,
        code: 'MAX_LENGTH_VIOLATION',
      });
    }

    if (schema.pattern) {
      try {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(value)) {
          errors.push({
            message: `String does not match pattern: ${schema.pattern}`,
            path: this.getPath(context),
            value,
            severity: ValidationSeverity.ERROR,
            code: 'PATTERN_VIOLATION',
          });
        }
      } catch (e) {
        errors.push({
          message: `Invalid regex pattern: ${schema.pattern}`,
          path: this.getPath(context),
          value,
          severity: ValidationSeverity.ERROR,
          code: 'INVALID_PATTERN',
        });
      }
    }
  }

  // Validate number
  private validateNumber(
    value: number,
    schema: JSONSchema,
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({
        message: `Number must be at least ${schema.minimum}`,
        path: this.getPath(context),
        value,
        severity: ValidationSeverity.ERROR,
        code: 'MIN_VALUE_VIOLATION',
      });
    }

    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({
        message: `Number must be at most ${schema.maximum}`,
        path: this.getPath(context),
        value,
        severity: ValidationSeverity.ERROR,
        code: 'MAX_VALUE_VIOLATION',
      });
    }
  }

  // Validate array
  private validateArray(
    value: unknown[],
    schema: JSONSchema,
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push({
        message: `Array must have at least ${schema.minItems} items`,
        path: this.getPath(context),
        value,
        severity: ValidationSeverity.ERROR,
        code: 'MIN_ITEMS_VIOLATION',
      });
    }

    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push({
        message: `Array must have at most ${schema.maxItems} items`,
        path: this.getPath(context),
        value,
        severity: ValidationSeverity.ERROR,
        code: 'MAX_ITEMS_VIOLATION',
      });
    }

    // Validate items
    if (schema.items) {
      value.forEach((item, index) => {
        const itemContext = { ...context, path: [...context.path, index.toString()] };
        this.validateValue(item, schema.items!, itemContext, errors, warnings);
      });
    }
  }

  // Validate object
  private validateObject(
    value: Record<string, unknown>,
    schema: JSONSchema,
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // Check required properties
    if (schema.required) {
      for (const requiredProp of schema.required) {
        if (!(requiredProp in value)) {
          errors.push({
            message: `Missing required property: ${requiredProp}`,
            path: this.getPath(context),
            value,
            severity: ValidationSeverity.ERROR,
            code: 'MISSING_REQUIRED_PROPERTY',
            suggestions: [requiredProp],
          });
        }
      }
    }

    // Validate properties
    if (schema.properties) {
      const propNames = Object.keys(schema.properties);
      for (const propName of propNames) {
        if (propName in value) {
          const propContext = { ...context, path: [...context.path, propName] };
          this.validateValue(value[propName], schema.properties[propName], propContext, errors, warnings);
        }
      }
    }

    // Check additional properties
    if (schema.additionalProperties === false) {
      const allowedProps = new Set(Object.keys(schema.properties || {}));
      for (const propName of Object.keys(value)) {
        if (!allowedProps.has(propName)) {
          errors.push({
            message: `Additional property not allowed: ${propName}`,
            path: this.getPath(context),
            value: value[propName],
            severity: ValidationSeverity.ERROR,
            code: 'ADDITIONAL_PROPERTY_NOT_ALLOWED',
          });
        }
      }
    } else if (typeof schema.additionalProperties === 'object') {
      const allowedProps = new Set(Object.keys(schema.properties || {}));
      const valueKeys = Object.keys(value);
      for (const propName of valueKeys) {
        if (!allowedProps.has(propName)) {
          const propContext = { ...context, path: [...context.path, propName] };
          this.validateValue(value[propName], schema.additionalProperties, propContext, errors, warnings);
        }
      }
    }
  }

  // Validate oneOf
  private validateOneOf(
    value: unknown,
    schemas: JSONSchema[],
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    let validCount = 0;
    const allErrors: ValidationError[] = [];

    for (const subSchema of schemas) {
      const subErrors: ValidationError[] = [];
      const subWarnings: ValidationError[] = [];
      this.validateValue(value, subSchema, context, subErrors, subWarnings);
      
      if (subErrors.length === 0) {
        validCount++;
      } else {
        allErrors.push(...subErrors);
      }
    }

    if (validCount === 0) {
      errors.push({
        message: 'Value does not match any of the allowed schemas',
        path: this.getPath(context),
        value,
        severity: ValidationSeverity.ERROR,
        code: 'ONE_OF_VIOLATION',
      });
      errors.push(...allErrors);
    } else if (validCount > 1) {
      errors.push({
        message: 'Value matches multiple schemas (should match exactly one)',
        path: this.getPath(context),
        value,
        severity: ValidationSeverity.ERROR,
        code: 'ONE_OF_MULTIPLE_MATCHES',
      });
    }
  }

  // Validate anyOf
  private validateAnyOf(
    value: unknown,
    schemas: JSONSchema[],
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    let hasValidSchema = false;
    const allErrors: ValidationError[] = [];

    for (const subSchema of schemas) {
      const subErrors: ValidationError[] = [];
      const subWarnings: ValidationError[] = [];
      this.validateValue(value, subSchema, context, subErrors, subWarnings);
      
      if (subErrors.length === 0) {
        hasValidSchema = true;
        break;
      } else {
        allErrors.push(...subErrors);
      }
    }

    if (!hasValidSchema) {
      errors.push({
        message: 'Value does not match any of the allowed schemas',
        path: this.getPath(context),
        value,
        severity: ValidationSeverity.ERROR,
        code: 'ANY_OF_VIOLATION',
      });
      errors.push(...allErrors);
    }
  }

  // Validate allOf
  private validateAllOf(
    value: unknown,
    schemas: JSONSchema[],
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    for (const subSchema of schemas) {
      this.validateValue(value, subSchema, context, errors, warnings);
    }
  }

  // Test condition for if/then/else
  private testCondition(value: unknown, schema: JSONSchema, context: ValidationContext): boolean {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    this.validateValue(value, schema, context, errors, warnings);
    return errors.length === 0;
  }

  // Resolve schema reference
  private resolveReference(ref: string, context: ValidationContext): JSONSchema | null {
    // Handle internal references like #/definitions/componentDefinition
    if (ref.startsWith('#/definitions/')) {
      const definitionName = ref.replace('#/definitions/', '');
      return this.getSchema(definitionName) || null;
    }
    
    // Handle schema name references
    return this.getSchema(ref) || null;
  }

  // Get the type of a value
  private getType(value: unknown): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  // Get the current path as a string
  private getPath(context: ValidationContext): string {
    return context.path.length > 0 ? context.path.join('.') : '';
  }

  // Deep equality check
  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    
    if (a === null || b === null) return a === b;
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      
      if (Array.isArray(a)) {
        const arrA = a as unknown[];
        const arrB = b as unknown[];
        if (arrA.length !== arrB.length) return false;
        return arrA.every((item, index) => this.deepEqual(item, arrB[index]));
      }
      
      const objA = a as Record<string, unknown>;
      const objB = b as Record<string, unknown>;
      const keysA = Object.keys(objA);
      const keysB = Object.keys(objB);
      
      if (keysA.length !== keysB.length) return false;
      for (const key of keysA) {
        if (!this.deepEqual(objA[key], objB[key])) {
          return false;
        }
      }
      return true;
    }
    
    return false;
  }
}

// Create a default validator instance
export const validator = new JSONValidator();

// Convenience functions
export function validateAppConfig(config: unknown): ValidationResult {
  return validator.validate(config, 'appConfig');
}

export function validateComponentDefinition(component: unknown): ValidationResult {
  return validator.validate(component, 'componentDefinition');
}

export function validateRouteDefinition(route: unknown): ValidationResult {
  return validator.validate(route, 'routeDefinition');
}

export function validateApiDefinition(api: unknown): ValidationResult {
  return validator.validate(api, 'apiDefinition');
}

// Convert validation errors to compilation errors
export function toCompilationErrors(validationResult: ValidationResult): CompilationError[] {
  return validationResult.errors.map(error => ({
    type: 'validation' as const,
    message: error.message,
    details: error.path ? `At path: ${error.path}` : undefined,
    location: error.path ? {
      path: error.path,
    } : undefined,
    suggestions: error.suggestions,
  }));
}