/**
 * Variable Substitution Utilities
 * Common utilities for template variable substitution
 */

import type { Variables } from "../types/application.ts";

// Regular expression to match variable patterns like ${{VARIABLE_NAME}}
export const VARIABLE_PATTERN = /\$\{\{([^}]+)\}\}/g;

/**
 * Resolve a single variable name to its value
 */
export function resolveVariable(
  variableName: string,
  variables: Variables,
  environmentVariables?: Record<string, string>,
): string {
  const trimmedName = variableName.trim();
  
  // Check environment variables first
  if (environmentVariables && trimmedName in environmentVariables) {
    return environmentVariables[trimmedName];
  }
  
  // Check provided variables
  if (trimmedName in variables) {
    return variables[trimmedName];
  }
  
  throw new Error(`Variable "${trimmedName}" not found`);
}

/**
 * Substitute variables in a string using ${{VARIABLE_NAME}} pattern
 */
export function substituteVariablesInString(
  value: string,
  variables: Variables,
  environmentVariables?: Record<string, string>,
): string {
  return value.replace(VARIABLE_PATTERN, (match, variableName) => {
    try {
      return resolveVariable(variableName, variables, environmentVariables);
    } catch (error) {
      console.warn(`Warning: ${error.message}, keeping original pattern: ${match}`);
      return match;
    }
  });
}

/**
 * Recursively substitute variables in any object/array/primitive
 */
export function substituteVariables(
  obj: any,
  variables: Variables,
  environmentVariables?: Record<string, string>,
): any {
  if (typeof obj === "string") {
    return substituteVariablesInString(obj, variables, environmentVariables);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => substituteVariables(item, variables, environmentVariables));
  }
  
  if (obj !== null && typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = substituteVariables(value, variables, environmentVariables);
    }
    return result;
  }
  
  return obj;
}

/**
 * Validate that all variable references can be resolved
 */
export function validateVariableReferences(
  obj: any,
  variables: Variables,
  environmentVariables?: Record<string, string>,
): { valid: boolean; missingVariables: string[] } {
  const missingVariables = new Set<string>();
  
  function checkObject(value: any): void {
    if (typeof value === "string") {
      const matches = value.matchAll(VARIABLE_PATTERN);
      for (const match of matches) {
        const variableName = match[1].trim();
        try {
          resolveVariable(variableName, variables, environmentVariables);
        } catch {
          missingVariables.add(variableName);
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach(checkObject);
    } else if (value !== null && typeof value === "object") {
      Object.values(value).forEach(checkObject);
    }
  }
  
  checkObject(obj);
  
  return {
    valid: missingVariables.size === 0,
    missingVariables: Array.from(missingVariables),
  };
}

/**
 * Extract all variable names referenced in an object
 */
export function extractVariableNames(obj: any): string[] {
  const variables = new Set<string>();
  
  function extractFromValue(value: any): void {
    if (typeof value === "string") {
      const matches = value.matchAll(VARIABLE_PATTERN);
      for (const match of matches) {
        variables.add(match[1].trim());
      }
    } else if (Array.isArray(value)) {
      value.forEach(extractFromValue);
    } else if (value !== null && typeof value === "object") {
      Object.values(value).forEach(extractFromValue);
    }
  }
  
  extractFromValue(obj);
  return Array.from(variables);
}

/**
 * Get environment variables as a record
 */
export function getEnvironmentVariables(): Record<string, string> {
  const env: Record<string, string> = {};
  
  // In Deno, environment variables are available through Deno.env
  if (typeof Deno !== "undefined" && Deno.env) {
    for (const [key, value] of Object.entries(Deno.env.toObject())) {
      if (value !== undefined) {
        env[key] = value;
      }
    }
  }
  
  return env;
}

/**
 * Create a variables validation result
 */
export interface VariableValidationResult {
  valid: boolean;
  missingVariables: string[];
  errorMessage?: string;
}

/**
 * Validate variables configuration
 */
export function validateVariables(
  variables: Variables,
  requiredVariables?: string[],
): VariableValidationResult {
  if (!requiredVariables || requiredVariables.length === 0) {
    return { valid: true, missingVariables: [] };
  }
  
  const missingVariables = requiredVariables.filter(
    variable => !(variable in variables)
  );
  
  const valid = missingVariables.length === 0;
  
  return {
    valid,
    missingVariables,
    errorMessage: valid 
      ? undefined 
      : `Missing required variables: ${missingVariables.join(", ")}`,
  };
}