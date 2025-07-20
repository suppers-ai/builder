import { NumberInput } from "@suppers/ui-lib";

export default function NumberInputPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Number Input Component</h1>
        <p>Number input component with increment/decrement controls</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Number Input</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <NumberInput />
                <NumberInput value={42} />
                <NumberInput placeholder="Enter number" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Sizes</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <NumberInput size="xs" value={1} />
                <NumberInput size="sm" value={10} />
                <NumberInput size="md" value={100} />
                <NumberInput size="lg" value={1000} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Colors</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <NumberInput color="primary" value={1} />
                <NumberInput color="secondary" value={2} />
                <NumberInput color="accent" value={3} />
                <NumberInput color="success" value={4} />
                <NumberInput color="warning" value={5} />
                <NumberInput color="error" value={6} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Variants</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <NumberInput bordered value={100} />
                <NumberInput ghost value={200} />
                <NumberInput bordered={false} value={300} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">States</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <NumberInput disabled value={50} />
                <NumberInput required placeholder="Required" />
                <NumberInput value={25} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Constraints</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <NumberInput min={0} max={100} value={50} placeholder="0-100" />
                <NumberInput min={10} placeholder="Min: 10" />
                <NumberInput max={1000} placeholder="Max: 1000" />
                <NumberInput step={5} placeholder="Step: 5" />
                <NumberInput step={0.1} value={3.14} placeholder="Decimal step" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Use Cases</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <NumberInput min={1} max={10} value={5} placeholder="Rating (1-10)" />
                <NumberInput min={0} step={0.01} value={19.99} placeholder="Price ($)" />
                <NumberInput min={0} max={150} value={25} placeholder="Age" />
                <NumberInput min={0} step={1} value={3} placeholder="Quantity" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
