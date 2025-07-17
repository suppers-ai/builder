// Component registry tests

import { assertEquals, assertThrows, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { ComponentRegistry, createRegistry, defaultRegistry } from './registry.ts';
import { ComponentCategory } from '@json-app-compiler/shared';
import type { ComponentRegistryEntry, ComponentMetadata } from './types.ts';

// Helper function to create mock components for testing
function createMockComponent(
  name: string, 
  category: ComponentCategory = ComponentCategory.LAYOUT
): ComponentRegistryEntry {
  return {
    component: () => null as any,
    metadata: {
      name,
      category,
      description: `Mock ${name} component`,
      version: '1.0.0'
    },
    propSchema: {
      children: {
        type: 'node',
        required: false,
        description: 'Child elements'
      }
    },
    jsonSchema: {
      type: 'object',
      properties: {
        children: {
          type: ['string', 'number', 'boolean', 'array', 'object', 'null'],
          description: 'Child elements'
        }
      },
      additionalProperties: false
    },
    dependencies: []
  };
}

Deno.test('ComponentRegistry - Basic Registration', () => {
  const registry = createRegistry();
  const mockComponent = createMockComponent('Button');
  
  registry.register('Button', mockComponent);
  
  assert(registry.has('Button'));
  assertEquals(registry.get('Button'), mockComponent);
  assertEquals(registry.list().length, 1);
});

Deno.test('ComponentRegistry - Duplicate Registration Prevention', () => {
  const registry = createRegistry({ allowOverrides: false });
  const mockComponent = createMockComponent('Button');
  
  registry.register('Button', mockComponent);
  
  assertThrows(
    () => registry.register('Button', mockComponent),
    Error,
    'already registered'
  );
});

Deno.test('ComponentRegistry - Override Allowed', () => {
  const registry = createRegistry({ allowOverrides: true });
  const mockComponent1 = createMockComponent('Button');
  const mockComponent2 = createMockComponent('Button');
  
  registry.register('Button', mockComponent1);
  registry.register('Button', mockComponent2);
  
  assertEquals(registry.get('Button'), mockComponent2);
});

Deno.test('ComponentRegistry - Bulk Registration', () => {
  const registry = createRegistry();
  const components = {
    'Button': createMockComponent('Button'),
    'Input': createMockComponent('Input', ComponentCategory.INPUT),
    'Card': createMockComponent('Card')
  };
  
  registry.registerBulk(components);
  
  assertEquals(registry.list().length, 3);
  assert(registry.has('Button'));
  assert(registry.has('Input'));
  assert(registry.has('Card'));
});

Deno.test('ComponentRegistry - Category Filtering', () => {
  const registry = createRegistry();
  
  registry.register('Header', createMockComponent('Header', ComponentCategory.LAYOUT));
  registry.register('Footer', createMockComponent('Footer', ComponentCategory.LAYOUT));
  registry.register('Checkbox', createMockComponent('Checkbox', ComponentCategory.INPUT));
  
  const layoutComponents = registry.getByCategory(ComponentCategory.LAYOUT);
  const inputComponents = registry.getByCategory(ComponentCategory.INPUT);
  
  assertEquals(Object.keys(layoutComponents).length, 2);
  assertEquals(Object.keys(inputComponents).length, 1);
  assert('Header' in layoutComponents);
  assert('Footer' in layoutComponents);
  assert('Checkbox' in inputComponents);
});

Deno.test('ComponentRegistry - List by Category', () => {
  const registry = createRegistry();
  
  registry.register('Header', createMockComponent('Header', ComponentCategory.LAYOUT));
  registry.register('Footer', createMockComponent('Footer', ComponentCategory.LAYOUT));
  registry.register('Checkbox', createMockComponent('Checkbox', ComponentCategory.INPUT));
  
  const layoutNames = registry.listByCategory(ComponentCategory.LAYOUT);
  const inputNames = registry.listByCategory(ComponentCategory.INPUT);
  
  assertEquals(layoutNames.length, 2);
  assertEquals(inputNames.length, 1);
  assert(layoutNames.includes('Header'));
  assert(layoutNames.includes('Footer'));
  assert(inputNames.includes('Checkbox'));
});

Deno.test('ComponentRegistry - Search Functionality', () => {
  const registry = createRegistry();
  
  const buttonComponent = createMockComponent('Button');
  buttonComponent.metadata.tags = ['interactive', 'form'];
  
  const buttonGroupComponent = createMockComponent('ButtonGroup');
  buttonGroupComponent.metadata.description = 'Group of buttons';
  
  const cardComponent = createMockComponent('Card');
  cardComponent.metadata.description = 'Display card component';
  
  registry.register('Button', buttonComponent);
  registry.register('ButtonGroup', buttonGroupComponent);
  registry.register('Card', cardComponent);
  
  // Search by name
  let results = registry.search('button');
  assertEquals(results.length, 2);
  assert(results.includes('Button'));
  assert(results.includes('ButtonGroup'));
  
  // Search by tag
  results = registry.search('interactive');
  assertEquals(results.length, 1);
  assert(results.includes('Button'));
  
  // Search by description
  results = registry.search('display');
  assertEquals(results.length, 1);
  assert(results.includes('Card'));
});

Deno.test('ComponentRegistry - Props Validation', () => {
  const registry = createRegistry();
  
  const buttonComponent = createMockComponent('Button');
  buttonComponent.propSchema = {
    variant: {
      type: 'string',
      required: true,
      enum: ['primary', 'secondary', 'danger']
    },
    size: {
      type: 'string',
      required: false,
      enum: ['sm', 'md', 'lg'],
      default: 'md'
    },
    disabled: {
      type: 'boolean',
      required: false,
      default: false
    }
  };
  
  registry.register('Button', buttonComponent);
  
  // Valid props
  let validation = registry.validateProps('Button', {
    variant: 'primary',
    size: 'lg',
    disabled: false
  });
  assert(validation.valid);
  assertEquals(validation.errors.length, 0);
  
  // Missing required prop
  validation = registry.validateProps('Button', {
    size: 'lg'
  });
  assert(!validation.valid);
  assertEquals(validation.errors.length, 1);
  assertEquals(validation.errors[0].code, 'MISSING_REQUIRED_PROP');
  
  // Invalid enum value
  validation = registry.validateProps('Button', {
    variant: 'invalid',
    size: 'xl'
  });
  assert(!validation.valid);
  assertEquals(validation.errors.length, 2);
  
  // Unknown prop (should generate warning)
  validation = registry.validateProps('Button', {
    variant: 'primary',
    unknownProp: 'value'
  });
  assert(validation.valid); // Still valid, just warnings
  assertEquals(validation.warnings.length, 1);
});

Deno.test('ComponentRegistry - Component Not Found', () => {
  const registry = createRegistry();
  
  const validation = registry.validateProps('NonExistent', {});
  assert(!validation.valid);
  assertEquals(validation.errors[0].code, 'COMPONENT_NOT_FOUND');
});

Deno.test('ComponentRegistry - Schema and Dependencies', () => {
  const registry = createRegistry();
  
  const complexComponent = createMockComponent('ComplexComponent');
  complexComponent.dependencies = ['React', 'SomeLibrary'];
  complexComponent.jsonSchema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      count: { type: 'number' }
    },
    required: ['title']
  };
  
  registry.register('ComplexComponent', complexComponent);
  
  const schema = registry.getSchema('ComplexComponent');
  const dependencies = registry.getDependencies('ComplexComponent');
  const metadata = registry.getMetadata('ComplexComponent');
  
  assertEquals(schema, complexComponent.jsonSchema);
  assertEquals(dependencies.length, 2);
  assert(dependencies.includes('React'));
  assert(dependencies.includes('SomeLibrary'));
  assertEquals(metadata?.name, 'ComplexComponent');
});

Deno.test('ComponentRegistry - Statistics', () => {
  const registry = createRegistry();
  
  const deprecatedComponent = createMockComponent('OldButton');
  deprecatedComponent.metadata.deprecated = true;
  
  const experimentalComponent = createMockComponent('NewFeature', ComponentCategory.DATA_DISPLAY);
  experimentalComponent.metadata.experimental = true;
  
  registry.register('OldButton', deprecatedComponent);
  registry.register('NewFeature', experimentalComponent);
  registry.register('RegularButton', createMockComponent('RegularButton'));
  
  const stats = registry.getStats();
  
  assertEquals(stats.totalComponents, 3);
  assertEquals(stats.deprecatedCount, 1);
  assertEquals(stats.experimentalCount, 1);
  assertEquals(stats.categoryCounts[ComponentCategory.LAYOUT], 2);
  assertEquals(stats.categoryCounts[ComponentCategory.DATA_DISPLAY], 1);
});

Deno.test('ComponentRegistry - Clear Registry', () => {
  const registry = createRegistry();
  
  registry.register('Button', createMockComponent('Button'));
  registry.register('Input', createMockComponent('Input'));
  
  assertEquals(registry.list().length, 2);
  
  registry.clear();
  
  assertEquals(registry.list().length, 0);
  assert(!registry.has('Button'));
  assert(!registry.has('Input'));
});

Deno.test('ComponentRegistry - Export and Import', () => {
  const registry1 = createRegistry();
  const registry2 = createRegistry();
  
  registry1.register('Button', createMockComponent('Button'));
  registry1.register('Input', createMockComponent('Input'));
  
  const exportedData = registry1.export();
  registry2.import(exportedData);
  
  assertEquals(registry2.list().length, 2);
  assert(registry2.has('Button'));
  assert(registry2.has('Input'));
});

Deno.test('ComponentRegistry - Validation Disabled', () => {
  const registry = createRegistry({ autoValidation: false });
  
  // This should not throw even with invalid component
  const invalidComponent = {
    component: 'not-a-function',
    metadata: null,
    propSchema: null,
    jsonSchema: null,
    dependencies: 'not-an-array'
  } as any;
  
  // Should not throw because validation is disabled
  registry.register('InvalidComponent', invalidComponent);
  assert(registry.has('InvalidComponent'));
});

Deno.test('ComponentRegistry - Strict Validation', () => {
  const registry = createRegistry({ strict: true, autoValidation: true });
  
  const invalidComponent = {
    component: () => null,
    metadata: {
      name: 'invalid-name', // Should start with uppercase
      category: ComponentCategory.LAYOUT,
      description: 'Test',
      version: '1.0.0'
    },
    propSchema: {},
    jsonSchema: { type: 'object' },
    dependencies: []
  } as ComponentRegistryEntry;
  
  assertThrows(
    () => registry.register('invalid-name', invalidComponent),
    Error,
    'Component registration failed'
  );
});

Deno.test('ComponentRegistry - Default Registry', () => {
  // Test that the default registry works
  const mockComponent = createMockComponent('DefaultTest');
  
  defaultRegistry.register('DefaultTest', mockComponent);
  assert(defaultRegistry.has('DefaultTest'));
  
  // Clean up
  defaultRegistry.clear();
});