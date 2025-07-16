// Unit tests for the validation system
/// <reference lib="deno.ns" />

import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { 
  JSONValidator, 
  validator, 
  validateAppConfig, 
  validateComponentDefinition,
  ValidationResult 
} from './validators.ts';
import { ValidationSeverity } from './enums.ts';

Deno.test('JSONValidator - Basic type validation', () => {
  const testValidator = new JSONValidator();
  
  // Test string validation
  const stringResult = testValidator.validate('hello', { type: 'string' });
  assertEquals(stringResult.valid, true);
  assertEquals(stringResult.errors.length, 0);
  
  // Test type mismatch
  const typeMismatchResult = testValidator.validate(123, { type: 'string' });
  assertEquals(typeMismatchResult.valid, false);
  assertEquals(typeMismatchResult.errors.length, 1);
  assertEquals(typeMismatchResult.errors[0].code, 'TYPE_MISMATCH');
});

Deno.test('JSONValidator - String validation with constraints', () => {
  const testValidator = new JSONValidator();
  
  // Test minLength
  const minLengthResult = testValidator.validate('hi', { 
    type: 'string', 
    minLength: 5 
  });
  assertEquals(minLengthResult.valid, false);
  assertEquals(minLengthResult.errors[0].code, 'MIN_LENGTH_VIOLATION');
  
  // Test maxLength
  const maxLengthResult = testValidator.validate('this is too long', { 
    type: 'string', 
    maxLength: 5 
  });
  assertEquals(maxLengthResult.valid, false);
  assertEquals(maxLengthResult.errors[0].code, 'MAX_LENGTH_VIOLATION');
  
  // Test pattern
  const patternResult = testValidator.validate('invalid-email', { 
    type: 'string', 
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
  });
  assertEquals(patternResult.valid, false);
  assertEquals(patternResult.errors[0].code, 'PATTERN_VIOLATION');
  
  // Test valid pattern
  const validPatternResult = testValidator.validate('test@example.com', { 
    type: 'string', 
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
  });
  assertEquals(validPatternResult.valid, true);
});

Deno.test('JSONValidator - Number validation', () => {
  const testValidator = new JSONValidator();
  
  // Test minimum
  const minResult = testValidator.validate(5, { 
    type: 'number', 
    minimum: 10 
  });
  assertEquals(minResult.valid, false);
  assertEquals(minResult.errors[0].code, 'MIN_VALUE_VIOLATION');
  
  // Test maximum
  const maxResult = testValidator.validate(15, { 
    type: 'number', 
    maximum: 10 
  });
  assertEquals(maxResult.valid, false);
  assertEquals(maxResult.errors[0].code, 'MAX_VALUE_VIOLATION');
  
  // Test valid range
  const validResult = testValidator.validate(8, { 
    type: 'number', 
    minimum: 5, 
    maximum: 10 
  });
  assertEquals(validResult.valid, true);
});

Deno.test('JSONValidator - Array validation', () => {
  const testValidator = new JSONValidator();
  
  // Test minItems
  const minItemsResult = testValidator.validate([1], { 
    type: 'array', 
    minItems: 3 
  });
  assertEquals(minItemsResult.valid, false);
  assertEquals(minItemsResult.errors[0].code, 'MIN_ITEMS_VIOLATION');
  
  // Test maxItems
  const maxItemsResult = testValidator.validate([1, 2, 3, 4, 5], { 
    type: 'array', 
    maxItems: 3 
  });
  assertEquals(maxItemsResult.valid, false);
  assertEquals(maxItemsResult.errors[0].code, 'MAX_ITEMS_VIOLATION');
  
  // Test items validation
  const itemsResult = testValidator.validate(['hello', 123], { 
    type: 'array',
    items: { type: 'string' }
  });
  assertEquals(itemsResult.valid, false);
  assertEquals(itemsResult.errors.length, 1);
  assertEquals(itemsResult.errors[0].code, 'TYPE_MISMATCH');
});

Deno.test('JSONValidator - Object validation', () => {
  const testValidator = new JSONValidator();
  
  // Test required properties
  const requiredResult = testValidator.validate({}, {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' }
    },
    required: ['name']
  });
  assertEquals(requiredResult.valid, false);
  assertEquals(requiredResult.errors[0].code, 'MISSING_REQUIRED_PROPERTY');
  
  // Test additional properties not allowed
  const additionalResult = testValidator.validate({
    name: 'John',
    extra: 'not allowed'
  }, {
    type: 'object',
    properties: {
      name: { type: 'string' }
    },
    additionalProperties: false
  });
  assertEquals(additionalResult.valid, false);
  assertEquals(additionalResult.errors[0].code, 'ADDITIONAL_PROPERTY_NOT_ALLOWED');
  
  // Test valid object
  const validResult = testValidator.validate({
    name: 'John',
    age: 30
  }, {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' }
    },
    required: ['name']
  });
  assertEquals(validResult.valid, true);
});

Deno.test('JSONValidator - Enum validation', () => {
  const testValidator = new JSONValidator();
  
  // Test invalid enum value
  const invalidResult = testValidator.validate('invalid', {
    type: 'string',
    enum: ['red', 'green', 'blue']
  });
  assertEquals(invalidResult.valid, false);
  assertEquals(invalidResult.errors[0].code, 'ENUM_VIOLATION');
  assertExists(invalidResult.errors[0].suggestions);
  
  // Test valid enum value
  const validResult = testValidator.validate('red', {
    type: 'string',
    enum: ['red', 'green', 'blue']
  });
  assertEquals(validResult.valid, true);
});

Deno.test('validateAppConfig - Valid configuration', () => {
  const validConfig = {
    metadata: {
      name: 'test-app',
      version: '1.0.0',
      description: 'Test application'
    },
    components: [
      {
        id: 'header',
        type: 'Header',
        props: {
          title: 'My App'
        }
      }
    ],
    routes: [
      {
        path: '/',
        component: 'HomePage'
      }
    ],
    api: {
      endpoints: []
    }
  };
  
  const result = validateAppConfig(validConfig);
  assertEquals(result.valid, true);
  assertEquals(result.errors.length, 0);
});

Deno.test('validateComponentDefinition - Valid component', () => {
  const validComponent = {
    id: 'button-1',
    type: 'Button',
    props: {
      variant: 'primary',
      size: 'md',
      children: 'Click me'
    }
  };
  
  const result = validateComponentDefinition(validComponent);
  assertEquals(result.valid, true);
});