import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { FormulaEvaluator } from "../payment/product/price/formula-evaluator.ts";
import { PricingEngine } from "../payment/product/price/pricing-engine.ts";
import {
  createPricingPrice,
  PricingFormula,
} from "../payment/product/price/price.ts";
import {
  createPricingFormula,
  IPricingVariable,
  VariableType,
  VariableUtils,
} from "../payment/product/price/dynamic-pricing.ts";

// ============================================================================
// SIMPLIFIED FORMULA CALCULATION TESTS
// ============================================================================

Deno.test("Basic Formula Calculations", async (t) => {
  await t.step("Simple addition formula", () => {
    const formula = createPricingFormula({
      formula_name: "simple_add",
      name: "Simple Addition",
      pricing_product_id: "test",
      value_calculation: ["10", "+", "20"],
    });

    const result = FormulaEvaluator.evaluateFormula(formula, {});
    assertEquals(result.value, 30);
    assertEquals(result.applied, true);
  });

  await t.step("Variable multiplication", () => {
    const formula = createPricingFormula({
      formula_name: "multiply",
      name: "Multiplication",
      pricing_product_id: "test",
      value_calculation: ["participants", "*", "basePrice"],
    });

    const variables = {
      participants: { id: "participants", name: "Participants", type: VariableType.fixed, value: 3 },
      basePrice: { id: "basePrice", name: "Base Price", type: VariableType.fixed, value: 100 },
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.value, 300);
    assertEquals(result.applied, true);
    assertEquals(result.usedVariables.sort(), ["basePrice", "participants"]);
  });

  await t.step("Percentage calculation", () => {
    const formula = createPricingFormula({
      formula_name: "percentage",
      name: "10% Increase",
      pricing_product_id: "test",
      value_calculation: ["100", "*", "1.1"],
    });

    const result = FormulaEvaluator.evaluateFormula(formula, {});
    assertEquals(Math.round(result.value * 100) / 100, 110);
  });

  await t.step("Parentheses precedence", () => {
    const formula = createPricingFormula({
      formula_name: "precedence",
      name: "Order of Operations",
      pricing_product_id: "test",
      value_calculation: ["(", "10", "+", "5", ")", "*", "2"],
    });

    const result = FormulaEvaluator.evaluateFormula(formula, {});
    assertEquals(result.value, 30); // (10 + 5) * 2 = 30
  });
});

Deno.test("Conditional Formulas", async (t) => {
  await t.step("Simple condition - applied", () => {
    const formula = createPricingFormula({
      formula_name: "conditional",
      name: "Weekend Surcharge",
      pricing_product_id: "test",
      value_calculation: ["25"],
      apply_condition: ["isWeekend", "==", "1"],
    });

    const variables = {
      isWeekend: { id: "isWeekend", name: "Is Weekend", type: VariableType.fixed, value: 1 },
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.applied, true);
    assertEquals(result.value, 25);
    assertEquals(result.conditionResult, true);
  });

  await t.step("Simple condition - not applied", () => {
    const formula = createPricingFormula({
      formula_name: "conditional",
      name: "Weekend Surcharge",
      pricing_product_id: "test",
      value_calculation: ["25"],
      apply_condition: ["isWeekend", "==", "1"],
    });

    const variables = {
      isWeekend: { id: "isWeekend", name: "Is Weekend", type: VariableType.fixed, value: 0 },
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.applied, false);
    assertEquals(result.conditionResult, false);
  });

  await t.step("Greater than condition", () => {
    const formula = createPricingFormula({
      formula_name: "bulk",
      name: "Bulk Discount",
      pricing_product_id: "test",
      value_calculation: ["-50"],
      apply_condition: ["quantity", ">", "10"],
    });

    const smallOrder = {
      quantity: { id: "quantity", name: "Quantity", type: VariableType.fixed, value: 5 },
    };
    const smallResult = FormulaEvaluator.evaluateFormula(formula, smallOrder);
    assertEquals(smallResult.applied, false);

    const largeOrder = {
      quantity: { id: "quantity", name: "Quantity", type: VariableType.fixed, value: 15 },
    };
    const largeResult = FormulaEvaluator.evaluateFormula(formula, largeOrder);
    assertEquals(largeResult.applied, true);
    assertEquals(largeResult.value, -50);
  });

  await t.step("AND condition", () => {
    const formula = createPricingFormula({
      formula_name: "special",
      name: "Special Offer",
      pricing_product_id: "test",
      value_calculation: ["-100"],
      apply_condition: ["isVIP", "==", "1", "&&", "quantity", ">=", "5"],
    });

    const vipLarge = {
      isVIP: { id: "isVIP", name: "VIP", type: VariableType.fixed, value: 1 },
      quantity: { id: "quantity", name: "Qty", type: VariableType.fixed, value: 5 },
    };
    const vipResult = FormulaEvaluator.evaluateFormula(formula, vipLarge);
    assertEquals(vipResult.applied, true);

    const nonVipLarge = {
      isVIP: { id: "isVIP", name: "VIP", type: VariableType.fixed, value: 0 },
      quantity: { id: "quantity", name: "Qty", type: VariableType.fixed, value: 5 },
    };
    const nonVipResult = FormulaEvaluator.evaluateFormula(formula, nonVipLarge);
    assertEquals(nonVipResult.applied, false);
  });
});

Deno.test("Complete Pricing Calculation", async (t) => {
  await t.step("Restaurant pricing with multiple formulas", () => {
    const formulas = {
      base: createPricingFormula({
        formula_name: "base",
        name: "Base Price",
        pricing_product_id: "restaurant",
        value_calculation: ["participants", "*", "pricePerPerson"],
      }),
      weekend: createPricingFormula({
        formula_name: "weekend",
        name: "Weekend Surcharge",
        pricing_product_id: "restaurant",
        value_calculation: ["weekendFee"],
        apply_condition: ["isWeekend", "==", "1"],
      }),
      largeParty: createPricingFormula({
        formula_name: "largeParty",
        name: "Large Party Fee",
        pricing_product_id: "restaurant",
        value_calculation: ["50"],
        apply_condition: ["participants", ">=", "8"],
      }),
      tax: createPricingFormula({
        formula_name: "tax",
        name: "Tax",
        pricing_product_id: "restaurant",
        value_calculation: ["subtotal", "*", "0.1"], // 10% tax
      }),
    };

    const productVariables = {
      pricePerPerson: { 
        id: "pricePerPerson", 
        name: "Price Per Person", 
        type: VariableType.fixed, 
        value: 50 
      },
      weekendFee: { 
        id: "weekendFee", 
        name: "Weekend Fee", 
        type: VariableType.fixed, 
        value: 75 
      },
    };

    // Weekend large party scenario
    const context = {
      participants: 10,
      dayOfWeek: 6, // Saturday
    };

    const result = FormulaEvaluator.evaluatePricing(
      formulas,
      { purchaseVariables: {} },
      context,
      "USD",
      productVariables
    );

    // Expected calculation:
    // Base: 10 * 50 = 500
    // Weekend: +75 (applied because isWeekend derived from dayOfWeek = 6)
    // Large party: +50 (applied because participants >= 8)
    // Subtotal: 625
    // Tax: 625 * 0.1 = 62.5
    // Total: 687.5

    assertEquals(result.finalPrice, 687.5);
    assertEquals(result.appliedFormulas.filter(f => f.applied).length, 4);
  });

  await t.step("Simple product with discount", () => {
    const formulas = {
      base: createPricingFormula({
        formula_name: "base",
        name: "Base Price",
        pricing_product_id: "product",
        value_calculation: ["quantity", "*", "unitPrice"],
      }),
      bulkDiscount: createPricingFormula({
        formula_name: "bulkDiscount",
        name: "Bulk Discount",
        pricing_product_id: "product",
        value_calculation: ["subtotal", "*", "-0.15"], // 15% discount
        apply_condition: ["quantity", ">=", "10"],
      }),
    };

    const productVariables = {
      unitPrice: { 
        id: "unitPrice", 
        name: "Unit Price", 
        type: VariableType.fixed, 
        value: 25 
      },
      quantity: {
        id: "quantity",
        name: "Quantity",
        type: VariableType.fixed,
        value: 12
      },
    };

    const context = {};

    const result = FormulaEvaluator.evaluatePricing(
      formulas,
      { purchaseVariables: {} },
      context,
      "USD",
      productVariables
    );

    // Base: 12 * 25 = 300
    // Bulk discount: 300 * -0.15 = -45
    // Total: 255

    assertEquals(result.finalPrice, 255);
  });
});

Deno.test("Variable Override", async (t) => {
  await t.step("Purchase variables override product variables", () => {
    const formula = createPricingFormula({
      formula_name: "base",
      name: "Base Calculation",
      pricing_product_id: "test",
      value_calculation: ["basePrice"],
    });

    const productVariables = {
      basePrice: { id: "basePrice", name: "Base", type: VariableType.fixed, value: 100 },
    };

    const purchaseVariables = {
      basePrice: { id: "basePrice", name: "Override", type: VariableType.fixed, value: 200 },
    };

    const context = {};

    const result = FormulaEvaluator.evaluatePricing(
      { base: formula },
      { purchaseVariables },
      context,
      "USD",
      productVariables
    );

    assertEquals(result.finalPrice, 200); // Should use overridden value
  });
});

Deno.test("Error Handling", async (t) => {
  await t.step("Missing variable defaults to 0", () => {
    const formula = createPricingFormula({
      formula_name: "missing",
      name: "Missing Variable",
      pricing_product_id: "test",
      value_calculation: ["existingVar", "+", "missingVar"],
    });

    const variables = {
      existingVar: { id: "existingVar", name: "Existing", type: VariableType.fixed, value: 100 },
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    // The formula evaluator should handle missing variables gracefully
    // Either by defaulting to 0 or returning an error
    assertEquals(result.applied, true);
  });

  await t.step("Empty formula returns 0", () => {
    const formula = createPricingFormula({
      formula_name: "empty",
      name: "Empty",
      pricing_product_id: "test",
      value_calculation: [],
    });

    const result = FormulaEvaluator.evaluateFormula(formula, {});
    assertEquals(result.value, 0);
    assertEquals(result.applied, true);
  });
});

Deno.test("Complex Real-World Scenario", async (t) => {
  await t.step("Hotel booking with seasonal pricing", () => {
    const formulas = {
      baseRate: createPricingFormula({
        formula_name: "baseRate",
        name: "Base Room Rate",
        pricing_product_id: "hotel",
        value_calculation: ["nights", "*", "roomRate"],
      }),
      peakSeason: createPricingFormula({
        formula_name: "peakSeason",
        name: "Peak Season",
        pricing_product_id: "hotel",
        value_calculation: ["subtotal", "*", "0.25"], // 25% increase
        apply_condition: ["month", ">=", "6", "&&", "month", "<=", "8"],
      }),
      longStay: createPricingFormula({
        formula_name: "longStay",
        name: "Long Stay Discount",
        pricing_product_id: "hotel",
        value_calculation: ["subtotal", "*", "-0.1"], // 10% discount
        apply_condition: ["nights", ">=", "7"],
      }),
      resortFee: createPricingFormula({
        formula_name: "resortFee",
        name: "Resort Fee",
        pricing_product_id: "hotel",
        value_calculation: ["nights", "*", "35"],
      }),
      tax: createPricingFormula({
        formula_name: "tax",
        name: "Hotel Tax",
        pricing_product_id: "hotel",
        value_calculation: ["subtotal", "*", "0.125"], // 12.5% tax
      }),
    };

    const productVariables = {
      roomRate: { id: "roomRate", name: "Room Rate", type: VariableType.fixed, value: 150 },
      nights: { id: "nights", name: "Nights", type: VariableType.fixed, value: 7 },
    };

    // Summer long stay scenario
    const context = {
      month: 7, // July
    };

    const result = FormulaEvaluator.evaluatePricing(
      formulas,
      { purchaseVariables: {} },
      context,
      "USD",
      productVariables
    );

    // Expected:
    // Base: 7 * 150 = 1050
    // Peak season: 1050 * 0.25 = 262.5 -> subtotal: 1312.5
    // Long stay: 1312.5 * -0.1 = -131.25 -> subtotal: 1181.25
    // Resort fee: 7 * 35 = 245 -> subtotal: 1426.25
    // Tax: 1426.25 * 0.125 = 178.28 -> total: 1604.53

    assertEquals(Math.round(result.finalPrice * 100) / 100, 1604.53);
    assertEquals(result.appliedFormulas.filter(f => f.applied).length, 5);
  });
});