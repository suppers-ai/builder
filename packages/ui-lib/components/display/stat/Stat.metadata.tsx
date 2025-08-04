import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";
import { Stat } from "./Stat.tsx";

const statExamples: ComponentExample[] = [
  {
    title: "Basic Stats",
    description: "Simple statistics display with title, value, and description",
    props: [
      {
        title: "Total Users",
        value: "25,600",
        description: "Since last month",
      },
      {
        title: "Revenue",
        value: "$89,400",
        description: "↗︎ 12% increase",
      },
      {
        title: "Active Sessions",
        value: "1,094",
        description: "Currently online",
      },
    ],
  },
  {
    title: "Stats with Icons",
    description: "Statistics with visual figures and icons",
    props: [
      {
        title: "Downloads",
        value: "31K",
        description: "Jan 1st - Feb 1st",
      },
      {
        title: "New Users",
        value: "4,200",
        description: "↗︎ 400 (22%)",
      },
    ],
  },
  {
    title: "Formatted Values",
    description: "Statistics with different value formatters",
    props: [
      {
        title: "Revenue",
        value: "$125,000",
        description: "Monthly earnings",
      },
      {
        title: "Growth Rate",
        value: "15.7%",
        description: "Year over year",
      },
      {
        title: "Active Users",
        value: "1,234,567",
        description: "Platform wide",
      },
    ],
  },
  {
    title: "Vertical Stats Layout",
    description: "Statistics in vertical (stacked) layout for mobile",
    props: [
      {
        title: "Page Views",
        value: "89,400",
        description: "21% more than last month",
      },
      {
        title: "Bounce Rate",
        value: "24.5%",
        description: "14% less than last month",
      },
      {
        title: "Session Duration",
        value: "4m 32s",
        description: "Average time on site",
      },
    ],
  },
  {
    title: "Dashboard Stats",
    description: "Real-world dashboard statistics with comprehensive data",
    props: [
      {
        title: "Total Sales",
        value: "$847,392",
        description: "↗︎ $12,483 (18.2%) from last month",
      },
      {
        title: "Orders",
        value: "3,847",
        description: "↗︎ 89 (2.4%) from yesterday",
      },
      {
        title: "Customers",
        value: "12,847",
        description: "↗︎ 127 new this week",
      },
    ],
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
  interactive: false,
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
