import { EntityCard } from "./EntityCard.tsx";

export const componentMetadata = {
  component: EntityCard,
  category: "Display",
  name: "EntityCard",
  description: "Generic card component for displaying entities with status, actions, and metadata",
  props: {
    title: {
      type: "string",
      required: true,
      description: "Main title of the entity",
    },
    subtitle: {
      type: "string",
      description: "Optional subtitle text",
    },
    description: {
      type: "string",
      description: "Entity description",
    },
    updatedAt: {
      type: "string",
      required: true,
      description: "Last updated date string",
    },
    status: {
      type: "{ value: string; statuses: Record<string, EntityStatus> }",
      required: true,
      description: "Status configuration object",
    },
    metadata: {
      type: "Record<string, any>",
      description: "Optional metadata to display in collapsible section",
    },
    actions: {
      type: "EntityAction[]",
      default: "[]",
      description: "Primary action buttons displayed in footer",
    },
    menuActions: {
      type: "EntityMenuAction[]",
      default: "[]",
      description: "Actions displayed in dropdown menu",
    },
    showOwnerActions: {
      type: "boolean",
      default: "false",
      description: "Whether to show owner-specific actions",
    },
    onView: {
      type: "() => void",
      description: "Callback for view action",
    },
  },
  examples: [
    {
      name: "Basic Entity Card",
      code: `<EntityCard
  title="My Entity"
  updatedAt="2024-01-01"
  status={{
    value: "active",
    statuses: {
      active: { value: "active", icon: "✅", message: "All good", badgeClass: "badge-success" }
    }
  }}
/>`,
      props: {},
    },
  ],
};
