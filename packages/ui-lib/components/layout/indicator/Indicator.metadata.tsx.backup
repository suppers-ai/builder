import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Indicator } from "./Indicator.tsx";

const indicatorExamples: ComponentExample[] = [
  {
    title: "Basic Indicator",
    description: "Simple indicator with numeric value",
    code: `<Indicator item="5">
  <button class="btn">Messages</button>
</Indicator>`,
    props: {
      item: "5",
      children: <button class="btn">Messages</button>
    },
    showCode: true,
  },
  {
    title: "Position Variants",
    description: "Indicators in different positions",
    code: `<div class="flex gap-8">
  <Indicator item="2" position="top-left">
    <div class="avatar">
      <div class="w-12 rounded-full bg-primary"></div>
    </div>
  </Indicator>
  <Indicator item="8" position="top-right">
    <div class="avatar">
      <div class="w-12 rounded-full bg-secondary"></div>
    </div>
  </Indicator>
  <Indicator item="1" position="bottom-left">
    <div class="avatar">
      <div class="w-12 rounded-full bg-accent"></div>
    </div>
  </Indicator>
  <Indicator item="3" position="bottom-right">
    <div class="avatar">
      <div class="w-12 rounded-full bg-info"></div>
    </div>
  </Indicator>
</div>`,
    showCode: true,
  },
  {
    title: "Color Variants",
    description: "Indicators with different color themes",
    code: `<div class="flex gap-4">
  <Indicator item="!" color="error">
    <button class="btn">Alerts</button>
  </Indicator>
  <Indicator item="5" color="warning">
    <button class="btn">Warnings</button>
  </Indicator>
  <Indicator item="✓" color="success">
    <button class="btn">Complete</button>
  </Indicator>
  <Indicator item="i" color="info">
    <button class="btn">Info</button>
  </Indicator>
</div>`,
    showCode: true,
  },
  {
    title: "Indicator on Button",
    description: "Common pattern for notification buttons",
    code: `<div class="flex gap-4">
  <Indicator item="3">
    <button class="btn btn-primary">
      Inbox
    </button>
  </Indicator>
  <Indicator item="99+">
    <button class="btn btn-secondary">
      Notifications
    </button>
  </Indicator>
  <Indicator item="•" color="error">
    <button class="btn btn-outline">
      Live Updates
    </button>
  </Indicator>
</div>`,
    showCode: true,
  },
  {
    title: "Indicator on Avatar",
    description: "Status indicators on user avatars",
    code: `<div class="flex gap-6">
  <Indicator item="5" position="top-right" color="primary">
    <div class="avatar">
      <div class="w-16 rounded-full">
        <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" alt="User" />
      </div>
    </div>
  </Indicator>
  <Indicator item="•" position="bottom-right" color="success">
    <div class="avatar">
      <div class="w-16 rounded-full">
        <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" alt="Online user" />
      </div>
    </div>
  </Indicator>
  <Indicator item="!" position="top-right" color="warning">
    <div class="avatar placeholder">
      <div class="bg-neutral text-neutral-content rounded-full w-16">
        <span class="text-xl">JD</span>
      </div>
    </div>
  </Indicator>
</div>`,
    showCode: true,
  },
  {
    title: "Text Indicators",
    description: "Indicators with custom text labels",
    code: `<div class="flex gap-4">
  <Indicator item="NEW" color="success">
    <div class="card bg-base-100 shadow-md w-32 h-20">
      <div class="card-body p-4 text-center">
        <p class="text-sm">Feature</p>
      </div>
    </div>
  </Indicator>
  <Indicator item="HOT" color="error">
    <div class="card bg-base-100 shadow-md w-32 h-20">
      <div class="card-body p-4 text-center">
        <p class="text-sm">Deal</p>
      </div>
    </div>
  </Indicator>
  <Indicator item="BETA" color="info">
    <div class="card bg-base-100 shadow-md w-32 h-20">
      <div class="card-body p-4 text-center">
        <p class="text-sm">Version</p>
      </div>
    </div>
  </Indicator>
</div>`,
    showCode: true,
  },
];

export const indicatorMetadata: ComponentMetadata = {
  name: "Indicator",
  description: "Position indicator",
  category: ComponentCategory.LAYOUT,
  path: "/components/layout/indicator",
  tags: ["indicator", "badge", "position", "overlay", "notification", "marker"],
  examples: indicatorExamples,
  relatedComponents: ["badge", "avatar", "button"],
  preview: (
    <div class="flex gap-4 items-center">
      <Indicator item="5" position="top-right">
        <button class="btn">Messages</button>
      </Indicator>
      <Indicator item="!" position="top-right" color="error">
        <div class="avatar">
          <div class="w-12 rounded-full bg-primary"></div>
        </div>
      </Indicator>
    </div>
  ),
};
