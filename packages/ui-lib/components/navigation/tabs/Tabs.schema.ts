/**
 * Tabs Component Zod Schema
 * Defines props, types, validation, and documentation for the Tabs component
 */

import { z } from "zod";
import { ComponentChildren } from "preact";
import {
  BaseComponentPropsSchema,
  SizePropsSchema,
  withMetadata,
} from "../../schemas/base.ts";

// Tab Item schema
const TabItemSchema = z.object({
  id: z.string()
    .min(1)
    .describe("Unique tab identifier"),
    
  label: z.string()
    .min(1)
    .describe("Tab display label"),
    
  content: z.custom<ComponentChildren>()
    .describe("Tab content to display when active"),
    
  disabled: z.boolean()
    .default(false)
    .describe("Whether tab is disabled"),
});

// Tabs-specific props
const TabsSpecificPropsSchema = z.object({
  tabs: withMetadata(
    z.array(TabItemSchema)
      .min(1)
      .describe("Array of tab items"),
    { 
      examples: [
        '[{ id: "tab1", label: "Overview", content: <div>Content</div> }]',
        '[{ id: "settings", label: "Settings", content: settingsPanel, disabled: false }]'
      ], 
      since: "1.0.0" 
    },
  ),
  
  activeTab: z.string()
    .optional()
    .describe("ID of currently active tab (defaults to first tab)"),
    
  bordered: z.boolean()
    .default(false)
    .describe("Add borders to tabs"),
    
  lifted: z.boolean()
    .default(false)
    .describe("Apply lifted tab style"),
    
  boxed: z.boolean()
    .default(false)
    .describe("Apply boxed tab style"),
    
  onTabChange: z.function()
    .args(z.string())
    .returns(z.void())
    .optional()
    .describe("Callback when tab is changed"),
})
.refine(
  (data) => {
    // If activeTab is specified, it must exist in tabs array
    if (data.activeTab) {
      return data.tabs.some(tab => tab.id === data.activeTab);
    }
    return true;
  },
  {
    message: "activeTab must match an existing tab ID",
    path: ["activeTab"],
  }
)
.refine(
  (data) => {
    // All tab IDs must be unique
    const ids = data.tabs.map(tab => tab.id);
    return new Set(ids).size === ids.length;
  },
  {
    message: "All tab IDs must be unique",
    path: ["tabs"],
  }
);

// Complete Tabs Props Schema
export const TabsPropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(TabsSpecificPropsSchema)
  .describe("Tabbed interface with configurable styling and controlled/uncontrolled modes");

// Export TabItem schema for reuse
export { TabItemSchema };

// Infer TypeScript types from schemas
export type TabItemProps = z.infer<typeof TabItemSchema>;
export type TabsProps = z.infer<typeof TabsPropsSchema>;

// Export validation functions
export const validateTabsProps = (props: unknown): TabsProps => {
  return TabsPropsSchema.parse(props);
};

export const safeValidateTabsProps = (props: unknown) => {
  return TabsPropsSchema.safeParse(props);
};

export const validateTabItem = (item: unknown): TabItemProps => {
  return TabItemSchema.parse(item);
};

export const safeValidateTabItem = (item: unknown) => {
  return TabItemSchema.safeParse(item);
};

// Utility validation functions
export const validateTabsArray = (tabs: unknown): TabItemProps[] => {
  return z.array(TabItemSchema).min(1).parse(tabs);
};

export const validateActiveTab = (activeTab: string, tabs: TabItemProps[]): boolean => {
  return tabs.some(tab => tab.id === activeTab);
};