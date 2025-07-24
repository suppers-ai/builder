import { ApplicationCard } from "./ApplicationCard.tsx";

export const componentMetadata = {
  component: ApplicationCard,
  category: "Display",
  name: "ApplicationCard", 
  description: "Specialized card component for displaying application entities with status-specific actions",
  props: {
    application: {
      type: "Application",
      required: true,
      description: "Application object with name, status, template_id, etc."
    },
    onEdit: {
      type: "(application: Application) => void",
      description: "Callback for edit action (only shown for draft status)"
    },
    onDelete: {
      type: "(application: Application) => void", 
      description: "Callback for delete action (only shown for draft/archived status)"
    },
    onView: {
      type: "(application: Application) => void",
      description: "Callback for view action"
    },
    onSubmitForReview: {
      type: "(application: Application) => void",
      description: "Callback for submit action (only shown for draft status)"
    },
    showOwnerActions: {
      type: "boolean",
      default: "false",
      description: "Whether to show owner-specific actions (edit/delete/submit)"
    }
  },
  examples: [
    {
      name: "Application Card with Actions",
      code: `<ApplicationCard
  application={app}
  onView={(app) => console.log('View', app)}
  onEdit={(app) => console.log('Edit', app)}
  showOwnerActions={true}
/>`,
      props: {}
    }
  ]
};