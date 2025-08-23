#!/usr/bin/env deno run --allow-net --allow-env

/**
 * Setup script to create the sorted-storage application in the database
 */

const SUPABASE_URL = "http://localhost:54321";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

async function createApplication() {
  console.log("Creating sorted-storage application...");
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_SERVICE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Prefer": "return=representation"
    },
    body: JSON.stringify({
      name: "Sorted Storage",
      slug: "sorted-storage",
      description: "File storage and management application",
      status: "published"
    })
  });

  if (!response.ok) {
    const error = await response.text();
    if (error.includes("duplicate key") || error.includes("already exists")) {
      console.log("Application already exists, updating...");
      
      // Try to update instead
      const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/applications?slug=eq.sorted-storage`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_SERVICE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          name: "Sorted Storage",
          description: "File storage and management application",
          status: "published",
          updated_at: new Date().toISOString()
        })
      });
      
      if (updateResponse.ok) {
        const data = await updateResponse.json();
        console.log("✅ Application updated successfully:", data);
      } else {
        console.error("Failed to update application:", await updateResponse.text());
      }
    } else {
      console.error("Failed to create application:", error);
    }
    return;
  }

  const data = await response.json();
  console.log("✅ Application created successfully:", data);
}

// Run the setup
if (import.meta.main) {
  await createApplication();
}