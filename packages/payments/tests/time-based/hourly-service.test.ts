import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { createProduct, getProductTags, Product } from "../../payment/product/product.ts";
import {
  getPriceAmount,
  PricingFormula,
  PricingPrice,
  PricingProduct,
} from "../../payment/product/price/price.ts";
import { IPricingVariable, VariableType } from "../../payment/product/price/dynamic-pricing.ts";
import { PricingEngine } from "../../payment/product/price/pricing-engine.ts";
import {
  IBillingItem,
  IPurchase,
  PaymentType,
  PurchaseStatus,
} from "../../payment/purchase/purchase.ts";
import {
  CancellationConditionType,
  CancellationPolicy,
  ICancellationPolicy,
} from "../../payment/product/cancellation/cancellation.ts";
import { RefundType } from "../../payment/refund.ts";

Deno.test("Hourly Service - Cleaning Service Pricing", () => {
  const hourlyRate: PricingPrice = {
    id: crypto.randomUUID(),
    name: "House Cleaning Hourly Rate",
    description: "Professional house cleaning service per hour",
    pricing_product_id: "house-cleaning-service",
    pricing_type: "fixed",
    target: "flat",
    interval: "per-unit",
    amount: { "USD": 35.00 },
    formula_names: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const pricingProduct: PricingProduct = {
    id: "house-cleaning-service",
    name: "Professional House Cleaning",
    description: "Expert house cleaning service",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const cleaningService: Product = createProduct({
    name: "House Cleaning Service",
    description: "Professional residential cleaning",
    seller_id: "test-seller",
    tags: { "service": true, "cleaning": true, "hourly": true },
  });

  assertExists(cleaningService.id);
  const tags = getProductTags(cleaningService);
  assertEquals(tags["hourly"], true);
  const amount = getPriceAmount(hourlyRate);
  assertEquals(amount["USD"], 35.00);
});

Deno.test("Hourly Service - Time Slot Restrictions", () => {
  const productVariables: Record<string, IPricingVariable> = {
    standardHourlyRate: {
      id: "standardHourlyRate",
      name: "Standard Hourly Rate",
      type: VariableType.fixed,
      value: 35.00,
    },
    eveningSurcharge: {
      id: "eveningSurcharge",
      name: "Evening Service Surcharge",
      type: VariableType.fixed,
      value: 10.00,
    },
  };

  const formulas: PricingFormula[] = [
    {
      id: crypto.randomUUID(),
      pricing_product_id: "cleaning-time-based",
      formula_name: "baseRate",
      name: "Base Hourly Rate",
      description: null,
      value_calculation: ["participants", "*", "standardHourlyRate"],
      apply_condition: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      pricing_product_id: "cleaning-time-based",
      formula_name: "eveningFee",
      name: "Evening Surcharge",
      description: null,
      value_calculation: ["participants", "*", "eveningSurcharge"],
      apply_condition: ["isEveningHours", "==", 1],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const hourlyPrice: PricingPrice = {
    id: crypto.randomUUID(),
    name: "Time-based Cleaning Service",
    description: "Hourly cleaning service with time-based pricing",
    pricing_product_id: "cleaning-time-based",
    pricing_type: "dynamic",
    target: "flat",
    interval: "per-unit",
    amount: null,
    formula_names: ["baseRate", "eveningFee"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const timeBasedPricing: PricingProduct = {
    id: "cleaning-time-based",
    name: "Time-based Cleaning Service",
    description: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Test business hours (no surcharge)
  const businessResult = PricingEngine.calculatePrice(
    hourlyPrice,
    formulas,
    "USD",
    { participants: 4, customVariables: { isEveningHours: 0 } },
    productVariables,
  );
  assertEquals(businessResult.finalPrice, 140.00); // 4 * 35

  // Test evening hours (with surcharge)
  const eveningResult = PricingEngine.calculatePrice(
    hourlyPrice,
    formulas,
    "USD",
    { participants: 4, customVariables: { isEveningHours: 1 } },
    productVariables,
  );
  assertEquals(eveningResult.finalPrice, 180.00); // (4 * 35) + (4 * 10)
});

Deno.test("Hourly Service - Weekend Premium", () => {
  const productVariables: Record<string, IPricingVariable> = {
    baseHourlyRate: {
      id: "baseHourlyRate",
      name: "Base Hourly Rate",
      type: VariableType.fixed,
      value: 35.00,
    },
    weekendPremiumRate: {
      id: "weekendPremiumRate",
      name: "Weekend Premium Rate",
      type: VariableType.percentage,
      value: 20, // 20% premium
    },
  };

  const formulas: PricingFormula[] = [
    {
      id: crypto.randomUUID(),
      pricing_product_id: "cleaning-weekend-premium",
      formula_name: "baseRate",
      name: "Base Rate",
      description: null,
      value_calculation: ["participants", "*", "baseHourlyRate"],
      apply_condition: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      pricing_product_id: "cleaning-weekend-premium",
      formula_name: "weekendPremium",
      name: "Weekend Premium",
      description: null,
      value_calculation: ["subtotal", "*", "weekendPremiumRate", "/", "100"],
      apply_condition: ["isWeekend", "==", 1],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const cleaningPrice: PricingPrice = {
    id: crypto.randomUUID(),
    name: "Cleaning with Weekend Premium",
    description: "Hourly cleaning service with weekend pricing",
    pricing_product_id: "cleaning-weekend-premium",
    pricing_type: "dynamic",
    target: "flat",
    interval: "per-unit",
    amount: null,
    formula_names: ["baseRate", "weekendPremium"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const weekendPricing: PricingProduct = {
    id: "cleaning-weekend-premium",
    name: "Cleaning with Weekend Premium",
    description: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Test weekday pricing
  const weekdayResult = PricingEngine.calculatePrice(
    cleaningPrice,
    formulas,
    "USD",
    { participants: 4, customVariables: { isWeekend: 0 } },
    productVariables,
  );
  assertEquals(weekdayResult.finalPrice, 140.00); // 4 * 35

  // Test weekend pricing (with premium)
  const weekendResult = PricingEngine.calculatePrice(
    cleaningPrice,
    formulas,
    "USD",
    { participants: 4, customVariables: { isWeekend: 1 } },
    productVariables,
  );
  assertEquals(weekendResult.finalPrice, 168.00); // 140 + 20%
});

Deno.test("Hourly Service - Tutoring with Bulk Discount", () => {
  const productVariables: Record<string, IPricingVariable> = {
    tutoringHourlyRate: {
      id: "tutoringHourlyRate",
      name: "Tutoring Hourly Rate",
      type: VariableType.fixed,
      value: 50.00,
    },
    bulkDiscountRate: {
      id: "bulkDiscountRate",
      name: "Bulk Discount Rate",
      type: VariableType.percentage,
      value: -15, // 15% discount
    },
    bulkThreshold: {
      id: "bulkThreshold",
      name: "Bulk Discount Threshold",
      type: VariableType.fixed,
      value: 10,
    },
  };

  const formulas: PricingFormula[] = [
    {
      id: crypto.randomUUID(),
      pricing_product_id: "tutoring-bulk-discount",
      formula_name: "baseRate",
      name: "Base Tutoring Rate",
      description: null,
      value_calculation: ["participants", "*", "tutoringHourlyRate"],
      apply_condition: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      pricing_product_id: "tutoring-bulk-discount",
      formula_name: "bulkDiscount",
      name: "Bulk Discount",
      description: null,
      value_calculation: ["subtotal", "*", "bulkDiscountRate", "/", "100"],
      apply_condition: ["participants", ">=", "bulkThreshold"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const tutoringPrice: PricingPrice = {
    id: crypto.randomUUID(),
    name: "Tutoring with Bulk Discount",
    description: "Hourly tutoring with bulk package discounts",
    pricing_product_id: "tutoring-bulk-discount",
    pricing_type: "dynamic",
    target: "flat",
    interval: "per-unit",
    amount: null,
    formula_names: ["baseRate", "bulkDiscount"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const tutoringPricing: PricingProduct = {
    id: "tutoring-bulk-discount",
    name: "Tutoring with Bulk Discount",
    description: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Test regular pricing (no discount)
  const regularResult = PricingEngine.calculatePrice(
    tutoringPrice,
    formulas,
    "USD",
    { participants: 5 },
    productVariables,
  );
  assertEquals(regularResult.finalPrice, 250.00); // 5 * 50

  // Test bulk discount
  const bulkResult = PricingEngine.calculatePrice(
    tutoringPrice,
    formulas,
    "USD",
    { participants: 12 },
    productVariables,
  );
  assertEquals(bulkResult.finalPrice, 510.00); // (12 * 50) - 15% = 600 - 90 = 510
});

Deno.test("Hourly Service - Complete Purchase Flow", () => {
  const billingItems: IBillingItem[] = [
    {
      name: "House Cleaning Service (4 hours)",
      description: "Deep cleaning service - 4 hours @ $35/hour",
      quantity: 4,
      unitPrice: 35.00,
      total: 140.00,
    },
    {
      name: "Weekend Premium (4 hours)",
      description: "Weekend service surcharge",
      quantity: 4,
      unitPrice: 7.00,
      total: 28.00,
    },
    {
      name: "Supply Fee",
      description: "Cleaning supplies and equipment",
      quantity: 1,
      unitPrice: 15.00,
      total: 15.00,
    },
    {
      name: "Service Tax",
      description: "Local service tax",
      quantity: 1,
      unitPrice: 14.64,
      total: 14.64,
      isTax: true,
    },
  ];

  const hourlyServicePurchase: IPurchase = {
    id: crypto.randomUUID(),
    userId: "user-789",
    product: {
      id: "house-cleaning-service",
      name: "Professional House Cleaning",
      currency: "USD",
    },
    status: PurchaseStatus.pending, // Awaiting approval
    paymentData: {
      timestamp: Date.now(),
      paymentType: PaymentType.stripe,
      paymentId: "pi_cleaning_123",
    },
    purchaseData: {
      serviceDate: "2024-08-10",
      serviceTime: "10:00:00",
      duration: 4, // hours
      serviceType: "deep-cleaning",
      propertySize: "3-bedroom-house",
      specialInstructions: "Please focus on kitchen and bathrooms, pet-friendly products only",
      address: {
        street: "123 Main St",
        city: "Springfield",
        state: "IL",
        zip: "62701",
      },
    },
    billingItems,
    verId: 1,
  };

  assertExists(hourlyServicePurchase.id);
  assertEquals(hourlyServicePurchase.status, PurchaseStatus.pending);
  assertEquals(hourlyServicePurchase.billingItems.length, 4);
  assertEquals(hourlyServicePurchase.purchaseData.duration, 4);
  assertEquals(hourlyServicePurchase.purchaseData.serviceType, "deep-cleaning");

  // Calculate total
  const total = hourlyServicePurchase.billingItems.reduce((sum, item) => sum + item.total, 0);
  assertEquals(total, 197.64); // 140 + 28 + 15 + 14.64
});

Deno.test("Hourly Service - Last-Minute Cancellation Policy", () => {
  const standardCancellation: CancellationPolicy = {
    id: "standard-cancellation-24h",
    name: "Standard Cancellation",
    description: "100% refund if cancelled more than 24 hours in advance",
    refund: {
      type: RefundType.percentage,
      amount: 100,
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  const shortNoticeCancellation: CancellationPolicy = {
    id: "short-notice-12h",
    name: "Short Notice Cancellation",
    description: "50% refund if cancelled between 12-24 hours in advance",
    refund: {
      type: RefundType.percentage,
      amount: 50,
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 12 * 60 * 60 * 1000, // 12 hours
    },
  };

  const lastMinuteCancellation: CancellationPolicy = {
    id: "last-minute-2h",
    name: "Last Minute Cancellation",
    description: "25% refund if cancelled more than 2 hours in advance",
    refund: {
      type: RefundType.percentage,
      amount: 25,
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 2 * 60 * 60 * 1000, // 2 hours
    },
  };

  const serviceCancellationPolicy: ICancellationPolicy = {
    id: "hourly-service-cancellation",
    name: "Hourly Service Cancellation Policy",
    policies: {
      "before-24h": standardCancellation,
      "12h-24h": shortNoticeCancellation,
      "2h-12h": lastMinuteCancellation,
      "within-2h": {
        ...lastMinuteCancellation,
        refund: { type: RefundType.percentage, amount: 0 },
      },
    },
  };

  assertEquals(Object.keys(serviceCancellationPolicy.policies).length, 4);
  assertEquals(serviceCancellationPolicy.policies["before-24h"].refund?.amount, 100);
  assertEquals(serviceCancellationPolicy.policies["12h-24h"].refund?.amount, 50);
  assertEquals(serviceCancellationPolicy.policies["2h-12h"].refund?.amount, 25);
  assertEquals(serviceCancellationPolicy.policies["within-2h"].refund?.amount, 0);
});

Deno.test("Hourly Service - Personal Training with Group Discount", () => {
  const productVariables: Record<string, IPricingVariable> = {
    personalTrainingRate: {
      id: "personalTrainingRate",
      name: "Personal Training Rate",
      type: VariableType.fixed,
      value: 75.00,
    },
    groupDiscountPerPerson: {
      id: "groupDiscountPerPerson",
      name: "Group Discount Per Person",
      type: VariableType.fixed,
      value: -25.00, // Discount per person
    },
    groupMinSize: {
      id: "groupMinSize",
      name: "Group Minimum Size",
      type: VariableType.fixed,
      value: 2,
    },
  };

  const formulas: PricingFormula[] = [
    {
      id: crypto.randomUUID(),
      pricing_product_id: "personal-training-group",
      formula_name: "baseRate",
      name: "Base Training Rate",
      description: null,
      value_calculation: ["participants", "*", "personalTrainingRate"],
      apply_condition: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      pricing_product_id: "personal-training-group",
      formula_name: "groupDiscount",
      name: "Group Training Discount",
      description: null,
      value_calculation: ["participants", "*", "groupDiscountPerPerson"],
      apply_condition: ["participants", ">=", "groupMinSize"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const trainingPrice: PricingPrice = {
    id: crypto.randomUUID(),
    name: "Personal Training with Group Options",
    description: "Personal training with group discounts",
    pricing_product_id: "personal-training-group",
    pricing_type: "dynamic",
    target: "flat",
    interval: "per-unit",
    amount: null,
    formula_names: ["baseRate", "groupDiscount"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const trainingPricing: PricingProduct = {
    id: "personal-training-group",
    name: "Personal Training with Group Options",
    description: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Test single person (no discount)
  const singleResult = PricingEngine.calculatePrice(
    trainingPrice,
    formulas,
    "USD",
    { participants: 1 },
    productVariables,
  );
  assertEquals(singleResult.finalPrice, 75.00); // 1 * 75

  // Test group training (with discount)
  const groupResult = PricingEngine.calculatePrice(
    trainingPrice,
    formulas,
    "USD",
    { participants: 3 },
    productVariables,
  );
  assertEquals(groupResult.finalPrice, 150.00); // (3 * 75) + (3 * -25) = 225 - 75 = 150
});
