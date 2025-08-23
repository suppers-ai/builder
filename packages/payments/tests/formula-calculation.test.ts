import { assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { FormulaEvaluator } from "../payment/product/price/formula-evaluator.ts";
import { PricingEngine } from "../payment/product/price/pricing-engine.ts";
import {
  createPricingPrice,
  PricingFormula,
  PricingPrice,
} from "../payment/product/price/price.ts";
import {
  createPricingFormula,
  IPricingVariable,
  VariableType,
  VariableUtils,
} from "../payment/product/price/dynamic-pricing.ts";

// ============================================================================
// TEST SUITE: Formula Calculation Engine
// ============================================================================

Deno.test("Formula Calculations - Basic Operations", async (t) => {
  // Test data setup
  const createVariable = (id: string, value: number): IPricingVariable => ({
    id,
    name: id,
    type: VariableType.fixed,
    value,
  });

  await t.step("Addition", () => {
    const formula = createPricingFormula({
      formula_name: "addition",
      name: "Addition Test",
      pricing_product_id: "test",
      value_calculation: ["a", "+", "b"],
    });

    const variables = {
      a: createVariable("a", 10),
      b: createVariable("b", 20),
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.value, 30);
    assertEquals(result.applied, true);
  });

  await t.step("Subtraction", () => {
    const formula = createPricingFormula({
      formula_name: "subtraction",
      name: "Subtraction Test",
      pricing_product_id: "test",
      value_calculation: ["a", "-", "b"],
    });

    const variables = {
      a: createVariable("a", 50),
      b: createVariable("b", 30),
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.value, 20);
  });

  await t.step("Multiplication", () => {
    const formula = createPricingFormula({
      formula_name: "multiplication",
      name: "Multiplication Test",
      pricing_product_id: "test",
      value_calculation: ["a", "*", "b"],
    });

    const variables = {
      a: createVariable("a", 7),
      b: createVariable("b", 8),
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.value, 56);
  });

  await t.step("Division", () => {
    const formula = createPricingFormula({
      formula_name: "division",
      name: "Division Test",
      pricing_product_id: "test",
      value_calculation: ["a", "/", "b"],
    });

    const variables = {
      a: createVariable("a", 100),
      b: createVariable("b", 4),
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.value, 25);
  });

  await t.step("Mixed Operations with Parentheses", () => {
    const formula = createPricingFormula({
      formula_name: "mixed",
      name: "Mixed Operations",
      pricing_product_id: "test",
      value_calculation: ["(", "a", "+", "b", ")", "*", "c", "-", "d"],
    });

    const variables = {
      a: createVariable("a", 10),
      b: createVariable("b", 5),
      c: createVariable("c", 3),
      d: createVariable("d", 15),
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.value, 30); // (10 + 5) * 3 - 15 = 45 - 15 = 30
  });
});

Deno.test("Formula Calculations - Percentage Calculations", async (t) => {
  await t.step("Percentage Increase", () => {
    const formula = createPricingFormula({
      formula_name: "percentage_increase",
      name: "20% Increase",
      pricing_product_id: "test",
      value_calculation: ["basePrice", "*", "(", "1", "+", "increase", "/", "100", ")"],
    });

    const variables = {
      basePrice: { id: "basePrice", name: "Base Price", type: VariableType.fixed, value: 100 },
      increase: { id: "increase", name: "Increase %", type: VariableType.percentage, value: 20 },
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.value, 120); // 100 * (1 + 20/100) = 120
  });

  await t.step("Percentage Discount", () => {
    const formula = createPricingFormula({
      formula_name: "percentage_discount",
      name: "15% Discount",
      pricing_product_id: "test",
      value_calculation: ["basePrice", "*", "(", "1", "-", "discount", "/", "100", ")"],
    });

    const variables = {
      basePrice: { id: "basePrice", name: "Base Price", type: VariableType.fixed, value: 200 },
      discount: { id: "discount", name: "Discount %", type: VariableType.percentage, value: 15 },
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.value, 170); // 200 * (1 - 15/100) = 170
  });

  await t.step("Compound Percentage", () => {
    const formula = createPricingFormula({
      formula_name: "compound",
      name: "Compound Calculation",
      pricing_product_id: "test",
      value_calculation: [
        "basePrice", "*", 
        "(", "1", "+", "surcharge", "/", "100", ")", "*",
        "(", "1", "-", "discount", "/", "100", ")"
      ],
    });

    const variables = {
      basePrice: { id: "basePrice", name: "Base", type: VariableType.fixed, value: 100 },
      surcharge: { id: "surcharge", name: "Surcharge", type: VariableType.percentage, value: 10 },
      discount: { id: "discount", name: "Discount", type: VariableType.percentage, value: 20 },
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.value, 88); // 100 * 1.1 * 0.8 = 88
  });
});

Deno.test("Formula Calculations - Conditional Logic", async (t) => {
  await t.step("Simple Equality Condition", () => {
    const formula = createPricingFormula({
      formula_name: "conditional",
      name: "Weekend Surcharge",
      pricing_product_id: "test",
      value_calculation: ["surcharge"],
      apply_condition: ["isWeekend", "==", "1"],
    });

    const weekendVars = {
      surcharge: { id: "surcharge", name: "Surcharge", type: VariableType.fixed, value: 25 },
      isWeekend: { id: "isWeekend", name: "Is Weekend", type: VariableType.fixed, value: 1 },
    };

    const weekendResult = FormulaEvaluator.evaluateFormula(formula, weekendVars);
    assertEquals(weekendResult.applied, true);
    assertEquals(weekendResult.value, 25);

    const weekdayVars = { ...weekendVars, isWeekend: { ...weekendVars.isWeekend, value: 0 } };
    const weekdayResult = FormulaEvaluator.evaluateFormula(formula, weekdayVars);
    assertEquals(weekdayResult.applied, false);
  });

  await t.step("Greater Than Condition", () => {
    const formula = createPricingFormula({
      formula_name: "bulk_discount",
      name: "Bulk Discount",
      pricing_product_id: "test",
      value_calculation: ["quantity", "*", "discountPerUnit"],
      apply_condition: ["quantity", ">", "10"],
    });

    const variables = {
      quantity: { id: "quantity", name: "Quantity", type: VariableType.fixed, value: 15 },
      discountPerUnit: { id: "discountPerUnit", name: "Discount", type: VariableType.fixed, value: -2 },
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.applied, true);
    assertEquals(result.value, -30); // 15 * -2
  });

  await t.step("Complex AND Condition", () => {
    const formula = createPricingFormula({
      formula_name: "special_offer",
      name: "Special Offer",
      pricing_product_id: "test",
      value_calculation: ["offerAmount"],
      apply_condition: ["quantity", ">=", "5", "&&", "isVIP", "==", "1"],
    });

    const variables = {
      quantity: { id: "quantity", name: "Quantity", type: VariableType.fixed, value: 5 },
      isVIP: { id: "isVIP", name: "Is VIP", type: VariableType.fixed, value: 1 },
      offerAmount: { id: "offerAmount", name: "Offer", type: VariableType.fixed, value: -50 },
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.applied, true);
    assertEquals(result.value, -50);
  });

  await t.step("Complex OR Condition", () => {
    const formula = createPricingFormula({
      formula_name: "peak_pricing",
      name: "Peak Pricing",
      pricing_product_id: "test",
      value_calculation: ["peakCharge"],
      apply_condition: ["hour", "<", "9", "||", "hour", ">", "17"],
    });

    const morningVars = {
      hour: { id: "hour", name: "Hour", type: VariableType.fixed, value: 7 },
      peakCharge: { id: "peakCharge", name: "Peak Charge", type: VariableType.fixed, value: 15 },
    };

    const morningResult = FormulaEvaluator.evaluateFormula(formula, morningVars);
    assertEquals(morningResult.applied, true);

    const eveningVars = { ...morningVars, hour: { ...morningVars.hour, value: 19 } };
    const eveningResult = FormulaEvaluator.evaluateFormula(formula, eveningVars);
    assertEquals(eveningResult.applied, true);

    const middayVars = { ...morningVars, hour: { ...morningVars.hour, value: 12 } };
    const middayResult = FormulaEvaluator.evaluateFormula(formula, middayVars);
    assertEquals(middayResult.applied, false);
  });
});

Deno.test("Formula Calculations - Real-World Scenarios", async (t) => {
  await t.step("Restaurant Pricing with Time-based Surcharges", () => {
    const formulas = {
      base: createPricingFormula({
        formula_name: "base",
        name: "Base Price",
        pricing_product_id: "restaurant",
        value_calculation: ["guests", "*", "pricePerPerson"],
      }),
      weekend: createPricingFormula({
        formula_name: "weekend",
        name: "Weekend Surcharge",
        pricing_product_id: "restaurant",
        value_calculation: ["subtotal", "*", "weekendRate", "/", "100"],
        apply_condition: ["isWeekend", "==", "1"],
      }),
      peakHour: createPricingFormula({
        formula_name: "peakHour",
        name: "Peak Hour Surcharge",
        pricing_product_id: "restaurant",
        value_calculation: ["subtotal", "*", "peakRate", "/", "100"],
        apply_condition: ["hour", ">=", "18", "&&", "hour", "<=", "21"],
      }),
      largeParty: createPricingFormula({
        formula_name: "largeParty",
        name: "Large Party Fee",
        pricing_product_id: "restaurant",
        value_calculation: ["largePartyFee"],
        apply_condition: ["guests", ">=", "8"],
      }),
      serviceFee: createPricingFormula({
        formula_name: "serviceFee",
        name: "Service Fee",
        pricing_product_id: "restaurant",
        value_calculation: ["subtotal", "*", "serviceRate", "/", "100"],
      }),
    };

    const productVariables = {
      pricePerPerson: { id: "pricePerPerson", name: "Price/Person", type: VariableType.fixed, value: 45 },
      weekendRate: { id: "weekendRate", name: "Weekend Rate", type: VariableType.percentage, value: 15 },
      peakRate: { id: "peakRate", name: "Peak Rate", type: VariableType.percentage, value: 20 },
      largePartyFee: { id: "largePartyFee", name: "Large Party Fee", type: VariableType.fixed, value: 50 },
      serviceRate: { id: "serviceRate", name: "Service Rate", type: VariableType.percentage, value: 18 },
    };

    const context = {
      guests: 10,
      dayOfWeek: 6, // Saturday
      hour: 19, // 7 PM
    };

    const result = FormulaEvaluator.evaluatePricing(
      formulas,
      { purchaseVariables: {} },
      context,
      "USD",
      productVariables
    );

    // Base: 10 * 45 = 450
    // Weekend: 450 * 15% = 67.5 -> subtotal: 517.5
    // Peak hour: 517.5 * 20% = 103.5 -> subtotal: 621
    // Large party: +50 -> subtotal: 671
    // Service: 671 * 18% = 120.78 -> total: 791.78

    assertEquals(result.finalPrice, 791.78);
    assertEquals(result.appliedFormulas.filter(f => f.applied).length, 5);
  });

  await t.step("Hotel Dynamic Pricing with Occupancy", () => {
    const formulas = {
      base: createPricingFormula({
        formula_name: "base",
        name: "Base Room Rate",
        pricing_product_id: "hotel",
        value_calculation: ["nights", "*", "roomRate"],
      }),
      occupancy: createPricingFormula({
        formula_name: "occupancy",
        name: "High Occupancy Surcharge",
        pricing_product_id: "hotel",
        value_calculation: [
          "subtotal", "*", "(", "occupancyRate", "-", "75", ")", "/", "100"
        ],
        apply_condition: ["occupancyRate", ">", "75"],
      }),
      longStay: createPricingFormula({
        formula_name: "longStay",
        name: "Long Stay Discount",
        pricing_product_id: "hotel",
        value_calculation: ["subtotal", "*", "-0.1"],
        apply_condition: ["nights", ">=", "7"],
      }),
      earlyBooking: createPricingFormula({
        formula_name: "earlyBooking",
        name: "Early Booking Discount",
        pricing_product_id: "hotel",
        value_calculation: ["subtotal", "*", "earlyBookingRate", "/", "100"],
        apply_condition: ["daysInAdvance", ">", "30"],
      }),
      resortFee: createPricingFormula({
        formula_name: "resortFee",
        name: "Resort Fee",
        pricing_product_id: "hotel",
        value_calculation: ["nights", "*", "resortFeePerNight"],
      }),
      taxes: createPricingFormula({
        formula_name: "taxes",
        name: "Taxes",
        pricing_product_id: "hotel",
        value_calculation: ["subtotal", "*", "taxRate", "/", "100"],
      }),
    };

    const productVariables = {
      roomRate: { id: "roomRate", name: "Room Rate", type: VariableType.fixed, value: 200 },
      resortFeePerNight: { id: "resortFeePerNight", name: "Resort Fee", type: VariableType.fixed, value: 35 },
      earlyBookingRate: { id: "earlyBookingRate", name: "Early Booking", type: VariableType.percentage, value: -8 },
      taxRate: { id: "taxRate", name: "Tax Rate", type: VariableType.percentage, value: 14.5 },
    };

    const context = {
      nights: 7,
      occupancyRate: 85,
      daysInAdvance: 45,
    };

    const result = FormulaEvaluator.evaluatePricing(
      formulas,
      { purchaseVariables: {} },
      context,
      "USD",
      productVariables
    );

    // Base: 7 * 200 = 1400
    // Occupancy (85% - 75% = 10%): 1400 * 0.1 = 140 -> subtotal: 1540
    // Long stay discount: 1540 * -0.1 = -154 -> subtotal: 1386
    // Early booking: 1386 * -8% = -110.88 -> subtotal: 1275.12
    // Resort fee: 7 * 35 = 245 -> subtotal: 1520.12
    // Taxes: 1520.12 * 14.5% = 220.42 -> total: 1740.54

    assertEquals(Math.round(result.finalPrice * 100) / 100, 1740.54);
  });

  await t.step("E-commerce with Tiered Pricing", () => {
    const formulas = {
      base: createPricingFormula({
        formula_name: "base",
        name: "Base Price",
        pricing_product_id: "ecommerce",
        value_calculation: ["quantity", "*", "unitPrice"],
      }),
      tier1: createPricingFormula({
        formula_name: "tier1",
        name: "Tier 1 Discount (10+ items)",
        pricing_product_id: "ecommerce",
        value_calculation: ["subtotal", "*", "-0.05"],
        apply_condition: ["quantity", ">=", "10", "&&", "quantity", "<", "25"],
      }),
      tier2: createPricingFormula({
        formula_name: "tier2",
        name: "Tier 2 Discount (25+ items)",
        pricing_product_id: "ecommerce",
        value_calculation: ["subtotal", "*", "-0.10"],
        apply_condition: ["quantity", ">=", "25", "&&", "quantity", "<", "50"],
      }),
      tier3: createPricingFormula({
        formula_name: "tier3",
        name: "Tier 3 Discount (50+ items)",
        pricing_product_id: "ecommerce",
        value_calculation: ["subtotal", "*", "-0.15"],
        apply_condition: ["quantity", ">=", "50"],
      }),
      shipping: createPricingFormula({
        formula_name: "shipping",
        name: "Shipping",
        pricing_product_id: "ecommerce",
        value_calculation: ["shippingBase", "+", "(", "quantity", "*", "shippingPerItem", ")"],
        apply_condition: ["subtotal", "<", "100"],
      }),
      tax: createPricingFormula({
        formula_name: "tax",
        name: "Sales Tax",
        pricing_product_id: "ecommerce",
        value_calculation: ["subtotal", "*", "salesTax", "/", "100"],
      }),
    };

    const productVariables = {
      unitPrice: { id: "unitPrice", name: "Unit Price", type: VariableType.fixed, value: 15 },
      shippingBase: { id: "shippingBase", name: "Base Shipping", type: VariableType.fixed, value: 10 },
      shippingPerItem: { id: "shippingPerItem", name: "Per Item Ship", type: VariableType.fixed, value: 0.5 },
      salesTax: { id: "salesTax", name: "Sales Tax", type: VariableType.percentage, value: 8.25 },
    };

    // Test Tier 2 pricing
    const context = { quantity: 30 };

    const result = FormulaEvaluator.evaluatePricing(
      formulas,
      { purchaseVariables: {} },
      context,
      "USD",
      productVariables
    );

    // Base: 30 * 15 = 450
    // Tier 2 discount: 450 * -0.10 = -45 -> subtotal: 405
    // Shipping: Not applied (subtotal >= 100)
    // Tax: 405 * 8.25% = 33.41 -> total: 438.41

    assertEquals(Math.round(result.finalPrice * 100) / 100, 438.41);
  });

  await t.step("Service Appointment with Duration-based Pricing", () => {
    const formulas = {
      base: createPricingFormula({
        formula_name: "base",
        name: "Hourly Rate",
        pricing_product_id: "service",
        value_calculation: ["duration", "/", "60", "*", "hourlyRate"],
      }),
      premium: createPricingFormula({
        formula_name: "premium",
        name: "Premium Service",
        pricing_product_id: "service",
        value_calculation: ["subtotal", "*", "premiumMultiplier"],
        apply_condition: ["isPremium", "==", "1"],
      }),
      urgency: createPricingFormula({
        formula_name: "urgency",
        name: "Urgent Service",
        pricing_product_id: "service",
        value_calculation: ["urgentFee"],
        apply_condition: ["hoursNotice", "<", "24"],
      }),
      afterHours: createPricingFormula({
        formula_name: "afterHours",
        name: "After Hours",
        pricing_product_id: "service",
        value_calculation: ["subtotal", "*", "0.5"],
        apply_condition: ["hour", "<", "8", "||", "hour", ">=", "18"],
      }),
      firstTime: createPricingFormula({
        formula_name: "firstTime",
        name: "First Time Customer",
        pricing_product_id: "service",
        value_calculation: ["subtotal", "*", "firstTimeRate", "/", "100"],
        apply_condition: ["isFirstTime", "==", "1"],
      }),
    };

    const productVariables = {
      hourlyRate: { id: "hourlyRate", name: "Hourly Rate", type: VariableType.fixed, value: 120 },
      premiumMultiplier: { id: "premiumMultiplier", name: "Premium", type: VariableType.fixed, value: 0.25 },
      urgentFee: { id: "urgentFee", name: "Urgent Fee", type: VariableType.fixed, value: 75 },
      firstTimeRate: { id: "firstTimeRate", name: "First Time", type: VariableType.percentage, value: -20 },
    };

    const context = {
      duration: 90, // 1.5 hours
      isPremium: 1,
      hoursNotice: 12,
      hour: 19,
      isFirstTime: true,
    };

    const result = FormulaEvaluator.evaluatePricing(
      formulas,
      { purchaseVariables: {} },
      context,
      "USD",
      productVariables
    );

    // Base: 90/60 * 120 = 180
    // Premium: 180 * 0.25 = 45 -> subtotal: 225
    // Urgency: +75 -> subtotal: 300
    // After hours: 300 * 0.5 = 150 -> subtotal: 450
    // First time: 450 * -20% = -90 -> total: 360

    assertEquals(result.finalPrice, 360);
  });
});

Deno.test("Formula Calculations - Edge Cases", async (t) => {
  await t.step("Division by Zero", () => {
    const formula = createPricingFormula({
      formula_name: "divide_by_zero",
      name: "Division by Zero",
      pricing_product_id: "test",
      value_calculation: ["a", "/", "b"],
    });

    const variables = {
      a: { id: "a", name: "A", type: VariableType.fixed, value: 100 },
      b: { id: "b", name: "B", type: VariableType.fixed, value: 0 },
    };

    // FormulaEvaluator should handle division by zero gracefully
    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    // Division by zero should result in NaN or Infinity, but formula still applies
    assertEquals(isNaN(result.value) || !isFinite(result.value), true);
    assertEquals(result.applied, true);
  });

  await t.step("Missing Variable", () => {
    const formula = createPricingFormula({
      formula_name: "missing_var",
      name: "Missing Variable",
      pricing_product_id: "test",
      value_calculation: ["a", "+", "b"],
    });

    const variables = {
      a: { id: "a", name: "A", type: VariableType.fixed, value: 10 },
      // b is missing
    };

    // Missing variables should be treated as 0
    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.value, 10); // a + 0 (missing b defaults to 0)
    assertEquals(result.applied, true);
  });

  await t.step("Empty Formula", () => {
    const formula = createPricingFormula({
      formula_name: "empty",
      name: "Empty Formula",
      pricing_product_id: "test",
      value_calculation: [],
    });

    const variables = {};

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.value, 0);
    assertEquals(result.applied, true);
  });

  await t.step("Very Large Numbers", () => {
    const formula = createPricingFormula({
      formula_name: "large_numbers",
      name: "Large Numbers",
      pricing_product_id: "test",
      value_calculation: ["a", "*", "b", "*", "c"],
    });

    const variables = {
      a: { id: "a", name: "A", type: VariableType.fixed, value: 1000000 },
      b: { id: "b", name: "B", type: VariableType.fixed, value: 1000000 },
      c: { id: "c", name: "C", type: VariableType.fixed, value: 0.000001 },
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.value, 1000000); // Should handle large numbers correctly
  });

  await t.step("Negative Results", () => {
    const formula = createPricingFormula({
      formula_name: "negative",
      name: "Negative Result",
      pricing_product_id: "test",
      value_calculation: ["a", "-", "b"],
    });

    const variables = {
      a: { id: "a", name: "A", type: VariableType.fixed, value: 10 },
      b: { id: "b", name: "B", type: VariableType.fixed, value: 50 },
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.value, -40);
  });

  await t.step("Complex Nested Parentheses", () => {
    const formula = createPricingFormula({
      formula_name: "nested",
      name: "Nested Parentheses",
      pricing_product_id: "test",
      value_calculation: [
        "(", "(", "a", "+", "b", ")", "*", "(", "c", "-", "d", ")", ")",
        "/", "(", "e", "+", "f", ")"
      ],
    });

    const variables = {
      a: { id: "a", name: "A", type: VariableType.fixed, value: 10 },
      b: { id: "b", name: "B", type: VariableType.fixed, value: 20 },
      c: { id: "c", name: "C", type: VariableType.fixed, value: 15 },
      d: { id: "d", name: "D", type: VariableType.fixed, value: 5 },
      e: { id: "e", name: "E", type: VariableType.fixed, value: 3 },
      f: { id: "f", name: "F", type: VariableType.fixed, value: 2 },
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    // ((10 + 20) * (15 - 5)) / (3 + 2) = (30 * 10) / 5 = 300 / 5 = 60
    assertEquals(result.value, 60);
  });
});

Deno.test("Formula Calculations - System Variables", async (t) => {
  await t.step("Date-based Calculations", () => {
    const formula = createPricingFormula({
      formula_name: "seasonal",
      name: "Seasonal Pricing",
      pricing_product_id: "test",
      value_calculation: ["basePrice", "*", "seasonMultiplier"],
      apply_condition: ["month", ">=", "6", "&&", "month", "<=", "8"],
    });

    const summerVariables = {
      basePrice: { id: "basePrice", name: "Base", type: VariableType.fixed, value: 100 },
      seasonMultiplier: { id: "seasonMultiplier", name: "Multiplier", type: VariableType.fixed, value: 1.5 },
      month: { id: "month", name: "Month", type: VariableType.fixed, value: 7 },
    };

    const summerResult = FormulaEvaluator.evaluateFormula(formula, summerVariables);
    assertEquals(summerResult.value, 150);
    assertEquals(summerResult.applied, true);

    const winterVariables = { ...summerVariables, month: { ...summerVariables.month, value: 12 } };
    const winterResult = FormulaEvaluator.evaluateFormula(formula, winterVariables);
    assertEquals(winterResult.applied, false);
  });

  await t.step("Day of Week Calculations", () => {
    const formula = createPricingFormula({
      formula_name: "weekday_discount",
      name: "Weekday Discount",
      pricing_product_id: "test",
      value_calculation: ["basePrice", "*", "weekdayDiscount"],
      apply_condition: ["dayOfWeek", ">=", "1", "&&", "dayOfWeek", "<=", "5"],
    });

    const variables = {
      basePrice: { id: "basePrice", name: "Base", type: VariableType.fixed, value: 100 },
      weekdayDiscount: { id: "weekdayDiscount", name: "Discount", type: VariableType.fixed, value: 0.9 },
      dayOfWeek: { id: "dayOfWeek", name: "Day", type: VariableType.fixed, value: 3 }, // Wednesday
    };

    const result = FormulaEvaluator.evaluateFormula(formula, variables);
    assertEquals(result.value, 90);
    assertEquals(result.applied, true);
  });
});

Deno.test("Formula Calculations - Multi-Currency Support", async (t) => {
  await t.step("Currency Conversion", () => {
    const price = createPricingPrice({
      name: "International Pricing",
      pricing_type: "dynamic",
      formula_names: ["base"],
      target: "flat",
      interval: "flat",
      pricing_product_id: "test",
      amount: {
        USD: 100,
        EUR: 85,
        GBP: 75,
      },
    });

    const formulas = [
      createPricingFormula({
        formula_name: "base",
        name: "Base Price",
        pricing_product_id: "test",
        value_calculation: ["1"], // Just return 1 to use the base amount
      }),
    ];

    const variables = {};
    const context = {};

    // Test USD
    const usdResult = PricingEngine.calculatePrice(
      price,
      formulas,
      "USD",
      context,
      variables
    );
    assertEquals(usdResult.finalPrice, 100);

    // Test EUR
    const eurResult = PricingEngine.calculatePrice(
      price,
      formulas,
      "EUR",
      context,
      variables
    );
    assertEquals(eurResult.finalPrice, 85);

    // Test GBP
    const gbpResult = PricingEngine.calculatePrice(
      price,
      formulas,
      "GBP",
      context,
      variables
    );
    assertEquals(gbpResult.finalPrice, 75);
  });
});

Deno.test("Formula Calculations - Performance", async (t) => {
  await t.step("Handle 100+ formulas efficiently", () => {
    const formulas: { [key: string]: PricingFormula } = {};
    
    // Create 100 formulas
    for (let i = 0; i < 100; i++) {
      formulas[`formula_${i}`] = createPricingFormula({
        formula_name: `formula_${i}`,
        name: `Formula ${i}`,
        pricing_product_id: "test",
        value_calculation: ["1"], // Simple calculation
        apply_condition: i % 2 === 0 ? ["always", "==", "1"] : undefined,
      });
    }

    const variables = {
      always: { id: "always", name: "Always", type: VariableType.fixed, value: 1 },
    };

    const startTime = performance.now();
    const result = FormulaEvaluator.evaluatePricing(
      formulas,
      { purchaseVariables: {} },
      {},
      "USD",
      variables
    );
    const endTime = performance.now();

    // Should complete in reasonable time (< 100ms)
    assertEquals((endTime - startTime) < 100, true);
    assertEquals(result.appliedFormulas.length, 100);
  });
});