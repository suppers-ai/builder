import { ComponentCategory, ComponentExample, ComponentMetadata } from "../../types.ts";
import { Timeline } from "./Timeline.tsx";

const timelineExamples: ComponentExample[] = [
  {
    title: "Basic Timeline",
    description: "Simple chronological event timeline",
    props: {
      items: [
        {
          id: "1",
          title: "Event 1",
          description: "First event description",
          date: "2024-01-01",
        },
        {
          id: "2",
          title: "Event 2",
          description: "Second event description",
          date: "2024-01-15",
        },
      ],
    },
  },
  {
    title: "Timeline with Icons",
    description: "Timeline events with custom icons",
    props: {
      items: [
        {
          id: "1",
          title: "Event 1",
          description: "First event description",
          date: "2024-01-01",
        },
        {
          id: "2",
          title: "Event 2",
          description: "Second event description",
          date: "2024-01-15",
        },
      ],
    },
  },
  {
    title: "Horizontal Timeline",
    description: "Timeline displayed in horizontal layout",
    props: {
      items: [
        {
          id: "1",
          title: "Event 1",
          description: "First event description",
          date: "2024-01-01",
        },
        {
          id: "2",
          title: "Event 2",
          description: "Second event description",
          date: "2024-01-15",
        },
      ],
    },
  },
  {
    title: "Responsive Timeline",
    description: "Timeline that adapts to different screen sizes",
    props: {
      items: [
        {
          id: "1",
          title: "Event 1",
          description: "First event description",
          date: "2024-01-01",
        },
        {
          id: "2",
          title: "Event 2",
          description: "Second event description",
          date: "2024-01-15",
        },
      ],
    },
  },
  {
    title: "Colored Timeline",
    description: "Timeline with different colors for event types",
    props: {
      items: [
        {
          id: "1",
          title: "Event 1",
          description: "First event description",
          date: "2024-01-01",
        },
        {
          id: "2",
          title: "Event 2",
          description: "Second event description",
          date: "2024-01-15",
        },
      ],
      color: "primary",
    },
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
