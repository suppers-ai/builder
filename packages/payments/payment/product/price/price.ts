import { PricingFormula, PricingPrice, PricingProduct } from "@suppers/shared";

// Re-export database types as primary types
export type { PricingFormula, PricingPrice, PricingProduct };

// Legacy type aliases removed - use PricingProduct, PricingPrice, PricingFormula directly

/**
 * The currency of the price, we use string to allow for custom currencies
 */
export type Currency = string;

export enum PricingModel {
  // Time-based pricing (hotels, rentals, hourly services)
  timeBased = "time-based",
  // Service-based pricing (appointments, events)
  serviceBased = "service-based",
  // Product-based pricing (ecommerce, physical goods)
  productBased = "product-based",
}

export enum PricingType {
  // Fixed pricing (traditional)
  fixed = "fixed",
  // Dynamic pricing using formulas
  dynamic = "dynamic",
}

// Database-compatible enums (keeping for business logic)
export enum PriceTarget {
  perParticipant = "per-participant",
  perGroupOfParticipants = "per-group-of-participants",
  flat = "flat",
}

export enum PriceInterval {
  perUnit = "per-unit",
  flat = "flat",
}

// Helper functions to work with database PricingProduct and PricingPrice types
export function createPricingProduct(productData: Partial<PricingProduct>): PricingProduct {
  const now = new Date().toISOString();

  return {
    id: productData.id || crypto.randomUUID(),
    name: productData.name || "",
    description: productData.description || null,
    owner_id: productData.owner_id || "",
    created_at: productData.created_at || now,
    updated_at: productData.updated_at || now,
  };
}

// Helper functions to work with database PricingPrice type
export function createPricingPrice(priceData: Partial<PricingPrice>): PricingPrice {
  const now = new Date().toISOString();

  return {
    id: priceData.id || crypto.randomUUID(),
    name: priceData.name || "",
    description: priceData.description || null,
    pricing_product_id: priceData.pricing_product_id || "",
    pricing_type: priceData.pricing_type || "fixed",
    target: priceData.target || "flat",
    interval: priceData.interval || "flat",
    amount: priceData.amount || null,
    formula_names: priceData.formula_names || null,
    created_at: priceData.created_at || now,
    updated_at: priceData.updated_at || now,
  };
}

// Helper functions for working with JSON fields
export function getPriceAmount(price: PricingPrice): Record<Currency, number> {
  if (!price.amount || typeof price.amount !== "object") return {};
  return price.amount as Record<Currency, number>;
}

export function setPriceAmount(
  price: PricingPrice,
  amount: Record<Currency, number>,
): PricingPrice {
  return { ...price, amount: amount as any };
}

export function getFormulaNames(price: PricingPrice): string[] {
  if (!price.formula_names || !Array.isArray(price.formula_names)) return [];
  return price.formula_names as string[];
}

export function setFormulaNames(price: PricingPrice, formulaNames: string[]): PricingPrice {
  return { ...price, formula_names: formulaNames as any };
}
