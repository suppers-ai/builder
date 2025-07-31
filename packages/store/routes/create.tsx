import { type PageProps } from "fresh";

export default function CreatePage(_props: PageProps) {
  return (
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div class="text-center mb-8">
        <h1 class="text-2xl font-semibold text-base-content mb-2">
          What do you want to build?
        </h1>
        <div class="badge badge-warning badge-lg mt-4">
          Coming Soon
        </div>
      </div>

      {/* Chat Input */}
      <div class="bg-base-100 rounded-2xl border border-base-300 p-4 mb-6">
        <textarea 
          class="w-full resize-none border-none outline-none bg-transparent text-base-content placeholder:text-base-content/50"
          placeholder="Describe the app you want to build..."
          rows={3}
          disabled
        ></textarea>
        
        <div class="flex justify-between items-center mt-3">
          <div class="flex items-center gap-2 text-sm text-base-content/60">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <button class="btn btn-circle btn-sm bg-base-content text-base-100" disabled>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Examples Section */}
      <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
        <h3 class="text-sm font-medium text-base-content/70 mb-3">Examples of apps you can build:</h3>
        
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-base-content/60">
            <span>→</span>
            <span>A task management app with team collaboration features</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-base-content/60">
            <span>→</span>
            <span>An e-commerce store with payment integration</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-base-content/60">
            <span>→</span>
            <span>A personal blog with markdown support and comments</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-base-content/60">
            <span>→</span>
            <span>A dashboard to track business metrics and analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
}
