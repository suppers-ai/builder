// JSON schema definitions for configuration validation

import { HttpMethod, LogLevel, ComponentCategory } from './enums.ts';

// JSON Schema type definition
export interface JSONSchema {
  type?: string | string[];
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  enum?: unknown[];
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  additionalProperties?: boolean | JSONSchema;
  oneOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  allOf?: JSONSchema[];
  not?: JSONSchema;
  if?: JSONSchema;
  then?: JSONSchema;
  else?: JSONSchema;
  const?: unknown;
  default?: unknown;
  description?: string;
  examples?: unknown[];
  title?: string;
  $ref?: string;
}

// App metadata schema
export const appMetadataSchema: JSONSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      pattern: '^[a-z][a-z0-9-]*$',
      minLength: 1,
      maxLength: 50,
      description: 'Application name (lowercase, alphanumeric with hyphens)',
    },
    version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9-]+)?$',
      description: 'Semantic version (e.g., 1.0.0 or 1.0.0-beta)',
    },
    description: {
      type: 'string',
      maxLength: 200,
      description: 'Brief description of the application',
    },
    author: {
      type: 'string',
      maxLength: 100,
      description: 'Application author',
    },
    license: {
      type: 'string',
      maxLength: 50,
      description: 'License identifier (e.g., MIT, Apache-2.0)',
    },
  },
  required: ['name', 'version'],
  additionalProperties: false,
};

// Theme configuration schema
export const themeConfigSchema: JSONSchema = {
  type: 'object',
  properties: {
    primaryColor: {
      type: 'string',
      pattern: '^#[0-9a-fA-F]{6}$|^rgb\\(\\d+,\\s*\\d+,\\s*\\d+\\)$|^hsl\\(\\d+,\\s*\\d+%,\\s*\\d+%\\)$',
      description: 'Primary color (hex, rgb, or hsl)',
    },
    secondaryColor: {
      type: 'string',
      pattern: '^#[0-9a-fA-F]{6}$|^rgb\\(\\d+,\\s*\\d+,\\s*\\d+\\)$|^hsl\\(\\d+,\\s*\\d+%,\\s*\\d+%\\)$',
      description: 'Secondary color (hex, rgb, or hsl)',
    },
    fontFamily: {
      type: 'string',
      maxLength: 200,
      description: 'Font family CSS value',
    },
    spacing: {
      type: 'object',
      additionalProperties: {
        type: 'string',
        pattern: '^\\d+(\\.\\d+)?(px|rem|em|%|vh|vw)$',
      },
      description: 'Spacing scale with CSS units',
    },
    breakpoints: {
      type: 'object',
      additionalProperties: {
        type: 'string',
        pattern: '^\\d+px$',
      },
      description: 'Responsive breakpoints in pixels',
    },
    customProperties: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      description: 'Custom CSS properties',
    },
  },
  additionalProperties: false,
};

// Component condition schema
export const componentConditionSchema: JSONSchema = {
  type: 'object',
  properties: {
    field: {
      type: 'string',
      minLength: 1,
      description: 'Field name to evaluate',
    },
    operator: {
      type: 'string',
      enum: ['equals', 'not_equals', 'contains', 'exists'],
      description: 'Comparison operator',
    },
    value: {
      description: 'Value to compare against (optional for exists operator)',
    },
  },
  required: ['field', 'operator'],
  additionalProperties: false,
};

// Component definition schema
export const componentDefinitionSchema: JSONSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      pattern: '^[a-zA-Z][a-zA-Z0-9_-]*$',
      minLength: 1,
      maxLength: 50,
      description: 'Unique component identifier',
    },
    type: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      description: 'Component type name',
    },
    props: {
      type: 'object',
      description: 'Component properties',
    },
    children: {
      type: 'array',
      items: { $ref: '#/definitions/componentDefinition' },
      description: 'Child components',
    },
    conditions: {
      type: 'array',
      items: componentConditionSchema,
      description: 'Conditional rendering rules',
    },
  },
  required: ['id', 'type', 'props'],
  additionalProperties: false,
};

// Route metadata schema
export const routeMetaSchema: JSONSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      maxLength: 100,
      description: 'Page title',
    },
    description: {
      type: 'string',
      maxLength: 200,
      description: 'Page description for SEO',
    },
    keywords: {
      type: 'array',
      items: {
        type: 'string',
        maxLength: 50,
      },
      maxItems: 20,
      description: 'SEO keywords',
    },
    requiresAuth: {
      type: 'boolean',
      description: 'Whether route requires authentication',
    },
  },
  additionalProperties: false,
};

// Route definition schema
export const routeDefinitionSchema: JSONSchema = {
  type: 'object',
  properties: {
    path: {
      type: 'string',
      pattern: '^/[a-zA-Z0-9/_:-]*$',
      minLength: 1,
      description: 'Route path pattern',
    },
    component: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      description: 'Component name to render',
    },
    layout: {
      type: 'string',
      maxLength: 50,
      description: 'Layout component name',
    },
    middleware: {
      type: 'array',
      items: {
        type: 'string',
        maxLength: 50,
      },
      maxItems: 10,
      description: 'Middleware function names',
    },
    props: {
      type: 'object',
      description: 'Static props for the route component',
    },
    meta: routeMetaSchema,
  },
  required: ['path', 'component'],
  additionalProperties: false,
};

// Field validation schema
export const fieldValidationSchema: JSONSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['string', 'number', 'boolean', 'array', 'object'],
      description: 'Field data type',
    },
    required: {
      type: 'boolean',
      description: 'Whether field is required',
    },
    min: {
      type: 'number',
      description: 'Minimum value/length',
    },
    max: {
      type: 'number',
      description: 'Maximum value/length',
    },
    pattern: {
      type: 'string',
      description: 'Regular expression pattern',
    },
    enum: {
      type: 'array',
      description: 'Allowed values',
    },
    custom: {
      type: 'string',
      maxLength: 50,
      description: 'Custom validation function name',
    },
  },
  required: ['type'],
  additionalProperties: false,
};

// Validation schema
export const validationSchema: JSONSchema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      additionalProperties: fieldValidationSchema,
      description: 'Request body validation',
    },
    query: {
      type: 'object',
      additionalProperties: fieldValidationSchema,
      description: 'Query parameters validation',
    },
    params: {
      type: 'object',
      additionalProperties: fieldValidationSchema,
      description: 'URL parameters validation',
    },
    headers: {
      type: 'object',
      additionalProperties: fieldValidationSchema,
      description: 'Headers validation',
    },
  },
  additionalProperties: false,
};

// Auth configuration schema
export const authConfigSchema: JSONSchema = {
  type: 'object',
  properties: {
    required: {
      type: 'boolean',
      description: 'Whether authentication is required',
    },
    roles: {
      type: 'array',
      items: {
        type: 'string',
        maxLength: 50,
      },
      maxItems: 20,
      description: 'Required user roles',
    },
    permissions: {
      type: 'array',
      items: {
        type: 'string',
        maxLength: 50,
      },
      maxItems: 50,
      description: 'Required permissions',
    },
  },
  required: ['required'],
  additionalProperties: false,
};

// API endpoint schema
export const apiEndpointSchema: JSONSchema = {
  type: 'object',
  properties: {
    path: {
      type: 'string',
      pattern: '^/[a-zA-Z0-9/_:-]*$',
      minLength: 1,
      description: 'API endpoint path',
    },
    methods: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      },
      minItems: 1,
      maxItems: 7,
      description: 'Supported HTTP methods',
    },
    handler: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      description: 'Handler function name',
    },
    middleware: {
      type: 'array',
      items: {
        type: 'string',
        maxLength: 50,
      },
      maxItems: 10,
      description: 'Middleware function names',
    },
    validation: validationSchema,
    auth: authConfigSchema,
  },
  required: ['path', 'methods', 'handler'],
  additionalProperties: false,
};

// API definition schema
export const apiDefinitionSchema: JSONSchema = {
  type: 'object',
  properties: {
    endpoints: {
      type: 'array',
      items: apiEndpointSchema,
      minItems: 0,
      description: 'API endpoints',
    },
    middleware: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
          },
          config: {
            type: 'object',
          },
          order: {
            type: 'number',
            minimum: 0,
          },
        },
        required: ['name'],
        additionalProperties: false,
      },
      description: 'Global middleware',
    },
    auth: {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          enum: ['jwt', 'session', 'oauth', 'custom'],
        },
        config: {
          type: 'object',
        },
        routes: {
          type: 'object',
          properties: {
            login: { type: 'string' },
            logout: { type: 'string' },
            register: { type: 'string' },
          },
          additionalProperties: false,
        },
      },
      required: ['provider', 'config'],
      additionalProperties: false,
      description: 'Global authentication configuration',
    },
    cors: {
      type: 'object',
      properties: {
        origin: {
          oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } },
            { type: 'boolean' },
          ],
        },
        methods: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
          },
        },
        allowedHeaders: {
          type: 'array',
          items: { type: 'string' },
        },
        credentials: {
          type: 'boolean',
        },
      },
      required: ['origin'],
      additionalProperties: false,
      description: 'CORS configuration',
    },
  },
  required: ['endpoints'],
  additionalProperties: false,
};

// Build configuration schema
export const buildConfigSchema: JSONSchema = {
  type: 'object',
  properties: {
    target: {
      type: 'string',
      enum: ['development', 'production'],
      description: 'Build target environment',
    },
    minify: {
      type: 'boolean',
      description: 'Whether to minify output',
    },
    sourceMaps: {
      type: 'boolean',
      description: 'Whether to generate source maps',
    },
    outputDir: {
      type: 'string',
      pattern: '^[a-zA-Z0-9._/-]+$',
      description: 'Output directory path',
    },
    publicPath: {
      type: 'string',
      pattern: '^/[a-zA-Z0-9._/-]*$',
      description: 'Public path for assets',
    },
  },
  additionalProperties: false,
};

// Main app configuration schema
export const appConfigSchema: JSONSchema = {
  type: 'object',
  properties: {
    metadata: appMetadataSchema,
    components: {
      type: 'array',
      items: componentDefinitionSchema,
      description: 'Application components',
    },
    routes: {
      type: 'array',
      items: routeDefinitionSchema,
      minItems: 1,
      description: 'Application routes',
    },
    api: apiDefinitionSchema,
    theme: themeConfigSchema,
    build: buildConfigSchema,
  },
  required: ['metadata', 'components', 'routes', 'api'],
  additionalProperties: false,
  definitions: {
    componentDefinition: componentDefinitionSchema,
  },
};

// Schema registry for easy access
export const schemas = {
  appConfig: appConfigSchema,
  appMetadata: appMetadataSchema,
  themeConfig: themeConfigSchema,
  componentDefinition: componentDefinitionSchema,
  routeDefinition: routeDefinitionSchema,
  apiDefinition: apiDefinitionSchema,
  apiEndpoint: apiEndpointSchema,
  validation: validationSchema,
  fieldValidation: fieldValidationSchema,
  authConfig: authConfigSchema,
  buildConfig: buildConfigSchema,
} as const;