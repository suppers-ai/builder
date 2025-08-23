// Pricing Engine Test
// Simple test to verify pricing calculation functionality

import { PricingContext, PricingEngine, PricingEngineFormula } from "./pricing-engine.ts";

// Test data - Restaurant booking scenario
const restaurantFormulas: PricingEngineFormula[] = [
  {
    formula_name: "baseCalculation",
    name: "Base Price",
    description: "Standard price per person",
    value_calculation: [{ type: "variable", value: "basePrice" }],
  },
  {
    formula_name: "weekendSurcharge",
    name: "Weekend Premium",
    description: "20% surcharge for weekend bookings",
    value_calculation: [
      {
        type: "multiply",
        left: { type: "variable", value: "basePrice" },
        right: {
          type: "divide",
          left: { type: "variable", value: "weekendSurcharge" },
          right: { type: "literal", value: 100 },
        },
      },
    ],
    apply_condition: [
      {
        type: "weekday",
        operator: "in",
        value: ["saturday", "sunday"],
      },
    ],
  },
  {
    formula_name: "groupDiscount",
    name: "Group Discount",
    description: "10% discount for groups of 5 or more",
    value_calculation: [
      {
        type: "multiply",
        left: { type: "variable", value: "basePrice" },
        right: {
          type: "subtract",
          left: { type: "literal", value: 0 },
          right: {
            type: "divide",
            left: { type: "variable", value: "groupDiscount" },
            right: { type: "literal", value: 100 },
          },
        },
      },
    ],
    apply_condition: [
      {
        type: "participants",
        operator: "greater_than_equal",
        value: 5,
      },
    ],
  },
];

// Test contexts
const weekdayContext: PricingContext = {
  variables: {
    basePrice: 25,
    weekendSurcharge: 20,
    groupDiscount: 10,
  },
  quantity: 2,
  participants: 2,
  eventDate: new Date("2024-03-12"), // Tuesday
};

const weekendContext: PricingContext = {
  variables: {
    basePrice: 25,
    weekendSurcharge: 20,
    groupDiscount: 10,
  },
  quantity: 6,
  participants: 6,
  eventDate: new Date("2024-03-16"), // Saturday
};

// Run tests
console.log("🧪 Testing Pricing Engine\n");

console.log("📅 Weekday Booking (2 people):");
const weekdayResult = PricingEngine.calculatePrice(restaurantFormulas, weekdayContext);
console.log("Base:", weekdayResult.baseAmount);
console.log("Adjustments:", weekdayResult.adjustments.length);
console.log("Total:", weekdayResult.totalAmount);
console.log("Breakdown:", weekdayResult.breakdown.join(" | "));
console.log("Expected: $25 (base only)\n");

console.log("🎉 Weekend Group Booking (6 people):");
const weekendResult = PricingEngine.calculatePrice(restaurantFormulas, weekendContext);
console.log("Base:", weekendResult.baseAmount);
console.log("Adjustments:", weekendResult.adjustments.map((a) => `${a.name}: $${a.amount}`));
console.log("Total:", weekendResult.totalAmount);
console.log("Breakdown:", weekendResult.breakdown.join(" | "));
console.log("Expected: $25 + $5 (weekend) - $2.50 (group) = $27.50\n");

// Validation test
console.log("🔍 Formula Validation Test:");
const validationResult = PricingEngine.validateFormula([
  {
    type: "multiply",
    left: { type: "variable", value: "basePrice" },
    right: { type: "literal", value: 1.2 },
  },
]);
console.log("Valid:", validationResult.valid);
console.log("Errors:", validationResult.errors);

console.log("\n✅ Pricing Engine Tests Complete!");
