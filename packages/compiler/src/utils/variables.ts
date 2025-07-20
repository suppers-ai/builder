/**
 * Variable substitution system for the compiler
 * Handles ${{VARIABLE_NAME}} pattern matching and replacement
 */

import type { Variables } from "../types/mod.ts";

/**
 * Regular expression to match ${{VARIABLE_NAME}} patterns
 */
const VARIABLE_PATTERN = /\$\{\{([A-Z_][A-Z0-9_]*)\}\}/g;

/**
 * Error thrown when a variable reference is not found
 */
export class VariableNotFoundError extends Error {
  constructor(variableName: string) {
    super(`Variable '${variableName}' not found in variables configuration`);
    this.name = "VariableNotFoundError";
  }
}

/**
 * Resolves a single variable reference
 */
export function resolveVariable(
  variableName: string,
  variables: Variables,
  environmentVariables?: Record<string, string>,
): string {
  // First check the provided variables
  if (variables[variableName] !== undefined) {
    return variables[variableName];
  }

  // Then check environment variables as fallback
  if (environmentVariables && environmentVariables[variableName] !== undefined) {
    return environmentVariables[variableName];
  }

  // Check Deno environment variables as final fallback
  const envValue = Deno.env.get(variableName);
  if (envValue !== undefined) {
    return envValue;
  }

  throw new VariableNotFoundError(variableName);
}

/**
 * Substitutes variables in a string value
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
      // If variable is not found, keep the original pattern
      console.warn(
        `Warning: ${
          error instanceof Error ? error.message : String(error)
        }, keeping original pattern: ${match}`,
      );
      return match;
    }
  });
}

/**
 * Recursively substitutes variables in any object value
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
    return obj.map((item) => substituteVariables(item, variables, environmentVariables));
  }

  if (obj && typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = substituteVariables(value, variables, environmentVariables);
    }
    return result;
  }

  return obj;
}

/**
 * Validates that all variable references in an object can be resolved
 */
export function validateVariableReferences(
  obj: any,
  variables: Variables,
  environmentVariables?: Record<string, string>,
): { valid: boolean; missingVariables: string[] } {
  const missingVariables = new Set<string>();

  function checkValue(value: any): void {
    if (typeof value === "string") {
      let match;
      const regex = new RegExp(VARIABLE_PATTERN);
      while ((match = regex.exec(value)) !== null) {
        const variableName = match[1];
        try {
          resolveVariable(variableName, variables, environmentVariables);
        } catch (error) {
          if (error instanceof VariableNotFoundError) {
            missingVariables.add(variableName);
          }
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach(checkValue);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(checkValue);
    }
  }

  checkValue(obj);

  return {
    valid: missingVariables.size === 0,
    missingVariables: Array.from(missingVariables),
  };
}

/**
 * Extracts all variable names referenced in an object
 */
export function extractVariableNames(obj: any): string[] {
  const variables = new Set<string>();

  function checkValue(value: any): void {
    if (typeof value === "string") {
      let match;
      const regex = new RegExp(VARIABLE_PATTERN);
      while ((match = regex.exec(value)) !== null) {
        variables.add(match[1]);
      }
    } else if (Array.isArray(value)) {
      value.forEach(checkValue);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(checkValue);
    }
  }

  checkValue(obj);
  return Array.from(variables);
}

/**
 * Utility to get environment variables as a record
 */
export function getEnvironmentVariables(): Record<string, string> {
  const env: Record<string, string> = {};

  // In Deno, we can't directly enumerate all environment variables
  // So we'll return an empty object and rely on individual lookups
  // This is a security feature in Deno
  return env;
}
