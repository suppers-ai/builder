import { Radio } from "@suppers/ui-lib";

export default function RadioPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Radio Component</h1>
        <p>Radio button component for single selection</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Sizes</h2>
          <div class="space-y-4">
            <Radio size="xs" label="Extra Small" />
            <Radio size="sm" label="Small" />
            <Radio size="md" label="Medium" />
            <Radio size="lg" label="Large" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Colors</h2>
          <div class="space-y-4">
            <Radio color="primary" label="Primary" checked />
            <Radio color="secondary" label="Secondary" checked />
            <Radio color="accent" label="Accent" checked />
            <Radio color="success" label="Success" checked />
            <Radio color="warning" label="Warning" checked />
            <Radio color="error" label="Error" checked />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">States</h2>
          <div class="space-y-4">
            <Radio label="Unchecked" />
            <Radio label="Checked" checked />
            <Radio label="Disabled" disabled />
            <Radio label="Checked + Disabled" checked disabled />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Radio Groups</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold mb-2">Display Only</h3>
              <div class="space-y-2">
                <Radio name="size" value="small" label="Small" checked />
                <Radio name="size" value="medium" label="Medium" />
                <Radio name="size" value="large" label="Large" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold mb-2">Favorite Color</h3>
              <div class="space-y-2">
                <Radio
                  name="color"
                  value="red"
                  label="Red"
                  color="error"
                  onChange={(value) => console.log("Selected color:", value)}
                />
                <Radio
                  name="color"
                  value="blue"
                  label="Blue"
                  color="primary"
                  onChange={(value) => console.log("Selected color:", value)}
                />
                <Radio
                  name="color"
                  value="green"
                  label="Green"
                  color="success"
                  onChange={(value) => console.log("Selected color:", value)}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
