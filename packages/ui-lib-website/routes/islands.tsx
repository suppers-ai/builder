import { 
  islandPatterns, 
  getIslandsByInteractivity,
  getIslandCount 
} from "../data/islands.ts";

export default function IslandsPage() {
  const basicPatterns = getIslandsByInteractivity("basic");
  const mediumPatterns = getIslandsByInteractivity("medium");
  const advancedPatterns = getIslandsByInteractivity("advanced");

  return (
    <>
      <div class="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div class="text-center space-y-4">
          <h1 class="text-4xl font-bold">Creating Interactive Islands</h1>
          <p class="text-lg text-base-content/70">
            Learn how to transform static ui-lib components into interactive islands with client-side functionality
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
            <div class="stat-title">Pattern Examples</div>
            <div class="stat-value text-2xl">{getIslandCount()}</div>
            <div class="stat-desc">Ready to use</div>
          </div>
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Complexity Levels</div>
            <div class="stat-value text-2xl">3</div>
            <div class="stat-desc">Basic to Advanced</div>
          </div>
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Tutorials</div>
            <div class="stat-value text-2xl">{islandPatterns.tutorials.length}</div>
            <div class="stat-desc">Step-by-step guides</div>
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

        {/* Pattern Categories by Complexity */}
        <div class="space-y-8">
          <h2 class="text-2xl font-bold">Island Patterns by Complexity</h2>

          {/* Basic Patterns */}
          <div class="card bg-base-100 shadow-sm border border-base-300">
            <div class="card-body">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-xl">🟢</span>
                <h3 class="card-title text-lg">Basic Patterns</h3>
                <div class="badge badge-success">{basicPatterns.length} patterns</div>
              </div>
              <p class="text-sm text-base-content/70 mb-4">
                Simple interactivity patterns perfect for getting started with islands
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {basicPatterns.map((pattern) => (
                  <div key={pattern.id} class="card bg-base-200 hover:bg-base-300 transition-colors">
                    <div class="card-body p-4">
                      <h4 class="font-semibold text-sm">{pattern.name}</h4>
                      <p class="text-xs text-base-content/70 line-clamp-2 mb-2">
                        {pattern.description}
                      </p>
                      
                      <div class="flex items-center justify-between mb-2">
                        <div class="text-xs text-base-content/50">
                          Base: {pattern.baseComponent}
                        </div>
                        <div class="flex flex-wrap gap-1">
                          {pattern.hooks.slice(0, 2).map((hook) => (
                            <div key={hook} class="badge badge-xs badge-outline">
                              {hook}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div class="text-xs text-base-content/60">
                        {pattern.interactivityType}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Medium Patterns */}
          <div class="card bg-base-100 shadow-sm border border-base-300">
            <div class="card-body">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-xl">🟡</span>
                <h3 class="card-title text-lg">Medium Patterns</h3>
                <div class="badge badge-warning">{mediumPatterns.length} patterns</div>
              </div>
              <p class="text-sm text-base-content/70 mb-4">
                More complex patterns involving forms, data handling, and component communication
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediumPatterns.map((pattern) => (
                  <div key={pattern.id} class="card bg-base-200 hover:bg-base-300 transition-colors">
                    <div class="card-body p-4">
                      <h4 class="font-semibold text-sm">{pattern.name}</h4>
                      <p class="text-xs text-base-content/70 line-clamp-2 mb-2">
                        {pattern.description}
                      </p>
                      
                      <div class="flex items-center justify-between mb-2">
                        <div class="text-xs text-base-content/50">
                          Base: {pattern.baseComponent}
                        </div>
                        <div class="flex flex-wrap gap-1">
                          {pattern.hooks.slice(0, 2).map((hook) => (
                            <div key={hook} class="badge badge-xs badge-outline">
                              {hook}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div class="text-xs text-base-content/60">
                        {pattern.interactivityType}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Patterns */}
          <div class="card bg-base-100 shadow-sm border border-base-300">
            <div class="card-body">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-xl">🔴</span>
                <h3 class="card-title text-lg">Advanced Patterns</h3>
                <div class="badge badge-error">{advancedPatterns.length} patterns</div>
              </div>
              <p class="text-sm text-base-content/70 mb-4">
                Complex patterns with real-time updates, API integration, and advanced state management
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {advancedPatterns.map((pattern) => (
                  <div key={pattern.id} class="card bg-base-200 hover:bg-base-300 transition-colors">
                    <div class="card-body p-4">
                      <h4 class="font-semibold text-sm">{pattern.name}</h4>
                      <p class="text-xs text-base-content/70 line-clamp-2 mb-2">
                        {pattern.description}
                      </p>
                      
                      <div class="flex items-center justify-between mb-2">
                        <div class="text-xs text-base-content/50">
                          Base: {pattern.baseComponent}
                        </div>
                        <div class="flex flex-wrap gap-1">
                          {pattern.hooks.slice(0, 2).map((hook) => (
                            <div key={hook} class="badge badge-xs badge-outline">
                              {hook}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div class="text-xs text-base-content/60">
                        {pattern.interactivityType}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tutorial Section */}
        <div class="card bg-primary text-primary-content">
          <div class="card-body">
            <h2 class="card-title text-xl mb-4">Getting Started Tutorial</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold mb-2">Creating Islands</h3>
                <ul class="text-sm space-y-1 opacity-90">
                  <li>• Place in <code>/islands/</code> directory</li>
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
            
            {islandPatterns.tutorials.length > 0 && (
              <div class="mt-6">
                <h3 class="font-semibold mb-3">Step-by-Step Tutorial: {islandPatterns.tutorials[0].title}</h3>
                <p class="text-sm opacity-90 mb-4">{islandPatterns.tutorials[0].description}</p>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {islandPatterns.tutorials[0].steps.map((step, index) => (
                    <div key={index} class="bg-primary-content/10 rounded-lg p-3">
                      <div class="text-xs font-semibold mb-1">Step {index + 1}</div>
                      <div class="text-sm font-medium mb-1">{step.title}</div>
                      <div class="text-xs opacity-80">{step.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
