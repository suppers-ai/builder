import { Application } from "@suppers/shared";

// Re-export database type as primary type
export type { Application };

// Legacy type alias removed - use Application directly

export type ApplicationMetadata = Record<string, any>;

// Business logic helper function that works with database Application type
export function createApplication(applicationData: Partial<Application>): Application {
  const now = new Date().toISOString();

  return {
    id: applicationData.id || crypto.randomUUID(),
    name: applicationData.name || "",
    description: applicationData.description || null,
    slug: applicationData.slug || applicationData.name?.toLowerCase().replace(/\s+/g, "-") || "app",
    status: applicationData.status || "draft",
    thumbnail_url: applicationData.thumbnail_url || null,
    website_url: applicationData.website_url || null,
    display_entities_with_tags: applicationData.display_entities_with_tags || null,
    metadata: applicationData.metadata || null,
    created_at: applicationData.created_at || now,
    updated_at: applicationData.updated_at || now,
  };
}
