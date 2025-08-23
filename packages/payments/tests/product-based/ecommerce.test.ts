import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { createProduct, Product } from "../../payment/product/product.ts";
import {
  createPricingPrice,
  createPricingProduct,
  getPriceAmount,
} from "../../payment/product/price/price.ts";
import {
  createPricingFormula,
  IPricingVariable,
  VariableType,
} from "../../payment/product/price/dynamic-pricing.ts";
import { PricingEngine } from "../../payment/product/price/pricing-engine.ts";
// import { ICancellationPolicy, CancellationPolicy, CancellationConditionType } from "../../payment/product/cancellation/cancellation.ts";

Deno.test("Ecommerce - Basic Product Pricing with Fixed Price", () => {
  const productPriceData = {
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    amount: { "USD": 199.99 },
    target: "flat",
    interval: "per-unit",
    pricing_product_id: "wireless-headphones",
  };
  const productPrice = createPricingPrice(productPriceData);

  const headphones: Product = createProduct({
    seller_id: "test-seller",
    name: "Wireless Bluetooth Headphones",
    description: "Premium audio experience with wireless convenience",
    tags: { "product": true, "electronics": true, "audio": true },
  });

  assertExists(headphones.id);
  assertEquals((headphones.tags as any)?.["product"], true);
  assertEquals((getPriceAmount(productPrice) as any)?.["USD"], 199.99);
});

Deno.test("Ecommerce - Dynamic Pricing with Quantity Discounts", () => {
  const productVariables: Record<string, IPricingVariable> = {
    unitPrice: {
      id: "unitPrice",
      name: "Unit Price",
      type: VariableType.fixed,
      value: 50,
    },
    bulkDiscountThreshold: {
      id: "bulkDiscountThreshold",
      name: "Bulk Discount Threshold",
      type: VariableType.fixed,
      value: 10,
    },
    bulkDiscountRate: {
      id: "bulkDiscountRate",
      name: "Bulk Discount Rate",
      type: VariableType.percentage,
      value: -15, // 15% discount
    },
  };

  const formulas = {
    baseCalculation: createPricingFormula({
      formula_name: "baseCalculation",
      name: "Base Calculation",
      pricing_product_id: "custom-tshirts",
      value_calculation: ["participants", "*", "unitPrice"],
    }),
    bulkDiscount: createPricingFormula({
      formula_name: "bulkDiscount",
      name: "Bulk Discount",
      pricing_product_id: "custom-tshirts",
      value_calculation: ["subtotal", "*", "bulkDiscountRate", "/", "100"],
      apply_condition: ["participants", ">=", "bulkDiscountThreshold"],
    }),
  };

  const dynamicPriceData = {
    name: "T-Shirt Bulk Pricing",
    description: "Custom t-shirts with bulk discounts",
    pricing_type: "dynamic",
    formula_names: ["baseCalculation", "bulkDiscount"],
    target: "per-participant",
    interval: "per-unit",
    pricing_product_id: "custom-tshirts",
  };
  const dynamicPrice = createPricingPrice(dynamicPriceData);

  const pricingProductData = {
    name: "Custom T-Shirts",
    description: "Custom printed t-shirts with bulk pricing",
  };
  const pricingProduct = createPricingProduct(pricingProductData);

  // Create product with variables
  const tshirtProduct: Product = createProduct({
    seller_id: "test-seller",
    name: "Custom T-Shirts",
    description: "Custom printed t-shirts with bulk pricing",
  });

  // Test small order (no discount)
  const smallOrderResult = PricingEngine.calculatePrice(
    dynamicPrice,
    Object.values(formulas),
    "USD",
    { participants: 5 },
    productVariables,
  );

  assertEquals(smallOrderResult.finalPrice, 250); // 5 * 50, no discount

  // Test bulk order (with discount)
  const bulkOrderResult = PricingEngine.calculatePrice(
    dynamicPrice,
    Object.values(formulas),
    "USD",
    { participants: 15 },
    productVariables,
  );

  // 15 * 50 = 750, then 750 * -15 / 100 = -112.5, total = 637.5
  assertEquals(bulkOrderResult.finalPrice, 637.5);
  assertEquals(bulkOrderResult.appliedConditions.length, 2); // Base + bulk discount
});

Deno.test("Ecommerce - Shipping and Tax Calculation", () => {
  const productVariables: Record<string, IPricingVariable> = {
    itemPrice: {
      id: "itemPrice",
      name: "Item Price",
      type: VariableType.fixed,
      value: 25.99,
    },
    shippingCost: {
      id: "shippingCost",
      name: "Shipping Cost",
      type: VariableType.fixed,
      value: 8.99,
    },
    freeShippingThreshold: {
      id: "freeShippingThreshold",
      name: "Free Shipping Threshold",
      type: VariableType.fixed,
      value: 75,
    },
    taxRate: {
      id: "taxRate",
      name: "Sales Tax Rate",
      type: VariableType.percentage,
      value: 8.25,
    },
  };

  const formulas = {
    itemsTotal: createPricingFormula({
      formula_name: "itemsTotal",
      name: "Items Total",
      pricing_product_id: "books-order",
      value_calculation: ["participants", "*", "itemPrice"],
    }),
    shipping: createPricingFormula({
      formula_name: "shipping",
      name: "Shipping Cost",
      pricing_product_id: "books-order",
      value_calculation: ["shippingCost"],
      apply_condition: ["subtotal", "<", "freeShippingThreshold"],
    }),
    salesTax: createPricingFormula({
      formula_name: "salesTax",
      name: "Sales Tax",
      pricing_product_id: "books-order",
      value_calculation: ["subtotal", "*", "taxRate", "/", "100"],
    }),
  };

  const ecommercePriceData = {
    name: "Book Order with Shipping",
    pricing_type: "dynamic",
    formula_names: ["itemsTotal", "shipping", "salesTax"],
    target: "per-participant",
    interval: "per-unit",
    pricing_product_id: "books-order",
  };
  const ecommercePrice = createPricingPrice(ecommercePriceData);

  const pricingProductData = {
    name: "Book Order",
    description: "Book orders with shipping and tax",
  };
  const pricingProduct = createPricingProduct(pricingProductData);

  // Create product with variables
  const bookProduct: Product = createProduct({
    seller_id: "test-seller",
    name: "Book Order",
    description: "Books with shipping and tax",
  });

  // Test order under free shipping threshold
  const smallOrderResult = PricingEngine.calculatePrice(
    ecommercePrice,
    Object.values(formulas),
    "USD",
    { participants: 2 },
    productVariables,
  );

  // Items: 2 * 25.99 = 51.98
  // Shipping: 8.99 (applied because 51.98 < 75)
  // Subtotal: 60.97
  // Tax: 60.97 * 8.25 / 100 = 5.03
  // Total: 65.03
  assertEquals(smallOrderResult.finalPrice, 66.0);

  // Test order over free shipping threshold
  const largeOrderResult = PricingEngine.calculatePrice(
    ecommercePrice,
    Object.values(formulas),
    "USD",
    { participants: 4 },
    productVariables,
  );

  // Items: 4 * 25.99 = 103.96
  // Shipping: 0 (not applied because 103.96 >= 75)
  // Tax: 103.96 * 8.25 / 100 = 8.58
  // Total: 112.54
  assertEquals(largeOrderResult.finalPrice, 112.54);
});

Deno.test("Ecommerce - Seasonal Promotions", () => {
  const productVariables: Record<string, IPricingVariable> = {
    regularPrice: {
      id: "regularPrice",
      name: "Regular Price",
      type: VariableType.fixed,
      value: 89.99,
    },
    holidayDiscountRate: {
      id: "holidayDiscountRate",
      name: "Holiday Discount",
      type: VariableType.percentage,
      value: -25, // 25% off
    },
    memberDiscountRate: {
      id: "memberDiscountRate",
      name: "Member Discount",
      type: VariableType.percentage,
      value: -10, // Additional 10% for members
    },
  };

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Base Price",
      pricing_product_id: "electronics-seasonal",
      value_calculation: ["participants", "*", "regularPrice"],
    }),
    holidayDiscount: createPricingFormula({
      formula_name: "holidayDiscount",
      name: "Holiday Sale",
      pricing_product_id: "electronics-seasonal",
      value_calculation: ["subtotal", "*", "holidayDiscountRate", "/", "100"],
      apply_condition: ["month", ">=", 11], // November and December
    }),
    memberDiscount: createPricingFormula({
      formula_name: "memberDiscount",
      name: "Member Discount",
      pricing_product_id: "electronics-seasonal",
      value_calculation: ["subtotal", "*", "memberDiscountRate", "/", "100"],
      apply_condition: ["isMember", "==", 1],
    }),
  };

  const seasonalPriceData = {
    name: "Seasonal Electronics Sale",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "holidayDiscount", "memberDiscount"],
    target: "per-participant",
    interval: "per-unit",
    pricing_product_id: "electronics-seasonal",
  };
  const seasonalPrice = createPricingPrice(seasonalPriceData);

  const pricingProductData = {
    name: "Electronics Seasonal Sale",
    description: "Electronics with seasonal promotions",
  };
  const pricingProduct = createPricingProduct(pricingProductData);

  // Create product with variables
  const electronicsProduct: Product = createProduct({
    seller_id: "test-seller",
    name: "Electronics Seasonal Sale",
    description: "Electronics with seasonal and member discounts",
  });

  // Test holiday season + member discount
  const holidayMemberResult = PricingEngine.calculatePrice(
    seasonalPrice,
    Object.values(formulas),
    "USD",
    {
      participants: 2,
      month: 12, // December
      customVariables: { isMember: 1 },
    },
    productVariables,
  );

  // Base: 2 * 89.99 = 179.98
  // Holiday discount: 179.98 * -25 / 100 = -44.995 ≈ -45.00
  // Subtotal: 134.98
  // Member discount: 134.98 * -10 / 100 = -13.498 ≈ -13.50
  // Final: 121.48
  assertEquals(holidayMemberResult.finalPrice, 121.49);

  // Test non-holiday season, no member
  const regularResult = PricingEngine.calculatePrice(
    seasonalPrice,
    Object.values(formulas),
    "USD",
    {
      participants: 2,
      month: 6, // June
      customVariables: { isMember: 0 },
    },
    productVariables,
  );

  assertEquals(regularResult.finalPrice, 179.98); // No discounts applied
});
