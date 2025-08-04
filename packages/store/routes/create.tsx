import { type PageProps } from "fresh";
import { Alert, Badge, Button, Textarea } from "@suppers/ui-lib";
import { Plus, Send } from "lucide-preact";

export default function CreatePage(_props: PageProps) {
  return (
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div class="text-center mb-8">
        <h1 class="text-2xl font-semibold text-base-content mb-2">
          What do you want to build?
        </h1>
        <Badge color="warning" size="lg" class="mt-4">
          Coming Soon
        </Badge>
      </div>

      {/* Chat Input */}
      <div class="bg-base-100 rounded-2xl border border-base-300 p-4 mb-6">
        <Textarea
          class="w-full resize-none border-none outline-none bg-transparent"
          placeholder="Describe the app you want to build..."
          rows={3}
          disabled
        />

        <div class="flex justify-between items-center mt-3">
          <div class="flex items-center gap-2 text-sm text-base-content/60">
            <Plus size={16} />
          </div>
          <Button
            circle
            size="sm"
            class="bg-base-content text-base-100"
            disabled
          >
            <Send size={16} />
          </Button>
        </div>
      </div>

      {/* Examples Section */}
      <Alert color="warning" class="rounded-xl">
        <h3 class="text-sm font-medium mb-3">
          Examples of apps you can build:
        </h3>

        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm">
            <span>→</span>
            <span>A task management app with team collaboration features</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span>→</span>
            <span>An e-commerce store with payment integration</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span>→</span>
            <span>A personal blog with markdown support and comments</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span>→</span>
            <span>A dashboard to track business metrics and analytics</span>
          </div>
        </div>
      </Alert>
    </div>
  );
}
