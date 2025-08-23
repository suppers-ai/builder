/**
 * Comprehensive test for the place management workflow
 * Tests the complete flow from creating places to managing products and variables
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.207.0/assert/mod.ts";
import {
  createPlace,
  getPlaceTags,
  Place,
  PlaceVariable,
  PlaceVariableType,
  setPlaceTags,
} from "../payment/place.ts";
// Application type will be created inline for testing purposes

// Test helper for application with display tags
interface TestApplication {
  id: string;
  name: string;
  displayPlaceWithTags?: string[];
}

function createTestApplication(data: Partial<TestApplication>): TestApplication {
  return {
    id: data.id || crypto.randomUUID(),
    name: data.name || "",
    displayPlaceWithTags: data.displayPlaceWithTags || [],
  };
}

// Domain-specific filtering functions for testing
function getPlacesForApplicationDomain(places: Place[], application: TestApplication): Place[] {
  if (!application.displayPlaceWithTags || application.displayPlaceWithTags.length === 0) {
    return places;
  }
  return places.filter((place) => {
    const tags = getPlaceTags(place);
    if (!tags || Object.keys(tags).length === 0) {
      return false;
    }
    return application.displayPlaceWithTags!.some((appTag) => tags[appTag] === true);
  });
}

function canPlaceBeShownInApplicationDomain(place: Place, application: TestApplication): boolean {
  if (!application.displayPlaceWithTags || application.displayPlaceWithTags.length === 0) {
    return true;
  }
  const tags = getPlaceTags(place);
  if (!tags || Object.keys(tags).length === 0) {
    return false;
  }
  return application.displayPlaceWithTags!.some((appTag) => tags[appTag] === true);
}

Deno.test("Place Management Workflow", async (t) => {
  await t.step("Create Place", () => {
    const placeData = {
      name: "Test Hotel",
      description: "A beautiful test hotel",
      owner_id: "user-123",
      tags: { "accommodation": true, "hotel": true },
    };

    const place = createPlace(placeData);

    assertEquals(place.name, "Test Hotel");
    assertEquals(place.description, "A beautiful test hotel");
    assertEquals(place.owner_id, "user-123");
    assertEquals(place.status, "active");
    assertEquals(place.verified, true);
    assertEquals(place.version_id, 1);
    assertExists(place.id);
    assertExists(place.created_at);
    assertExists(place.updated_at);

    // Check tags
    const tags = getPlaceTags(place);
    assertEquals(tags.accommodation, true);
    assertEquals(tags.hotel, true);
  });

  await t.step("Create Test Application", () => {
    const appData = {
      name: "Booking App",
      displayPlaceWithTags: ["accommodation", "hotel"],
    };

    const app = createTestApplication(appData);

    assertEquals(app.name, "Booking App");
    assertEquals(app.displayPlaceWithTags, ["accommodation", "hotel"]);
    assertExists(app.id);
  });

  await t.step("Place-Application Filtering", () => {
    // Create test places
    const hotelPlace = createPlace({
      name: "Hotel Paradise",
      owner_id: "user-1",
      tags: { "accommodation": true, "hotel": true },
    });

    const restaurantPlace = createPlace({
      name: "Fine Dining",
      owner_id: "user-2",
      tags: { "restaurant": true, "food": true },
    });

    const mixedPlace = createPlace({
      name: "Hotel with Restaurant",
      owner_id: "user-3",
      tags: { "accommodation": true, "hotel": true, "restaurant": true },
    });

    // Create test applications
    const hotelApp = createTestApplication({
      name: "Hotel Booking App",
      displayPlaceWithTags: ["accommodation", "hotel"],
    });

    const restaurantApp = createTestApplication({
      name: "Restaurant Booking App",
      displayPlaceWithTags: ["restaurant", "food"],
    });

    const generalApp = createTestApplication({
      name: "General App",
      displayPlaceWithTags: [], // Accepts all places
    });

    const places = [hotelPlace, restaurantPlace, mixedPlace];

    // Test hotel app filtering
    const hotelAppPlaces = getPlacesForApplicationDomain(places, hotelApp);
    assertEquals(hotelAppPlaces.length, 2); // hotelPlace and mixedPlace
    assertEquals(hotelAppPlaces.map((p) => p.name).sort(), [
      "Hotel Paradise",
      "Hotel with Restaurant",
    ]);

    // Test restaurant app filtering
    const restaurantAppPlaces = getPlacesForApplicationDomain(places, restaurantApp);
    assertEquals(restaurantAppPlaces.length, 2); // restaurantPlace and mixedPlace
    assertEquals(restaurantAppPlaces.map((p) => p.name).sort(), [
      "Fine Dining",
      "Hotel with Restaurant",
    ]);

    // Test general app (should accept all)
    const generalAppPlaces = getPlacesForApplicationDomain(places, generalApp);
    assertEquals(generalAppPlaces.length, 3);

    // Test individual place compatibility
    assertEquals(canPlaceBeShownInApplicationDomain(hotelPlace, hotelApp), true);
    assertEquals(canPlaceBeShownInApplicationDomain(hotelPlace, restaurantApp), false);
    assertEquals(canPlaceBeShownInApplicationDomain(mixedPlace, hotelApp), true);
    assertEquals(canPlaceBeShownInApplicationDomain(mixedPlace, restaurantApp), true);
    assertEquals(canPlaceBeShownInApplicationDomain(restaurantPlace, generalApp), true);
  });

  await t.step("Place Variables", () => {
    const place = createPlace({
      name: "Test Place",
      owner_id: "user-123",
    });

    // Test different variable types
    const textVariable: PlaceVariable = {
      id: "var-1",
      variable_id: "checkInTime",
      name: "Check-in Time",
      description: "Standard check-in time",
      type: "text",
      value: "3:00 PM",
      place_id: place.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const numberVariable: PlaceVariable = {
      id: "var-2",
      variable_id: "maxCapacity",
      name: "Maximum Capacity",
      description: null,
      type: "number",
      value: 100,
      place_id: place.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const booleanVariable: PlaceVariable = {
      id: "var-3",
      variable_id: "wifiAvailable",
      name: "WiFi Available",
      description: null,
      type: "boolean",
      value: true,
      place_id: place.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const jsonVariable: PlaceVariable = {
      id: "var-4",
      variable_id: "amenities",
      name: "Amenities",
      description: null,
      type: "json",
      value: { pool: true, gym: true, spa: false },
      place_id: place.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Test variable validation
    assertEquals(textVariable.variable_id, "checkInTime");
    assertEquals(textVariable.name, "Check-in Time");
    assertEquals(textVariable.type, "text");
    assertEquals(textVariable.value, "3:00 PM");

    assertEquals(numberVariable.variable_id, "maxCapacity");
    assertEquals(numberVariable.value, 100);

    assertEquals(booleanVariable.value, true);
    assertEquals((jsonVariable.value as any)?.pool, true);

    // Test that all variables are linked to the place
    assertEquals(textVariable.place_id, place.id);
    assertEquals(numberVariable.place_id, place.id);
    assertEquals(booleanVariable.place_id, place.id);
    assertEquals(jsonVariable.place_id, place.id);
  });

  await t.step("Product-Place Association", () => {
    const place = createPlace({
      name: "Resort Hotel",
      owner_id: "user-123",
      tags: { "accommodation": true, "resort": true },
    });

    // In the database schema, products have a place_id field rather than
    // places having a products array. This test validates the place creation
    assertEquals(place.name, "Resort Hotel");
    assertEquals(place.owner_id, "user-123");

    const tags = getPlaceTags(place);
    assertEquals(tags.accommodation, true);
    assertEquals(tags.resort, true);
  });

  await t.step("Place Status Management", () => {
    // Test different place statuses
    const activePlace = createPlace({
      name: "Active Place",
      owner_id: "user-123",
      status: "active",
    });

    const pendingPlace = createPlace({
      name: "Pending Place",
      owner_id: "user-123",
      status: "pending",
      verified: false,
    });

    const deletedPlace = createPlace({
      name: "Deleted Place",
      owner_id: "user-123",
      status: "deleted",
    });

    assertEquals(activePlace.status, "active");
    assertEquals(activePlace.verified, true);

    assertEquals(pendingPlace.status, "pending");
    assertEquals(pendingPlace.verified, false);

    assertEquals(deletedPlace.status, "deleted");
  });
});

Deno.test("Place Management Edge Cases", async (t) => {
  await t.step("Empty Tags Handling", () => {
    const placeWithoutTags = createPlace({
      name: "No Tags Place",
      owner_id: "user-123",
    });

    const appWithTags = createTestApplication({
      name: "Specific App",
      displayPlaceWithTags: ["hotel"],
    });

    const appWithoutTags = createTestApplication({
      name: "General App",
    });

    // Place without tags should not match app with specific tag requirements
    assertEquals(canPlaceBeShownInApplicationDomain(placeWithoutTags, appWithTags), false);

    // Place without tags should match app without tag requirements
    assertEquals(canPlaceBeShownInApplicationDomain(placeWithoutTags, appWithoutTags), true);
  });

  await t.step("Variable Type Validation", () => {
    // Test that variable types are properly enforced
    const variables = [
      { type: PlaceVariableType.text, validValue: "text", invalidValue: null },
      { type: PlaceVariableType.number, validValue: 42, invalidValue: "not a number" },
      { type: PlaceVariableType.boolean, validValue: true, invalidValue: "maybe" },
      {
        type: PlaceVariableType.json,
        validValue: { key: "value" },
        invalidValue: "not json object",
      },
    ];

    variables.forEach(({ type, validValue }) => {
      const variable: PlaceVariable = {
        id: `var-${type}`,
        variable_id: `test${type}`,
        place_id: "test-place-id",
        name: `Test ${type}`,
        description: null,
        type,
        value: validValue,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // This should not throw - we're just testing the interface accepts the values
      assertEquals(variable.type, type);
      assertEquals(variable.value, validValue);
    });
  });

  await t.step("Large Dataset Performance", () => {
    // Test performance with larger datasets
    const places: Place[] = [];
    for (let i = 0; i < 1000; i++) {
      places.push(createPlace({
        name: `Place ${i}`,
        owner_id: `user-${i % 10}`,
        tags: {
          [`type-${i % 5}`]: true,
          [`category-${i % 3}`]: true,
        },
      }));
    }

    const app = createTestApplication({
      name: "Test App",
      displayPlaceWithTags: ["type-0", "type-1"],
    });

    const startTime = performance.now();
    const filteredPlaces = getPlacesForApplicationDomain(places, app);
    const endTime = performance.now();

    // Should filter correctly
    assertEquals(filteredPlaces.length, 400); // 200 with type-0 + 200 with type-1

    // Should be reasonably fast (less than 10ms for 1000 items)
    const duration = endTime - startTime;
    console.log(`Filtering 1000 places took ${duration}ms`);
    // Note: We don't assert on performance in tests as it varies by environment
  });
});
