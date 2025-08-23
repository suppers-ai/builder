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

Deno.test("Appointment - Basic Medical Consultation", () => {
  const businessHours: ITimeSlot = {
    startTime: "08:00:00",
    endTime: "18:00:00",
  };

  const pricingProduct: PricingProduct = createPricingProduct({
    id: "medical-consultation",
    name: "Medical Consultation",
    description: "General medical consultation with licensed physician",
  });

  const consultationPrice: PricingPrice = setPriceAmount(
    createPricingPrice({
      name: "General Consultation",
      description: "45-minute general medical consultation",
      pricing_product_id: pricingProduct.id,
      pricing_type: "fixed",
      target: "flat",
      interval: "flat",
    }),
    { "USD": 150.00 },
  );

  const consultation: Product = createProduct({
    name: "Medical Consultation",
    description: "Professional medical consultation",
    seller_id: "test-seller",
    tags: { "appointment": true, "medical": true, "consultation": true },
  });

  assertExists(consultation.id);
  const tags = getProductTags(consultation);
  assertEquals(tags["appointment"], true);
  assertEquals(getPriceAmount(consultationPrice)["USD"], 150.00);
  assertEquals(businessHours.startTime, "08:00:00");
});

Deno.test("Appointment - Specialist with Premium Pricing", () => {
  const productVariables: Record<string, IPricingVariable> = {
    baseConsultationPrice: {
      id: "baseConsultationPrice",
      name: "Base Consultation Price",
      type: VariableType.fixed,
      value: 150.00,
    },
    specialistSurcharge: {
      id: "specialistSurcharge",
      name: "Specialist Surcharge",
      type: VariableType.fixed,
      value: 100.00,
    },
  };

  const specialistPricing = createPricingProduct({
    name: "Specialist Medical Consultation",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Base Consultation",
      pricing_product_id: specialistPricing.id,
      value_calculation: ["baseConsultationPrice"],
    }),
    specialistFee: createPricingFormula({
      formula_name: "specialistFee",
      name: "Specialist Surcharge",
      pricing_product_id: specialistPricing.id,
      value_calculation: ["specialistSurcharge"],
      apply_condition: ["isSpecialist", "==", 1],
    }),
  };

  const consultationPrice: PricingPrice = createPricingPrice({
    name: "Medical Consultation with Specialist Option",
    description: "Consultation with optional specialist surcharge",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "specialistFee"],
    target: "flat",
    interval: "flat",
    pricing_product_id: specialistPricing.id,
  });

  // Test standard consultation
  const standardResult = PricingEngine.calculatePrice(
    consultationPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { isSpecialist: 0 } },
    productVariables,
  );
  assertEquals(standardResult.finalPrice, 150.00);

  // Test specialist consultation
  const specialistResult = PricingEngine.calculatePrice(
    consultationPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { isSpecialist: 1 } },
    productVariables,
  );
  assertEquals(specialistResult.finalPrice, 250.00); // 150 + 100
});

Deno.test("Appointment - Legal Consultation with Time-based Billing", () => {
  const legalPricing: PricingProduct = createPricingProduct({
    id: "legal-consultation",
    name: "Legal Consultation",
  });

  const initialConsultation: PricingPrice = setPriceAmount(
    createPricingPrice({
      name: "Initial Legal Consultation",
      description: "First hour consultation with attorney",
      pricing_product_id: legalPricing.id,
      pricing_type: "fixed",
      target: "flat",
      interval: "flat",
    }),
    { "USD": 300.00 },
  );

  const additionalHour: PricingPrice = setPriceAmount(
    createPricingPrice({
      name: "Additional Hour",
      description: "Additional time beyond first hour",
      pricing_product_id: legalPricing.id,
      pricing_type: "fixed",
      target: "flat",
      interval: "per-unit",
    }),
    { "USD": 250.00 },
  );

  assertEquals(legalPricing.name, "Legal Consultation");
  assertEquals(getPriceAmount(initialConsultation)["USD"], 300.00);
  assertEquals(getPriceAmount(additionalHour)["USD"], 250.00);
});

Deno.test("Appointment - Therapy with Package Discounts", () => {
  const productVariables: Record<string, IPricingVariable> = {
    sessionPrice: {
      id: "sessionPrice",
      name: "Therapy Session Price",
      type: VariableType.fixed,
      value: 120.00,
    },
    packageDiscountRate: {
      id: "packageDiscountRate",
      name: "Package Discount Rate",
      type: VariableType.percentage,
      value: -10, // 10% discount
    },
    packageThreshold: {
      id: "packageThreshold",
      name: "Package Threshold",
      type: VariableType.fixed,
      value: 4,
    },
  };

  const therapyPricing = createPricingProduct({
    name: "Therapy Sessions with Package Discount",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Base Session Price",
      pricing_product_id: therapyPricing.id,
      value_calculation: ["participants", "*", "sessionPrice"],
    }),
    packageDiscount: createPricingFormula({
      formula_name: "packageDiscount",
      name: "Package Discount",
      pricing_product_id: therapyPricing.id,
      value_calculation: ["subtotal", "*", "packageDiscountRate", "/", "100"],
      apply_condition: ["participants", ">=", "packageThreshold"],
    }),
  };

  const therapyPrice: PricingPrice = createPricingPrice({
    name: "Therapy Sessions with Package Discount",
    description: "Individual therapy sessions with package pricing",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "packageDiscount"],
    target: "flat",
    interval: "per-unit",
    pricing_product_id: therapyPricing.id,
  });

  // Test single session (no discount)
  const singleResult = PricingEngine.calculatePrice(
    therapyPrice,
    Object.values(formulas),
    "USD",
    { participants: 1 },
    productVariables,
  );
  assertEquals(singleResult.finalPrice, 120.00);

  // Test package discount
  const packageResult = PricingEngine.calculatePrice(
    therapyPrice,
    Object.values(formulas),
    "USD",
    { participants: 4 },
    productVariables,
  );
  assertEquals(packageResult.finalPrice, 432.00); // (4 * 120) - 10% = 480 - 48 = 432
});

Deno.test("Appointment - Complete Purchase Flow", () => {
  const billingItems: IBillingItem[] = [
    {
      name: "Specialist Consultation",
      description: "Cardiology consultation - 60 minutes",
      quantity: 1,
      unitPrice: 250.00,
      total: 250.00,
    },
    {
      name: "ECG Test",
      description: "Electrocardiogram test and interpretation",
      quantity: 1,
      unitPrice: 75.00,
      total: 75.00,
    },
    {
      name: "Administrative Fee",
      description: "Processing and file management",
      quantity: 1,
      unitPrice: 15.00,
      total: 15.00,
    },
    {
      name: "Medical Tax",
      description: "Healthcare service tax",
      quantity: 1,
      unitPrice: 27.20,
      total: 27.20,
      isTax: true,
    },
  ];

  const appointmentPurchase: IPurchase = {
    id: crypto.randomUUID(),
    userId: "patient-123",
    product: {
      id: "specialist-consultation",
      name: "Cardiology Consultation",
      currency: "USD",
    },
    status: PurchaseStatus.confirmed,
    paymentData: {
      timestamp: Date.now(),
      paymentType: PaymentType.stripe,
      paymentId: "pi_appointment_123",
    },
    purchaseData: {
      appointmentDate: "2024-09-15",
      appointmentTime: "14:00:00",
      duration: 60, // minutes
      appointmentType: "specialist-consultation",
      practitioner: {
        id: "dr-smith-001",
        name: "Dr. Sarah Smith",
        specialization: "Cardiology",
      },
      patient: {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1980-05-15",
        insurance: {
          provider: "Blue Cross",
          policyNumber: "BC123456789",
        },
      },
      reasonForVisit: "Annual cardiac checkup and ECG",
      symptoms: "Occasional chest tightness during exercise",
    },
    billingItems,
    verId: 1,
  };

  assertExists(appointmentPurchase.id);
  assertEquals(appointmentPurchase.status, PurchaseStatus.confirmed);
  assertEquals(appointmentPurchase.billingItems.length, 4);
  assertEquals(appointmentPurchase.purchaseData.duration, 60);
  assertEquals(appointmentPurchase.purchaseData.practitioner.specialization, "Cardiology");

  // Calculate total
  const total = appointmentPurchase.billingItems.reduce((sum, item) => sum + item.total, 0);
  assertEquals(total, 367.20); // 250 + 75 + 15 + 27.20
});

Deno.test("Appointment - Strict Cancellation Policy", () => {
  const earlyCancel: CancellationPolicy = {
    id: "early-cancel-72h",
    name: "Early Cancellation",
    description: "100% refund if cancelled more than 72 hours in advance",
    refund: {
      type: RefundType.percentage,
      amount: 100,
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 72 * 60 * 60 * 1000, // 72 hours
    },
  };

  const standardCancel: CancellationPolicy = {
    id: "standard-cancel-24h",
    name: "Standard Cancellation",
    description: "50% refund if cancelled between 24-72 hours in advance",
    refund: {
      type: RefundType.percentage,
      amount: 50,
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  const lateCancel: CancellationPolicy = {
    id: "late-cancel-24h",
    name: "Late Cancellation",
    description: "No refund for cancellations within 24 hours",
    refund: {
      type: RefundType.percentage,
      amount: 0,
    },
    condition: {
      type: CancellationConditionType.cutoffTime,
      value: 0,
    },
  };

  const appointmentCancellation: ICancellationPolicy = {
    id: "appointment-cancellation",
    name: "Medical Appointment Cancellation Policy",
    description: "Standard cancellation policy for medical appointments",
    policies: {
      "before-72h": earlyCancel,
      "24h-72h": standardCancel,
      "within-24h": lateCancel,
    },
  };

  assertEquals(Object.keys(appointmentCancellation.policies).length, 3);
  assertEquals(appointmentCancellation.policies["before-72h"].refund?.amount, 100);
  assertEquals(appointmentCancellation.policies["24h-72h"].refund?.amount, 50);
  assertEquals(appointmentCancellation.policies["within-24h"].refund?.amount, 0);
});

Deno.test("Appointment - Emergency After-Hours Consultation", () => {
  const productVariables: Record<string, IPricingVariable> = {
    regularConsultationPrice: {
      id: "regularConsultationPrice",
      name: "Regular Consultation Price",
      type: VariableType.fixed,
      value: 150.00,
    },
    afterHoursEmergencyFee: {
      id: "afterHoursEmergencyFee",
      name: "After-Hours Emergency Fee",
      type: VariableType.fixed,
      value: 200.00,
    },
  };

  const emergencyPricing = createPricingProduct({
    name: "Emergency Medical Consultation",
  });

  const formulas = {
    basePrice: createPricingFormula({
      formula_name: "basePrice",
      name: "Regular Consultation",
      pricing_product_id: emergencyPricing.id,
      value_calculation: ["regularConsultationPrice"],
    }),
    emergencyFee: createPricingFormula({
      formula_name: "emergencyFee",
      name: "After-Hours Emergency Fee",
      pricing_product_id: emergencyPricing.id,
      value_calculation: ["afterHoursEmergencyFee"],
      apply_condition: ["isAfterHours", "==", 1],
    }),
  };

  const emergencyPrice: PricingPrice = createPricingPrice({
    name: "Emergency Medical Consultation",
    description: "Medical consultation with after-hours emergency fee",
    pricing_type: "dynamic",
    formula_names: ["basePrice", "emergencyFee"],
    target: "flat",
    interval: "flat",
    pricing_product_id: emergencyPricing.id,
  });

  // Test regular hours
  const regularResult = PricingEngine.calculatePrice(
    emergencyPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { isAfterHours: 0 } },
    productVariables,
  );
  assertEquals(regularResult.finalPrice, 150.00);

  // Test after-hours emergency
  const emergencyResult = PricingEngine.calculatePrice(
    emergencyPrice,
    Object.values(formulas),
    "USD",
    { participants: 1, customVariables: { isAfterHours: 1 } },
    productVariables,
  );
  assertEquals(emergencyResult.finalPrice, 350.00); // 150 + 200
});

Deno.test("Appointment - Group Therapy Session", () => {
  const groupTherapy: PricingProduct = createPricingProduct({
    id: "group-therapy",
    name: "Group Therapy Session",
  });

  const groupSession: PricingPrice = setPriceAmount(
    createPricingPrice({
      name: "Group Therapy Session",
      description: "Group therapy session (4-8 participants)",
      pricing_product_id: groupTherapy.id,
      pricing_type: "fixed",
      target: "per-participant",
      interval: "flat",
    }),
    { "USD": 45.00 },
  );

  assertEquals(groupSession.target, "per-participant");
  assertEquals(getPriceAmount(groupSession)["USD"], 45.00);
  assertEquals(groupTherapy.name, "Group Therapy Session");
});
