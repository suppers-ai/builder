import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";

// Test imports to ensure new types are working correctly
import { createProduct, getProductTags, Product } from "../payment/product/product.ts";
import {
  createPricingPrice,
  createPricingProduct,
  PricingPrice,
  PricingProduct,
} from "../payment/product/price/price.ts";
import {
  createPlace,
  getPlaceTags,
  Place,
  PlaceVariable,
  PlaceVariableType,
} from "../payment/place.ts";
import {
  createPricingFormula,
  IPricingVariable,
  VariableType,
  VariableUtils,
} from "../payment/product/price/dynamic-pricing.ts";
import { PricingEngine } from "../payment/product/price/pricing-engine.ts";

Deno.test("Types Validation - Product Creation", () => {
  const product = createProduct({
    seller_id: "test-seller-123",
    name: "Test Product",
    description: "A test product",
    tags: { "test": true, "category": true },
    metadata: { "custom": "value" },
  });

  assertExists(product.id);
  assertEquals(product.name, "Test Product");
  assertEquals(product.seller_id, "test-seller-123");
  assertEquals(product.version_id, 1);

  const tags = getProductTags(product);
  assertEquals(tags["test"], true);
  assertEquals(tags["category"], true);
});

Deno.test("Types Validation - Place Creation", () => {
  const place = createPlace({
    owner_id: "test-owner-123",
    name: "Test Place",
    description: "A test place",
    tags: { "accommodation": true, "hotel": true },
    status: "active",
  });

  assertExists(place.id);
  assertEquals(place.name, "Test Place");
  assertEquals(place.owner_id, "test-owner-123");
  assertEquals(place.status, "active");
  assertEquals(place.verified, true);

  const tags = getPlaceTags(place);
  assertEquals(tags["accommodation"], true);
  assertEquals(tags["hotel"], true);
});

Deno.test("Types Validation - Pricing Product Creation", () => {
  const pricingProduct = createPricingProduct({
    name: "Test Pricing",
    description: "Test pricing product",
  });

  assertExists(pricingProduct.id);
  assertEquals(pricingProduct.name, "Test Pricing");
  assertExists(pricingProduct.created_at);
  assertExists(pricingProduct.updated_at);
});

Deno.test("Types Validation - Pricing Price Creation", () => {
  const pricingProduct = createPricingProduct({ name: "Test Product" });

  const pricingPrice = createPricingPrice({
    name: "Standard Rate",
    pricing_product_id: pricingProduct.id,
    pricing_type: "dynamic",
    target: "per-participant",
    interval: "per-unit",
    formula_names: ["baseCalculation"],
  });

  assertExists(pricingPrice.id);
  assertEquals(pricingPrice.name, "Standard Rate");
  assertEquals(pricingPrice.pricing_product_id, pricingProduct.id);
  assertEquals(pricingPrice.pricing_type, "dynamic");
  assertEquals(pricingPrice.target, "per-participant");
  assertEquals(pricingPrice.interval, "per-unit");
});

Deno.test("Types Validation - Place Variable Types", () => {
  const place = createPlace({
    owner_id: "test-owner",
    name: "Test Place",
  });

  const textVariable: PlaceVariable = {
    id: "var-1",
    variable_id: "checkInTime",
    name: "Check-in Time",
    description: "Standard check-in time",
    type: PlaceVariableType.text,
    value: "3:00 PM",
    place_id: place.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const numberVariable: PlaceVariable = {
    id: "var-2",
    variable_id: "maxCapacity",
    name: "Maximum Capacity",
    description: null,
    type: PlaceVariableType.number,
    value: 100,
    place_id: place.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  assertEquals(textVariable.type, "text");
  assertEquals(textVariable.value, "3:00 PM");
  assertEquals(numberVariable.type, "number");
  assertEquals(numberVariable.value, 100);
});

Deno.test("Types Validation - Pricing Variables and Formulas", () => {
  const productVariables: Record<string, IPricingVariable> = {
    basePrice: {
      id: "basePrice",
      name: "Base Price",
      type: VariableType.fixed,
      value: 100,
      description: "Base price per participant",
    },
    discount: {
      id: "discount",
      name: "Discount",
      type: VariableType.percentage,
      value: -10,
      description: "Standard discount",
    },
  };

  const pricingProduct = createPricingProduct({ name: "Test Product" });

  // Create a simple formula manually
  const baseFormula = createPricingFormula({
    formula_name: "baseCalculation",
    name: "Base Price Calculation",
    pricing_product_id: pricingProduct.id,
    value_calculation: ["participants", "*", "basePrice"],
  });

  // Test that formula is created successfully
  assertExists(baseFormula);
  assertEquals(baseFormula.name, "Base Price Calculation");

  // Test variable merging
  const context = { participants: 2, dayOfWeek: 1 };
  const mergedVariables = VariableUtils.mergeVariables(
    { purchaseVariables: {} },
    context,
    productVariables,
  );

  assertEquals(mergedVariables.participants.value, 2);
  assertEquals(mergedVariables.basePrice.value, 100);
  assertEquals(mergedVariables.discount.value, -10);
});

Deno.test("Types Validation - Pricing Engine Integration", () => {
  const productVariables: Record<string, IPricingVariable> = {
    basePrice: {
      id: "basePrice",
      name: "Base Price",
      type: VariableType.fixed,
      value: 150,
    },
  };

  const pricingProduct = createPricingProduct({ name: "Test Product" });
  const pricingPrice = createPricingPrice({
    name: "Test Price",
    pricing_product_id: pricingProduct.id,
    pricing_type: "dynamic",
    formula_names: ["baseCalculation"],
    target: "per-participant",
    interval: "per-unit",
  });

  // Create a simple formula
  const baseFormula = createPricingFormula({
    formula_name: "baseCalculation",
    name: "Base Calculation",
    pricing_product_id: pricingProduct.id,
    value_calculation: ["participants", "*", "basePrice"],
  });

  const context = { participants: 2 };

  const result = PricingEngine.calculatePrice(
    pricingPrice,
    [baseFormula],
    "USD",
    context,
    productVariables,
  );

  assertExists(result.finalPrice);
  assertEquals(typeof result.finalPrice, "number");
  assertEquals(result.finalPrice > 0, true);
  assertExists(result.breakdown);
  assertEquals(Array.isArray(result.breakdown), true);
});
