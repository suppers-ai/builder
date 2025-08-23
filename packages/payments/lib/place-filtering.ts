import { Application, Place } from "@suppers/shared";

export function getPlacesForApplication(places: Place[], application: Application): Place[] {
  // For now, since the database Application doesn't have displayPlaceWithTags,
  // we return all places. This can be extended when the database schema includes
  // application-specific place filtering rules.
  return places.filter((place) => place.status === "active");
}

export function getApplicationsForPlace(place: Place, applications: Application[]): Application[] {
  // For now, return all published applications since the database schema
  // doesn't include tag-based filtering rules yet.
  return applications.filter((app) => app.status === "published" || app.status === "pending");
}

export function canPlaceBeShownInApplication(place: Place, application: Application): boolean {
  // For now, allow all active places to be shown in published applications
  return place.status === "active" &&
    (application.status === "published" || application.status === "pending");
}
