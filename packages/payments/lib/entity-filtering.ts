import { Application, Entity } from "@suppers/shared";

export function getEntitiesForApplication(entities: Entity[], application: Application): Entity[] {
  // For now, since the database Application doesn't have displayEntityWithTags,
  // we return all entities. This can be extended when the database schema includes
  // application-specific entity filtering rules.
  return entities.filter((entity) => entity.status === "active");
}

export function getApplicationsForEntity(
  entity: Entity,
  applications: Application[],
): Application[] {
  // For now, return all published applications since the database schema
  // doesn't include tag-based filtering rules yet.
  return applications.filter((app) => app.status === "published" || app.status === "pending");
}

export function canEntityBeShownInApplication(entity: Entity, application: Application): boolean {
  // For now, allow all active entities to be shown in published applications
  return entity.status === "active" &&
    (application.status === "published" || application.status === "pending");
}
