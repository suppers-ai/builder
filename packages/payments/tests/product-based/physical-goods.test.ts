import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { createProduct, getProductTags, Product } from "../../payment/product/product.ts";
import {
  createPricingPrice,
  createPricingProduct,
  PricingPrice,
  PricingProduct,
} from "../../payment/product/price/price.ts";
import {
  createPricingFormula,
  IPricingVariable,
  VariableType,
} from "../../payment/product/price/dynamic-pricing.ts";
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

Deno.test("Physical Goods - Furniture with Delivery Options", () => {
  const productVariables: Record<string, IPricingVariable> = {
    furniturePrice: {
      id: "furniturePrice",
      name: "Furniture Base Price",
      type: VariableType.fixed,
      value: 1299.00,
    },
    whiteGloveDeliveryFee: {
      id: "whiteGloveDeliveryFee",
      name: "White Glove Delivery Fee",
      type: VariableType.fixed,
      value: 199.00,
    },
  };

  const furniturePricing = createPricingProduct({
    name: "Leather Sofa with Delivery Options",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Base Furniture Price",
      pricing_product_id: furniturePricing.id,
      value_calculation: ["participants", "*", "furniturePrice"],
    }),
    whiteGloveDelivery: createPricingFormula({
      formula_name: "whiteGloveDelivery",
      name: "White Glove Delivery Service",
      pricing_product_id: furniturePricing.id,
      value_calculation: ["whiteGloveDeliveryFee"],
      apply_condition: ["wantsWhiteGloveDelivery", "==", 1],
    }),
  };

  const furniturePrice: PricingPrice = createPricingPrice({
    name: "Leather Sofa - Standard Delivery",
    description: "Premium leather 3-seater sofa with delivery options",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "whiteGloveDelivery"],
    target: "flat",
    interval: "per-unit",
    pricing_product_id: furniturePricing.id,
  });

  const sofa: Product = createProduct({
    seller_id: "test-seller",
    name: "Premium Leather Sofa",
    description: "Handcrafted Italian leather sofa",
    tags: { "physical": true, "furniture": true, "home": true },
  });

  assertExists(sofa.id);
  const tags = getProductTags(sofa);
  assertEquals(tags["physical"], true);

  // Test base price calculation
  const baseResult = PricingEngine.calculatePrice(
    furniturePrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { wantsWhiteGloveDelivery: 0 } },
    productVariables,
  );
  assertEquals(baseResult.finalPrice, 1299.00);

  // Test with white glove delivery
  const withDeliveryResult = PricingEngine.calculatePrice(
    furniturePrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { wantsWhiteGloveDelivery: 1 } },
    productVariables,
  );
  assertEquals(withDeliveryResult.finalPrice, 1498.00); // 1299 + 199
});

Deno.test("Physical Goods - Heavy Equipment with Weight-based Shipping", () => {
  const productVariables: Record<string, IPricingVariable> = {
    baseToolPrice: {
      id: "baseToolPrice",
      name: "Industrial Tool Base Price",
      type: VariableType.fixed,
      value: 2499.00,
    },
    standardShippingFee: {
      id: "standardShippingFee",
      name: "Standard Shipping Fee",
      type: VariableType.fixed,
      value: 29.00,
    },
    mediumFreightFee: {
      id: "mediumFreightFee",
      name: "Medium Freight Fee",
      type: VariableType.fixed,
      value: 149.00,
    },
    heavyFreightFee: {
      id: "heavyFreightFee",
      name: "Heavy Freight Fee",
      type: VariableType.fixed,
      value: 299.00,
    },
  };

  const equipmentPricing = createPricingProduct({
    name: "Industrial Equipment with Weight-based Shipping",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Base Tool Price",
      pricing_product_id: equipmentPricing.id,
      value_calculation: ["participants", "*", "baseToolPrice"],
    }),
    standardShipping: createPricingFormula({
      formula_name: "standardShipping",
      name: "Standard Shipping",
      pricing_product_id: equipmentPricing.id,
      value_calculation: ["standardShippingFee"],
      apply_condition: ["itemWeight", "<", 50],
    }),
    mediumFreightShipping: createPricingFormula({
      formula_name: "mediumFreightShipping",
      name: "Standard Freight Shipping",
      pricing_product_id: equipmentPricing.id,
      value_calculation: ["mediumFreightFee"],
      apply_condition: ["itemWeight", ">=", 50, "&&", "itemWeight", "<=", 150],
    }),
    heavyFreightShipping: createPricingFormula({
      formula_name: "heavyFreightShipping",
      name: "Heavy Freight Shipping",
      pricing_product_id: equipmentPricing.id,
      value_calculation: ["heavyFreightFee"],
      apply_condition: ["itemWeight", ">", 150],
    }),
  };

  const equipmentPrice: PricingPrice = createPricingPrice({
    name: "Industrial Tool with Weight-based Shipping",
    description: "Industrial equipment with automatic shipping calculation",
    pricing_type: "dynamic",
    formula_names: [
      "basePrice",
      "standardShipping",
      "mediumFreightShipping",
      "heavyFreightShipping",
    ],
    target: "flat",
    interval: "per-unit",
    pricing_product_id: equipmentPricing.id,
  });

  // Test light weight item
  const lightResult = PricingEngine.calculatePrice(
    equipmentPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { itemWeight: 35 } },
    productVariables,
  );
  assertEquals(lightResult.finalPrice, 2528.00); // 2499 + 29

  // Test medium weight item
  const mediumResult = PricingEngine.calculatePrice(
    equipmentPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { itemWeight: 100 } },
    productVariables,
  );
  assertEquals(mediumResult.finalPrice, 2648.00); // 2499 + 149

  // Test heavy weight item
  const heavyResult = PricingEngine.calculatePrice(
    equipmentPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { itemWeight: 200 } },
    productVariables,
  );
  assertEquals(heavyResult.finalPrice, 2798.00); // 2499 + 299
});

Deno.test("Physical Goods - Fresh Produce with Seasonality", () => {
  const productVariables: Record<string, IPricingVariable> = {
    peakSeasonPrice: {
      id: "peakSeasonPrice",
      name: "Peak Season Price",
      type: VariableType.fixed,
      value: 4.99,
    },
    earlySeasonPremium: {
      id: "earlySeasonPremium",
      name: "Early Season Premium",
      type: VariableType.fixed,
      value: 2.00,
    },
    lateSeasonPremium: {
      id: "lateSeasonPremium",
      name: "Late Season Premium",
      type: VariableType.fixed,
      value: 1.50,
    },
  };

  const seasonalPricing = createPricingProduct({
    name: "Fresh Strawberries with Seasonal Pricing",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Base Strawberry Price",
      pricing_product_id: seasonalPricing.id,
      value_calculation: ["participants", "*", "peakSeasonPrice"],
    }),
    springPremium: createPricingFormula({
      formula_name: "springPremium",
      name: "Early Season Premium",
      pricing_product_id: seasonalPricing.id,
      value_calculation: ["participants", "*", "earlySeasonPremium"],
      apply_condition: ["month", ">=", 3, "&&", "month", "<=", 5],
    }),
    fallPremium: createPricingFormula({
      formula_name: "fallPremium",
      name: "Late Season Premium",
      pricing_product_id: seasonalPricing.id,
      value_calculation: ["participants", "*", "lateSeasonPremium"],
      apply_condition: ["month", ">=", 9, "&&", "month", "<=", 11],
    }),
  };

  const strawberryPrice: PricingPrice = createPricingPrice({
    name: "Fresh Strawberries with Seasonal Pricing",
    description: "Fresh local strawberries with seasonal adjustments",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "springPremium", "fallPremium"],
    target: "flat",
    interval: "per-unit",
    pricing_product_id: seasonalPricing.id,
  });

  // Test summer (peak season) pricing
  const summerResult = PricingEngine.calculatePrice(
    strawberryPrice,
    Object.values(formulas),
    "USD",
    { participants: 2, month: 7 },
    productVariables,
  );
  assertEquals(summerResult.finalPrice, 9.98); // 2 * 4.99

  // Test spring pricing (with premium)
  const springResult = PricingEngine.calculatePrice(
    strawberryPrice,
    Object.values(formulas),
    "USD",
    { participants: 2, month: 4 },
    productVariables,
  );
  assertEquals(springResult.finalPrice, 13.98); // (2 * 4.99) + (2 * 2.00)

  // Test fall pricing (with premium)
  const fallResult = PricingEngine.calculatePrice(
    strawberryPrice,
    Object.values(formulas),
    "USD",
    { participants: 2, month: 10 },
    productVariables,
  );
  assertEquals(fallResult.finalPrice, 12.98); // (2 * 4.99) + (2 * 1.50)
});

Deno.test("Physical Goods - Art Print with Size Variations", () => {
  const productVariables: Record<string, IPricingVariable> = {
    baseSize8x10Price: {
      id: "baseSize8x10Price",
      name: "8x10 Print Price",
      type: VariableType.fixed,
      value: 25.00,
    },
    size16x20Upgrade: {
      id: "size16x20Upgrade",
      name: "16x20 Size Upgrade",
      type: VariableType.fixed,
      value: 35.00,
    },
    size24x36Upgrade: {
      id: "size24x36Upgrade",
      name: "24x36 Size Upgrade",
      type: VariableType.fixed,
      value: 75.00,
    },
  };

  const artPrintPricing = createPricingProduct({
    name: "Custom Art Print with Size Options",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Base Print Price",
      pricing_product_id: artPrintPricing.id,
      value_calculation: ["participants", "*", "baseSize8x10Price"],
    }),
    mediumSizeUpgrade: createPricingFormula({
      formula_name: "mediumSizeUpgrade",
      name: "16x20 Size Upgrade",
      pricing_product_id: artPrintPricing.id,
      value_calculation: ["participants", "*", "size16x20Upgrade"],
      apply_condition: ["printSizeType", "==", 2], // 1=8x10, 2=16x20, 3=24x36
    }),
    largeSizeUpgrade: createPricingFormula({
      formula_name: "largeSizeUpgrade",
      name: "24x36 Size Upgrade",
      pricing_product_id: artPrintPricing.id,
      value_calculation: ["participants", "*", "size24x36Upgrade"],
      apply_condition: ["printSizeType", "==", 3],
    }),
  };

  const artPrintPrice: PricingPrice = createPricingPrice({
    name: "Custom Art Print with Size Options",
    description: "Art print with automatic size-based pricing",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "mediumSizeUpgrade", "largeSizeUpgrade"],
    target: "flat",
    interval: "per-unit",
    pricing_product_id: artPrintPricing.id,
  });

  // Test base 8x10 size
  const baseResult = PricingEngine.calculatePrice(
    artPrintPrice,
    Object.values(formulas),
    "USD",
    { participants: 2, customVariables: { printSizeType: 1 } }, // 8x10
    productVariables,
  );
  assertEquals(baseResult.finalPrice, 50.00); // 2 * 25

  // Test 16x20 size upgrade
  const mediumResult = PricingEngine.calculatePrice(
    artPrintPrice,
    Object.values(formulas),
    "USD",
    { participants: 2, customVariables: { printSizeType: 2 } }, // 16x20
    productVariables,
  );
  assertEquals(mediumResult.finalPrice, 120.00); // (2 * 25) + (2 * 35)

  // Test 24x36 size upgrade
  const largeResult = PricingEngine.calculatePrice(
    artPrintPrice,
    Object.values(formulas),
    "USD",
    { participants: 2, customVariables: { printSizeType: 3 } }, // 24x36
    productVariables,
  );
  assertEquals(largeResult.finalPrice, 200.00); // (2 * 25) + (2 * 75)
});

Deno.test("Physical Goods - Complete Purchase Flow", () => {
  const billingItems: IBillingItem[] = [
    {
      name: "Premium Leather Sofa - Cognac",
      description: "3-seater Italian leather sofa in cognac color",
      quantity: 1,
      unitPrice: 1299.00,
      total: 1299.00,
    },
    {
      name: "White Glove Delivery Service",
      description: "Premium delivery with assembly and placement",
      quantity: 1,
      unitPrice: 199.00,
      total: 199.00,
    },
    {
      name: "Fabric Protection Plan",
      description: "5-year stain and damage protection",
      quantity: 1,
      unitPrice: 129.00,
      total: 129.00,
    },
    {
      name: "Assembly Service",
      description: "Professional furniture assembly",
      quantity: 1,
      unitPrice: 49.00,
      total: 49.00,
    },
    {
      name: "Sales Tax",
      description: "State and local sales tax (7.5%)",
      quantity: 1,
      unitPrice: 126.00,
      total: 126.00,
      isTax: true,
    },
  ];

  const furniturePurchase: IPurchase = {
    id: crypto.randomUUID(),
    userId: "homeowner-789",
    product: {
      id: "premium-leather-sofa",
      name: "Premium Leather Sofa",
      currency: "USD",
    },
    status: PurchaseStatus.confirmed,
    paymentData: {
      timestamp: Date.now(),
      paymentType: PaymentType.stripe,
      paymentId: "pi_furniture_123",
    },
    purchaseData: {
      orderDate: "2024-08-20T14:15:00Z",
      productDetails: {
        color: "Cognac",
        material: "Italian Leather",
        dimensions: "84W x 38D x 32H inches",
        weight: "145 lbs",
        sku: "SOFA-ITL-COG-3S",
      },
      deliveryWindow: {
        startDate: "2024-09-15",
        endDate: "2024-09-22",
        preferredTime: "morning",
      },
      deliveryAddress: {
        name: "Sarah Johnson",
        street: "456 Oak Avenue",
        apartment: "Unit 2B",
        city: "Portland",
        state: "OR",
        zipCode: "97205",
        country: "USA",
        phone: "+1-503-555-0123",
        deliveryNotes: "Call before delivery, elevator access available",
      },
      specialInstructions: "Please remove old sofa and dispose of it responsibly",
    },
    billingItems,
    verId: 1,
  };

  assertExists(furniturePurchase.id);
  assertEquals(furniturePurchase.status, PurchaseStatus.confirmed);
  assertEquals(furniturePurchase.billingItems.length, 5);
  assertEquals(furniturePurchase.purchaseData.productDetails.color, "Cognac");
  assertEquals(furniturePurchase.purchaseData.deliveryAddress.apartment, "Unit 2B");

  // Calculate total
  const total = furniturePurchase.billingItems.reduce((sum, item) => sum + item.total, 0);
  assertEquals(total, 1802.00); // 1299 + 199 + 129 + 49 + 126
});

Deno.test("Physical Goods - Limited Edition with Scarcity Pricing", () => {
  const productVariables: Record<string, IPricingVariable> = {
    baseWatchPrice: {
      id: "baseWatchPrice",
      name: "Base Watch Price",
      type: VariableType.fixed,
      value: 299.00,
    },
    scarcityPremium: {
      id: "scarcityPremium",
      name: "Limited Edition Premium",
      type: VariableType.fixed,
      value: 100.00,
    },
    scarcityThreshold: {
      id: "scarcityThreshold",
      name: "Scarcity Threshold",
      type: VariableType.fixed,
      value: 50,
    },
  };

  const limitedEditionPricing = createPricingProduct({
    name: "Limited Edition Watch",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Base Watch Price",
      pricing_product_id: limitedEditionPricing.id,
      value_calculation: ["participants", "*", "baseWatchPrice"],
    }),
    limitedEditionPremium: createPricingFormula({
      formula_name: "limitedEditionPremium",
      name: "Limited Edition Premium",
      pricing_product_id: limitedEditionPricing.id,
      value_calculation: ["participants", "*", "scarcityPremium"],
      apply_condition: ["availableUnits", "<", "scarcityThreshold"],
    }),
  };

  const watchPrice: PricingPrice = createPricingPrice({
    name: "Limited Edition Watch",
    description: "Watch with scarcity-based pricing",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "limitedEditionPremium"],
    target: "flat",
    interval: "per-unit",
    pricing_product_id: limitedEditionPricing.id,
  });

  // Test regular pricing (when plenty available)
  const regularResult = PricingEngine.calculatePrice(
    watchPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { availableUnits: 100 } },
    productVariables,
  );
  assertEquals(regularResult.finalPrice, 299.00);

  // Test limited edition pricing (when scarce)
  const limitedResult = PricingEngine.calculatePrice(
    watchPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { availableUnits: 25 } },
    productVariables,
  );
  assertEquals(limitedResult.finalPrice, 399.00); // 299 + 100
});

Deno.test("Physical Goods - Customization with Add-on Pricing", () => {
  const productVariables: Record<string, IPricingVariable> = {
    baseBoardPrice: {
      id: "baseBoardPrice",
      name: "Base Cutting Board Price",
      type: VariableType.fixed,
      value: 89.00,
    },
    engravingFee: {
      id: "engravingFee",
      name: "Custom Engraving Fee",
      type: VariableType.fixed,
      value: 25.00,
    },
    giftBoxFee: {
      id: "giftBoxFee",
      name: "Premium Gift Box Fee",
      type: VariableType.fixed,
      value: 15.00,
    },
    rushOrderFee: {
      id: "rushOrderFee",
      name: "Rush Order Fee",
      type: VariableType.fixed,
      value: 35.00,
    },
  };

  const customizedPricing = createPricingProduct({
    name: "Custom Cutting Board with Add-ons",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Base Board Price",
      pricing_product_id: customizedPricing.id,
      value_calculation: ["participants", "*", "baseBoardPrice"],
    }),
    engraving: createPricingFormula({
      formula_name: "engraving",
      name: "Custom Engraving",
      pricing_product_id: customizedPricing.id,
      value_calculation: ["engravingFee"],
      apply_condition: ["wantsEngraving", "==", 1],
    }),
    giftBox: createPricingFormula({
      formula_name: "giftBox",
      name: "Premium Gift Box",
      pricing_product_id: customizedPricing.id,
      value_calculation: ["giftBoxFee"],
      apply_condition: ["wantsGiftBox", "==", 1],
    }),
    rushOrder: createPricingFormula({
      formula_name: "rushOrder",
      name: "Rush Order Fee",
      pricing_product_id: customizedPricing.id,
      value_calculation: ["rushOrderFee"],
      apply_condition: ["needsRushOrder", "==", 1],
    }),
  };

  const cuttingBoardPrice: PricingPrice = createPricingPrice({
    name: "Custom Cutting Board with Add-ons",
    description: "Customizable cutting board with optional add-ons",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "engraving", "giftBox", "rushOrder"],
    target: "flat",
    interval: "per-unit",
    pricing_product_id: customizedPricing.id,
  });

  // Test base price only
  const baseResult = PricingEngine.calculatePrice(
    cuttingBoardPrice,
    Object.values(formulas),
    "USD",
    {
      participants: 1,
      customVariables: {
        wantsEngraving: 0,
        wantsGiftBox: 0,
        needsRushOrder: 0,
      },
    },
    productVariables,
  );
  assertEquals(baseResult.finalPrice, 89.00);

  // Test with all add-ons
  const fullResult = PricingEngine.calculatePrice(
    cuttingBoardPrice,
    Object.values(formulas),
    "USD",
    {
      participants: 1,
      customVariables: {
        wantsEngraving: 1,
        wantsGiftBox: 1,
        needsRushOrder: 1,
      },
    },
    productVariables,
  );
  assertEquals(fullResult.finalPrice, 164.00); // 89 + 25 + 15 + 35
});

Deno.test("Physical Goods - Return Policy for Different Categories", () => {
  const standardReturn: CancellationPolicy = {
    id: "standard-return-30d",
    name: "Standard Return Policy",
    description: "30-day return policy for most items",
    refund: {
      type: RefundType.percentage,
      amount: 100,
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  };

  const furnitureReturn: CancellationPolicy = {
    id: "furniture-return-7d",
    name: "Furniture Return Policy",
    description: "7-day return policy for large furniture items",
    refund: {
      type: RefundType.percentage,
      amount: 85, // 15% restocking fee
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  };

  const customReturn: CancellationPolicy = {
    id: "custom-no-return",
    name: "Custom Items - No Return",
    description: "Custom/personalized items cannot be returned",
    refund: {
      type: RefundType.percentage,
      amount: 0,
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 0,
    },
  };

  const physicalGoodsReturn: ICancellationPolicy = {
    id: "physical-goods-return",
    name: "Physical Goods Return Policy",
    policies: {
      "standard-items": standardReturn,
      "furniture-items": furnitureReturn,
      "custom-items": customReturn,
    },
  };

  assertEquals(Object.keys(physicalGoodsReturn.policies).length, 3);
  assertEquals(physicalGoodsReturn.policies["standard-items"].refund?.amount, 100);
  assertEquals(physicalGoodsReturn.policies["furniture-items"].refund?.amount, 85);
  assertEquals(physicalGoodsReturn.policies["custom-items"].refund?.amount, 0);
});
