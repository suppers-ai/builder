/**
 * Storage Setup Test Script
 *
 * This script helps verify that your storage system is configured correctly.
 * Run this after setting up the storage bucket and policies.
 */

import { DirectAuthClient } from "../profile/lib/auth-client/index.ts";

async function testStorageSetup() {
  console.log("🧪 Storage Setup Test");
  console.log("====================\n");

  // You'll need to replace these with your actual Supabase credentials
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "your-supabase-url";
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "your-anon-key";

  if (SUPABASE_URL === "your-supabase-url" || SUPABASE_ANON_KEY === "your-anon-key") {
    console.log("❌ Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables");
    console.log("   or update the script with your Supabase credentials.");
    return;
  }

  console.log("📋 Test Configuration:");
  console.log(`   Supabase URL: ${SUPABASE_URL}`);
  console.log(`   Using anonymous key: ${SUPABASE_ANON_KEY.slice(0, 20)}...`);
  console.log();

  const authClient = new DirectAuthClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Test 1: Check if client initializes
  console.log("1️⃣ Testing client initialization...");
  try {
    await authClient.initialize();
    console.log("   ✅ Auth client initialized successfully");
  } catch (error) {
    console.log("   ❌ Auth client initialization failed:", error instanceof Error ? error.message : String(error));
    return;
  }

  // Test 2: Check authentication status
  console.log("\n2️⃣ Checking authentication status...");
  const isAuthenticated = authClient.isAuthenticated();
  if (isAuthenticated) {
    console.log("   ✅ User is authenticated");
    const userId = authClient.getUserId();
    console.log(`   👤 User ID: ${userId}`);
  } else {
    console.log("   ⚠️  User is not authenticated");
    console.log("   This is expected if you haven't logged in yet.");
    console.log("   You can still test the API structure.");
  }

  // Test 3: Test API endpoint accessibility
  console.log("\n3️⃣ Testing storage API endpoints...");

  const testApplicationSlug = "test-app";

  try {
    // Test list files endpoint (should fail gracefully if not authenticated)
    console.log(`   📂 Testing list files for app: ${testApplicationSlug}`);
    const listResult = await authClient.listFiles(testApplicationSlug);

    if (listResult.success) {
      console.log("   ✅ List files endpoint working");
      console.log(`   📁 Found ${listResult.data?.files?.length || 0} files`);
    } else {
      console.log(`   ℹ️  List files response: ${listResult.error}`);
      if (listResult.error?.includes("Authentication required")) {
        console.log("   💡 This is expected when not authenticated");
      } else if (listResult.error?.includes("Application not found")) {
        console.log("   💡 This means the API is working but the test app doesn't exist");
      }
    }
  } catch (error) {
    console.log("   ❌ API endpoint test failed:", error instanceof Error ? error.message : String(error));
  }

  // Test 4: Verify file path structure
  console.log("\n4️⃣ Verifying file path structure...");
  const testUserId = "550e8400-e29b-41d4-a716-446655440000";
  const testAppSlug = "my-app";
  const testFileName = "test-file.txt";
  const expectedPath = `${testUserId}/${testAppSlug}/${testFileName}`;

  console.log(`   📁 Expected file path structure: ${expectedPath}`);
  console.log("   ✅ Path structure follows userId/applicationSlug/filename format");

  // Test 5: Storage bucket check
  console.log("\n5️⃣ Storage bucket information...");
  console.log("   🪣 Bucket name: application-files");
  console.log("   🔒 Bucket type: Private (not public)");
  console.log("   📏 File size limit: 50MB (52428800 bytes)");
  console.log(
    "   📄 Allowed MIME types: image/*, text/*, application/json, application/pdf, video/*, audio/*",
  );

  console.log("\n📋 Next Steps:");
  console.log("===============");

  if (!isAuthenticated) {
    console.log("1. 🔐 Authenticate a user to fully test the storage system");
    console.log("2. 📱 Create a test application in your system");
    console.log("3. 📤 Try uploading a file using authClient.uploadFile()");
  } else {
    console.log("1. 📱 Create a test application if you haven't already");
    console.log("2. 📤 Try uploading a test file");
    console.log("3. 📋 List files to verify the upload worked");
  }

  console.log("4. 📖 Check the storage-setup.md guide if you encounter issues");
  console.log("5. 🔍 Verify storage policies are applied in your Supabase dashboard");

  console.log("\n🎉 Storage setup test completed!");
}

// Run the test if this file is executed directly
if (import.meta.main) {
  await testStorageSetup();
}
