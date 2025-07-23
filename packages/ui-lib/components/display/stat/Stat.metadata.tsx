import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";

const statExamples: ComponentExample[] = [
  {
    title: "Basic Stats",
    description: "Simple statistics display with title, value, and description",
    code: `<div class="stats shadow">
  <Stat
    title="Total Users"
    value="25,600"
    description="Since last month"
  />
  <Stat
    title="Revenue"
    value="$89,400"
    description="↗︎ 12% increase"
  />
  <Stat
    title="Active Sessions"
    value="1,094"
    description="Currently online"
  />
</div>`,
    showCode: true,
  },
  {
    title: "Stats with Icons",
    description: "Statistics with visual figures and icons",
    code: `<div class="stats shadow">
  <Stat
    title="Downloads"
    value="31K"
    description="Jan 1st - Feb 1st"
    figure={
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    }
  />
  <Stat
    title="New Users"
    value="4,200"
    description="↗︎ 400 (22%)"
    figure={
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
      </svg>
    }
  />
</div>`,
    showCode: true,
  },
  {
    title: "Formatted Values",
    description: "Statistics with different value formatters",
    code: `<div class="stats shadow">
  <Stat
    title="Revenue"
    value={125000}
    description="Monthly earnings"
    formatter="currency"
    currency="USD"
  />
  <Stat
    title="Growth Rate"
    value={15.7}
    description="Year over year"
    formatter="percentage"
  />
  <Stat
    title="Active Users"
    value={1234567}
    description="Platform wide"
    formatter="number"
  />
</div>`,
    showCode: true,
  },
  {
    title: "Vertical Stats Layout",
    description: "Statistics in vertical (stacked) layout for mobile",
    code: `<div class="stats stats-vertical shadow">
  <Stat
    title="Page Views"
    value="89,400"
    description="21% more than last month"
  />
  <Stat
    title="Bounce Rate"
    value="24.5%"
    description="14% less than last month"
  />
  <Stat
    title="Session Duration"
    value="4m 32s"
    description="Average time on site"
  />
</div>`,
    showCode: true,
  },
  {
    title: "Dashboard Stats",
    description: "Real-world dashboard statistics with comprehensive data",
    code: `<div class="space-y-6">
  <div class="stats shadow w-full">
    <Stat
      title="Total Sales"
      value="$847,392"
      description="↗︎ $12,483 (18.2%) from last month"
      figure={
        <div class="avatar">
          <div class="w-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      }
    />
    <Stat
      title="Orders"
      value="3,847"
      description="↗︎ 89 (2.4%) from yesterday"
      figure={
        <div class="avatar">
          <div class="w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
      }
    />
    <Stat
      title="Customers"
      value="12,847"
      description="↗︎ 127 new this week"
      figure={
        <div class="avatar">
          <div class="w-16 rounded-full bg-purple-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      }
    />
  </div>
  
  <div class="stats shadow w-full">
    <Stat
      title="Conversion Rate"
      value="3.24%"
      description="↗︎ 0.18% from last week"
    />
    <Stat
      title="Average Order"
      value="$247.83"
      description="↗︎ $23.11 increase"
    />
    <Stat
      title="Return Rate"
      value="1.2%"
      description="↘︎ 0.3% decrease (good)"
    />
    <Stat
      title="Satisfaction"
      value="4.8/5"
      description="Based on 2,847 reviews"
    />
  </div>
</div>`,
    showCode: true,
  },
];

const statProps: ComponentProp[] = [
  {
    name: "title",
    type: "string",
    description: "Title/label for the statistic",
  },
  {
    name: "value",
    type: "string | number",
    description: "The main statistic value to display",
    required: true,
  },
  {
    name: "description",
    type: "string",
    description: "Additional description or context for the statistic",
  },
  {
    name: "figure",
    type: "ComponentChildren",
    description: "Icon or visual element to display alongside the stat",
  },
  {
    name: "actions",
    type: "ComponentChildren",
    description: "Action buttons or controls for the statistic",
  },
  {
    name: "formatter",
    type: "'currency' | 'number' | 'percentage' | 'none'",
    description: "How to format the value display",
    default: "none",
  },
  {
    name: "currency",
    type: "string",
    description: "Currency code for currency formatting",
    default: "USD",
  },
  {
    name: "locale",
    type: "string",
    description: "Locale for number formatting",
    default: "en-US",
  },
  {
    name: "loading",
    type: "boolean",
    description: "Show loading state",
    default: "false",
  },
  {
    name: "animated",
    type: "boolean",
    description: "Enable animations for value changes",
    default: "false",
  },
  {
    name: "onClick",
    type: "() => void",
    description: "Click handler for interactive stats",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const statMetadata: ComponentMetadata = {
  name: "Stat",
  description:
    "Display statistics and metrics with titles, values, and contextual information for dashboards",
  category: ComponentCategory.DISPLAY,
  path: "/components/display/stat",
  tags: ["statistics", "metrics", "numbers", "data", "dashboard", "analytics"],
  relatedComponents: ["card", "progress", "countdown"],
  interactive: false, // Display component, though can have onClick
  preview: (
    <div class="stats shadow">
      <div class="stat">
        <div class="stat-title">Downloads</div>
        <div class="stat-value">31K</div>
        <div class="stat-desc">Jan 1st - Feb 1st</div>
      </div>
      <div class="stat">
        <div class="stat-title">Users</div>
        <div class="stat-value">4,200</div>
        <div class="stat-desc">↗︎ 400 (22%)</div>
      </div>
      <div class="stat">
        <div class="stat-title">Revenue</div>
        <div class="stat-value">$89,400</div>
        <div class="stat-desc">↗︎ 18% increase</div>
      </div>
    </div>
  ),
  examples: statExamples,
  props: statProps,
  variants: ["basic", "with-icons", "formatted", "vertical", "dashboard"],
  useCases: [
    "Analytics dashboards",
    "KPI displays",
    "Performance metrics",
    "Business intelligence",
    "Progress tracking",
  ],
  usageNotes: [
    "Group related statistics together using the stats container class",
    "Use descriptive titles and clear value formatting for better readability",
    "Include trend indicators (arrows, percentages) to show changes over time",
    "Consider using icons or figures to make statistics more visually appealing",
    "Use consistent formatting and units across related statistics",
    "Implement loading states for real-time data updates",
  ],
};
