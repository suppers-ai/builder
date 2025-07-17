// Unit tests for component import generator
import { assertEquals, assertNotEquals, assertStringIncludes } from "https://deno.land/std/assert/mod.ts";
import { ComponentImportGenerator, createImportGenerator } from "./component-import-generator.ts";
import { ComponentResolver } from "./component-resolver.ts";
import { ComponentCategory } from "../../shared/src/enums.ts";
import type { ComponentDefinition, ComponentRegistry } from "../../shared/src/types.ts";

// Mock component registry for testing
const mockRegistry: ComponentRegistry = {
  "Button": {
    component: { __fresh_island: true },
    schema: {
      type: "object",
      properties: {
        variant: { type: "string", enum: ["primary", "secondary", "danger"] },
        size: { type: "string", enum: ["sm", "md", "lg"] },
        disabled: { type: "boolean" },
        children: { type: "array" }
      },
      required: ["children"]
    },
    dependencies: [],
    category: ComponentCategory.FORM,
    description: "A button component"
  },
  "Card": {
    component: {},
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        bordered: { type: "boolean" },
        children: { type: "array" }
      }
    },
    dependencies: [],
    category: ComponentCategory.LAYOUT,
    description: "A card component"
  },
  "Layout": {
    component: {},
    schema: {
      type: "object",
      properties: {
        header: { type: "boolean" },
        footer: { type: "boolean" },
        sidebar: { type: "boolean" },
        children: { type: "array" }
      }
    },
    dependencies: ["Header", "Footer"],
    category: ComponentCategory.LAYOUT,
    description: "A layout component"
  },
  "Header": {
    component: {},
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        navigation: { type: "array" }
      }
    },
    dependencies: [],
    category: ComponentCategory.LAYOUT,
    description: "A header component"
  },
  "Footer": {
    component: {},
    schema: {
      type: "object",
      properties: {
        copyright: { type: "string" },
        links: { type: "array" }
      }
    },
    dependencies: [],
    category: ComponentCategory.LAYOUT,
    description: "A footer component"
  },
  "Form": {
    component: { __fresh_island: true },
    schema: {
      type: "object",
      properties: {
        onSubmit: { type: "function" },
        children: { type: "array" }
      }
    },
    dependencies: ["Input", "Button"],
    category: ComponentCategory.FORM,
    description: "A form component"
  },
  "Input": {
    component: { __fresh_island: true },
    schema: {
      type: "object",
      properties: {
        type: { type: "string" },
        value: { type: "string" },
        onChange: { type: "function" }
      }
    },
    dependencies: [],
    category: ComponentCategory.FORM,
    description: "An input component"
  }
};

// Test component definitions
const singleComponentDefinition: ComponentDefinition = {
  id: "submit-button",
  type: "Button",
  props: {
    variant: "primary",
    size: "md",
    disabled: false
  },
  children: []
};

const nestedComponentDefinition: ComponentDefinition = {
  id: "layout",
  type: "Layout",
  props: {
    header: true,
    footer: true
  },
  children: [
    {
      id: "header",
      type: "Header",
      props: {
        title: "My App"
      },
      children: []
    },
    {
      id: "content",
      type: "Card",
      props: {
        title: "Content"
      },
      children: []
    },
    {
      id: "footer",
      type: "Footer",
      props: {
        copyright: "© 2025"
      },
      children: []
    }
  ]
};

const formComponentDefinition: ComponentDefinition = {
  id: "contact-form",
  type: "Form",
  props: {
    onSubmit: "$handleSubmit"
  },
  children: [
    {
      id: "name-input",
      type: "Input",
      props: {
        type: "text",
        value: "$name",
        onChange: "$handleNameChange"
      },
      children: []
    },
    {
      id: "submit-button",
      type: "Button",
      props: {
        variant: "primary",
        type: "submit"
      },
      children: []
    }
  ]
};

Deno.test("ComponentImportGenerator - constructor accepts registry or resolver", () => {
  // Test with registry
  const generator1 = createImportGenerator(mockRegistry);
  assertNotEquals(generator1, undefined);
  
  // Test with resolver
  const resolver = new ComponentResolver(mockRegistry);
  const generator2 = createImportGenerator(resolver);
  assertNotEquals(generator2, undefined);
});

Deno.test("ComponentImportGenerator - generateImports for single component", () => {
  const generator = createImportGenerator(mockRegistry);
  const result = generator.generateImports(singleComponentDefinition);
  
  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  assertEquals(result.componentTypes.includes("Button"), true);
  assertNotEquals(result.imports.length, 0);
  
  // Check that Button is included in imports
  const importString = result.imports.join("\n");
  assertStringIncludes(importString, "Button");
  
  // Check that island imports are generated for Button
  assertNotEquals(result.islandImports.length, 0);
  const islandImportString = result.islandImports.join("\n");
  assertStringIncludes(islandImportString, "Button");
});

Deno.test("ComponentImportGenerator - generateImports for nested components", () => {
  const generator = createImportGenerator(mockRegistry);
  const result = generator.generateImports(nestedComponentDefinition);
  
  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  
  // Check that all component types are included
  assertEquals(result.componentTypes.includes("Layout"), true);
  assertEquals(result.componentTypes.includes("Header"), true);
  assertEquals(result.componentTypes.includes("Card"), true);
  assertEquals(result.componentTypes.includes("Footer"), true);
  
  // Check that all components are included in imports
  const importString = result.imports.join("\n");
  assertStringIncludes(importString, "Layout");
  assertStringIncludes(importString, "Header");
  assertStringIncludes(importString, "Card");
  assertStringIncludes(importString, "Footer");
  
  // Check that no island imports are generated for these components
  assertEquals(result.islandImports.length, 0);
});

Deno.test("ComponentImportGenerator - generateImports for components with dependencies", () => {
  const generator = createImportGenerator(mockRegistry);
  const result = generator.generateImports(formComponentDefinition);
  
  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  
  // Check that all component types are included
  assertEquals(result.componentTypes.includes("Form"), true);
  assertEquals(result.componentTypes.includes("Input"), true);
  assertEquals(result.componentTypes.includes("Button"), true);
  
  // Check that all components are included in imports
  const importString = result.imports.join("\n");
  assertStringIncludes(importString, "Form");
  assertStringIncludes(importString, "Input");
  assertStringIncludes(importString, "Button");
  
  // Check that island imports are generated for Form, Input, and Button
  assertNotEquals(result.islandImports.length, 0);
  const islandImportString = result.islandImports.join("\n");
  assertStringIncludes(islandImportString, "Form");
  assertStringIncludes(islandImportString, "Input");
  assertStringIncludes(islandImportString, "Button");
});

Deno.test("ComponentImportGenerator - generateImports with custom options", () => {
  const generator = createImportGenerator(mockRegistry);
  const result = generator.generateImports(singleComponentDefinition, {
    useRelativeImports: false,
    importBasePath: '@/components/',
    includeIslands: false
  });
  
  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  
  // Check that imports use absolute paths
  const importString = result.imports.join("\n");
  assertStringIncludes(importString, "@/components/");
  
  // Check that no island imports are generated
  assertEquals(result.islandImports.length, 0);
});

Deno.test("ComponentImportGenerator - generateImports for array of components", () => {
  const generator = createImportGenerator(mockRegistry);
  const result = generator.generateImports([
    singleComponentDefinition,
    nestedComponentDefinition
  ]);
  
  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  
  // Check that all component types are included
  assertEquals(result.componentTypes.includes("Button"), true);
  assertEquals(result.componentTypes.includes("Layout"), true);
  assertEquals(result.componentTypes.includes("Header"), true);
  assertEquals(result.componentTypes.includes("Card"), true);
  assertEquals(result.componentTypes.includes("Footer"), true);
});

Deno.test("ComponentImportGenerator - generatePropMapping", () => {
  const generator = createImportGenerator(mockRegistry);
  const propMapping = generator.generatePropMapping(singleComponentDefinition);
  
  assertNotEquals(propMapping, "");
  assertStringIncludes(propMapping, "const submit-buttonProps = {");
  assertStringIncludes(propMapping, "variant: \"primary\"");
  assertStringIncludes(propMapping, "size: \"md\"");
  assertStringIncludes(propMapping, "disabled: false");
});

Deno.test("ComponentImportGenerator - handles variable references in props", () => {
  const generator = createImportGenerator(mockRegistry);
  const propMapping = generator.generatePropMapping({
    id: "form",
    type: "Form",
    props: {
      onSubmit: "$handleSubmit",
      data: "$formData"
    },
    children: []
  });
  
  assertNotEquals(propMapping, "");
  assertStringIncludes(propMapping, "onSubmit: handleSubmit");
  assertStringIncludes(propMapping, "data: formData");
});