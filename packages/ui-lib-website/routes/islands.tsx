import { getAllIslandCategories, getIslandCount, getIslandsByCategory } from "../data/islands.ts";
import { Badge, Card } from "@suppers/ui-lib";

export default function IslandsPage() {
  const categories = getAllIslandCategories();

  return (
    <>
      <div class="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div class="text-center space-y-4">
          <h1 class="text-4xl font-bold">Interactive Islands</h1>
          <p class="text-lg text-base-content/70">
            Client-side interactive components with hooks and state management
          </p>
          <div class="breadcrumbs justify-center">
            <ul>
              <li>
                <a href="/" class="link">Home</a>
              </li>
              <li>Islands</li>
            </ul>
          </div>
        </div>
        {/* Overview Stats */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Total Islands</div>
            <div class="stat-value text-2xl">{getIslandCount()}</div>
            <div class="stat-desc">Interactive components</div>
          </div>
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Categories</div>
            <div class="stat-value text-2xl">{categories.length}</div>
            <div class="stat-desc">Different types</div>
          </div>
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Client-Side</div>
            <div class="stat-value text-2xl">100%</div>
            <div class="stat-desc">With hooks support</div>
          </div>
        </div>

        {/* What are Islands? */}
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-xl mb-4">What are Islands?</h2>
            <div class="prose max-w-none">
              <p>
                Islands are interactive components that run on the client-side and can use
                React/Preact hooks. They provide dynamic functionality like state management, event
                handling, and real-time updates.
              </p>
              <ul>
                <li>
                  <strong>Client-side only:</strong> Islands are hydrated and run in the browser
                </li>
                <li>
                  <strong>Hook support:</strong> Can use useState, useEffect, and other React hooks
                </li>
                <li>
                  <strong>Interactive:</strong> Handle user interactions and dynamic state changes
                </li>
                <li>
                  <strong>Isolated:</strong> Each island is an independent interactive component
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div class="space-y-6">
          <h2 class="text-2xl font-bold">Island Categories</h2>

          {categories.map((category) => {
            const islands = getIslandsByCategory(category);
            const categoryIcon = getCategoryIcon(category);

            return (
              <div key={category} class="card bg-base-100 shadow-sm border border-base-300">
                <div class="card-body">
                  <div class="flex items-center gap-3 mb-4">
                    {categoryIcon}
                    <h3 class="card-title text-lg">{category}</h3>
                    <Badge color="neutral">{islands.length}</Badge>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {islands.map((island) => (
                      <a
                        key={island.path}
                        href={island.path}
                        class="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
                      >
                        <div class="card-body p-4">
                          <h4 class="font-semibold text-sm">{island.name}</h4>
                          <p class="text-xs text-base-content/70 line-clamp-2">
                            {island.description}
                          </p>

                          <div class="flex items-center justify-between mt-3">
                            <div class="flex flex-wrap gap-1">
                              {island.tags?.slice(0, 2).map((tag) => (
                                <Badge key={tag} size="xs" variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {(island as any).interactivityLevel && (
                              <Badge
                                size="xs"
                                color={getInteractivityColorName(
                                  (island as any).interactivityLevel,
                                )}
                              >
                                {(island as any).interactivityLevel}
                              </Badge>
                            )}
                          </div>

                          {(island as any).associatedComponent && (
                            <div class="text-xs text-base-content/50 mt-2">
                              Extends: {(island as any).associatedComponent}
                            </div>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Development Guide */}
        <div class="card bg-primary text-primary-content">
          <div class="card-body">
            <h2 class="card-title text-xl mb-4">Development Guide</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold mb-2">Creating Islands</h3>
                <ul class="text-sm space-y-1 opacity-90">
                  <li>
                    • Place in <code>/islands/</code> directory
                  </li>
                  <li>• Must have default export</li>
                  <li>• Can use any React hooks</li>
                  <li>• Automatically code-split</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold mb-2">Best Practices</h3>
                <ul class="text-sm space-y-1 opacity-90">
                  <li>• Keep islands focused and small</li>
                  <li>• Use TypeScript for better DX</li>
                  <li>• Handle loading and error states</li>
                  <li>• Test interactive functionality</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper functions
function getCategoryIcon(category: string) {
  const iconMap: Record<string, any> = {
    "Actions": "⚡",
    "Display": "📊",
    "Navigation": "🧭",
    "Input": "📝",
    "Layout": "🏗️",
    "Feedback": "💬",
    "Specialized": "🎯",
    "Controls": "🎛️",
  };

  return <span class="text-xl">{iconMap[category] || "🧩"}</span>;
}

function getInteractivityColorName(level: string) {
  switch (level) {
    case "basic":
      return "success";
    case "medium":
      return "warning";
    case "advanced":
      return "error";
    default:
      return "neutral";
  }
}
