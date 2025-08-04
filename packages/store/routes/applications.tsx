import { type PageProps } from "fresh";
import { Button, Card } from "@suppers/ui-lib";
import { Package } from "lucide-preact";

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

export default function ApplicationsPage(_props: PageProps) {
  return (
    <div class="container mx-auto px-6 py-8 max-w-4xl">
      {/* Applications Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockApplications.map((app) => (
          <a
            key={app.id}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Card
              bordered
              hoverable
              class="cursor-pointer hover:border-primary/20 rounded-2xl"
            >
              <div class="flex items-start gap-4">
                {/* App Icon */}
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-base-200 rounded-xl overflow-hidden">
                    <img
                      src={app.thumbnail}
                      alt={`${app.name} thumbnail`}
                      class="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* App Info */}
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between mb-1">
                    <h3 class="font-semibold text-base text-base-content truncate">
                      {app.name}
                    </h3>
                    <div
                      class={`text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0 ${
                        app.status === "good"
                          ? "text-success bg-success/10"
                          : "text-error bg-error/10"
                      }`}
                    >
                      {app.status === "good" ? "Good" : "Poor"}
                    </div>
                  </div>

                  <p class="text-sm text-base-content/70 mb-2">
                    {app.author}
                  </p>

                  <p class="text-sm text-base-content/60 mb-3 line-clamp-2">
                    {app.description}
                  </p>

                  <div class="flex items-center justify-between">
                    <span
                      class={`text-sm ${app.status === "good" ? "text-success" : "text-error"}`}
                    >
                      {app.votes} votes
                    </span>
                  </div>
                </div>
              </div>
            </Card>
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
          <Button as="a" href="/create" color="primary">
            Create First App
          </Button>
        </div>
      )}
    </div>
  );
}
