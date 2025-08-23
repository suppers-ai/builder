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

Deno.test("Event Ticketing - Concert General Admission", () => {
  const pricingProduct: PricingProduct = createPricingProduct({
    id: "concert-general-admission",
    name: "Concert General Admission",
    description: "General admission ticket for live concert",
  });

  const generalAdmissionPrice: PricingPrice = setPriceAmount(
    createPricingPrice({
      name: "General Admission",
      description: "General admission ticket to concert",
      pricing_product_id: pricingProduct.id,
      pricing_type: "fixed",
      target: "per-participant",
      interval: "flat",
    }),
    { "USD": 85.00 },
  );

  const concertTicket: Product = createProduct({
    name: "Concert Ticket - General Admission",
    description: "Live music concert experience",
    seller_id: "test-seller",
    tags: { "event": true, "concert": true, "ticket": true },
  });

  assertExists(concertTicket.id);
  const tags = getProductTags(concertTicket);
  assertEquals(tags["event"], true);
  assertEquals(getPriceAmount(generalAdmissionPrice)["USD"], 85.00);
  assertEquals(generalAdmissionPrice.target, "per-participant");
});

Deno.test("Event Ticketing - Tiered Pricing (VIP, Premium, General)", () => {
  const productVariables: Record<string, IPricingVariable> = {
    generalTicketPrice: {
      id: "generalTicketPrice",
      name: "General Admission Price",
      type: VariableType.fixed,
      value: 75.00,
    },
    premiumUpgradePrice: {
      id: "premiumUpgradePrice",
      name: "Premium Seating Upgrade",
      type: VariableType.fixed,
      value: 50.00,
    },
    vipUpgradePrice: {
      id: "vipUpgradePrice",
      name: "VIP Experience Upgrade",
      type: VariableType.fixed,
      value: 175.00,
    },
  };

  const tieredPricing = createPricingProduct({
    name: "Concert with Tiered Pricing",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "General Admission",
      pricing_product_id: tieredPricing.id,
      value_calculation: ["participants", "*", "generalTicketPrice"],
    }),
    premiumUpgrade: createPricingFormula({
      formula_name: "premiumUpgrade",
      name: "Premium Seating Upgrade",
      pricing_product_id: tieredPricing.id,
      value_calculation: ["participants", "*", "premiumUpgradePrice"],
      apply_condition: ["ticketType", "==", 2], // 1=general, 2=premium, 3=vip
    }),
    vipUpgrade: createPricingFormula({
      formula_name: "vipUpgrade",
      name: "VIP Experience Upgrade",
      pricing_product_id: tieredPricing.id,
      value_calculation: ["participants", "*", "vipUpgradePrice"],
      apply_condition: ["ticketType", "==", 3], // 1=general, 2=premium, 3=vip
    }),
  };

  const ticketPrice: PricingPrice = createPricingPrice({
    name: "Concert Tickets with Tiered Pricing",
    description: "Concert tickets with General, Premium, and VIP options",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "premiumUpgrade", "vipUpgrade"],
    target: "per-participant",
    interval: "flat",
    pricing_product_id: tieredPricing.id,
  });

  // Test general admission
  const generalResult = PricingEngine.calculatePrice(
    ticketPrice,
    Object.values(formulas),
    "USD",
    { participants: 2, customVariables: { ticketType: 1 } }, // 1=general
    productVariables,
  );
  assertEquals(generalResult.finalPrice, 150.00); // 2 * 75

  // Test premium tickets
  const premiumResult = PricingEngine.calculatePrice(
    ticketPrice,
    Object.values(formulas),
    "USD",
    { participants: 2, customVariables: { ticketType: 2 } }, // 2=premium
    productVariables,
  );
  assertEquals(premiumResult.finalPrice, 250.00); // (2 * 75) + (2 * 50)

  // Test VIP tickets
  const vipResult = PricingEngine.calculatePrice(
    ticketPrice,
    Object.values(formulas),
    "USD",
    { participants: 2, customVariables: { ticketType: 3 } }, // 3=vip
    productVariables,
  );
  assertEquals(vipResult.finalPrice, 500.00); // (2 * 75) + (2 * 175)
});

Deno.test("Event Ticketing - Early Bird and Group Discounts", () => {
  const productVariables: Record<string, IPricingVariable> = {
    standardTicketPrice: {
      id: "standardTicketPrice",
      name: "Standard Ticket Price",
      type: VariableType.fixed,
      value: 100.00,
    },
    earlyBirdDiscountRate: {
      id: "earlyBirdDiscountRate",
      name: "Early Bird Discount Rate",
      type: VariableType.percentage,
      value: -20, // 20% discount
    },
    groupDiscountRate: {
      id: "groupDiscountRate",
      name: "Group Discount Rate",
      type: VariableType.percentage,
      value: -15, // 15% discount
    },
    groupThreshold: {
      id: "groupThreshold",
      name: "Group Discount Threshold",
      type: VariableType.fixed,
      value: 10,
    },
  };

  const discountPricing = createPricingProduct({
    name: "Event with Early Bird and Group Discounts",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Standard Ticket Price",
      pricing_product_id: discountPricing.id,
      value_calculation: ["participants", "*", "standardTicketPrice"],
    }),
    earlyBirdDiscount: createPricingFormula({
      formula_name: "earlyBirdDiscount",
      name: "Early Bird Discount",
      pricing_product_id: discountPricing.id,
      value_calculation: ["subtotal", "*", "earlyBirdDiscountRate", "/", "100"],
      apply_condition: ["daysBeforeEvent", ">=", 30],
    }),
    groupDiscount: createPricingFormula({
      formula_name: "groupDiscount",
      name: "Group Discount",
      pricing_product_id: discountPricing.id,
      value_calculation: ["subtotal", "*", "groupDiscountRate", "/", "100"],
      apply_condition: ["participants", ">=", "groupThreshold"],
    }),
  };

  const eventPrice: PricingPrice = createPricingPrice({
    name: "Event Tickets with Discounts",
    description: "Event tickets with early bird and group discounts",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "earlyBirdDiscount", "groupDiscount"],
    target: "per-participant",
    interval: "flat",
    pricing_product_id: discountPricing.id,
  });

  // Test standard pricing (no discounts)
  const standardResult = PricingEngine.calculatePrice(
    eventPrice,
    Object.values(formulas),
    "USD",
    { participants: 5, customVariables: { daysBeforeEvent: 10 } },
    productVariables,
  );
  assertEquals(standardResult.finalPrice, 500.00); // 5 * 100

  // Test early bird discount only
  const earlyBirdResult = PricingEngine.calculatePrice(
    eventPrice,
    Object.values(formulas),
    "USD",
    { participants: 5, customVariables: { daysBeforeEvent: 45 } },
    productVariables,
  );
  assertEquals(earlyBirdResult.finalPrice, 400.00); // 500 - 20%

  // Test group discount only
  const groupResult = PricingEngine.calculatePrice(
    eventPrice,
    Object.values(formulas),
    "USD",
    { participants: 12, customVariables: { daysBeforeEvent: 10 } },
    productVariables,
  );
  assertEquals(groupResult.finalPrice, 1020.00); // 1200 - 15%

  // Test both discounts (early bird group)
  const bothDiscountsResult = PricingEngine.calculatePrice(
    eventPrice,
    Object.values(formulas),
    "USD",
    { participants: 12, customVariables: { daysBeforeEvent: 45 } },
    productVariables,
  );
  assertEquals(bothDiscountsResult.finalPrice, 816.00); // 1200 - 20% = 960, then 960 - 15% = 816
});

Deno.test("Event Ticketing - Age-based Pricing", () => {
  const productVariables: Record<string, IPricingVariable> = {
    adultTicketPrice: {
      id: "adultTicketPrice",
      name: "Adult Ticket Price",
      type: VariableType.fixed,
      value: 80.00,
    },
    studentDiscountRate: {
      id: "studentDiscountRate",
      name: "Student Discount Rate",
      type: VariableType.percentage,
      value: -25, // 25% discount
    },
    childDiscountRate: {
      id: "childDiscountRate",
      name: "Child Discount Rate",
      type: VariableType.percentage,
      value: -50, // 50% discount
    },
    seniorDiscountRate: {
      id: "seniorDiscountRate",
      name: "Senior Discount Rate",
      type: VariableType.percentage,
      value: -15, // 15% discount
    },
  };

  const ageBasedPricing = createPricingProduct({
    name: "Event with Age-based Pricing",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Adult Ticket Price",
      pricing_product_id: ageBasedPricing.id,
      value_calculation: ["participants", "*", "adultTicketPrice"],
    }),
    studentDiscount: createPricingFormula({
      formula_name: "studentDiscount",
      name: "Student Discount",
      pricing_product_id: ageBasedPricing.id,
      value_calculation: ["subtotal", "*", "studentDiscountRate", "/", "100"],
      apply_condition: ["customerType", "==", 2], // 1=adult, 2=student, 3=child, 4=senior
    }),
    childDiscount: createPricingFormula({
      formula_name: "childDiscount",
      name: "Child Discount",
      pricing_product_id: ageBasedPricing.id,
      value_calculation: ["subtotal", "*", "childDiscountRate", "/", "100"],
      apply_condition: ["customerType", "==", 3], // 1=adult, 2=student, 3=child, 4=senior
    }),
    seniorDiscount: createPricingFormula({
      formula_name: "seniorDiscount",
      name: "Senior Discount",
      pricing_product_id: ageBasedPricing.id,
      value_calculation: ["subtotal", "*", "seniorDiscountRate", "/", "100"],
      apply_condition: ["customerType", "==", 4], // 1=adult, 2=student, 3=child, 4=senior
    }),
  };

  const ageBasedPrice: PricingPrice = createPricingPrice({
    name: "Event Tickets with Age-based Pricing",
    description: "Event tickets with discounts based on age and student status",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "studentDiscount", "childDiscount", "seniorDiscount"],
    target: "per-participant",
    interval: "flat",
    pricing_product_id: ageBasedPricing.id,
  });

  // Test adult pricing (no discount)
  const adultResult = PricingEngine.calculatePrice(
    ageBasedPrice,
    Object.values(formulas),
    "USD",
    { participants: 2, customVariables: { customerType: 1 } }, // 1=adult
    productVariables,
  );
  assertEquals(adultResult.finalPrice, 160.00); // 2 * 80

  // Test student discount
  const studentResult = PricingEngine.calculatePrice(
    ageBasedPrice,
    Object.values(formulas),
    "USD",
    { participants: 2, customVariables: { customerType: 2 } }, // 2=student
    productVariables,
  );
  assertEquals(studentResult.finalPrice, 120.00); // 160 - 25%

  // Test child discount
  const childResult = PricingEngine.calculatePrice(
    ageBasedPrice,
    Object.values(formulas),
    "USD",
    { participants: 2, customVariables: { customerType: 3 } }, // 3=child
    productVariables,
  );
  assertEquals(childResult.finalPrice, 80.00); // 160 - 50%

  // Test senior discount
  const seniorResult = PricingEngine.calculatePrice(
    ageBasedPrice,
    Object.values(formulas),
    "USD",
    { participants: 2, customVariables: { customerType: 4 } }, // 4=senior
    productVariables,
  );
  assertEquals(seniorResult.finalPrice, 136.00); // 160 - 15%
});

Deno.test("Event Ticketing - Complete Purchase Flow", () => {
  const billingItems: IBillingItem[] = [
    {
      name: "VIP Concert Tickets (2x)",
      description: "VIP tickets with meet & greet - 2 tickets",
      quantity: 2,
      unitPrice: 250.00,
      total: 500.00,
    },
    {
      name: "Processing Fee",
      description: "Ticket processing and handling fee",
      quantity: 1,
      unitPrice: 15.00,
      total: 15.00,
    },
    {
      name: "Venue Fee",
      description: "Venue facility fee",
      quantity: 2,
      unitPrice: 8.50,
      total: 17.00,
    },
    {
      name: "Service Tax",
      description: "Entertainment service tax",
      quantity: 1,
      unitPrice: 42.56,
      total: 42.56,
      isTax: true,
    },
  ];

  const eventPurchase: IPurchase = {
    id: crypto.randomUUID(),
    userId: "attendee-789",
    product: {
      id: "concert-vip-tickets",
      name: "Summer Music Festival VIP",
      currency: "USD",
    },
    status: PurchaseStatus.confirmed,
    paymentData: {
      timestamp: Date.now(),
      paymentType: PaymentType.stripe,
      paymentId: "pi_event_tickets_123",
    },
    purchaseData: {
      eventDate: "2024-08-20",
      eventTime: "19:00:00",
      venue: {
        name: "Madison Square Garden",
        address: "4 Pennsylvania Plaza, New York, NY 10001",
        section: "VIP Section A",
        seats: ["VIP-A-15", "VIP-A-16"],
      },
      attendees: [
        {
          name: "John Smith",
          email: "john@example.com",
          ticketType: "vip",
        },
        {
          name: "Jane Smith",
          email: "jane@example.com",
          ticketType: "vip",
        },
      ],
      specialRequests: "Wheelchair accessible seating if needed",
    },
    billingItems,
    verId: 1,
  };

  assertExists(eventPurchase.id);
  assertEquals(eventPurchase.status, PurchaseStatus.confirmed);
  assertEquals(eventPurchase.billingItems.length, 4);
  assertEquals(eventPurchase.purchaseData.attendees.length, 2);
  assertEquals(eventPurchase.purchaseData.venue.seats.length, 2);

  // Calculate total
  const total = eventPurchase.billingItems.reduce((sum, item) => sum + item.total, 0);
  assertEquals(total, 574.56); // 500 + 15 + 17 + 42.56
});

Deno.test("Event Ticketing - Refund Policy", () => {
  const fullRefund: CancellationPolicy = {
    id: "full-refund-30d",
    name: "Full Refund Period",
    description: "100% refund if cancelled more than 30 days before event",
    refund: {
      type: RefundType.percentage,
      amount: 100,
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  };

  const partialRefund: CancellationPolicy = {
    id: "partial-refund-14d",
    name: "Partial Refund Period",
    description: "75% refund if cancelled 14-30 days before event",
    refund: {
      type: RefundType.percentage,
      amount: 75,
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 14 * 24 * 60 * 60 * 1000, // 14 days
    },
  };

  const minimalRefund: CancellationPolicy = {
    id: "minimal-refund-7d",
    name: "Minimal Refund Period",
    description: "25% refund (less fees) if cancelled 7-14 days before event",
    refund: {
      type: RefundType.percentage,
      amount: 25,
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  };

  const noRefund: CancellationPolicy = {
    id: "no-refund-7d",
    name: "No Refund Period",
    description: "No refund for cancellations within 7 days of event",
    refund: {
      type: RefundType.percentage,
      amount: 0,
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 0,
    },
  };

  const eventCancellation: ICancellationPolicy = {
    id: "event-ticket-cancellation",
    name: "Event Ticket Cancellation Policy",
    policies: {
      "before-30d": fullRefund,
      "14d-30d": partialRefund,
      "7d-14d": minimalRefund,
      "within-7d": noRefund,
    },
  };

  assertEquals(Object.keys(eventCancellation.policies).length, 4);
  assertEquals(eventCancellation.policies["before-30d"].refund?.amount, 100);
  assertEquals(eventCancellation.policies["14d-30d"].refund?.amount, 75);
  assertEquals(eventCancellation.policies["7d-14d"].refund?.amount, 25);
  assertEquals(eventCancellation.policies["within-7d"].refund?.amount, 0);
});

Deno.test("Event Ticketing - Workshop with Materials Fee", () => {
  const workshopPricing: PricingProduct = createPricingProduct({
    id: "photography-workshop",
    name: "Photography Workshop with Materials",
  });

  const workshopPrice: PricingPrice = setPriceAmount(
    createPricingPrice({
      name: "Workshop Attendance",
      description: "Full-day photography workshop",
      pricing_product_id: workshopPricing.id,
      pricing_type: "fixed",
      target: "per-participant",
      interval: "flat",
    }),
    { "USD": 180.00 },
  );

  const materialsPrice: PricingPrice = setPriceAmount(
    createPricingPrice({
      name: "Workshop Materials",
      description: "Photography handbook and practice materials",
      pricing_product_id: workshopPricing.id,
      pricing_type: "fixed",
      target: "per-participant",
      interval: "flat",
    }),
    { "USD": 25.00 },
  );

  assertEquals(workshopPricing.name, "Photography Workshop with Materials");
  assertEquals(getPriceAmount(workshopPrice)["USD"], 180.00);
  assertEquals(getPriceAmount(materialsPrice)["USD"], 25.00);
});

Deno.test("Event Ticketing - Multi-day Conference Pass", () => {
  const productVariables: Record<string, IPricingVariable> = {
    singleDayPrice: {
      id: "singleDayPrice",
      name: "Single Day Pass Price",
      type: VariableType.fixed,
      value: 150.00,
    },
    multiDayDiscountRate: {
      id: "multiDayDiscountRate",
      name: "Multi-day Discount Rate",
      type: VariableType.percentage,
      value: -20, // 20% discount per day
    },
    multiDayThreshold: {
      id: "multiDayThreshold",
      name: "Multi-day Threshold",
      type: VariableType.fixed,
      value: 2,
    },
  };

  const conferencePricing = createPricingProduct({
    name: "Technology Conference Pass",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Base Conference Price",
      pricing_product_id: conferencePricing.id,
      value_calculation: ["participants", "*", "singleDayPrice"],
    }),
    multiDayDiscount: createPricingFormula({
      formula_name: "multiDayDiscount",
      name: "Multi-day Discount",
      pricing_product_id: conferencePricing.id,
      value_calculation: ["subtotal", "*", "multiDayDiscountRate", "/", "100"],
      apply_condition: ["days", ">=", "multiDayThreshold"],
    }),
  };

  const conferencePrice: PricingPrice = createPricingPrice({
    name: "Technology Conference Pass",
    description: "Conference pass with multi-day discount",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "multiDayDiscount"],
    target: "per-participant",
    interval: "per-unit",
    pricing_product_id: conferencePricing.id,
  });

  // Test single day (no discount)
  const singleDayResult = PricingEngine.calculatePrice(
    conferencePrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { days: 1 } },
    productVariables,
  );
  assertEquals(singleDayResult.finalPrice, 150.00);

  // Test multi-day (with discount)
  const multiDayResult = PricingEngine.calculatePrice(
    conferencePrice,
    Object.values(formulas),
    "USD",
    { participants: 3, customVariables: { days: 3 } },
    productVariables,
  );
  assertEquals(multiDayResult.finalPrice, 360.00); // (3 * 150) - 20% = 450 - 90 = 360
});
