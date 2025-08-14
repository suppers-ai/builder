/**
 * Schema-to-documentation extractor
 * Converts Zod schemas into API documentation format
 */

import { z } from "zod";

export interface ApiProp {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: string;
  examples?: string[];
  deprecated?: boolean;
  since?: string;
}

export interface ExtractorOptions {
  includePrivate?: boolean;
  includeInherited?: boolean;
  flattenObjects?: boolean;
}

/**
 * Extract API props documentation from a Zod schema
 */
export function extractApiPropsFromSchema(
  schema: z.ZodSchema,
  options: ExtractorOptions = {},
): ApiProp[] {
  const props: ApiProp[] = [];

  function extractFromZodType(
    zodType: z.ZodTypeAny,
    propName: string,
    path: string[] = [],
  ): void {
    // Handle ZodObject
    if (zodType instanceof z.ZodObject) {
      const shape = zodType.shape;

      for (const [key, fieldSchema] of Object.entries(shape)) {
        extractFromZodType(fieldSchema as z.ZodTypeAny, key, [...path, propName]);
      }
      return;
    }

    // Handle ZodOptional and ZodDefault
    let innerType = zodType;
    let isOptional = false;
    let defaultValue: any = undefined;

    if (zodType instanceof z.ZodOptional) {
      isOptional = true;
      innerType = zodType._def.innerType;
    }

    if (zodType instanceof z.ZodDefault) {
      defaultValue = zodType._def.defaultValue();
      innerType = zodType._def.innerType;
    }

    // Handle ZodOptional wrapping ZodDefault
    if (innerType instanceof z.ZodOptional) {
      isOptional = true;
      innerType = innerType._def.innerType;
    }

    if (innerType instanceof z.ZodDefault) {
      defaultValue = innerType._def.defaultValue();
      innerType = innerType._def.innerType;
    }

    // Get type information
    const typeString = getZodTypeString(innerType);
    const description = zodType.description || innerType.description || "";

    // Extract metadata if available
    const metadata = (zodType as any)._def?.metadata || {};

    props.push({
      name: propName,
      type: typeString,
      description,
      required: !isOptional && defaultValue === undefined,
      default: defaultValue !== undefined ? JSON.stringify(defaultValue) : undefined,
      examples: metadata.examples,
      deprecated: metadata.deprecated,
      since: metadata.since,
    });
  }

  // Start extraction from the root schema
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;

    for (const [key, fieldSchema] of Object.entries(shape)) {
      extractFromZodType(fieldSchema as z.ZodTypeAny, key);
    }
  } else {
    // Handle non-object schemas
    extractFromZodType(schema, "value");
  }

  return props.filter((prop) => {
    // Filter out private props if not requested
    if (!options.includePrivate && prop.name.startsWith("_")) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Sort required props first, then alphabetically
    if (a.required && !b.required) return -1;
    if (!a.required && b.required) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Convert Zod type to TypeScript-like string representation
 */
function getZodTypeString(zodType: z.ZodTypeAny): string {
  // Handle ZodString
  if (zodType instanceof z.ZodString) {
    return "string";
  }

  // Handle ZodNumber
  if (zodType instanceof z.ZodNumber) {
    return "number";
  }

  // Handle ZodBoolean
  if (zodType instanceof z.ZodBoolean) {
    return "boolean";
  }

  // Handle ZodEnum
  if (zodType instanceof z.ZodEnum) {
    const values = zodType._def.values;
    return values.map((v: any) => `'${v}'`).join(" | ");
  }

  // Handle ZodLiteral
  if (zodType instanceof z.ZodLiteral) {
    const value = zodType._def.value;
    return typeof value === "string" ? `'${value}'` : String(value);
  }

  // Handle ZodUnion
  if (zodType instanceof z.ZodUnion) {
    const options = zodType._def.options;
    return options
      .map((option: z.ZodTypeAny) => getZodTypeString(option))
      .join(" | ");
  }

  // Handle ZodArray
  if (zodType instanceof z.ZodArray) {
    const elementType = getZodTypeString(zodType._def.type);
    return `${elementType}[]`;
  }

  // Handle ZodFunction
  if (zodType instanceof z.ZodFunction) {
    const args = zodType._def.args;
    const returns = zodType._def.returns;

    if (args instanceof z.ZodTuple && args._def.items.length > 0) {
      const argTypes = args._def.items.map((arg: z.ZodTypeAny) => getZodTypeString(arg));
      const returnType = getZodTypeString(returns);
      return `(${
        argTypes.map((t: string, i: number) => `arg${i}: ${t}`).join(", ")
      }) => ${returnType}`;
    }

    return "Function";
  }

  // Handle ZodObject
  if (zodType instanceof z.ZodObject) {
    const shape = zodType.shape;
    const entries = Object.entries(shape);

    if (entries.length === 0) {
      return "object";
    }

    const props = entries.map(([key, value]) => {
      const type = getZodTypeString(value as z.ZodTypeAny);
      const optional = (value as any)?.isOptional?.() ? "?" : "";
      return `${key}${optional}: ${type}`;
    });

    return `{ ${props.join("; ")} }`;
  }

  // Handle ZodAny
  if (zodType instanceof z.ZodAny) {
    return "any";
  }

  // Handle ZodUnknown
  if (zodType instanceof z.ZodUnknown) {
    return "unknown";
  }

  // Handle ZodVoid
  if (zodType instanceof z.ZodVoid) {
    return "void";
  }

  // Handle ZodNullable
  if (zodType instanceof z.ZodNullable) {
    const innerType = getZodTypeString(zodType._def.innerType);
    return `${innerType} | null`;
  }

  // Handle custom types (ComponentChildren, etc.)
  if ((zodType as any)._def?.typeName) {
    return (zodType as any)._def.typeName;
  }

  // Fallback
  return "unknown";
}

/**
 * Create a schema with enhanced documentation
 */
export function createDocumentedSchema<T extends z.ZodRawShape>(
  shape: T,
  options: {
    title?: string;
    description?: string;
    examples?: Record<string, any>[];
    since?: string;
  } = {},
): z.ZodObject<T> {
  const schema = z.object(shape);

  if (options.description) {
    schema.describe(options.description);
  }

  // Add metadata to the schema
  (schema as any)._def.metadata = {
    title: options.title,
    examples: options.examples,
    since: options.since,
  };

  return schema;
}

/**
 * Generate example usage from schema
 */
export function generateSchemaExamples(
  schema: z.ZodSchema,
  count: number = 3,
): Record<string, any>[] {
  const examples: Record<string, any>[] = [];

  // This is a simplified example generator
  // In a real implementation, you might want more sophisticated example generation

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;

    for (let i = 0; i < count; i++) {
      const example: Record<string, any> = {};

      for (const [key, fieldSchema] of Object.entries(shape)) {
        const fieldType = fieldSchema as z.ZodTypeAny;
        example[key] = generateExampleValue(fieldType, i);
      }

      examples.push(example);
    }
  }

  return examples;
}

/**
 * Generate example value for a specific Zod type
 */
function generateExampleValue(zodType: z.ZodTypeAny, index: number = 0): any {
  // Handle ZodOptional and ZodDefault
  let innerType = zodType;

  if (zodType instanceof z.ZodOptional) {
    // Sometimes return undefined for optional fields
    if (index % 3 === 2) return undefined;
    innerType = zodType._def.innerType;
  }

  if (zodType instanceof z.ZodDefault) {
    // Use default value occasionally
    if (index % 2 === 0) return zodType._def.defaultValue();
    innerType = zodType._def.innerType;
  }

  // Generate example values based on type
  if (innerType instanceof z.ZodString) {
    return `example-${index}`;
  }

  if (innerType instanceof z.ZodNumber) {
    return (index + 1) * 10;
  }

  if (innerType instanceof z.ZodBoolean) {
    return index % 2 === 0;
  }

  if (innerType instanceof z.ZodEnum) {
    const values = innerType._def.values;
    return values[index % values.length];
  }

  if (innerType instanceof z.ZodLiteral) {
    return innerType._def.value;
  }

  return undefined;
}
