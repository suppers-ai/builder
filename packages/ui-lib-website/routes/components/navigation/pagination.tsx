import { Pagination } from "@suppers/ui-lib";

export default function PaginationPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Pagination Component</h1>
        <p>Navigation component for paginated content with customizable appearance and behavior</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Pagination</h2>
          <div class="flex justify-center">
            <Pagination currentPage={3} totalPages={10} />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Sizes</h2>
          <div class="space-y-4">
            <div class="flex justify-center">
              <div class="space-y-2 text-center">
                <p class="font-medium">Extra Small</p>
                <Pagination currentPage={2} totalPages={5} size="xs" />
              </div>
            </div>
            <div class="flex justify-center">
              <div class="space-y-2 text-center">
                <p class="font-medium">Small</p>
                <Pagination currentPage={2} totalPages={5} size="sm" />
              </div>
            </div>
            <div class="flex justify-center">
              <div class="space-y-2 text-center">
                <p class="font-medium">Medium (Default)</p>
                <Pagination currentPage={2} totalPages={5} size="md" />
              </div>
            </div>
            <div class="flex justify-center">
              <div class="space-y-2 text-center">
                <p class="font-medium">Large</p>
                <Pagination currentPage={2} totalPages={5} size="lg" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Large Dataset Pagination</h2>
          <div class="space-y-4">
            <div class="flex justify-center">
              <div class="space-y-2 text-center">
                <p class="font-medium">Beginning (Page 5 of 100)</p>
                <Pagination currentPage={5} totalPages={100} />
              </div>
            </div>
            <div class="flex justify-center">
              <div class="space-y-2 text-center">
                <p class="font-medium">Middle (Page 50 of 100)</p>
                <Pagination currentPage={50} totalPages={100} />
              </div>
            </div>
            <div class="flex justify-center">
              <div class="space-y-2 text-center">
                <p class="font-medium">End (Page 96 of 100)</p>
                <Pagination currentPage={96} totalPages={100} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Configuration Options</h2>
          <div class="space-y-4">
            <div class="flex justify-center">
              <div class="space-y-2 text-center">
                <p class="font-medium">No First/Last Buttons</p>
                <Pagination currentPage={5} totalPages={20} showFirstLast={false} />
              </div>
            </div>
            <div class="flex justify-center">
              <div class="space-y-2 text-center">
                <p class="font-medium">No Previous/Next Buttons</p>
                <Pagination currentPage={5} totalPages={20} showPrevNext={false} />
              </div>
            </div>
            <div class="flex justify-center">
              <div class="space-y-2 text-center">
                <p class="font-medium">Limited Visible Pages (3)</p>
                <Pagination currentPage={10} totalPages={20} maxVisiblePages={3} />
              </div>
            </div>
            <div class="flex justify-center">
              <div class="space-y-2 text-center">
                <p class="font-medium">More Visible Pages (7)</p>
                <Pagination currentPage={10} totalPages={20} maxVisiblePages={7} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Edge Cases</h2>
          <div class="space-y-4">
            <div class="flex justify-center">
              <div class="space-y-2 text-center">
                <p class="font-medium">Single Page (Hidden)</p>
                <Pagination currentPage={1} totalPages={1} />
                <p class="text-sm text-base-content/70">Pagination is hidden when totalPages ≤ 1</p>
              </div>
            </div>
            <div class="flex justify-center">
              <div class="space-y-2 text-center">
                <p class="font-medium">Two Pages</p>
                <Pagination currentPage={1} totalPages={2} />
              </div>
            </div>
            <div class="flex justify-center">
              <div class="space-y-2 text-center">
                <p class="font-medium">Three Pages</p>
                <Pagination currentPage={2} totalPages={3} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Usage Examples</h2>
          <div class="bg-base-200 p-6 rounded-box">
            <h3 class="text-lg font-medium mb-4">Code Examples</h3>
            <div class="space-y-4">
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Basic Pagination Display</code></pre>
                <pre data-prefix=">"><code>{'<Pagination currentPage={page} totalPages={total} />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Interactive Pagination with callbacks</code></pre>
                <pre data-prefix=">"><code>{'<Pagination currentPage={page} totalPages={total} onPageChange={setPage} />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Customized appearance</code></pre>
                <pre data-prefix=">"><code>{'<Pagination size="lg" maxVisiblePages={7} showFirstLast={false} />'}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
