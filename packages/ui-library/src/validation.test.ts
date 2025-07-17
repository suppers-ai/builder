// Component validation tests

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { 
  validateComponentProps, 
  propSchemaToJsonSchema, 
  validateRegistryEntry 
} from './validation.ts';
import { ComponentCategory } from '@json-app-compiler/shared';
import type { 
  ComponentPropSchema, 
  ComponentPropDefinition,
  ComponentRegistryEntry 
} from './types.ts';

Deno.test('validateComponentProps - Basic Types', () => {
  const schema: ComponentPropSchema = {
    title: {
      type: 'string',
      required: true
    },
    count: {
      type: 'number',
      required: false,
      min: 0,
      max: 100
    },
    enabled: {
      type: 'boolean',
      required: false,
      default: true
    }
  };

  // Valid props
  let result = validateComponentProps({
    title: 'Test Title',
    count: 50,
    enabled: true
  }, schema);
  
  assert(result.valid);
  assertEquals(result.errors.length, 0);

  // Missing required prop
  result = validateComponentProps({
    count: 50
  }, schema);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].code, 'MISSING_REQUIRED_PROP');
  assertEquals(result.errors[0].field, 'title');

  // Invalid type
  result = validateComponentProps({
    title: 123, // Should be string
    count: 50
  }, schema);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].code, 'INVALID_TYPE');
});

Deno.test('validateComponentProps - String Validation', () => {
  const schema: ComponentPropSchema = {
    name: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 10,
      pattern: '^[A-Za-z]+$'
    },
    category: {
      type: 'string',
      required: true,
      enum: ['primary', 'secondary', 'danger']
    }
  };

  // Valid string
  let result = validateComponentProps({
    name: 'Button',
    category: 'primary'
  }, schema);
  
  assert(result.valid);
  assertEquals(result.errors.length, 0);

  // String too short
  result = validateComponentProps({
    name: 'A',
    category: 'primary'
  }, schema);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].code, 'STRING_TOO_SHORT');

  // String too long
  result = validateComponentProps({
    name: 'VeryLongButtonName',
    category: 'primary'
  }, schema);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].code, 'STRING_TOO_LONG');

  // Pattern mismatch
  result = validateComponentProps({
    name: 'Button123',
    category: 'primary'
  }, schema);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].code, 'PATTERN_MISMATCH');

  // Invalid enum value
  result = validateComponentProps({
    name: 'Button',
    category: 'invalid'
  }, schema);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].code, 'INVALID_ENUM_VALUE');
});

Deno.test('validateComponentProps - Number Validation', () => {
  const schema: ComponentPropSchema = {
    width: {
      type: 'number',
      required: true,
      min: 0,
      max: 1000
    },
    height: {
      type: 'number',
      required: false
    }
  };

  // Valid number
  let result = validateComponentProps({
    width: 500
  }, schema);
  
  assert(result.valid);
  assertEquals(result.errors.length, 0);

  // Number too small
  result = validateComponentProps({
    width: -10
  }, schema);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].code, 'NUMBER_TOO_SMALL');

  // Number too large
  result = validateComponentProps({
    width: 1500
  }, schema);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].code, 'NUMBER_TOO_LARGE');
});

Deno.test('validateComponentProps - Array Validation', () => {
  const schema: ComponentPropSchema = {
    items: {
      type: 'array',
      required: true,
      min: 1,
      max: 5,
      items: {
        type: 'string',
        minLength: 1
      }
    }
  };

  // Valid array
  let result = validateComponentProps({
    items: ['item1', 'item2', 'item3']
  }, schema);
  
  assert(result.valid);
  assertEquals(result.errors.length, 0);

  // Array too short
  result = validateComponentProps({
    items: []
  }, schema);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].code, 'ARRAY_TOO_SHORT');

  // Array too long
  result = validateComponentProps({
    items: ['1', '2', '3', '4', '5', '6']
  }, schema);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].code, 'ARRAY_TOO_LONG');

  // Invalid array item
  result = validateComponentProps({
    items: ['valid', ''] // Empty string violates minLength
  }, schema);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].field, 'items[1]');
  assertEquals(result.errors[0].code, 'STRING_TOO_SHORT');
});

Deno.test('validateComponentProps - Object Validation', () => {
  const schema: ComponentPropSchema = {
    config: {
      type: 'object',
      required: true,
      properties: {
        theme: {
          type: 'string',
          required: true,
          enum: ['light', 'dark']
        },
        size: {
          type: 'number',
          required: false,
          min: 1
        }
      }
    }
  };

  // Valid object
  let result = validateComponentProps({
    config: {
      theme: 'light',
      size: 16
    }
  }, schema);
  
  assert(result.valid);
  assertEquals(result.errors.length, 0);

  // Missing required nested prop
  result = validateComponentProps({
    config: {
      size: 16
    }
  }, schema);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].field, 'config.theme');
  assertEquals(result.errors[0].code, 'MISSING_REQUIRED_PROP');

  // Invalid nested prop
  result = validateComponentProps({
    config: {
      theme: 'invalid',
      size: 16
    }
  }, schema);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].field, 'config.theme');
  assertEquals(result.errors[0].code, 'INVALID_ENUM_VALUE');
});

Deno.test('validateComponentProps - Custom Validation', () => {
  const schema: ComponentPropSchema = {
    email: {
      type: 'string',
      required: true,
      validation: (value: unknown) => {
        if (typeof value !== 'string') return false;
        return value.includes('@') ? true : 'Email must contain @ symbol';
      }
    }
  };

  // Valid custom validation
  let result = validateComponentProps({
    email: 'test@example.com'
  }, schema);
  
  assert(result.valid);
  assertEquals(result.errors.length, 0);

  // Invalid custom validation
  result = validateComponentProps({
    email: 'invalid-email'
  }, schema);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].code, 'CUSTOM_VALIDATION_FAILED');
  assertEquals(result.errors[0].message, 'Email must contain @ symbol');
});

Deno.test('validateComponentProps - Unknown Props Warning', () => {
  const schema: ComponentPropSchema = {
    title: {
      type: 'string',
      required: true
    }
  };

  const result = validateComponentProps({
    title: 'Test',
    unknownProp: 'value'
  }, schema);
  
  assert(result.valid); // Still valid, just warnings
  assertEquals(result.errors.length, 0);
  assertEquals(result.warnings.length, 1);
  assertEquals(result.warnings[0].field, 'unknownProp');
});

Deno.test('propSchemaToJsonSchema - Basic Conversion', () => {
  const propSchema: ComponentPropSchema = {
    title: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100,
      description: 'Component title'
    },
    count: {
      type: 'number',
      required: false,
      min: 0,
      max: 1000,
      default: 0
    },
    enabled: {
      type: 'boolean',
      required: false,
      default: true
    }
  };

  const jsonSchema = propSchemaToJsonSchema(propSchema);

  assertEquals(jsonSchema.type, 'object');
  assertEquals(jsonSchema.required, ['title']);
  assertEquals(jsonSchema.additionalProperties, false);
  
  // Check string property
  const titleProp = jsonSchema.properties!.title;
  assertEquals(titleProp.type, 'string');
  assertEquals(titleProp.minLength, 1);
  assertEquals(titleProp.maxLength, 100);
  assertEquals(titleProp.description, 'Component title');

  // Check number property
  const countProp = jsonSchema.properties!.count;
  assertEquals(countProp.type, 'number');
  assertEquals(countProp.minimum, 0);
  assertEquals(countProp.maximum, 1000);
  assertEquals(countProp.default, 0);

  // Check boolean property
  const enabledProp = jsonSchema.properties!.enabled;
  assertEquals(enabledProp.type, 'boolean');
  assertEquals(enabledProp.default, true);
});

Deno.test('propSchemaToJsonSchema - Array and Object Types', () => {
  const propSchema: ComponentPropSchema = {
    items: {
      type: 'array',
      required: true,
      items: {
        type: 'string',
        minLength: 1
      }
    },
    config: {
      type: 'object',
      required: false,
      properties: {
        theme: {
          type: 'string',
          enum: ['light', 'dark']
        }
      }
    }
  };

  const jsonSchema = propSchemaToJsonSchema(propSchema);

  // Check array property
  const itemsProp = jsonSchema.properties!.items;
  assertEquals(itemsProp.type, 'array');
  assertEquals(itemsProp.items!.type, 'string');
  assertEquals(itemsProp.items!.minLength, 1);

  // Check object property
  const configProp = jsonSchema.properties!.config;
  assertEquals(configProp.type, 'object');
  assertEquals(configProp.properties!.theme.type, 'string');
  assertEquals(configProp.properties!.theme.enum, ['light', 'dark']);
});

Deno.test('validateRegistryEntry - Valid Entry', () => {
  const validEntry: ComponentRegistryEntry = {
    component: () => null as any,
    metadata: {
      name: 'Button',
      category: ComponentCategory.FORM,
      description: 'A clickable button component',
      version: '1.0.0'
    },
    propSchema: {
      variant: {
        type: 'string',
        required: false,
        enum: ['primary', 'secondary']
      }
    },
    jsonSchema: {
      type: 'object',
      properties: {
        variant: {
          type: 'string',
          enum: ['primary', 'secondary']
        }
      },
      additionalProperties: false
    },
    dependencies: ['react']
  };

  const result = validateRegistryEntry('Button', validEntry);
  
  assert(result.valid);
  assertEquals(result.errors.length, 0);
});

Deno.test('validateRegistryEntry - Invalid Component Name', () => {
  const invalidEntry: ComponentRegistryEntry = {
    component: () => null as any,
    metadata: {
      name: 'button', // Should start with uppercase
      category: ComponentCategory.FORM,
      description: 'A button component',
      version: '1.0.0'
    },
    propSchema: {},
    jsonSchema: { type: 'object' },
    dependencies: []
  };

  let result = validateRegistryEntry('button', invalidEntry);
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].code, 'INVALID_COMPONENT_NAME_FORMAT');

  // Test empty name
  result = validateRegistryEntry('', invalidEntry);
  assert(!result.valid);
  assertEquals(result.errors[0].code, 'INVALID_COMPONENT_NAME');
});

Deno.test('validateRegistryEntry - Invalid Component Function', () => {
  const invalidEntry = {
    component: 'not-a-function', // Should be a function
    metadata: {
      name: 'Button',
      category: ComponentCategory.FORM,
      description: 'A button component',
      version: '1.0.0'
    },
    propSchema: {},
    jsonSchema: { type: 'object' },
    dependencies: []
  } as any;

  const result = validateRegistryEntry('Button', invalidEntry);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].code, 'INVALID_COMPONENT_TYPE');
});

Deno.test('validateRegistryEntry - Missing Metadata', () => {
  const invalidEntry = {
    component: () => null as any,
    metadata: null, // Missing metadata
    propSchema: {},
    jsonSchema: { type: 'object' },
    dependencies: []
  } as any;

  const result = validateRegistryEntry('Button', invalidEntry);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].code, 'MISSING_METADATA');
});

Deno.test('validateRegistryEntry - Invalid Dependencies', () => {
  const invalidEntry = {
    component: () => null as any,
    metadata: {
      name: 'Button',
      category: ComponentCategory.FORM,
      description: 'A button component',
      version: '1.0.0'
    },
    propSchema: {},
    jsonSchema: { type: 'object' },
    dependencies: 'not-an-array' // Should be an array
  } as any;

  const result = validateRegistryEntry('Button', invalidEntry);
  
  assert(!result.valid);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0].code, 'INVALID_DEPENDENCIES');
});