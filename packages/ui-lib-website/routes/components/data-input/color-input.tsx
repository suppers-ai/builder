import { ColorInput } from "@suppers/ui-lib";

export default function ColorInputPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Color Input Component</h1>
        <p>Color input component with color preview</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Color Input</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <ColorInput />
                <ColorInput value="#ff0000" />
                <ColorInput value="#00ff00" />
                <ColorInput value="#0000ff" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Sizes</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <ColorInput size="xs" value="#ff6b6b" />
                <ColorInput size="sm" value="#4ecdc4" />
                <ColorInput size="md" value="#45b7d1" />
                <ColorInput size="lg" value="#96ceb4" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Colors</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <ColorInput color="primary" value="#570df8" />
                <ColorInput color="secondary" value="#f000b8" />
                <ColorInput color="accent" value="#37cdbe" />
                <ColorInput color="success" value="#00f664" />
                <ColorInput color="warning" value="#ff9900" />
                <ColorInput color="error" value="#ff5724" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Variants</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <ColorInput bordered value="#8b5cf6" />
                <ColorInput ghost value="#06b6d4" />
                <ColorInput bordered={false} value="#ef4444" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">States</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <ColorInput disabled value="#6b7280" />
                <ColorInput required value="#10b981" />
                <ColorInput value="#f59e0b" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Preview Options</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <ColorInput showPreview={true} value="#ec4899" />
                <ColorInput showPreview={false} value="#8b5cf6" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Common Colors</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorInput value="#ff0000" />
                <ColorInput value="#00ff00" />
                <ColorInput value="#0000ff" />
                <ColorInput value="#ffff00" />
                <ColorInput value="#ff00ff" />
                <ColorInput value="#00ffff" />
                <ColorInput value="#ffffff" />
                <ColorInput value="#000000" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
