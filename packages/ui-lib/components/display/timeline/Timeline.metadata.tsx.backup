import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Timeline } from "./Timeline.tsx";

const timelineExamples: ComponentExample[] = [
  {
    title: "Basic Timeline",
    description: "Simple chronological event timeline",
    code: `<Timeline
  items={[
    {
      title: "Project Started",
      content: "Initial project setup and planning completed.",
      timestamp: "Jan 15, 2024"
    },
    {
      title: "Design Phase",
      content: "UI/UX design mockups created and approved.",
      timestamp: "Feb 2, 2024"
    },
    {
      title: "Development",
      content: "Core functionality implementation in progress.",
      timestamp: "Feb 20, 2024"
    }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Timeline with Icons",
    description: "Timeline events with custom icons",
    code: `<Timeline
  items={[
    {
      title: "Order Placed",
      content: "Your order has been successfully placed.",
      timestamp: "2 hours ago",
      icon: "shopping-cart",
      status: "completed"
    },
    {
      title: "Payment Confirmed", 
      content: "Payment processing completed.",
      timestamp: "1 hour ago",
      icon: "credit-card",
      status: "completed"
    },
    {
      title: "Preparing Order",
      content: "Your order is being prepared for shipment.",
      timestamp: "30 min ago",
      icon: "package",
      status: "active"
    }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Horizontal Timeline",
    description: "Timeline displayed in horizontal layout",
    code: `<Timeline
  items={[
    {
      title: "Q1 2024",
      content: "Research & Planning",
      timestamp: "Jan - Mar"
    },
    {
      title: "Q2 2024",
      content: "Design & Prototyping", 
      timestamp: "Apr - Jun"
    },
    {
      title: "Q3 2024",
      content: "Development",
      timestamp: "Jul - Sep"
    }
  ]}
  orientation="horizontal"
/>`,
    showCode: true,
  },
  {
    title: "Responsive Timeline",
    description: "Timeline that adapts to different screen sizes",
    code: `<Timeline
  items={[
    {
      title: "Company Founded",
      content: "Started with a small team and big dreams.",
      timestamp: "2020"
    },
    {
      title: "First Product Launch",
      content: "Released our flagship product to market.",
      timestamp: "2021"
    },
    {
      title: "Global Expansion",
      content: "Opened offices in 5 new countries.",
      timestamp: "2023"
    }
  ]}
  responsive
/>`,
    showCode: true,
  },
  {
    title: "Colored Timeline",
    description: "Timeline with different colors for event types",
    code: `<Timeline
  items={[
    {
      title: "System Update",
      content: "Security patches applied successfully.",
      timestamp: "Today",
      color: "success"
    },
    {
      title: "Maintenance Window",
      content: "Scheduled maintenance completed.",
      timestamp: "Yesterday", 
      color: "warning"
    },
    {
      title: "Feature Release",
      content: "New dashboard features available.",
      timestamp: "1 week ago",
      color: "info"
    }
  ]}
/>`,
    showCode: true,
  },
];

export const timelineMetadata: ComponentMetadata = {
  name: "Timeline",
  description: "Chronological event display",
  category: ComponentCategory.DISPLAY,
  path: "/components/display/timeline",
  tags: ["timeline", "chronological", "events", "history", "progress", "steps"],
  examples: timelineExamples,
  relatedComponents: ["steps", "progress", "badge"],
  preview: (
    <div class="w-full max-w-sm">
      <Timeline
        items={[
          {
            title: "Project started",
            content: "Initial planning phase",
            timestamp: "Jan 1, 2024",
          },
          {
            title: "Development",
            content: "Core features implemented",
            timestamp: "Feb 15, 2024",
          },
          {
            title: "Testing",
            content: "Quality assurance phase",
            timestamp: "Mar 1, 2024",
          },
        ]}
      />
    </div>
  ),
};
