import { Tabs } from "@suppers/ui-lib";

const basicTabs = [
  {
    id: "tab1",
    label: "Tab 1",
    content: (
      <div>
        <h3 class="text-lg font-bold mb-2">Content for Tab 1</h3>
        <p>This is the content for the first tab. You can put any components or content here.</p>
      </div>
    ),
  },
  {
    id: "tab2",
    label: "Tab 2",
    content: (
      <div>
        <h3 class="text-lg font-bold mb-2">Content for Tab 2</h3>
        <p>This is the content for the second tab with different information.</p>
        <button class="btn btn-primary mt-2">Action Button</button>
      </div>
    ),
  },
  {
    id: "tab3",
    label: "Tab 3",
    content: (
      <div>
        <h3 class="text-lg font-bold mb-2">Content for Tab 3</h3>
        <ul class="list-disc list-inside">
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      </div>
    ),
  },
];

const disabledTabs = [
  ...basicTabs,
  {
    id: "tab4",
    label: "Disabled Tab",
    disabled: true,
    content: <div>This content should not be accessible</div>,
  },
];

export default function TabsPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Tabs Component</h1>
        <p>Tab navigation component for organizing content</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Tabs</h2>
          <Tabs tabs={basicTabs} />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Sizes</h2>
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold mb-2">Small</h3>
              <Tabs size="sm" tabs={basicTabs} />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Large</h3>
              <Tabs size="lg" tabs={basicTabs} />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Variants</h2>
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold mb-2">Bordered</h3>
              <Tabs bordered tabs={basicTabs} />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Lifted</h3>
              <Tabs lifted tabs={basicTabs} />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Boxed</h3>
              <Tabs boxed tabs={basicTabs} />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">With Disabled Tab</h2>
          <Tabs tabs={disabledTabs} />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive Tabs</h2>
          <Tabs
            tabs={basicTabs}
            onTabChange={(tabId) => console.log("Active tab changed to:", tabId)}
          />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive with Custom Initial Tab</h2>
          <Tabs
            tabs={basicTabs}
            activeTab="tab2"
            bordered
            size="lg"
            onTabChange={(tabId) => console.log("Large tabs changed to:", tabId)}
          />
        </section>
      </div>
    </div>
  );
}
