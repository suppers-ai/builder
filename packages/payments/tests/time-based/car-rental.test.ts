import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { createProduct, getProductTags, Product } from "../../payment/product/product.ts";
import {
  createPricingPrice,
  createPricingProduct,
  getPriceAmount,
  PricingPrice,
  PricingProduct,
  setPriceAmount,
} from "../../payment/product/price/price.ts";
import {
  createPricingFormula,
  IPricingVariable,
  VariableType,
} from "../../payment/product/price/dynamic-pricing.ts";
import { PricingEngine } from "../../payment/product/price/pricing-engine.ts";
import { DayOfWeek, DayType } from "../../payment/date.ts";
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

Deno.test("Car Rental - Daily Rate Pricing", () => {
  const pricingProduct: PricingProduct = createPricingProduct({
    id: "economy-car-rental",
    name: "Economy Car Rental",
    description: "Compact economy car for daily rental",
  });

  const dailyRate: PricingPrice = createPricingPrice({
    name: "Economy Car Daily Rate",
    description: "Daily rate for economy car rental",
    pricing_product_id: pricingProduct.id,
    pricing_type: "fixed",
    target: "flat",
    interval: "per-unit",
  });

  // Set the amount using helper function
  const updatedDailyRate = setPriceAmount(dailyRate, { "USD": 45.00 });

  const economyCar: Product = createProduct({
    name: "Economy Car Rental",
    description: "Fuel-efficient compact car",
    seller_id: "test-seller",
    tags: { "rental": true, "vehicle": true, "economy": true },
  });

  assertExists(economyCar.id);
  const tags = getProductTags(economyCar);
  assertEquals(tags["rental"], true);
  const amount = getPriceAmount(updatedDailyRate);
  assertEquals(amount["USD"], 45.00);
});

Deno.test("Car Rental - Weekly Discount", () => {
  const productVariables: Record<string, IPricingVariable> = {
    dailyRate: {
      id: "dailyRate",
      name: "Daily Rental Rate",
      type: VariableType.fixed,
      value: 50.00,
    },
    weeklyDiscountRate: {
      id: "weeklyDiscountRate",
      name: "Weekly Discount Rate",
      type: VariableType.percentage,
      value: -15, // 15% discount
    },
    weeklyThreshold: {
      id: "weeklyThreshold",
      name: "Weekly Rental Threshold",
      type: VariableType.fixed,
      value: 7,
    },
  };

  const weeklyPricing = createPricingProduct({
    name: "Car Rental with Weekly Discount",
  });

  const formulas = {
    baseRate: createPricingFormula({
      formula_name: "baseRate",
      name: "Base Daily Rate",
      pricing_product_id: weeklyPricing.id,
      value_calculation: ["participants", "*", "dailyRate"],
    }),
    weeklyDiscount: createPricingFormula({
      formula_name: "weeklyDiscount",
      name: "Weekly Rental Discount",
      pricing_product_id: weeklyPricing.id,
      value_calculation: ["subtotal", "*", "weeklyDiscountRate", "/", "100"],
      apply_condition: ["participants", ">=", "weeklyThreshold"],
    }),
  };

  const rentalPrice: PricingPrice = createPricingPrice({
    name: "Car Rental with Weekly Discount",
    description: "Daily car rental with weekly discount",
    pricing_type: "dynamic",
    formula_names: ["baseRate", "weeklyDiscount"],
    target: "flat",
    interval: "per-unit",
    pricing_product_id: weeklyPricing.id,
  });

  // Test daily rental (no discount)
  const dailyResult = PricingEngine.calculatePrice(
    rentalPrice,
    Object.values(formulas),
    "USD",
    { participants: 5 },
    productVariables,
  );
  assertEquals(dailyResult.finalPrice, 250.00); // 5 * 50

  // Test weekly rental (with discount)
  const weeklyResult = PricingEngine.calculatePrice(
    rentalPrice,
    Object.values(formulas),
    "USD",
    { participants: 7 },
    productVariables,
  );
  assertEquals(weeklyResult.finalPrice, 297.50); // (7 * 50) - 15% = 350 - 52.5 = 297.5
});

Deno.test("Car Rental - Age-based Surcharge", () => {
  const productVariables: Record<string, IPricingVariable> = {
    standardRate: {
      id: "standardRate",
      name: "Standard Daily Rate",
      type: VariableType.fixed,
      value: 45.00,
    },
    youngDriverSurcharge: {
      id: "youngDriverSurcharge",
      name: "Young Driver Surcharge",
      type: VariableType.fixed,
      value: 15.00,
    },
    youngDriverMaxAge: {
      id: "youngDriverMaxAge",
      name: "Young Driver Maximum Age",
      type: VariableType.fixed,
      value: 24,
    },
    youngDriverMinAge: {
      id: "youngDriverMinAge",
      name: "Young Driver Minimum Age",
      type: VariableType.fixed,
      value: 21,
    },
  };

  const ageSurchargePricing = createPricingProduct({
    name: "Car Rental with Age-based Pricing",
  });

  const formulas = {
    baseRate: createPricingFormula({
      formula_name: "baseRate",
      name: "Base Rental Rate",
      pricing_product_id: ageSurchargePricing.id,
      value_calculation: ["participants", "*", "standardRate"],
    }),
    youngDriverFee: createPricingFormula({
      formula_name: "youngDriverFee",
      name: "Young Driver Surcharge",
      pricing_product_id: ageSurchargePricing.id,
      value_calculation: ["participants", "*", "youngDriverSurcharge"],
      apply_condition: [
        "driverAge",
        ">=",
        "youngDriverMinAge",
        "&&",
        "driverAge",
        "<=",
        "youngDriverMaxAge",
      ],
    }),
  };

  const ageBasedPrice: PricingPrice = createPricingPrice({
    name: "Car Rental with Age-based Pricing",
    description: "Car rental with young driver surcharge",
    pricing_type: "dynamic",
    formula_names: ["baseRate", "youngDriverFee"],
    target: "flat",
    interval: "per-unit",
    pricing_product_id: ageSurchargePricing.id,
  });

  // Test standard rate (driver over 24)
  const standardResult = PricingEngine.calculatePrice(
    ageBasedPrice,
    Object.values(formulas),
    "USD",
    { participants: 3, customVariables: { driverAge: 30 } },
    productVariables,
  );
  assertEquals(standardResult.finalPrice, 135.00); // 3 * 45

  // Test young driver surcharge
  const youngDriverResult = PricingEngine.calculatePrice(
    ageBasedPrice,
    Object.values(formulas),
    "USD",
    { participants: 3, customVariables: { driverAge: 23 } },
    productVariables,
  );
  assertEquals(youngDriverResult.finalPrice, 180.00); // (3 * 45) + (3 * 15)
});

Deno.test("Car Rental - Insurance and Add-ons", () => {
  const addOnPricing = createPricingProduct({
    name: "Car Rental with Insurance and Add-ons",
  });

  const baseRate: PricingPrice = setPriceAmount(
    createPricingPrice({
      name: "Base Rental Rate",
      pricing_product_id: addOnPricing.id,
      pricing_type: "fixed",
      target: "flat",
      interval: "per-unit",
    }),
    { "USD": 50.00 },
  );

  const insuranceFee: PricingPrice = setPriceAmount(
    createPricingPrice({
      name: "Full Coverage Insurance",
      pricing_product_id: addOnPricing.id,
      pricing_type: "fixed",
      target: "flat",
      interval: "per-unit",
    }),
    { "USD": 18.00 },
  );

  const gpsAddOn: PricingPrice = setPriceAmount(
    createPricingPrice({
      name: "GPS Navigation System",
      pricing_product_id: addOnPricing.id,
      pricing_type: "fixed",
      target: "flat",
      interval: "per-unit",
    }),
    { "USD": 8.00 },
  );

  // Test the pricing structure
  assertExists(addOnPricing.id);
  assertEquals(addOnPricing.name, "Car Rental with Insurance and Add-ons");

  // Test individual price amounts
  assertEquals(getPriceAmount(baseRate)["USD"], 50.00);
  assertEquals(getPriceAmount(insuranceFee)["USD"], 18.00); // Insurance
  assertEquals(getPriceAmount(gpsAddOn)["USD"], 8.00); // GPS
});

Deno.test("Car Rental - Complete Purchase Flow", () => {
  const billingItems: IBillingItem[] = [
    {
      name: "Economy Car Rental (5 days)",
      description: "Compact economy car - 5 days @ $45/day",
      quantity: 5,
      unitPrice: 45.00,
      total: 225.00,
    },
    {
      name: "Full Coverage Insurance (5 days)",
      description: "Comprehensive insurance coverage",
      quantity: 5,
      unitPrice: 18.00,
      total: 90.00,
    },
    {
      name: "Young Driver Surcharge (5 days)",
      description: "Additional fee for driver under 25",
      quantity: 5,
      unitPrice: 15.00,
      total: 75.00,
    },
    {
      name: "Airport Pickup Fee",
      description: "One-time fee for airport location",
      quantity: 1,
      unitPrice: 25.00,
      total: 25.00,
    },
    {
      name: "State Tax",
      description: "Local rental car tax",
      quantity: 1,
      unitPrice: 31.15,
      total: 31.15,
      isTax: true,
    },
  ];

  const carRentalPurchase: IPurchase = {
    id: crypto.randomUUID(),
    userId: "user-456",
    product: {
      id: "economy-car-rental",
      name: "Economy Car Rental",
      currency: "USD",
    },
    status: PurchaseStatus.confirmed,
    paymentData: {
      timestamp: Date.now(),
      paymentType: PaymentType.stripe,
      paymentId: "pi_car_rental_123",
    },
    purchaseData: {
      pickupDate: "2024-08-01",
      returnDate: "2024-08-06",
      pickupLocation: "LAX Airport - Terminal 1",
      returnLocation: "LAX Airport - Terminal 1",
      driverAge: 23,
      licenseNumber: "D1234567",
      vehicleType: "economy",
      addOns: ["full-insurance", "young-driver-fee"],
    },
    billingItems,
    verId: 1,
  };

  assertExists(carRentalPurchase.id);
  assertEquals(carRentalPurchase.status, PurchaseStatus.confirmed);
  assertEquals(carRentalPurchase.billingItems.length, 5);
  assertEquals(carRentalPurchase.purchaseData.driverAge, 23);
  assertEquals(carRentalPurchase.purchaseData.addOns.length, 2);

  // Calculate total
  const total = carRentalPurchase.billingItems.reduce((sum, item) => sum + item.total, 0);
  assertEquals(total, 446.15); // 225 + 90 + 75 + 25 + 31.15
});

Deno.test("Car Rental - Flexible Cancellation Policy", () => {
  const freeCancellation: CancellationPolicy = {
    id: "free-cancellation-48h",
    name: "Free Cancellation",
    description: "100% refund if cancelled more than 48 hours before pickup",
    refund: {
      type: RefundType.percentage,
      amount: 100,
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 48 * 60 * 60 * 1000, // 48 hours
    },
  };

  const partialRefund: CancellationPolicy = {
    id: "partial-refund-24h",
    name: "Partial Refund",
    description: "50% refund if cancelled between 24-48 hours before pickup",
    refund: {
      type: RefundType.percentage,
      amount: 50,
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  const noRefund: CancellationPolicy = {
    id: "no-refund-24h",
    name: "No Refund",
    description: "No refund for cancellations within 24 hours of pickup",
    refund: {
      type: RefundType.percentage,
      amount: 0,
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 0,
    },
  };

  const cancellationPolicy: ICancellationPolicy = {
    id: "car-rental-cancellation",
    name: "Car Rental Cancellation Policy",
    policies: {
      "before-48h": freeCancellation,
      "24h-48h": partialRefund,
      "within-24h": noRefund,
    },
  };

  assertEquals(Object.keys(cancellationPolicy.policies).length, 3);
  assertEquals(cancellationPolicy.policies["before-48h"].refund?.amount, 100);
  assertEquals(cancellationPolicy.policies["24h-48h"].refund?.amount, 50);
  assertEquals(cancellationPolicy.policies["within-24h"].refund?.amount, 0);
});

Deno.test("Car Rental - Premium Vehicle Upgrade", () => {
  const productVariables: Record<string, IPricingVariable> = {
    economyRate: {
      id: "economyRate",
      name: "Economy Car Rate",
      type: VariableType.fixed,
      value: 45.00,
    },
    premiumUpgradeRate: {
      id: "premiumUpgradeRate",
      name: "Premium Upgrade Rate",
      type: VariableType.fixed,
      value: 25.00,
    },
    luxuryUpgradeRate: {
      id: "luxuryUpgradeRate",
      name: "Luxury Upgrade Rate",
      type: VariableType.fixed,
      value: 55.00,
    },
  };

  const upgradePricing = createPricingProduct({
    name: "Car Rental with Vehicle Upgrades",
  });

  const formulas = {
    baseRate: createPricingFormula({
      formula_name: "baseRate",
      name: "Base Economy Rate",
      pricing_product_id: upgradePricing.id,
      value_calculation: ["participants", "*", "economyRate"],
    }),
    premiumUpgrade: createPricingFormula({
      formula_name: "premiumUpgrade",
      name: "Premium Vehicle Upgrade",
      pricing_product_id: upgradePricing.id,
      value_calculation: ["participants", "*", "premiumUpgradeRate"],
      apply_condition: ["vehicleType", "==", 2],
    }),
    luxuryUpgrade: createPricingFormula({
      formula_name: "luxuryUpgrade",
      name: "Luxury Vehicle Upgrade",
      pricing_product_id: upgradePricing.id,
      value_calculation: ["participants", "*", "luxuryUpgradeRate"],
      apply_condition: ["vehicleType", "==", 3],
    }),
  };

  const upgradePrice: PricingPrice = createPricingPrice({
    name: "Car Rental with Vehicle Upgrades",
    description: "Car rental with premium and luxury upgrade options",
    pricing_type: "dynamic",
    formula_names: ["baseRate", "premiumUpgrade", "luxuryUpgrade"],
    target: "flat",
    interval: "per-unit",
    pricing_product_id: upgradePricing.id,
  });

  // Test economy rate (no upgrade)
  const economyResult = PricingEngine.calculatePrice(
    upgradePrice,
    Object.values(formulas),
    "USD",
    { participants: 3, customVariables: { vehicleType: 1 } }, // 1 = economy
    productVariables,
  );
  assertEquals(economyResult.finalPrice, 135.00); // 3 * 45

  // Test premium upgrade
  const premiumResult = PricingEngine.calculatePrice(
    upgradePrice,
    Object.values(formulas),
    "USD",
    { participants: 3, customVariables: { vehicleType: 2 } }, // 2 = premium
    productVariables,
  );
  assertEquals(premiumResult.finalPrice, 210.00); // (3 * 45) + (3 * 25)

  // Test luxury upgrade
  const luxuryResult = PricingEngine.calculatePrice(
    upgradePrice,
    Object.values(formulas),
    "USD",
    { participants: 3, customVariables: { vehicleType: 3 } }, // 3 = luxury
    productVariables,
  );
  assertEquals(luxuryResult.finalPrice, 300.00); // (3 * 45) + (3 * 55)
});
