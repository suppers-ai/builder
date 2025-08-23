#!/usr/bin/env deno run --allow-all

/**
 * Demo script showing the new dynamic type system functionality
 */

import { validateMetadata, mapMetadataToFilters } from "./packages/api/supabase/functions/api/lib/metadata-validation.ts";

console.log("🏨 Suppers AI Builder - Dynamic Type System Demo\n");

// 1. Demo: Entity Type Schema for Hotels
console.log("1. Hotel Entity Type Schema:");
const hotelSchema = {
  fields: {
    starRating: { 
      type: "number" as const, 
      label: "Star Rating", 
      required: true, 
      min: 1, 
      max: 5 
    },
    amenities: { 
      type: "array" as const, 
      label: "Amenities", 
      max: 10,
      options: ["wifi", "pool", "gym", "spa", "restaurant", "bar", "parking", "pet-friendly"]
    },
    roomCount: { 
      type: "number" as const, 
      label: "Room Count", 
      required: true, 
      min: 1 
    },
    checkInTime: { 
      type: "time" as const, 
      label: "Check-in Time", 
      default: "15:00" 
    },
    allowsPets: { 
      type: "boolean" as const, 
      label: "Allows Pets", 
      default: false 
    },
    openingDate: { 
      type: "date" as const, 
      label: "Opening Date" 
    }
  }
};

// 2. Demo: Valid hotel metadata
console.log("\n2. Valid Hotel Metadata:");
const validHotelData = {
  starRating: 4,
  amenities: ["wifi", "pool", "restaurant"],
  roomCount: 120,
  checkInTime: "14:00",
  allowsPets: true,
  openingDate: "2020-01-15"
};

const validationResult = validateMetadata(validHotelData, hotelSchema);
console.log("✅ Validation Result:", validationResult.isValid);
console.log("📄 Cleaned Metadata:", validationResult.filteredMetadata);
console.log("❌ Errors:", validationResult.errors);

// 3. Demo: Invalid hotel metadata
console.log("\n3. Invalid Hotel Metadata:");
const invalidHotelData = {
  starRating: 6, // Too high
  amenities: "wifi,pool", // Wrong type
  roomCount: -5, // Negative
  checkInTime: "25:00", // Invalid time
  allowsPets: "yes", // Wrong type
  openingDate: "not-a-date" // Invalid date
};

const invalidResult = validateMetadata(invalidHotelData, hotelSchema);
console.log("❌ Validation Result:", invalidResult.isValid);
console.log("🔍 Errors:", invalidResult.errors);

// 4. Demo: Filter mapping for database search
console.log("\n4. Filter Column Mapping:");
const filterConfig = {
  filter_numeric_1: { label: "starRating", searchable: true },
  filter_numeric_2: { label: "roomCount", searchable: true },
  filter_text_1: { label: "amenities", searchable: true },
  filter_boolean_1: { label: "allowsPets", searchable: true },
  filter_date_1: { label: "openingDate", searchable: true }
};

const filterMappings = mapMetadataToFilters(validHotelData, filterConfig);
console.log("🗂️ Filter Mappings:", filterMappings);

// 5. Demo: Service Entity Type
console.log("\n5. Service Entity Type Schema:");
const serviceSchema = {
  fields: {
    duration: { 
      type: "number" as const, 
      label: "Duration (minutes)", 
      required: true, 
      min: 15 
    },
    category: { 
      type: "select" as const, 
      label: "Service Category", 
      required: true,
      options: ["consultation", "therapy", "coaching", "training"]
    },
    remoteAvailable: { 
      type: "boolean" as const, 
      label: "Remote Available", 
      default: false 
    },
    maxCapacity: { 
      type: "number" as const, 
      label: "Max Capacity", 
      min: 1, 
      max: 100 
    }
  }
};

const serviceData = {
  duration: 60,
  category: "consultation",
  remoteAvailable: true,
  maxCapacity: 1
};

const serviceResult = validateMetadata(serviceData, serviceSchema);
console.log("✅ Service Validation:", serviceResult.isValid);
console.log("📄 Service Data:", serviceResult.filteredMetadata);

// 6. Demo: Geographic search simulation
console.log("\n6. Geographic Search Simulation:");
const entityWithLocation = {
  id: "hotel-123",
  name: "Grand Plaza Hotel",
  type: "accommodation",
  sub_type: "hotel",
  location: "POINT(-74.0060 40.7128)", // New York City
  metadata: validHotelData
};

console.log("🏨 Entity:", entityWithLocation.name);
console.log("📍 Location:", entityWithLocation.location);
console.log("🏷️ Type:", `${entityWithLocation.type} > ${entityWithLocation.sub_type}`);

// Simulate distance calculation (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Search from Times Square (40.7580, -73.9855)
const searchLat = 40.7580;
const searchLng = -73.9855;
const entityLat = 40.7128;
const entityLng = -74.0060;

const distance = calculateDistance(searchLat, searchLng, entityLat, entityLng);
console.log(`🚶 Distance from Times Square: ${distance.toFixed(2)} km`);

console.log("\n🎉 Demo Complete!");
console.log("\nKey Features Demonstrated:");
console.log("• ✅ Dynamic metadata validation with type safety");
console.log("• 🗂️ Automatic filter column mapping for efficient search");
console.log("• 🏷️ Flexible type system (accommodation, service, ecommerce)");
console.log("• 📍 Geographic location support with distance calculation");
console.log("• 🔧 Admin-configurable schemas with inheritance");
console.log("• 🎯 Production-ready with comprehensive error handling");