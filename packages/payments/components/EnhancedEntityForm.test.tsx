import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { render } from "https://esm.sh/@testing-library/preact@3.2.3";
import { validateMetadata } from "../../api/supabase/functions/api/lib/metadata-validation.ts";

// Mock the API client
class MockEntityTypesAPIClient {
  async getAllEntityTypes() {
    return [
      {
        id: "1",
        name: "accommodation",
        description: "Hotels and lodging",
        metadata_schema: {
          stars: { type: "number", label: "Star Rating", min: 1, max: 5 },
          amenities: { type: "array", label: "Amenities" },
        },
        filter_config: {
          filter_numeric_1: { label: "Star Rating" },
          filter_text_1: { label: "Amenities" },
        },
        entity_sub_types: [
          {
            id: "1-1",
            name: "hotel",
            description: "Traditional hotel",
            metadata_schema: {
              roomCount: { type: "number", label: "Room Count" },
            },
            filter_config: {
              filter_numeric_2: { label: "Room Count" },
            },
          },
        ],
      },
    ];
  }
}

Deno.test("MetadataValidationService integration test", () => {
  const service = new MetadataValidationService();

  const schema = {
    stars: { type: "number", label: "Star Rating", min: 1, max: 5, required: true },
    amenities: { type: "array", label: "Amenities" },
    name: { type: "text", label: "Name", required: true, maxLength: 100 },
  };

  // Test valid metadata
  const validMetadata = {
    stars: 4,
    amenities: ["wifi", "pool", "gym"],
    name: "Grand Hotel",
  };

  const validResult = service.validateMetadata(validMetadata, schema);
  assertEquals(validResult.isValid, true);
  assertEquals(validResult.errors.length, 0);

  // Test invalid metadata
  const invalidMetadata = {
    stars: 6, // Too high
    amenities: "not an array", // Wrong type
    // name missing
  };

  const invalidResult = service.validateMetadata(invalidMetadata, schema);
  assertEquals(invalidResult.isValid, false);
  assertEquals(invalidResult.errors.length, 3);

  // Check specific errors
  const starsError = invalidResult.errors.find((e) => e.field === "stars");
  assertEquals(starsError?.message, "Value must be between 1 and 5");

  const amenitiesError = invalidResult.errors.find((e) => e.field === "amenities");
  assertEquals(amenitiesError?.message, "Value must be an array");

  const nameError = invalidResult.errors.find((e) => e.field === "name");
  assertEquals(nameError?.message, "Field is required");
});

Deno.test("Schema merging works correctly", () => {
  const service = new MetadataValidationService();

  const parentSchema = {
    name: { type: "text", label: "Name", required: true },
    category: {
      type: "select",
      label: "Category",
      options: ["hotel", "hostel"],
      required: true,
    },
  };

  const childSchema = {
    category: {
      type: "select",
      label: "Category",
      options: ["hotel", "hostel", "resort"],
      required: true,
    },
    roomCount: { type: "number", label: "Room Count", min: 1 },
  };

  const merged = service.mergeSchemas(parentSchema, childSchema);

  // Parent field should be preserved
  assertEquals(merged.name.required, true);

  // Child should override parent
  assertEquals(merged.category.options.length, 3);
  assertEquals(merged.category.options.includes("resort"), true);

  // Child field should be added
  assertEquals(merged.roomCount.label, "Room Count");
  assertEquals(merged.roomCount.min, 1);
});

Deno.test("Form validation integration", async () => {
  // Mock form data that would come from the enhanced form
  const formData = {
    name: "Test Hotel",
    description: "A beautiful test hotel",
    type: "accommodation",
    sub_type: "hotel",
    status: "active",
    metadata: {
      stars: 4,
      amenities: ["wifi", "pool"],
      roomCount: 150,
    },
  };

  // This represents the merged schema that would be used in the form
  const mergedSchema = {
    stars: { type: "number", label: "Star Rating", min: 1, max: 5, required: true },
    amenities: { type: "array", label: "Amenities" },
    roomCount: { type: "number", label: "Room Count", min: 1, required: true },
  };

  const service = new MetadataValidationService();
  const result = service.validateMetadata(formData.metadata, mergedSchema);

  assertEquals(result.isValid, true);
  assertEquals(result.errors.length, 0);
});
