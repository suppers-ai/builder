import { ComponentCategory, ComponentExample, ComponentMetadata } from "../../types.ts";
import { Accordion } from "./Accordion.tsx";

const accordionExamples: ComponentExample[] = [
  {
    title: "Basic Accordion",
    description: "Simple collapsible content sections",
    props: {
      items: [
        {
          id: "1",
          title: "What is your return policy?",
          content: "We offer a 30-day return policy for all unused items in original packaging.",
        },
        {
          id: "2",
          title: "How long does shipping take?",
          content: "Standard shipping takes 3-5 business days. Express options are available.",
        },
        {
          id: "3",
          title: "Do you offer international shipping?",
          content:
            "Yes, we ship to most countries worldwide with varying costs and delivery times.",
        },
      ],
    },
  },
  {
    title: "Multiple Open Sections",
    description: "Accordion allowing multiple sections to be expanded simultaneously",
    props: {
      items: [
        {
          id: "getting-started",
          title: "Getting Started",
          content:
            "Welcome to our platform! Create your account, complete your profile, and explore the dashboard.",
        },
        {
          id: "account-settings",
          title: "Account Settings",
          content:
            "Manage your account preferences, update personal information, and change notification settings.",
        },
        {
          id: "billing",
          title: "Billing Information",
          content: "View and update your billing details, payment methods, and subscription plans.",
        },
      ],
      multiple: true,
      defaultOpen: ["getting-started", "account-settings"],
    },
  },
];

export const accordionMetadata: ComponentMetadata = {
  name: "Accordion",
  description: "Collapsible content",
  category: ComponentCategory.DISPLAY,
  path: "/components/display/accordion",
  tags: ["collapsible", "expand", "collapse", "foldable", "sections"],
  examples: accordionExamples,
  relatedComponents: ["collapse", "card", "details"],
  preview: (
    <Accordion
      items={[
        {
          id: "1",
          title: "Getting Started",
          content: "Learn the basics of our platform",
        },
        {
          id: "2",
          title: "Advanced Features",
          content: "Explore advanced functionality",
        },
      ]}
      defaultOpen={["1"]}
    />
  ),
};
