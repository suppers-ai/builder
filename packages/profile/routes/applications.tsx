import { type PageProps } from "fresh";
import { Button, Card } from "@suppers/ui-lib";
import { ArrowLeft, Package } from "lucide-preact";

// Mock application data - in a real implementation, this would come from a database
const mockApplications = [
  {
    id: "1",
    thumbnail:
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=100&h=100&fit=crop&crop=center",
    name: "VoiceChat Pro",
    description: "Open Source, Low Latency, High Quality Voice Chat",
    author: "TechStudio",
    votes: 38,
    status: "good",
    category: "Communication",
    url: "https://discord.com",
  },
  {
    id: "2",
    thumbnail:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop&crop=center",
    name: "Digital Canvas",
    description: "Professional Digital Paint Program",
    author: "Creative Labs",
    votes: 308,
    status: "good",
    category: "Graphics",
    url: "https://www.figma.com",
  },
  {
    id: "3",
    thumbnail:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=100&h=100&fit=crop&crop=center",
    name: "CodeForge IDE",
    description: "Modern Development Environment for Teams",
    author: "DevCorp",
    votes: 138,
    status: "good",
    category: "Developer Tools",
    url: "https://code.visualstudio.com",
  },
];

export default function ApplicationsPage(props: PageProps) {
  // Get the return URL from query parameters, default to /profile
  const returnUrl = props.url.searchParams.get("return") || "/profile";
  
  return (
    <div class="min-h-screen bg-base-200">
      <div class="container mx-auto p-4 relative">
        <div class="max-w-4xl mx-auto">
          {/* Floating Back Button */}
          <div class="fixed top-4 left-4 z-10">
            <a
              href={returnUrl}
              class="btn btn-outline btn-primary btn-sm shadow-md hover:shadow-lg rounded-full w-10 h-10 p-0 flex items-center justify-center"
            >
              <ArrowLeft class="w-5 h-5" />
            </a>
          </div>

          <Card class="p-8 mt-16">
            <h2 class="text-xl font-semibold text-base-content mb-6 flex items-center gap-2">
              <Package class="w-5 h-5" />
              Available Applications
            </h2>

            {/* Applications Grid */}
            <div class="grid gap-4">
              {mockApplications.map((app) => (
                <a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div class="p-6 border border-base-300 rounded-lg bg-base-50 hover:bg-base-100 transition-colors cursor-pointer">
                    <div class="flex items-start gap-4">
                      {/* App Icon */}
                      <div class="flex-shrink-0">
                        <div class="w-16 h-16 bg-base-200 rounded-xl overflow-hidden">
                          <img
                            src={app.thumbnail}
                            alt={`${app.name} thumbnail`}
                            class="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* App Info */}
                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between mb-2">
                          <div>
                            <h3 class="font-semibold text-lg text-base-content">
                              {app.name}
                            </h3>
                            <p class="text-sm text-base-content/70">
                              by {app.author}
                            </p>
                          </div>
                          <div
                            class={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                              app.status === "good"
                                ? "text-success bg-success/10"
                                : "text-error bg-error/10"
                            }`}
                          >
                            {app.status === "good" ? "Active" : "Inactive"}
                          </div>
                        </div>

                        <p class="text-sm text-base-content/60 mb-3">
                          {app.description}
                        </p>

                        <div class="flex items-center justify-between">
                          <span class="text-xs text-base-content/50 bg-base-200 px-2 py-1 rounded">
                            {app.category}
                          </span>
                          <span
                            class={`text-sm font-medium ${
                              app.status === "good" ? "text-success" : "text-error"
                            }`}
                          >
                            {app.votes} votes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Empty State - if no applications */}
            {mockApplications.length === 0 && (
              <div class="text-center py-16">
                <div class="mb-4">
                  <Package size={64} class="mx-auto text-base-content/30" />
                </div>
                <h3 class="text-xl font-semibold text-base-content/60 mb-2">No Applications Found</h3>
                <p class="text-base-content/50 mb-6">
                  Be the first to publish an application to the store
                </p>
                <Button as="a" href="/admin/create" color="primary">
                  Create First App
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}