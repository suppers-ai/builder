import { EmailInput } from "@suppers/ui-lib";

export default function EmailInputPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Email Input Component</h1>
        <p>Email input component with built-in validation</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Email Input</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <EmailInput />
                <EmailInput value="user@example.com" />
                <EmailInput placeholder="Enter your email" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Sizes</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <EmailInput size="xs" placeholder="Extra small" />
                <EmailInput size="sm" placeholder="Small" />
                <EmailInput size="md" placeholder="Medium (default)" />
                <EmailInput size="lg" placeholder="Large" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Colors</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <EmailInput color="primary" placeholder="Primary" />
                <EmailInput color="secondary" placeholder="Secondary" />
                <EmailInput color="accent" placeholder="Accent" />
                <EmailInput color="success" placeholder="Success" />
                <EmailInput color="warning" placeholder="Warning" />
                <EmailInput color="error" placeholder="Error" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Variants</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <EmailInput bordered placeholder="Bordered (default)" />
                <EmailInput ghost placeholder="Ghost" />
                <EmailInput bordered={false} placeholder="No border" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">States</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <EmailInput disabled placeholder="Disabled" />
                <EmailInput required placeholder="Required" />
                <EmailInput value="valid@email.com" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">AutoComplete</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <EmailInput autoComplete="email" placeholder="Email autocomplete" />
                <EmailInput autoComplete="username" placeholder="Username autocomplete" />
                <EmailInput autoComplete="off" placeholder="No autocomplete" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
