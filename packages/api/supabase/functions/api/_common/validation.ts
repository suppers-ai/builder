/**
 * Validation utilities for API handlers
 */

import { ValidationError } from './errors.ts';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'uuid';
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
  transform?: (value: unknown) => unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
  data: Record<string, unknown>;
}

/**
 * Validate data against rules
 */
export function validate(
  data: unknown,
  rules: ValidationRule[]
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];
  const validatedData: Record<string, unknown> = {};
  const input = data as Record<string, unknown> || {};

  for (const rule of rules) {
    let value = input[rule.field];

    // Apply transformation if defined
    if (rule.transform) {
      value = rule.transform(value);
    }

    // Check required
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({ field: rule.field, message: `${rule.field} is required` });
      continue;
    }

    // Skip validation if not required and empty
    if (!rule.required && (value === undefined || value === null)) {
      continue;
    }

    // Type validation
    if (rule.type) {
      const typeValid = validateType(value, rule.type);
      if (!typeValid) {
        errors.push({ field: rule.field, message: `${rule.field} must be a valid ${rule.type}` });
        continue;
      }
    }

    // Min/Max validation
    if (rule.min !== undefined) {
      const minValid = validateMin(value, rule.min, rule.type);
      if (!minValid) {
        const unit = rule.type === 'string' || rule.type === 'array' ? 'length' : 'value';
        errors.push({ field: rule.field, message: `${rule.field} ${unit} must be at least ${rule.min}` });
      }
    }

    if (rule.max !== undefined) {
      const maxValid = validateMax(value, rule.max, rule.type);
      if (!maxValid) {
        const unit = rule.type === 'string' || rule.type === 'array' ? 'length' : 'value';
        errors.push({ field: rule.field, message: `${rule.field} ${unit} must be at most ${rule.max}` });
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        errors.push({ field: rule.field, message: `${rule.field} format is invalid` });
      }
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (customResult !== true) {
        const message = typeof customResult === 'string' ? customResult : `${rule.field} validation failed`;
        errors.push({ field: rule.field, message });
      }
    }

    // Add to validated data if no errors for this field
    if (!errors.find(e => e.field === rule.field)) {
      validatedData[rule.field] = value;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: validatedData,
  };
}

/**
 * Validate type
 */
function validateType(value: unknown, type: ValidationRule['type']): boolean {
  switch (type) {
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
    case 'email':
      return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'url':
      try {
        new URL(value as string);
        return true;
      } catch {
        return false;
      }
    case 'uuid':
      return typeof value === 'string' && 
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    default:
      return true;
  }
}

/**
 * Validate minimum value/length
 */
function validateMin(value: unknown, min: number, type?: ValidationRule['type']): boolean {
  if (type === 'string' && typeof value === 'string') {
    return value.length >= min;
  }
  if (type === 'array' && Array.isArray(value)) {
    return value.length >= min;
  }
  if (typeof value === 'number') {
    return value >= min;
  }
  return true;
}

/**
 * Validate maximum value/length
 */
function validateMax(value: unknown, max: number, type?: ValidationRule['type']): boolean {
  if (type === 'string' && typeof value === 'string') {
    return value.length <= max;
  }
  if (type === 'array' && Array.isArray(value)) {
    return value.length <= max;
  }
  if (typeof value === 'number') {
    return value <= max;
  }
  return true;
}

/**
 * Throw validation error if validation fails
 */
export function validateOrThrow(data: unknown, rules: ValidationRule[]): Record<string, unknown> {
  const result = validate(data, rules);
  
  if (!result.valid) {
    const message = result.errors.map(e => e.message).join(', ');
    throw new ValidationError(message, result.errors);
  }

  return result.data;
}

/**
 * Common validation rules
 */
export const commonRules = {
  email: (field = 'email'): ValidationRule => ({
    field,
    required: true,
    type: 'email',
  }),

  password: (field = 'password'): ValidationRule => ({
    field,
    required: true,
    type: 'string',
    min: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    custom: (value) => {
      const password = value as string;
      if (!/[a-z]/.test(password)) return 'Password must contain lowercase letter';
      if (!/[A-Z]/.test(password)) return 'Password must contain uppercase letter';
      if (!/\d/.test(password)) return 'Password must contain number';
      return true;
    },
  }),

  uuid: (field: string): ValidationRule => ({
    field,
    required: true,
    type: 'uuid',
  }),

  url: (field: string): ValidationRule => ({
    field,
    required: true,
    type: 'url',
  }),

  pagination: {
    page: (): ValidationRule => ({
      field: 'page',
      type: 'number',
      min: 1,
      transform: (value) => {
        const num = parseInt(value as string, 10);
        return isNaN(num) ? 1 : num;
      },
    }),
    pageSize: (): ValidationRule => ({
      field: 'pageSize',
      type: 'number',
      min: 1,
      max: 100,
      transform: (value) => {
        const num = parseInt(value as string, 10);
        return isNaN(num) ? 10 : num;
      },
    }),
  },
};

/**
 * Sanitize input data
 */
export function sanitize(data: unknown): unknown {
  if (typeof data === 'string') {
    // Remove potential XSS
    return data
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitize);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitize(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Parse and validate JSON body
 */
export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    const text = await request.text();
    if (!text) {
      throw new ValidationError('Request body is empty');
    }
    
    const data = JSON.parse(text);
    return data as T;
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError('Invalid JSON in request body');
  }
}

/**
 * Parse and validate query parameters
 */
export function parseQueryParams(
  request: Request,
  rules?: ValidationRule[]
): Record<string, unknown> {
  const url = new URL(request.url);
  const params: Record<string, unknown> = {};
  
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  if (rules) {
    const result = validateOrThrow(params, rules);
    return result;
  }

  return params;
}