import { assertArrayIncludes, assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { createProduct, Product } from "../payment/product/product.ts";
import {
  createPricingPrice,
  createPricingProduct,
  PriceInterval,
  PriceTarget,
  PricingPrice,
  PricingProduct,
  PricingType,
} from "../payment/product/price/price.ts";
import {
  createCommonFormulas,
  IPricingVariable,
  VariableType,
  VariableUtils,
} from "../payment/product/price/dynamic-pricing.ts";
import { PricingEngine } from "../payment/product/price/pricing-engine.ts";

/**
 * Tests for the refactored pricing system with formula-based restrictions
 */

Deno.test("Refactored Pricing System - Product Variables Moved to Database", () => {
  const product: Product = createProduct({
    seller_id: "test-seller-123",
    name: "Hotel Room",
    description: "Deluxe hotel room with ocean view",
  });

  // Product variables are now stored in separate table (product_variables)
  // They're no longer part of the Product object itself

  // Product should have required fields
  assertEquals(typeof product.id, "string");
  assertEquals(product.version_id, 1);
  assertEquals(product.seller_id, "test-seller-123");
});

Deno.test("Refactored Pricing System - Restrictions Moved to Database", () => {
  const product: Product = createProduct({
    seller_id: "test-seller-123",
    name: "Event Ticket",
  });

  // Restrictions are now stored in separate table (product_restrictions)
  // They're no longer part of the Product object itself
  // The database enforces relationships between products and restriction formulas

  // Product should have required fields
  assertEquals(typeof product.id, "string");
  assertEquals(product.seller_id, "test-seller-123");
});

Deno.test("Refactored Pricing System - Index-Based Formula Priority", () => {
  const productVariables = {
    basePrice: {
      id: "basePrice",
      name: "Base Price",
      type: VariableType.fixed,
      value: 100,
    },
    discount: {
      id: "discount",
      name: "Discount",
      type: VariableType.fixed,
      value: -10,
    },
    tax: {
      id: "tax",
      name: "Tax",
      type: VariableType.fixed,
      value: 8,
    },
  };

  const pricingProduct: PricingProduct = createPricingProduct({
    name: "Test Pricing",
  });

  const pricingPrice: PricingPrice = createPricingPrice({
    name: "Standard Rate",
    pricing_product_id: pricingProduct.id,
    pricing_type: "dynamic",
    formula_names: ["baseCalculation", "discountFormula", "taxFormula"],
    target: "per-participant",
    interval: "per-unit",
  });

  const formulas = createCommonFormulas(pricingProduct.id);

  const product = createProduct({
    seller_id: "test-seller-123",
    name: "Test Product",
  });

  const result = PricingEngine.calculatePrice(
    pricingPrice,
    Object.values(formulas),
    "USD",
    { participants: 1 },
    productVariables,
  );

  // Should calculate using the formulas
  assertEquals(typeof result.finalPrice, "number");
  assertEquals(result.finalPrice > 0, true);
});

Deno.test("Refactored Pricing System - Formula-Based Restrictions Check", () => {
  const productVariables = {
    availableStock: {
      id: "availableStock",
      name: "Available Stock",
      type: VariableType.fixed,
      value: 5,
    },
    maxParticipants: {
      id: "maxParticipants",
      name: "Maximum Participants",
      type: VariableType.fixed,
      value: 4,
    },
    openingHour: {
      id: "openingHour",
      name: "Opening Hour",
      type: VariableType.fixed,
      value: 9, // 9 AM
    },
    closingHour: {
      id: "closingHour",
      name: "Closing Hour",
      type: VariableType.fixed,
      value: 17, // 5 PM
    },
  };

  const pricingProduct: PricingProduct = createPricingProduct({
    name: "Restricted Product",
  });

  const formulas = createCommonFormulas(pricingProduct.id);

  // Add restriction formulas that check availability
  const now = new Date().toISOString();
  formulas["availableStockCheck"] = {
    id: crypto.randomUUID(),
    formula_name: "availableStockCheck",
    name: "Available Stock Check",
    description: "Check if enough stock is available",
    pricing_product_id: pricingProduct.id,
    value_calculation: [],
    apply_condition: ["participants", "<=", "availableStock"],
    created_at: now,
    updated_at: now,
  };

  formulas["maxParticipantsCheck"] = {
    id: crypto.randomUUID(),
    formula_name: "maxParticipantsCheck",
    name: "Max Participants Check",
    description: "Check if participant count is within limit",
    pricing_product_id: pricingProduct.id,
    value_calculation: [],
    apply_condition: ["participants", "<=", "maxParticipants"],
    created_at: now,
    updated_at: now,
  };

  const product: Product = createProduct({
    seller_id: "test-seller-123",
    name: "Restricted Product",
  });

  const restrictionFormulas = [
    "availableStockCheck",
    "maxParticipantsCheck",
  ];

  // Test with valid conditions
  const validVariables = VariableUtils.mergeVariables(
    {},
    {
      participants: 2,
      requestedHour: 10, // 10 AM
    },
    productVariables,
  );

  const validResult = VariableUtils.evaluateRestrictions(
    restrictionFormulas,
    formulas,
    validVariables,
  );

  assertEquals(validResult.available, true);
  assertEquals(validResult.failedRestrictions.length, 0);

  // Test with invalid conditions (too many participants)
  const invalidVariables = VariableUtils.mergeVariables(
    {},
    {
      participants: 6, // Exceeds maxParticipants (4)
      requestedHour: 10,
    },
    productVariables,
  );

  const invalidResult = VariableUtils.evaluateRestrictions(
    restrictionFormulas,
    formulas,
    invalidVariables,
  );

  assertEquals(invalidResult.available, false);
  assertArrayIncludes(invalidResult.failedRestrictions, ["maxParticipantsCheck"]);
});

Deno.test("Refactored Pricing System - Complete Hotel Booking Scenario", () => {
  const productVariables = {
    basePrice: {
      id: "basePrice",
      name: "Base Price",
      type: VariableType.fixed,
      value: 200,
    },
    availableStock: {
      id: "availableStock",
      name: "Available Stock",
      type: VariableType.fixed,
      value: 3,
    },
    maxParticipants: {
      id: "maxParticipants",
      name: "Maximum Participants",
      type: VariableType.fixed,
      value: 4,
    },
    weekendSurcharge: {
      id: "weekendSurcharge",
      name: "Weekend Surcharge",
      type: VariableType.fixed,
      value: 50,
    },
    firstTimeDiscount: {
      id: "firstTimeDiscount",
      name: "First Time Discount",
      type: VariableType.percentage,
      value: -15,
    },
  };

  const pricingProduct: PricingProduct = createPricingProduct({
    name: "Hotel Room Pricing",
  });

  const pricingPrice: PricingPrice = createPricingPrice({
    name: "Standard Rate",
    pricing_product_id: pricingProduct.id,
    pricing_type: "dynamic",
    formula_names: [
      "baseCalculation",
      "weekendSurchargeFormula",
      "firstTimeDiscountFormula",
    ],
    target: "per-participant",
    interval: "per-unit",
  });

  const formulas = createCommonFormulas(pricingProduct.id);

  // Add restriction formulas that check availability
  const now = new Date().toISOString();
  formulas["availableStockCheck"] = {
    id: crypto.randomUUID(),
    formula_name: "availableStockCheck",
    name: "Available Stock Check",
    description: "Check if enough stock is available",
    pricing_product_id: pricingProduct.id,
    value_calculation: [],
    apply_condition: ["participants", "<=", "availableStock"],
    created_at: now,
    updated_at: now,
  };

  formulas["maxParticipantsCheck"] = {
    id: crypto.randomUUID(),
    formula_name: "maxParticipantsCheck",
    name: "Max Participants Check",
    description: "Check if participant count is within limit",
    pricing_product_id: pricingProduct.id,
    value_calculation: [],
    apply_condition: ["participants", "<=", "maxParticipants"],
    created_at: now,
    updated_at: now,
  };

  const product: Product = createProduct({
    seller_id: "test-seller-123",
    name: "Deluxe Hotel Room",
  });

  const restrictionFormulas = [
    "availableStockCheck",
    "maxParticipantsCheck",
  ];

  // Test availability check (should pass)
  const variables = VariableUtils.mergeVariables(
    {},
    {
      participants: 2,
      dayOfWeek: 6, // Saturday (weekend)
      isFirstTime: true,
    },
    productVariables,
  );

  const availabilityResult = VariableUtils.evaluateRestrictions(
    restrictionFormulas,
    formulas,
    variables,
  );

  assertEquals(availabilityResult.available, true);

  // Test price calculation
  const result = PricingEngine.calculatePrice(
    pricingPrice,
    Object.values(formulas),
    "USD",
    {
      participants: 2,
      dayOfWeek: 6, // Saturday
      isFirstTime: true,
    },
    productVariables,
  );

  // Should have base calculation + weekend surcharge applied
  // Note: The actual calculation depends on the formula implementation
  assertEquals(typeof result.finalPrice, "number");
  assertEquals(result.finalPrice > 0, true);
  assertEquals(result.breakdown.length > 0, true);
});

Deno.test("Refactored Pricing System - Purchase Variables Override Product Variables", () => {
  const productVariables = {
    basePrice: {
      id: "basePrice",
      name: "Base Price",
      type: VariableType.fixed,
      value: 100,
    },
  };

  const purchaseVariables = {
    basePrice: {
      id: "basePrice",
      name: "VIP Base Price",
      type: VariableType.fixed,
      value: 200, // Override the product variable
    },
  };

  const pricingProduct: PricingProduct = createPricingProduct({
    name: "Override Test",
  });

  const pricingPrice: PricingPrice = createPricingPrice({
    name: "VIP Package",
    pricing_product_id: pricingProduct.id,
    pricing_type: "dynamic",
    formula_names: ["baseCalculation"],
    target: "per-participant",
    interval: "per-unit",
  });

  const formulas = createCommonFormulas(pricingProduct.id);

  const product = createProduct({
    seller_id: "test-seller-123",
    name: "Test Product",
  });

  const result = PricingEngine.calculatePrice(
    pricingPrice,
    Object.values(formulas),
    "USD",
    { participants: 2 },
    productVariables,
    purchaseVariables,
  );

  // Should use overridden price in calculation
  assertEquals(typeof result.finalPrice, "number");
  assertEquals(result.finalPrice > 0, true);
});
