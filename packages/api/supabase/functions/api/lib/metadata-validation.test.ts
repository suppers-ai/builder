import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  type FilterConfig,
  mapMetadataToFilters,
  type MetadataSchema,
  validateMetadata,
} from "./metadata-validation.ts";

Deno.test("validateMetadata - validates text fields", () => {
  const schema: MetadataSchema = {
    fields: {
      testField: {
        type: "text",
        label: "Test Field",
        required: true,
        max: 50,
      },
    },
  };

  // Valid text
  const validResult = validateMetadata({ testField: "Hello World" }, schema);
  assertEquals(validResult.isValid, true);
  assertEquals(validResult.errors, []);

  // Missing required field
  const missingResult = validateMetadata({}, schema);
  assertEquals(missingResult.isValid, false);
  assertEquals(missingResult.errors.length, 1);

  // Text too long
  const longResult = validateMetadata({
    testField: "a".repeat(51),
  }, schema);
  assertEquals(longResult.isValid, false);
  assertEquals(longResult.errors.length, 1);
});

Deno.test("validateMetadata - validates number fields", () => {
  const schema: MetadataSchema = {
    fields: {
      age: {
        type: "number",
        label: "Age",
        required: true,
        min: 0,
        max: 150,
      },
    },
  };

  // Valid number
  const validResult = validateMetadata({ age: 25 }, schema);
  assertEquals(validResult.isValid, true);

  // Number too small
  const smallResult = validateMetadata({ age: -1 }, schema);
  assertEquals(smallResult.isValid, false);

  // Number too large
  const largeResult = validateMetadata({ age: 200 }, schema);
  assertEquals(largeResult.isValid, false);

  // Invalid type
  const typeResult = validateMetadata({ age: "not a number" }, schema);
  assertEquals(typeResult.isValid, false);
});

Deno.test("validateMetadata - validates boolean fields", () => {
  const schema: MetadataSchema = {
    fields: {
      isActive: {
        type: "boolean",
        label: "Is Active",
        required: true,
      },
    },
  };

  // Valid boolean values
  assertEquals(validateMetadata({ isActive: true }, schema).isValid, true);
  assertEquals(validateMetadata({ isActive: false }, schema).isValid, true);

  // Invalid type
  const invalidResult = validateMetadata({ isActive: "yes" }, schema);
  assertEquals(invalidResult.isValid, false);
});

Deno.test("validateMetadata - validates date fields", () => {
  const schema: MetadataSchema = {
    fields: {
      birthDate: {
        type: "date",
        label: "Birth Date",
        required: true,
      },
    },
  };

  // Valid date string
  const validResult = validateMetadata({
    birthDate: "2000-01-01",
  }, schema);
  assertEquals(validResult.isValid, true);

  // Invalid date format
  const invalidResult = validateMetadata({
    birthDate: "not a date",
  }, schema);
  assertEquals(invalidResult.isValid, false);
});

Deno.test("validateMetadata - validates array fields", () => {
  const schema: MetadataSchema = {
    fields: {
      tags: {
        type: "array",
        label: "Tags",
        required: false,
        max: 5,
      },
    },
  };

  // Valid array
  const validResult = validateMetadata({
    tags: ["tag1", "tag2"],
  }, schema);
  assertEquals(validResult.isValid, true);

  // Too many items
  const tooManyResult = validateMetadata({
    tags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
  }, schema);
  assertEquals(tooManyResult.isValid, false);

  // Invalid type
  const invalidResult = validateMetadata({
    tags: "not an array",
  }, schema);
  assertEquals(invalidResult.isValid, false);
});

Deno.test("validateMetadata - validates select fields", () => {
  const schema: MetadataSchema = {
    fields: {
      category: {
        type: "select",
        label: "Category",
        required: true,
        options: ["A", "B", "C"],
      },
    },
  };

  // Valid option
  const validResult = validateMetadata({ category: "A" }, schema);
  assertEquals(validResult.isValid, true);

  // Invalid option
  const invalidResult = validateMetadata({ category: "D" }, schema);
  assertEquals(invalidResult.isValid, false);
});

Deno.test("mapMetadataToFilters - maps metadata to filter columns", () => {
  const metadata = {
    price: 99.99,
    category: "electronics",
    inStock: true,
    launchDate: "2024-01-01",
    extraField: "ignored",
  };

  const filterConfig: FilterConfig = {
    filter_numeric_1: { label: "price", searchable: true }, // Match field name
    filter_text_1: { label: "category", searchable: true },
    filter_boolean_1: { label: "inStock", searchable: true },
    filter_date_1: { label: "launchDate", searchable: true },
  };

  const result = mapMetadataToFilters(metadata, filterConfig);

  assertEquals(result.filter_numeric_1, 99.99);
  assertEquals(result.filter_text_1, "electronics");
  assertEquals(result.filter_boolean_1, true);
  assertEquals(result.filter_date_1, "2024-01-01");

  // Should not include unmapped fields
  assertEquals(result.extraField, undefined);
});

Deno.test("mapMetadataToFilters - handles column overflow", () => {
  const metadata = {
    num1: 1,
    num2: 2,
    num3: 3,
    num4: 4,
    num5: 5,
    num6: 6,
    text1: "a",
    text2: "b",
    text3: "c",
    text4: "d",
    text5: "e",
    text6: "f",
  };

  const filterConfig: FilterConfig = {
    filter_numeric_1: { label: "num1", searchable: true },
    filter_numeric_2: { label: "num2", searchable: true },
    filter_numeric_3: { label: "num3", searchable: true },
    filter_numeric_4: { label: "num4", searchable: true },
    filter_numeric_5: { label: "num5", searchable: true },
    filter_text_1: { label: "text1", searchable: true },
    filter_text_2: { label: "text2", searchable: true },
    filter_text_3: { label: "text3", searchable: true },
    filter_text_4: { label: "text4", searchable: true },
    filter_text_5: { label: "text5", searchable: true },
  };

  const result = mapMetadataToFilters(metadata, filterConfig);

  // Should map all configured filters
  assertEquals(result.filter_numeric_1, 1);
  assertEquals(result.filter_numeric_5, 5);
  assertEquals(result.filter_text_1, "a");
  assertEquals(result.filter_text_5, "e");

  // No filter_numeric_6 or filter_text_6 in config, so should be undefined
  assertEquals(result.filter_numeric_6, undefined);
  assertEquals(result.filter_text_6, undefined);
});
