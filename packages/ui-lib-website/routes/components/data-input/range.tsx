import { Range } from "@suppers/ui-lib";

export default function RangePage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Range Component</h1>
        <p>Slider component for selecting numeric values</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Sizes</h2>
          <div class="space-y-6">
            <div>
              <label class="label">Extra Small</label>
              <Range size="xs" />
            </div>
            <div>
              <label class="label">Small</label>
              <Range size="sm" />
            </div>
            <div>
              <label class="label">Medium</label>
              <Range size="md" />
            </div>
            <div>
              <label class="label">Large</label>
              <Range size="lg" />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Colors</h2>
          <div class="space-y-6">
            <div>
              <label class="label">Primary</label>
              <Range color="primary" value={70} />
            </div>
            <div>
              <label class="label">Secondary</label>
              <Range color="secondary" value={70} />
            </div>
            <div>
              <label class="label">Accent</label>
              <Range color="accent" value={70} />
            </div>
            <div>
              <label class="label">Success</label>
              <Range color="success" value={70} />
            </div>
            <div>
              <label class="label">Warning</label>
              <Range color="warning" value={70} />
            </div>
            <div>
              <label class="label">Error</label>
              <Range color="error" value={70} />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Ranges</h2>
          <div class="space-y-6">
            <div>
              <label class="label">0-100 (default)</label>
              <Range min={0} max={100} value={50} />
            </div>
            <div>
              <label class="label">0-10</label>
              <Range min={0} max={10} value={5} />
            </div>
            <div>
              <label class="label">-50 to 50</label>
              <Range min={-50} max={50} value={0} />
            </div>
            <div>
              <label class="label">With steps (0-100, step 10)</label>
              <Range min={0} max={100} step={10} value={30} />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">States</h2>
          <div class="space-y-6">
            <div>
              <label class="label">Normal</label>
              <Range value={60} />
            </div>
            <div>
              <label class="label">Disabled</label>
              <Range value={60} disabled />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive</h2>
          <div class="space-y-6">
            <div>
              <label class="label">Volume Control</label>
              <Range
                min={0}
                max={100}
                value={50}
                color="primary"
                onChange={(value) => console.log("Volume:", value)}
              />
            </div>
            <div>
              <label class="label">Temperature (-20°C to 40°C)</label>
              <Range
                min={-20}
                max={40}
                value={20}
                step={1}
                color="warning"
                size="lg"
                onChange={(value) => console.log("Temperature:", value, "°C")}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
