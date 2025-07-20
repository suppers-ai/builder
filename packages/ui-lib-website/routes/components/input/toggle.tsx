import { Toggle } from "@suppers/ui-lib";

export default function TogglePage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Toggle Component</h1>
        <p>A toggle switch component for boolean values</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Sizes</h2>
          <div class="space-y-4">
            <Toggle size="xs">Extra Small</Toggle>
            <Toggle size="sm">Small</Toggle>
            <Toggle size="md">Medium</Toggle>
            <Toggle size="lg">Large</Toggle>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Colors</h2>
          <div class="space-y-4">
            <Toggle color="primary">Primary</Toggle>
            <Toggle color="secondary">Secondary</Toggle>
            <Toggle color="accent">Accent</Toggle>
            <Toggle color="success">Success</Toggle>
            <Toggle color="warning">Warning</Toggle>
            <Toggle color="error">Error</Toggle>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">States</h2>
          <div class="space-y-4">
            <Toggle checked>Checked</Toggle>
            <Toggle disabled>Disabled</Toggle>
            <Toggle checked disabled>Checked + Disabled</Toggle>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive</h2>
          <div class="space-y-4">
            <Toggle
              checked={false}
              onChange={(checked) => console.log("Toggle changed:", checked)}
            >
              Click me to toggle
            </Toggle>
            <Toggle
              checked={true}
              size="lg"
              color="success"
              onChange={(checked) => console.log("Large toggle:", checked)}
            >
              Large success toggle
            </Toggle>
          </div>
        </section>
      </div>
    </div>
  );
}
