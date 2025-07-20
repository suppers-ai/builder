import { DatetimeInput } from "@suppers/ui-lib";

export default function DatetimeInputPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Datetime Input Component</h1>
        <p>Datetime input component for selecting date and time values</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Datetime Input</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <DatetimeInput />
                <DatetimeInput value="2023-12-25T14:30" />
                <DatetimeInput placeholder="Select date and time" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Sizes</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <DatetimeInput size="xs" placeholder="Extra small" />
                <DatetimeInput size="sm" placeholder="Small" />
                <DatetimeInput size="md" placeholder="Medium (default)" />
                <DatetimeInput size="lg" placeholder="Large" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Colors</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <DatetimeInput color="primary" placeholder="Primary" />
                <DatetimeInput color="secondary" placeholder="Secondary" />
                <DatetimeInput color="accent" placeholder="Accent" />
                <DatetimeInput color="success" placeholder="Success" />
                <DatetimeInput color="warning" placeholder="Warning" />
                <DatetimeInput color="error" placeholder="Error" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Variants</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <DatetimeInput bordered placeholder="Bordered (default)" />
                <DatetimeInput ghost placeholder="Ghost" />
                <DatetimeInput bordered={false} placeholder="No border" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">States</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <DatetimeInput disabled placeholder="Disabled" />
                <DatetimeInput required placeholder="Required" />
                <DatetimeInput value="2023-12-25T09:00" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Constraints</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <DatetimeInput
                  min="2023-01-01T00:00"
                  max="2023-12-31T23:59"
                  placeholder="2023 only"
                />
                <DatetimeInput step="3600" placeholder="Hourly intervals" />
                <DatetimeInput min="2023-06-01T00:00" placeholder="From June 2023" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
