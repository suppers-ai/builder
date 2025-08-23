import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { handleEntitySearch } from "./search.ts";

// Mock Supabase client
const mockSupabase = {
  from: (table: string) => ({
    select: (fields: string, options?: any) => ({
      eq: (field: string, value: any) => mockQueryBuilder,
      or: (condition: string) => mockQueryBuilder,
      not: (field: string, operator: string, value: any) => mockQueryBuilder,
      filter: (field: string, operator: string, value: string) => mockQueryBuilder,
      ilike: (field: string, value: string) => mockQueryBuilder,
      gte: (field: string, value: string) => mockQueryBuilder,
      lte: (field: string, value: string) => mockQueryBuilder,
      order: (field: string, options: any) => mockQueryBuilder,
      range: (start: number, end: number) => mockQueryBuilder,
    }),
  }),
};

const mockQueryBuilder = {
  eq: (field: string, value: any) => mockQueryBuilder,
  or: (condition: string) => mockQueryBuilder,
  not: (field: string, operator: string, value: any) => mockQueryBuilder,
  filter: (field: string, operator: string, value: string) => mockQueryBuilder,
  ilike: (field: string, value: string) => mockQueryBuilder,
  gte: (field: string, value: string) => mockQueryBuilder,
  lte: (field: string, value: string) => mockQueryBuilder,
  order: (field: string, options: any) => mockQueryBuilder,
  range: (start: number, end: number) => ({
    data: [
      {
        id: "1",
        name: "Test Entity",
        description: "A test entity",
        type: "accommodation",
        sub_type: "hotel",
        status: "active",
        location: "POINT(-74.0060 40.7128)",
        created_at: "2024-01-01T00:00:00Z",
        metadata: { stars: 4, amenities: ["wifi", "pool"] },
        variables: [],
      },
    ],
    error: null,
    count: 1,
  }),
};

Deno.test("handleEntitySearch - basic search", async () => {
  const url = new URL("http://localhost/api/v1/entity/search?q=test");
  const request = new Request(url.toString());

  const response = await handleEntitySearch(request, {
    url,
    isAdmin: false,
    userId: "user123",
    supabase: mockSupabase as any,
  });

  assertEquals(response.status, 200);

  const data = await response.json();
  assertEquals(data.data.length, 1);
  assertEquals(data.data[0].name, "Test Entity");
  assertEquals(data.pagination.total, 1);
  assertEquals(data.search.query, "test");
});

Deno.test("handleEntitySearch - type filter", async () => {
  const url = new URL("http://localhost/api/v1/entity/search?type=accommodation");
  const request = new Request(url.toString());

  const response = await handleEntitySearch(request, {
    url,
    isAdmin: false,
    userId: "user123",
    supabase: mockSupabase as any,
  });

  assertEquals(response.status, 200);

  const data = await response.json();
  assertEquals(data.search.type, "accommodation");
});

Deno.test("handleEntitySearch - geographic search", async () => {
  const url = new URL(
    "http://localhost/api/v1/entity/search?lat=40.7128&lng=-74.0060&radius=10&unit=km",
  );
  const request = new Request(url.toString());

  const response = await handleEntitySearch(request, {
    url,
    isAdmin: false,
    userId: "user123",
    supabase: mockSupabase as any,
  });

  assertEquals(response.status, 200);

  const data = await response.json();
  assertEquals(data.search.geographic.center.lat, 40.7128);
  assertEquals(data.search.geographic.center.lng, -74.0060);
  assertEquals(data.search.geographic.radius, 10);
  assertEquals(data.search.geographic.unit, "km");

  // Should include distance calculation
  assertEquals(typeof data.data[0].distance, "number");
});

Deno.test("handleEntitySearch - pagination", async () => {
  const url = new URL("http://localhost/api/v1/entity/search?page=2&limit=5");
  const request = new Request(url.toString());

  const response = await handleEntitySearch(request, {
    url,
    isAdmin: false,
    userId: "user123",
    supabase: mockSupabase as any,
  });

  assertEquals(response.status, 200);

  const data = await response.json();
  assertEquals(data.pagination.page, 2);
  assertEquals(data.pagination.limit, 5);
});

Deno.test("handleEntitySearch - filter parameters", async () => {
  const url = new URL(
    "http://localhost/api/v1/entity/search?filter_numeric_1=4&filter_text_1=hotel&filter_boolean_1=true",
  );
  const request = new Request(url.toString());

  const response = await handleEntitySearch(request, {
    url,
    isAdmin: false,
    userId: "user123",
    supabase: mockSupabase as any,
  });

  assertEquals(response.status, 200);

  const data = await response.json();
  assertEquals(data.data.length, 1);
});
