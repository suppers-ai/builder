import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PricingFormula, PricingPrice, PricingProduct } from "../../payment/product/price/price.ts";
import { IPricingVariable, VariableType } from "../../payment/product/price/dynamic-pricing.ts";
import { PricingEngine } from "../../payment/product/price/pricing-engine.ts";

Deno.test("Hotel Booking - Basic Room Pricing", () => {
  const productVariables: Record<string, IPricingVariable> = {
    roomRate: {
      id: "roomRate",
      name: "Room Rate per Night",
      type: VariableType.fixed,
      value: 150,
    },
  };

  const formulas: PricingFormula[] = [
    {
      id: crypto.randomUUID(),
      pricing_product_id: "standard-room",
      formula_name: "baseRate",
      name: "Base Room Rate",
      description: null,
      value_calculation: ["participants", "*", "roomRate"],
      apply_condition: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const roomPrice: PricingPrice = {
    id: crypto.randomUUID(),
    name: "Standard Hotel Room",
    description: "Comfortable hotel room with amenities",
    pricing_product_id: "standard-room",
    pricing_type: "dynamic",
    target: "per-participant",
    interval: "per-unit",
    amount: null,
    formula_names: ["baseRate"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const pricingProduct: PricingProduct = {
    id: "standard-room",
    name: "Standard Hotel Room",
    description: "Well-appointed room for business or leisure",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const result = PricingEngine.calculatePrice(
    roomPrice,
    formulas,
    "USD",
    { participants: 2 }, // 2 nights
    productVariables,
  );

  assertEquals(result.finalPrice, 300); // 2 * 150
});

Deno.test("Hotel Booking - Weekend and Peak Season Pricing", () => {
  const productVariables: Record<string, IPricingVariable> = {
    baseRoomRate: {
      id: "baseRoomRate",
      name: "Base Room Rate",
      type: VariableType.fixed,
      value: 120,
    },
    weekendSurcharge: {
      id: "weekendSurcharge",
      name: "Weekend Surcharge",
      type: VariableType.fixed,
      value: 40,
    },
    peakSeasonMultiplier: {
      id: "peakSeasonMultiplier",
      name: "Peak Season Multiplier",
      type: VariableType.fixed,
      value: 0.5, // 50% increase
    },
    resortFee: {
      id: "resortFee",
      name: "Resort Fee",
      type: VariableType.fixed,
      value: 25,
    },
  };

  const formulas: PricingFormula[] = [
    {
      id: crypto.randomUUID(),
      pricing_product_id: "resort-room",
      formula_name: "baseRate",
      name: "Base Rate",
      description: null,
      value_calculation: ["participants", "*", "baseRoomRate"],
      apply_condition: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      pricing_product_id: "resort-room",
      formula_name: "weekendSurcharge",
      name: "Weekend Surcharge",
      description: null,
      value_calculation: ["weekendSurcharge"],
      apply_condition: ["isWeekend", "==", 1],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      pricing_product_id: "resort-room",
      formula_name: "peakSeasonAdjustment",
      name: "Peak Season Adjustment",
      description: null,
      value_calculation: ["subtotal", "*", "peakSeasonMultiplier"],
      apply_condition: ["month", ">=", 6, "&&", "month", "<=", 8], // Summer
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      pricing_product_id: "resort-room",
      formula_name: "resortFee",
      name: "Resort Fee",
      description: null,
      value_calculation: ["resortFee"],
      apply_condition: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const dynamicRoomPrice: PricingPrice = {
    id: crypto.randomUUID(),
    name: "Dynamic Resort Room",
    description: "Resort room with dynamic pricing",
    pricing_product_id: "resort-room",
    pricing_type: "dynamic",
    target: "per-participant",
    interval: "per-unit",
    amount: null,
    formula_names: ["baseRate", "weekendSurcharge", "peakSeasonAdjustment", "resortFee"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const pricingProduct: PricingProduct = {
    id: "resort-room",
    name: "Resort Room",
    description: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Test weekend summer pricing
  const summerWeekendResult = PricingEngine.calculatePrice(
    dynamicRoomPrice,
    formulas,
    "USD",
    {
      participants: 3, // 3 nights
      dayOfWeek: 6, // Saturday
      month: 7, // July
    },
    productVariables,
  );

  // Base: 3 * 120 = 360
  // Weekend: +40
  // Subtotal: 400
  // Peak season: 400 * 0.5 = 200
  // Subtotal: 600
  // Resort fee: +25
  // Total: 625
  assertEquals(summerWeekendResult.finalPrice, 625);

  // Test weekday off-season pricing
  const offSeasonResult = PricingEngine.calculatePrice(
    dynamicRoomPrice,
    formulas,
    "USD",
    {
      participants: 3,
      dayOfWeek: 2, // Tuesday
      month: 3, // March
    },
    productVariables,
  );

  // Base: 3 * 120 = 360
  // Resort fee: +25
  // Total: 385 (no weekend or peak season charges)
  assertEquals(offSeasonResult.finalPrice, 385);
});

Deno.test("Hotel Booking - Group Discounts and Loyalty Program", () => {
  const productVariables: Record<string, IPricingVariable> = {
    roomRate: {
      id: "roomRate",
      name: "Room Rate",
      type: VariableType.fixed,
      value: 180,
    },
    groupDiscountThreshold: {
      id: "groupDiscountThreshold",
      name: "Group Discount Threshold",
      type: VariableType.fixed,
      value: 5,
    },
    groupDiscountRate: {
      id: "groupDiscountRate",
      name: "Group Discount Rate",
      type: VariableType.percentage,
      value: -15,
    },
    loyaltyDiscountRate: {
      id: "loyaltyDiscountRate",
      name: "Loyalty Discount Rate",
      type: VariableType.percentage,
      value: -10,
    },
    cancellationFee: {
      id: "cancellationFee",
      name: "Cancellation Insurance",
      type: VariableType.fixed,
      value: 20,
    },
  };

  const formulas: PricingFormula[] = [
    {
      id: crypto.randomUUID(),
      pricing_product_id: "group-booking",
      formula_name: "baseBooking",
      name: "Base Booking",
      description: null,
      value_calculation: ["participants", "*", "roomRate"],
      apply_condition: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      pricing_product_id: "group-booking",
      formula_name: "groupDiscount",
      name: "Group Discount",
      description: null,
      value_calculation: ["subtotal", "*", "groupDiscountRate", "/", "100"],
      apply_condition: ["participants", ">=", "groupDiscountThreshold"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      pricing_product_id: "group-booking",
      formula_name: "loyaltyDiscount",
      name: "Loyalty Discount",
      description: null,
      value_calculation: ["subtotal", "*", "loyaltyDiscountRate", "/", "100"],
      apply_condition: ["isLoyaltyMember", "==", 1],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      pricing_product_id: "group-booking",
      formula_name: "cancellationInsurance",
      name: "Cancellation Insurance",
      description: null,
      value_calculation: ["cancellationFee"],
      apply_condition: ["wantsCancellationInsurance", "==", 1],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const groupBookingPrice: PricingPrice = {
    id: crypto.randomUUID(),
    name: "Group Hotel Booking",
    description: "Hotel booking with group and loyalty discounts",
    pricing_product_id: "group-booking",
    pricing_type: "dynamic",
    target: "per-participant",
    interval: "per-unit",
    amount: null,
    formula_names: ["baseBooking", "groupDiscount", "loyaltyDiscount", "cancellationInsurance"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const pricingProduct: PricingProduct = {
    id: "group-booking",
    name: "Group Hotel Booking",
    description: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Test large group with loyalty member
  const groupLoyaltyResult = PricingEngine.calculatePrice(
    groupBookingPrice,
    formulas,
    "USD",
    {
      participants: 8, // 8 room nights
      customVariables: {
        isLoyaltyMember: 1,
        wantsCancellationInsurance: 1,
      },
    },
    productVariables,
  );

  // Base: 8 * 180 = 1440
  // Group discount: 1440 * -15 / 100 = -216
  // Subtotal: 1224
  // Loyalty discount: 1224 * -10 / 100 = -122.4
  // Subtotal: 1101.6
  // Cancellation insurance: +20
  // Total: 1121.6
  assertEquals(groupLoyaltyResult.finalPrice, 1121.6);

  // Test small booking, no extras
  const basicResult = PricingEngine.calculatePrice(
    groupBookingPrice,
    formulas,
    "USD",
    {
      participants: 2,
      customVariables: {
        isLoyaltyMember: 0,
        wantsCancellationInsurance: 0,
      },
    },
    productVariables,
  );

  assertEquals(basicResult.finalPrice, 360); // 2 * 180, no discounts
});

Deno.test("Hotel Booking - Advanced Occupancy-Based Pricing", () => {
  const productVariables: Record<string, IPricingVariable> = {
    baseRate: {
      id: "baseRate",
      name: "Base Rate",
      type: VariableType.fixed,
      value: 200,
    },
    lowOccupancyDiscount: {
      id: "lowOccupancyDiscount",
      name: "Low Occupancy Discount",
      type: VariableType.percentage,
      value: -20,
    },
    highOccupancyPremium: {
      id: "highOccupancyPremium",
      name: "High Occupancy Premium",
      type: VariableType.percentage,
      value: 30,
    },
    cityTax: {
      id: "cityTax",
      name: "City Tax",
      type: VariableType.fixed,
      value: 3.5,
    },
  };

  const formulas: PricingFormula[] = [
    {
      id: crypto.randomUUID(),
      pricing_product_id: "occupancy-room",
      formula_name: "baseRoomRate",
      name: "Base Room Rate",
      description: null,
      value_calculation: ["participants", "*", "baseRate"],
      apply_condition: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      pricing_product_id: "occupancy-room",
      formula_name: "lowOccupancyAdjustment",
      name: "Low Occupancy Discount",
      description: null,
      value_calculation: ["subtotal", "*", "lowOccupancyDiscount", "/", "100"],
      apply_condition: ["occupancyRate", "<", 30], // Less than 30% occupancy
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      pricing_product_id: "occupancy-room",
      formula_name: "highOccupancyAdjustment",
      name: "High Occupancy Premium",
      description: null,
      value_calculation: ["subtotal", "*", "highOccupancyPremium", "/", "100"],
      apply_condition: ["occupancyRate", ">", 85], // More than 85% occupancy
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      pricing_product_id: "occupancy-room",
      formula_name: "cityTaxPerNight",
      name: "City Tax",
      description: null,
      value_calculation: ["participants", "*", "cityTax"],
      apply_condition: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const occupancyBasedPrice: PricingPrice = {
    id: crypto.randomUUID(),
    name: "Occupancy-Based Room Rate",
    description: "Dynamic pricing based on hotel occupancy",
    pricing_product_id: "occupancy-room",
    pricing_type: "dynamic",
    target: "per-participant",
    interval: "per-unit",
    amount: null,
    formula_names: [
      "baseRoomRate",
      "lowOccupancyAdjustment",
      "highOccupancyAdjustment",
      "cityTaxPerNight",
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const pricingProduct: PricingProduct = {
    id: "occupancy-room",
    name: "Occupancy-Based Room",
    description: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Test low occupancy scenario
  const lowOccupancyResult = PricingEngine.calculatePrice(
    occupancyBasedPrice,
    formulas,
    "USD",
    {
      participants: 4,
      customVariables: { occupancyRate: 25 }, // 25% occupancy
    },
    productVariables,
  );

  // Base: 4 * 200 = 800
  // Low occupancy discount: 800 * -20 / 100 = -160
  // Subtotal: 640
  // City tax: 4 * 3.5 = 14
  // Total: 654
  assertEquals(lowOccupancyResult.finalPrice, 654);

  // Test high occupancy scenario
  const highOccupancyResult = PricingEngine.calculatePrice(
    occupancyBasedPrice,
    formulas,
    "USD",
    {
      participants: 4,
      customVariables: { occupancyRate: 90 }, // 90% occupancy
    },
    productVariables,
  );

  // Base: 4 * 200 = 800
  // High occupancy premium: 800 * 30 / 100 = 240
  // Subtotal: 1040
  // City tax: 4 * 3.5 = 14
  // Total: 1054
  assertEquals(highOccupancyResult.finalPrice, 1054);

  // Test normal occupancy (no adjustments)
  const normalOccupancyResult = PricingEngine.calculatePrice(
    occupancyBasedPrice,
    formulas,
    "USD",
    {
      participants: 4,
      customVariables: { occupancyRate: 65 }, // 65% occupancy
    },
    productVariables,
  );

  // Base: 4 * 200 = 800
  // City tax: 4 * 3.5 = 14
  // Total: 814 (no occupancy adjustments)
  assertEquals(normalOccupancyResult.finalPrice, 814);
});
