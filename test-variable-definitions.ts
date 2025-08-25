#!/usr/bin/env -S deno run --allow-all

/**
 * Test script for variable definitions functionality
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const API_BASE_URL = Deno.env.get("API_BASE_URL") || "http://localhost:54321/functions/v1/api";

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === "") {
  console.log("⚠️  SUPABASE_ANON_KEY not set. Using default local development key.");
  console.log("   Set it with: export SUPABASE_ANON_KEY='your-key-here'");
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testVariableDefinitions() {
  console.log("🧪 Testing Variable Definitions (System Variables) Functionality\n");

  // Check if variables table has system variables
  console.log("1️⃣ Checking system variables in variables table...");
  
  // Query system variables
  console.log("\n2️⃣ Querying system variables...");
  const { data: variables, error: variablesError } = await supabase
    .from("variables")
    .select("*")
    .eq("is_system", true)
    .limit(5);

  if (variablesError) {
    console.error("   ❌ Error querying table:", variablesError.message);
    console.log("\n   💡 The migration might not have been run. You may need to run:");
    console.log("      psql $DATABASE_URL < packages/api/supabase/migrations/20250823000000_merge_global_variables.sql");
  } else {
    console.log("   ✅ Table exists!");
    console.log(`   📊 Found ${variables?.length || 0} system variable definitions`);
    if (variables && variables.length > 0) {
      console.log("\n   Sample system variables:");
      variables.slice(0, 3).forEach(v => {
        console.log(`      - ${v.variable_id}: ${v.name} (${v.value_type})`);
      });
    }
  }

  // Test API endpoint (requires authentication)
  console.log("\n3️⃣ Testing API endpoint (requires admin auth)...");
  console.log("   ℹ️  To test the API endpoint:");
  console.log("      1. Start the admin server: cd packages/admin && deno task dev");
  console.log("      2. Log in as an admin user");
  console.log("      3. Navigate to: http://localhost:8004/variable-definitions");
  
  console.log("\n✅ Test complete!");
}

// Run the test
testVariableDefinitions().catch(console.error);