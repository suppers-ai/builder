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
import { DayOfWeek, DayType, ITimeSlot } from "../../payment/date.ts";
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

Deno.test("Subscription - Basic Monthly SaaS", () => {
  const pricingProduct: PricingProduct = createPricingProduct({
    id: "saas-monthly-subscription",
    name: "SaaS Monthly Subscription",
    description: "Project management software subscription",
  });

  const monthlyPrice: PricingPrice = setPriceAmount(
    createPricingPrice({
      name: "Monthly Subscription",
      description: "Monthly access to premium features",
      pricing_product_id: pricingProduct.id,
      pricing_type: "fixed",
      target: "flat",
      interval: "flat",
    }),
    { "USD": 29.99 },
  );

  const monthlySubscription: Product = createProduct({
    seller_id: "test-seller",
    name: "Project Management Software",
    description: "Comprehensive project management solution",
    tags: { "subscription": true, "saas": true, "software": true },
  });

  assertExists(monthlySubscription.id);
  const tags = getProductTags(monthlySubscription);
  assertEquals(tags["subscription"], true);
  assertEquals(tags["saas"], true);
  assertEquals(getPriceAmount(monthlyPrice)["USD"], 29.99);
});

Deno.test("Subscription - Tiered Pricing (Basic, Pro, Enterprise)", () => {
  const productVariables: Record<string, IPricingVariable> = {
    basicTierPrice: {
      id: "basicTierPrice",
      name: "Basic Tier Price",
      type: VariableType.fixed,
      value: 9.99,
    },
    proTierUpgrade: {
      id: "proTierUpgrade",
      name: "Pro Tier Upgrade",
      type: VariableType.fixed,
      value: 15.00,
    },
    enterpriseTierUpgrade: {
      id: "enterpriseTierUpgrade",
      name: "Enterprise Tier Upgrade",
      type: VariableType.fixed,
      value: 40.00,
    },
  };

  const tieredPricing = createPricingProduct({
    name: "Tiered Subscription Plans",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Basic Tier Price",
      pricing_product_id: tieredPricing.id,
      value_calculation: ["basicTierPrice"],
    }),
    proUpgrade: createPricingFormula({
      formula_name: "proUpgrade",
      name: "Pro Tier Upgrade",
      pricing_product_id: tieredPricing.id,
      value_calculation: ["proTierUpgrade"],
      apply_condition: ["subscriptionTier", "==", 2], // 1=basic, 2=pro, 3=enterprise
    }),
    enterpriseUpgrade: createPricingFormula({
      formula_name: "enterpriseUpgrade",
      name: "Enterprise Tier Upgrade",
      pricing_product_id: tieredPricing.id,
      value_calculation: ["enterpriseTierUpgrade"],
      apply_condition: ["subscriptionTier", "==", 3], // 1=basic, 2=pro, 3=enterprise
    }),
  };

  const tieredPrice: PricingPrice = createPricingPrice({
    name: "Tiered Subscription Plans",
    description: "Flexible subscription plans for different needs",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "proUpgrade", "enterpriseUpgrade"],
    target: "flat",
    interval: "flat",
    pricing_product_id: tieredPricing.id,
  });

  // Test basic tier
  const basicResult = PricingEngine.calculatePrice(
    tieredPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { subscriptionTier: 1 } }, // 1=basic
    productVariables,
  );
  assertEquals(basicResult.finalPrice, 9.99);

  // Test pro tier
  const proResult = PricingEngine.calculatePrice(
    tieredPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { subscriptionTier: 2 } }, // 2=pro
    productVariables,
  );
  assertEquals(proResult.finalPrice, 24.99); // 9.99 + 15.00

  // Test enterprise tier
  const enterpriseResult = PricingEngine.calculatePrice(
    tieredPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { subscriptionTier: 3 } }, // 3=enterprise
    productVariables,
  );
  assertEquals(enterpriseResult.finalPrice, 49.99); // 9.99 + 40.00
});

Deno.test("Subscription - Annual Discount", () => {
  const productVariables: Record<string, IPricingVariable> = {
    monthlyPrice: {
      id: "monthlyPrice",
      name: "Monthly Subscription Price",
      type: VariableType.fixed,
      value: 19.99,
    },
    annualDiscountRate: {
      id: "annualDiscountRate",
      name: "Annual Billing Discount Rate",
      type: VariableType.percentage,
      value: -20, // 20% discount
    },
  };

  const annualPricing = createPricingProduct({
    name: "Subscription with Annual Discount",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Base Monthly Price",
      pricing_product_id: annualPricing.id,
      value_calculation: ["monthlyPrice"],
    }),
    annualDiscount: createPricingFormula({
      formula_name: "annualDiscount",
      name: "Annual Billing Discount",
      pricing_product_id: annualPricing.id,
      value_calculation: ["subtotal", "*", "annualDiscountRate", "/", "100"],
      apply_condition: ["billingCycle", "==", 2], // 1=monthly, 2=annual, 3=quarterly
    }),
  };

  const subscriptionPrice: PricingPrice = createPricingPrice({
    name: "Subscription with Annual Discount",
    description: "Monthly subscription with optional annual discount",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "annualDiscount"],
    target: "flat",
    interval: "flat",
    pricing_product_id: annualPricing.id,
  });

  // Test monthly billing (no discount)
  const monthlyResult = PricingEngine.calculatePrice(
    subscriptionPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { billingCycle: 1 } }, // 1=monthly
    productVariables,
  );
  assertEquals(monthlyResult.finalPrice, 19.99);

  // Test annual billing (with discount)
  const annualResult = PricingEngine.calculatePrice(
    subscriptionPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { billingCycle: 2 } }, // 2=annual
    productVariables,
  );
  assertEquals(annualResult.finalPrice, 15.99); // 19.99 - (19.99 * 20%)
});

Deno.test("Subscription - Usage-based Add-ons", () => {
  const productVariables: Record<string, IPricingVariable> = {
    baseSubscriptionPrice: {
      id: "baseSubscriptionPrice",
      name: "Base Subscription Price",
      type: VariableType.fixed,
      value: 49.99,
    },
    additionalUserPrice: {
      id: "additionalUserPrice",
      name: "Additional User Price",
      type: VariableType.fixed,
      value: 8.99,
    },
    additionalStoragePrice: {
      id: "additionalStoragePrice",
      name: "Additional Storage Price",
      type: VariableType.fixed,
      value: 9.99,
    },
    includedUsers: {
      id: "includedUsers",
      name: "Included Users",
      type: VariableType.fixed,
      value: 5,
    },
  };

  const usageBasedPricing = createPricingProduct({
    name: "Subscription with Usage-based Add-ons",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Base Subscription",
      pricing_product_id: usageBasedPricing.id,
      value_calculation: ["baseSubscriptionPrice"],
    }),
    extraUsers: createPricingFormula({
      formula_name: "extraUsers",
      name: "Additional Users",
      pricing_product_id: usageBasedPricing.id,
      value_calculation: ["(", "totalUsers", "-", "includedUsers", ")", "*", "additionalUserPrice"],
      apply_condition: ["totalUsers", ">", "includedUsers"],
    }),
    extraStorage: createPricingFormula({
      formula_name: "extraStorage",
      name: "Additional Storage",
      pricing_product_id: usageBasedPricing.id,
      value_calculation: ["storageBlocks", "*", "additionalStoragePrice"],
      apply_condition: ["storageBlocks", ">", 0],
    }),
  };

  const usagePrice: PricingPrice = createPricingPrice({
    name: "Usage-based Subscription",
    description: "Base plan with usage-based add-ons",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "extraUsers", "extraStorage"],
    target: "flat",
    interval: "flat",
    pricing_product_id: usageBasedPricing.id,
  });

  // Test base subscription only
  const baseResult = PricingEngine.calculatePrice(
    usagePrice,
    Object.values(formulas),
    "USD",
    {
      participants: 1,
      customVariables: {
        totalUsers: 5,
        storageBlocks: 0,
      },
    },
    productVariables,
  );
  assertEquals(baseResult.finalPrice, 49.99);

  // Test with additional users and storage
  const fullResult = PricingEngine.calculatePrice(
    usagePrice,
    Object.values(formulas),
    "USD",
    {
      participants: 1,
      customVariables: {
        totalUsers: 8, // 3 extra users
        storageBlocks: 2, // 2 extra storage blocks
      },
    },
    productVariables,
  );
  assertEquals(fullResult.finalPrice, 96.94); // 49.99 + (3 * 8.99) + (2 * 9.99)
});

Deno.test("Subscription - Complete Purchase Flow", () => {
  const billingItems: IBillingItem[] = [
    {
      name: "Pro Plan Monthly Subscription",
      description: "Advanced features for growing teams",
      quantity: 1,
      unitPrice: 24.99,
      total: 24.99,
    },
    {
      name: "Additional Users (3x)",
      description: "Extra user seats beyond the included 10",
      quantity: 3,
      unitPrice: 5.99,
      total: 17.97,
    },
    {
      name: "Premium Support Add-on",
      description: "Priority customer support with 4-hour response",
      quantity: 1,
      unitPrice: 9.99,
      total: 9.99,
    },
    {
      name: "Service Tax",
      description: "Digital services tax",
      quantity: 1,
      unitPrice: 4.24,
      total: 4.24,
      isTax: true,
    },
  ];

  const subscriptionPurchase: IPurchase = {
    id: crypto.randomUUID(),
    userId: "business-owner-123",
    product: {
      id: "pro-monthly-subscription",
      name: "Pro Plan Monthly Subscription",
      currency: "USD",
    },
    status: PurchaseStatus.confirmed,
    paymentData: {
      timestamp: Date.now(),
      paymentType: PaymentType.stripe,
      paymentId: "sub_subscription_123",
    },
    purchaseData: {
      subscriptionId: "sub_1234567890",
      planId: "pro-monthly",
      billingCycle: "monthly",
      nextBillingDate: "2024-09-20T00:00:00Z",
      trialEnd: null,
      subscriptionStartDate: "2024-08-20T14:30:00Z",
      companyInfo: {
        name: "Acme Corporation",
        industry: "Technology",
        size: "50-100 employees",
        billingContact: {
          name: "Jane Smith",
          email: "jane.smith@acme.com",
          phone: "+1-555-123-4567",
        },
      },
      features: {
        maxUsers: 13, // 10 included + 3 additional
        storageLimit: "1TB",
        apiCalls: 100000,
        prioritySupport: true,
        customIntegrations: true,
      },
    },
    billingItems,
    verId: 1,
  };

  assertExists(subscriptionPurchase.id);
  assertEquals(subscriptionPurchase.status, PurchaseStatus.confirmed);
  assertEquals(subscriptionPurchase.billingItems.length, 4);
  assertEquals(subscriptionPurchase.purchaseData.billingCycle, "monthly");
  assertEquals(subscriptionPurchase.purchaseData.features.maxUsers, 13);

  // Calculate total
  const total = subscriptionPurchase.billingItems.reduce((sum, item) => sum + item.total, 0);
  assertEquals(total, 57.19); // 24.99 + 17.97 + 9.99 + 4.24
});

Deno.test("Subscription - Flexible Cancellation Policy", () => {
  const anytimeCancel: CancellationPolicy = {
    id: "anytime-cancel",
    name: "Cancel Anytime",
    description: "Cancel subscription anytime with immediate effect",
    refund: {
      type: RefundType.percentage,
      amount: 0, // No refund for current period, but access continues until end
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 0, // No minimum notice required
    },
  };

  const annualRefund: CancellationPolicy = {
    id: "annual-prorated-refund",
    name: "Annual Plan Prorated Refund",
    description: "Prorated refund for unused months on annual plans",
    refund: {
      type: RefundType.percentage,
      amount: 100, // Full refund for unused portion
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 7 * 24 * 60 * 60 * 1000, // 7 days notice for annual plans
    },
  };

  const subscriptionCancellation: ICancellationPolicy = {
    id: "subscription-cancellation",
    name: "Subscription Cancellation Policy",
    policies: {
      "monthly-plans": anytimeCancel,
      "annual-plans": annualRefund,
    },
  };

  assertEquals(Object.keys(subscriptionCancellation.policies).length, 2);
  assertEquals(subscriptionCancellation.policies["monthly-plans"].refund?.amount, 0);
  assertEquals(subscriptionCancellation.policies["annual-plans"].refund?.amount, 100);
});

Deno.test("Subscription - Free Trial with Conversion", () => {
  const productVariables: Record<string, IPricingVariable> = {
    regularPrice: {
      id: "regularPrice",
      name: "Regular Subscription Price",
      type: VariableType.fixed,
      value: 39.99,
    },
    trialDiscountRate: {
      id: "trialDiscountRate",
      name: "Free Trial Discount Rate",
      type: VariableType.percentage,
      value: -100, // 100% discount
    },
    trialPeriodDays: {
      id: "trialPeriodDays",
      name: "Trial Period Duration",
      type: VariableType.fixed,
      value: 14,
    },
  };

  const trialPricing = createPricingProduct({
    name: "Premium Subscription with Free Trial",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Regular Subscription Price",
      pricing_product_id: trialPricing.id,
      value_calculation: ["regularPrice"],
    }),
    freeTrialDiscount: createPricingFormula({
      formula_name: "freeTrialDiscount",
      name: "Free Trial Discount",
      pricing_product_id: trialPricing.id,
      value_calculation: ["subtotal", "*", "trialDiscountRate", "/", "100"],
      apply_condition: ["isFreeTrial", "==", 1],
    }),
  };

  const trialPrice: PricingPrice = createPricingPrice({
    name: "Premium Subscription with Free Trial",
    description: "Premium subscription with 14-day free trial",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "freeTrialDiscount"],
    target: "flat",
    interval: "flat",
    pricing_product_id: trialPricing.id,
  });

  // Test regular pricing (after trial)
  const regularResult = PricingEngine.calculatePrice(
    trialPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { isFreeTrial: 0 } },
    productVariables,
  );
  assertEquals(regularResult.finalPrice, 39.99);

  // Test trial pricing (free)
  const trialResult = PricingEngine.calculatePrice(
    trialPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { isFreeTrial: 1 } },
    productVariables,
  );
  assertEquals(trialResult.finalPrice, 0); // 39.99 - 100%
});

Deno.test("Subscription - Enterprise Custom Pricing", () => {
  const enterprisePricing = createPricingProduct({
    name: "Enterprise Subscription",
  });

  const standardPrice: PricingPrice = setPriceAmount(
    createPricingPrice({
      name: "Standard Enterprise (up to 100 users)",
      pricing_product_id: enterprisePricing.id,
      pricing_type: "fixed",
      target: "flat",
      interval: "flat",
    }),
    { "USD": 199.99 },
  );

  const largeFeeContingentPricing: PricingPrice = setPriceAmount(
    createPricingPrice({
      name: "Large Enterprise Pricing",
      description: "Custom pricing for 100+ users (contact sales)",
      pricing_product_id: enterprisePricing.id,
      pricing_type: "fixed",
      target: "flat",
      interval: "flat",
    }),
    { "USD": 0.00 }, // Custom pricing handled separately
  );

  // Test enterprise pricing structure
  assertExists(enterprisePricing.id);
  assertEquals(enterprisePricing.name, "Enterprise Subscription");
  assertEquals(getPriceAmount(standardPrice)["USD"], 199.99);
  assertEquals(getPriceAmount(largeFeeContingentPricing)["USD"], 0.00);
});

Deno.test("Subscription - Quarterly Billing Option", () => {
  const productVariables: Record<string, IPricingVariable> = {
    monthlyPrice: {
      id: "monthlyPrice",
      name: "Monthly Subscription Price",
      type: VariableType.fixed,
      value: 29.99,
    },
    quarterlyDiscountRate: {
      id: "quarterlyDiscountRate",
      name: "Quarterly Billing Discount Rate",
      type: VariableType.percentage,
      value: -10, // 10% discount
    },
  };

  const quarterlyPricing = createPricingProduct({
    name: "Quarterly Subscription",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Base Monthly Price",
      pricing_product_id: quarterlyPricing.id,
      value_calculation: ["monthlyPrice"],
    }),
    quarterlyDiscount: createPricingFormula({
      formula_name: "quarterlyDiscount",
      name: "Quarterly Billing Discount",
      pricing_product_id: quarterlyPricing.id,
      value_calculation: ["subtotal", "*", "quarterlyDiscountRate", "/", "100"],
      apply_condition: ["billingCycle", "==", 3], // 1=monthly, 2=annual, 3=quarterly
    }),
  };

  const subscriptionPrice: PricingPrice = createPricingPrice({
    name: "Quarterly Subscription with Discount",
    description: "Monthly subscription with quarterly billing discount",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "quarterlyDiscount"],
    target: "flat",
    interval: "flat",
    pricing_product_id: quarterlyPricing.id,
  });

  const quarterlySubscription: Product = createProduct({
    seller_id: "test-seller",
    name: "Quarterly Subscription Plan",
    description: "Save with quarterly billing",
    tags: { "subscription": true, "quarterly": true },
  });

  const tags = getProductTags(quarterlySubscription);
  assertEquals(tags["quarterly"], true);

  // Test monthly billing (no discount)
  const monthlyResult = PricingEngine.calculatePrice(
    subscriptionPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { billingCycle: 1 } }, // 1=monthly
    productVariables,
  );
  assertEquals(monthlyResult.finalPrice, 29.99);

  // Test quarterly billing (with discount)
  const quarterlyResult = PricingEngine.calculatePrice(
    subscriptionPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { billingCycle: 3 } }, // 3=quarterly
    productVariables,
  );
  assertEquals(quarterlyResult.finalPrice, 26.99); // 29.99 - 10%
});
