#!/usr/bin/env deno run --allow-all

/**
 * Data Migration Utility for Payments System Refactoring
 * Migrates existing tag-based data to the new dynamic type system
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

interface MigrationConfig {
  supabaseUrl: string;
  supabaseKey: string;
  dryRun: boolean;
  batchSize: number;
}

interface TagMappingRule {
  tag: string;
  entityType: string;
  entitySubType?: string;
  metadata?: Record<string, any>;
}

interface ProductTagMappingRule {
  tag: string;
  productType: string;
  productSubType?: string;
  metadata?: Record<string, any>;
}

class DataMigrationService {
  private supabase: any;
  private config: MigrationConfig;

  constructor(config: MigrationConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  /**
   * Main migration orchestrator
   */
  async runMigration(): Promise<void> {
    console.log("🚀 Starting Payments System Data Migration");
    console.log(`📊 Mode: ${this.config.dryRun ? "DRY RUN" : "LIVE MIGRATION"}`);
    console.log(`📦 Batch Size: ${this.config.batchSize}`);
    console.log("");

    try {
      // Step 1: Analyze existing data
      const analysis = await this.analyzeExistingData();
      this.printAnalysis(analysis);

      // Step 2: Setup default type mappings
      const entityMappings = this.createEntityTagMappings();
      const productMappings = this.createProductTagMappings();

      // Step 3: Migrate entities
      await this.migrateEntities(entityMappings);

      // Step 4: Migrate products
      await this.migrateProducts(productMappings);

      // Step 5: Generate migration report
      await this.generateMigrationReport();

      console.log("\n✅ Migration completed successfully!");
    } catch (error) {
      console.error("\n❌ Migration failed:", error);
      throw error;
    }
  }

  /**
   * Analyze existing data structure
   */
  private async analyzeExistingData(): Promise<any> {
    console.log("🔍 Analyzing existing data...");

    const [entitiesResult, productsResult] = await Promise.all([
      this.supabase.from("entities").select("id, tags, type").limit(1000),
      this.supabase.from("products").select("id, tags, type").limit(1000),
    ]);

    const entityTags = new Set<string>();
    const productTags = new Set<string>();
    const entityTypes = new Set<string>();
    const productTypes = new Set<string>();

    // Analyze entity tags
    entitiesResult.data?.forEach((entity: any) => {
      if (entity.tags && Array.isArray(entity.tags)) {
        entity.tags.forEach((tag: string) => entityTags.add(tag));
      }
      if (entity.type) {
        entityTypes.add(entity.type);
      }
    });

    // Analyze product tags
    productsResult.data?.forEach((product: any) => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach((tag: string) => productTags.add(tag));
      }
      if (product.type) {
        productTypes.add(product.type);
      }
    });

    return {
      entities: {
        total: entitiesResult.data?.length || 0,
        uniqueTags: Array.from(entityTags),
        existingTypes: Array.from(entityTypes),
      },
      products: {
        total: productsResult.data?.length || 0,
        uniqueTags: Array.from(productTags),
        existingTypes: Array.from(productTypes),
      },
    };
  }

  /**
   * Create entity tag mapping rules
   */
  private createEntityTagMappings(): TagMappingRule[] {
    return [
      // Accommodation mappings
      { tag: "hotel", entityType: "accommodation", entitySubType: "hotel" },
      { tag: "hostel", entityType: "accommodation", entitySubType: "hostel" },
      { tag: "apartment", entityType: "accommodation", entitySubType: "vacation_rental" },
      { tag: "vacation_rental", entityType: "accommodation", entitySubType: "vacation_rental" },
      { tag: "bed_breakfast", entityType: "accommodation", entitySubType: "bed_breakfast" },

      // Service mappings
      { tag: "consultation", entityType: "service", entitySubType: "consultation" },
      { tag: "therapy", entityType: "service", entitySubType: "therapy" },
      { tag: "coaching", entityType: "service", entitySubType: "coaching" },
      { tag: "training", entityType: "service", entitySubType: "training" },

      // Experience mappings
      { tag: "tour", entityType: "experience", entitySubType: "tour" },
      { tag: "event", entityType: "experience", entitySubType: "event" },
      { tag: "activity", entityType: "experience", entitySubType: "activity" },
      { tag: "workshop", entityType: "experience", entitySubType: "workshop" },

      // Amenity tags -> metadata
      { tag: "wifi", entityType: "accommodation", metadata: { wifi_available: true } },
      { tag: "pool", entityType: "accommodation", metadata: { has_pool: true } },
      { tag: "gym", entityType: "accommodation", metadata: { has_gym: true } },
      { tag: "spa", entityType: "accommodation", metadata: { has_spa: true } },
      { tag: "restaurant", entityType: "accommodation", metadata: { has_restaurant: true } },
      { tag: "parking", entityType: "accommodation", metadata: { has_parking: true } },
      { tag: "pet_friendly", entityType: "accommodation", metadata: { pets_allowed: true } },

      // Rating tags -> metadata
      { tag: "5_star", entityType: "accommodation", metadata: { star_rating: 5 } },
      { tag: "4_star", entityType: "accommodation", metadata: { star_rating: 4 } },
      { tag: "3_star", entityType: "accommodation", metadata: { star_rating: 3 } },
      { tag: "2_star", entityType: "accommodation", metadata: { star_rating: 2 } },
      { tag: "1_star", entityType: "accommodation", metadata: { star_rating: 1 } },
    ];
  }

  /**
   * Create product tag mapping rules
   */
  private createProductTagMappings(): ProductTagMappingRule[] {
    return [
      // E-commerce mappings
      { tag: "digital", productType: "ecommerce", productSubType: "digital" },
      { tag: "physical", productType: "ecommerce", productSubType: "physical" },
      { tag: "subscription", productType: "ecommerce", productSubType: "subscription" },
      { tag: "software", productType: "ecommerce", productSubType: "digital" },
      { tag: "book", productType: "ecommerce", productSubType: "digital" },
      { tag: "course", productType: "ecommerce", productSubType: "digital" },

      // Service product mappings
      { tag: "consultation_service", productType: "service", productSubType: "consultation" },
      { tag: "therapy_session", productType: "service", productSubType: "therapy" },
      { tag: "coaching_session", productType: "service", productSubType: "coaching" },
      { tag: "training_program", productType: "service", productSubType: "training" },

      // Accommodation product mappings
      { tag: "room_booking", productType: "accommodation", productSubType: "room" },
      { tag: "package_deal", productType: "accommodation", productSubType: "package" },

      // Attribute tags -> metadata
      { tag: "premium", productType: null, metadata: { tier: "premium" } },
      { tag: "basic", productType: null, metadata: { tier: "basic" } },
      { tag: "featured", productType: null, metadata: { featured: true } },
      { tag: "limited_time", productType: null, metadata: { limited_time: true } },
      { tag: "bestseller", productType: null, metadata: { bestseller: true } },
    ];
  }

  /**
   * Migrate entities with tag mapping
   */
  private async migrateEntities(mappings: TagMappingRule[]): Promise<void> {
    console.log("\n🏢 Migrating entities...");

    let offset = 0;
    let processed = 0;
    let updated = 0;

    while (true) {
      const { data: entities, error } = await this.supabase
        .from("entities")
        .select("id, name, tags, type, metadata")
        .range(offset, offset + this.config.batchSize - 1);

      if (error) throw error;
      if (!entities || entities.length === 0) break;

      const updates = [];

      for (const entity of entities) {
        const migration = this.processEntityTags(entity, mappings);
        if (migration.hasChanges) {
          updates.push({
            id: entity.id,
            ...migration.updates,
          });
        }
        processed++;
      }

      if (updates.length > 0 && !this.config.dryRun) {
        for (const update of updates) {
          const { error } = await this.supabase
            .from("entities")
            .update(update)
            .eq("id", update.id);

          if (error) {
            console.error(`Failed to update entity ${update.id}:`, error);
          } else {
            updated++;
          }
        }
      } else if (this.config.dryRun) {
        updated += updates.length;
      }

      console.log(`📊 Processed ${processed} entities, updated ${updated}`);
      offset += this.config.batchSize;
    }

    console.log(`✅ Entity migration complete: ${processed} processed, ${updated} updated`);
  }

  /**
   * Migrate products with tag mapping
   */
  private async migrateProducts(mappings: ProductTagMappingRule[]): Promise<void> {
    console.log("\n📦 Migrating products...");

    let offset = 0;
    let processed = 0;
    let updated = 0;

    while (true) {
      const { data: products, error } = await this.supabase
        .from("products")
        .select("id, name, tags, type, metadata")
        .range(offset, offset + this.config.batchSize - 1);

      if (error) throw error;
      if (!products || products.length === 0) break;

      const updates = [];

      for (const product of products) {
        const migration = this.processProductTags(product, mappings);
        if (migration.hasChanges) {
          updates.push({
            id: product.id,
            ...migration.updates,
          });
        }
        processed++;
      }

      if (updates.length > 0 && !this.config.dryRun) {
        for (const update of updates) {
          const { error } = await this.supabase
            .from("products")
            .update(update)
            .eq("id", update.id);

          if (error) {
            console.error(`Failed to update product ${update.id}:`, error);
          } else {
            updated++;
          }
        }
      } else if (this.config.dryRun) {
        updated += updates.length;
      }

      console.log(`📊 Processed ${processed} products, updated ${updated}`);
      offset += this.config.batchSize;
    }

    console.log(`✅ Product migration complete: ${processed} processed, ${updated} updated`);
  }

  /**
   * Process entity tags and determine migration
   */
  private processEntityTags(entity: any, mappings: TagMappingRule[]): any {
    const updates: any = {};
    let hasChanges = false;
    const metadata = { ...entity.metadata } || {};

    if (!entity.tags || !Array.isArray(entity.tags)) {
      return { hasChanges: false, updates: {} };
    }

    for (const tag of entity.tags) {
      const mapping = mappings.find((m) => m.tag === tag);
      if (mapping) {
        // Set type and sub-type if not already set
        if (mapping.entityType && !updates.type) {
          updates.type = mapping.entityType;
          hasChanges = true;
        }

        if (mapping.entitySubType && !updates.sub_type) {
          updates.sub_type = mapping.entitySubType;
          hasChanges = true;
        }

        // Merge metadata
        if (mapping.metadata) {
          Object.assign(metadata, mapping.metadata);
          hasChanges = true;
        }
      }
    }

    if (Object.keys(metadata).length > 0) {
      updates.metadata = metadata;
    }

    return { hasChanges, updates };
  }

  /**
   * Process product tags and determine migration
   */
  private processProductTags(product: any, mappings: ProductTagMappingRule[]): any {
    const updates: any = {};
    let hasChanges = false;
    const metadata = { ...product.metadata } || {};

    if (!product.tags || !Array.isArray(product.tags)) {
      return { hasChanges: false, updates: {} };
    }

    for (const tag of product.tags) {
      const mapping = mappings.find((m) => m.tag === tag);
      if (mapping) {
        // Set type and sub-type if not already set
        if (mapping.productType && !updates.type) {
          updates.type = mapping.productType;
          hasChanges = true;
        }

        if (mapping.productSubType && !updates.sub_type) {
          updates.sub_type = mapping.productSubType;
          hasChanges = true;
        }

        // Merge metadata
        if (mapping.metadata) {
          Object.assign(metadata, mapping.metadata);
          hasChanges = true;
        }
      }
    }

    if (Object.keys(metadata).length > 0) {
      updates.metadata = metadata;
    }

    return { hasChanges, updates };
  }

  /**
   * Print data analysis results
   */
  private printAnalysis(analysis: any): void {
    console.log("📊 Data Analysis Results:");
    console.log(`  Entities: ${analysis.entities.total} total`);
    console.log(`  Entity Tags: ${analysis.entities.uniqueTags.length} unique`);
    console.log(`  Entity Types: ${analysis.entities.existingTypes.length} existing`);
    console.log(`  Products: ${analysis.products.total} total`);
    console.log(`  Product Tags: ${analysis.products.uniqueTags.length} unique`);
    console.log(`  Product Types: ${analysis.products.existingTypes.length} existing`);

    if (analysis.entities.uniqueTags.length > 0) {
      console.log(`  Top Entity Tags: ${analysis.entities.uniqueTags.slice(0, 10).join(", ")}`);
    }

    if (analysis.products.uniqueTags.length > 0) {
      console.log(`  Top Product Tags: ${analysis.products.uniqueTags.slice(0, 10).join(", ")}`);
    }
  }

  /**
   * Generate migration report
   */
  private async generateMigrationReport(): Promise<void> {
    console.log("\n📋 Generating migration report...");

    const postMigrationAnalysis = await this.analyzeExistingData();

    const report = {
      timestamp: new Date().toISOString(),
      mode: this.config.dryRun ? "DRY_RUN" : "LIVE_MIGRATION",
      results: postMigrationAnalysis,
      recommendations: this.generateRecommendations(postMigrationAnalysis),
    };

    const reportPath = `./migration-report-${Date.now()}.json`;

    if (!this.config.dryRun) {
      await Deno.writeTextFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`📄 Migration report saved to: ${reportPath}`);
    } else {
      console.log("📄 Migration Report (Dry Run):");
      console.log(JSON.stringify(report, null, 2));
    }
  }

  /**
   * Generate recommendations based on migration results
   */
  private generateRecommendations(analysis: any): string[] {
    const recommendations = [];

    if (analysis.entities.uniqueTags.length > 20) {
      recommendations.push(
        "Consider creating additional entity sub-types for better categorization",
      );
    }

    if (analysis.products.uniqueTags.length > 15) {
      recommendations.push(
        "Consider creating additional product sub-types for better organization",
      );
    }

    if (analysis.entities.existingTypes.length === 0) {
      recommendations.push("Ensure default entity types are properly configured");
    }

    if (analysis.products.existingTypes.length === 0) {
      recommendations.push("Ensure default product types are properly configured");
    }

    recommendations.push("Review migrated metadata for data quality and consistency");
    recommendations.push("Update search indexes after migration for optimal performance");
    recommendations.push("Test geographic search functionality with migrated location data");

    return recommendations;
  }
}

// Main execution
if (import.meta.main) {
  const config: MigrationConfig = {
    supabaseUrl: Deno.env.get("SUPABASE_URL") || "http://localhost:54321",
    supabaseKey: Deno.env.get("SUPABASE_ANON_KEY") || "your-anon-key",
    dryRun: Deno.args.includes("--dry-run"),
    batchSize: parseInt(Deno.env.get("BATCH_SIZE") || "100"),
  };

  const migrationService = new DataMigrationService(config);

  try {
    await migrationService.runMigration();
  } catch (error) {
    console.error("Migration failed:", error);
    Deno.exit(1);
  }
}
