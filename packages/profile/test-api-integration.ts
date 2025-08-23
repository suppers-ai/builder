#!/usr/bin/env -S deno run --allow-net --allow-env

// Test script to verify entity and product API integration

const API_BASE = "http://127.0.0.1:54321/functions/v1/api/v1";

// Test token - replace with actual token for testing
const TEST_TOKEN = process.env.TEST_AUTH_TOKEN || "";

if (!TEST_TOKEN) {
  console.error("Please set TEST_AUTH_TOKEN environment variable");
  console.log("You can get a token by logging in and inspecting the network requests");
  Deno.exit(1);
}

async function testAPI() {
  console.log("Testing Entity and Product API endpoints...\n");

  // Test 1: Get entities
  console.log("1. Testing GET /entity");
  try {
    const response = await fetch(`${API_BASE}/entity`, {
      headers: {
        "Authorization": `Bearer ${TEST_TOKEN}`,
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    console.log("   Status:", response.status);
    console.log("   Response:", JSON.stringify(data, null, 2).substring(0, 200) + "...");
  } catch (error) {
    console.error("   Error:", error);
  }

  // Test 2: Create entity
  console.log("\n2. Testing POST /entity");
  try {
    const response = await fetch(`${API_BASE}/entity`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TEST_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Test Restaurant",
        description: "A test restaurant entity",
        type: "restaurant",
        sub_type: "italian",
        status: "active",
        metadata: {
          cuisine: "Italian",
          capacity: 50
        }
      })
    });
    const data = await response.json();
    console.log("   Status:", response.status);
    console.log("   Response:", JSON.stringify(data, null, 2).substring(0, 200) + "...");
    
    if (data.id) {
      // Test 3: Get products for entity
      console.log(`\n3. Testing GET /product?entity_id=${data.id}`);
      try {
        const prodResponse = await fetch(`${API_BASE}/product?entity_id=${data.id}`, {
          headers: {
            "Authorization": `Bearer ${TEST_TOKEN}`,
            "Content-Type": "application/json"
          }
        });
        const prodData = await prodResponse.json();
        console.log("   Status:", prodResponse.status);
        console.log("   Response:", JSON.stringify(prodData, null, 2).substring(0, 200) + "...");
      } catch (error) {
        console.error("   Error:", error);
      }

      // Test 4: Create product for entity
      console.log(`\n4. Testing POST /product`);
      try {
        const prodResponse = await fetch(`${API_BASE}/product`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${TEST_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            entity_id: data.id,
            name: "Margherita Pizza",
            description: "Classic Italian pizza",
            type: "physical_product",
            status: "active",
            prices: [{
              name: "Standard",
              amount: 12.99,
              currency: "USD"
            }]
          })
        });
        const prodData = await prodResponse.json();
        console.log("   Status:", prodResponse.status);
        console.log("   Response:", JSON.stringify(prodData, null, 2).substring(0, 200) + "...");
        
        // Clean up - delete the product
        if (prodData.id) {
          await fetch(`${API_BASE}/product/${prodData.id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${TEST_TOKEN}`,
            }
          });
          console.log("   Cleaned up test product");
        }
      } catch (error) {
        console.error("   Error:", error);
      }

      // Clean up - delete the test entity
      await fetch(`${API_BASE}/entity/${data.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${TEST_TOKEN}`,
        }
      });
      console.log("\n   Cleaned up test entity");
    }
  } catch (error) {
    console.error("   Error:", error);
  }

  console.log("\n✅ API integration test complete!");
}

testAPI();