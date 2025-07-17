// Demo script to showcase the component registry functionality

import { ComponentRegistry, createRegistry } from './registry.ts';
import { ComponentCategory } from '@json-app-compiler/shared';
import type { ComponentRegistryEntry } from './types.ts';

// Create a new registry instance
const registry = createRegistry({
  strict: true,
  allowOverrides: false,
  autoValidation: true,
  logLevel: 'info'
});

// Define a sample Button component
const ButtonComponent = (props: { variant?: string; children?: string }) => {
  return `<button class="${props.variant || 'default'}">${props.children || 'Button'}</button>`;
};

// Create a registry entry for the Button component
const buttonEntry: ComponentRegistryEntry = {
  component: ButtonComponent,
  metadata: {
    name: 'Button',
    category: ComponentCategory.FORM,
    description: 'A customizable button component',
    version: '1.0.0',
    author: 'UI Library Team',
    tags: ['interactive', 'form', 'clickable']
  },
  propSchema: {
    variant: {
      type: 'string',
      required: false,
      enum: ['primary', 'secondary', 'danger', 'success'],
      default: 'primary',
      description: 'Button visual style variant'
    },
    size: {
      type: 'string',
      required: false,
      enum: ['sm', 'md', 'lg'],
      default: 'md',
      description: 'Button size'
    },
    disabled: {
      type: 'boolean',
      required: false,
      default: false,
      description: 'Whether the button is disabled'
    },
    children: {
      type: 'string',
      required: false,
      description: 'Button text content'
    }
  },
  jsonSchema: {
    type: 'object',
    properties: {
      variant: {
        type: 'string',
        enum: ['primary', 'secondary', 'danger', 'success'],
        default: 'primary'
      },
      size: {
        type: 'string',
        enum: ['sm', 'md', 'lg'],
        default: 'md'
      },
      disabled: {
        type: 'boolean',
        default: false
      },
      children: {
        type: 'string'
      }
    },
    additionalProperties: false
  },
  dependencies: []
};

// Define a sample Input component
const InputComponent = (props: { type?: string; placeholder?: string; required?: boolean }) => {
  return `<input type="${props.type || 'text'}" placeholder="${props.placeholder || ''}" ${props.required ? 'required' : ''} />`;
};

const inputEntry: ComponentRegistryEntry = {
  component: InputComponent,
  metadata: {
    name: 'Input',
    category: ComponentCategory.INPUT,
    description: 'A form input component',
    version: '1.0.0',
    tags: ['form', 'input', 'text']
  },
  propSchema: {
    type: {
      type: 'string',
      required: false,
      enum: ['text', 'email', 'password', 'number', 'tel', 'url'],
      default: 'text',
      description: 'Input type'
    },
    placeholder: {
      type: 'string',
      required: false,
      description: 'Placeholder text'
    },
    required: {
      type: 'boolean',
      required: false,
      default: false,
      description: 'Whether the input is required'
    },
    minLength: {
      type: 'number',
      required: false,
      min: 0,
      description: 'Minimum input length'
    },
    maxLength: {
      type: 'number',
      required: false,
      min: 1,
      description: 'Maximum input length'
    }
  },
  jsonSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['text', 'email', 'password', 'number', 'tel', 'url'],
        default: 'text'
      },
      placeholder: {
        type: 'string'
      },
      required: {
        type: 'boolean',
        default: false
      },
      minLength: {
        type: 'number',
        minimum: 0
      },
      maxLength: {
        type: 'number',
        minimum: 1
      }
    },
    additionalProperties: false
  },
  dependencies: []
};

// Demo function to showcase registry functionality
export function runDemo() {
  console.log('🚀 Component Registry Demo\n');

  // Register components
  console.log('📝 Registering components...');
  registry.register('Button', buttonEntry);
  registry.register('Input', inputEntry);
  console.log(`✅ Registered ${registry.list().length} components\n`);

  // List all components
  console.log('📋 All registered components:');
  registry.list().forEach(name => {
    const metadata = registry.getMetadata(name);
    console.log(`  - ${name}: ${metadata?.description}`);
  });
  console.log('');

  // Search functionality
  console.log('🔍 Searching for "form" components:');
  const formComponents = registry.search('form');
  formComponents.forEach(name => {
    console.log(`  - ${name}`);
  });
  console.log('');

  // Category filtering
  console.log('📂 Components by category:');
  const formCategoryComponents = registry.getByCategory(ComponentCategory.FORM);
  const inputCategoryComponents = registry.getByCategory(ComponentCategory.INPUT);
  console.log(`  Form components: ${Object.keys(formCategoryComponents).join(', ')}`);
  console.log(`  Input components: ${Object.keys(inputCategoryComponents).join(', ')}`);
  console.log('');

  // Props validation
  console.log('✅ Validating component props...');
  
  // Valid Button props
  const validButtonProps = {
    variant: 'primary',
    size: 'lg',
    disabled: false,
    children: 'Click me!'
  };
  
  const buttonValidation = registry.validateProps('Button', validButtonProps);
  console.log(`  Button props validation: ${buttonValidation.valid ? '✅ Valid' : '❌ Invalid'}`);
  
  // Invalid Button props
  const invalidButtonProps = {
    variant: 'invalid-variant',
    size: 'xl', // Not in enum
    children: 'Click me!'
  };
  
  const invalidButtonValidation = registry.validateProps('Button', invalidButtonProps);
  console.log(`  Invalid Button props: ${invalidButtonValidation.valid ? '✅ Valid' : '❌ Invalid'}`);
  if (!invalidButtonValidation.valid) {
    console.log(`    Errors: ${invalidButtonValidation.errors.length}`);
    invalidButtonValidation.errors.forEach(error => {
      console.log(`      - ${error.field}: ${error.message}`);
    });
  }
  console.log('');

  // Registry statistics
  console.log('📊 Registry statistics:');
  const stats = registry.getStats();
  console.log(`  Total components: ${stats.totalComponents}`);
  console.log(`  Deprecated: ${stats.deprecatedCount}`);
  console.log(`  Experimental: ${stats.experimentalCount}`);
  console.log('  Category breakdown:');
  Object.entries(stats.categoryCounts).forEach(([category, count]) => {
    if (count > 0) {
      console.log(`    ${category}: ${count}`);
    }
  });
  console.log('');

  // Export/Import demo
  console.log('💾 Export/Import demo...');
  const exportedData = registry.export();
  console.log(`  Exported registry data (${exportedData.length} characters)`);
  
  const newRegistry = createRegistry();
  newRegistry.import(exportedData);
  console.log(`  Imported into new registry: ${newRegistry.list().length} components`);
  console.log('');

  console.log('🎉 Demo completed successfully!');
}

// Run the demo if this file is executed directly
if (import.meta.main) {
  runDemo();
}