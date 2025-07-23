/**
 * Footer Component Zod Schema
 * Defines props, types, validation, and documentation for the Footer component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Footer Link Schema
const FooterLinkSchema = z.object({
  text: z.string().describe("Link text"),
  href: z.string().describe("Link URL"),
  external: z.boolean().optional().describe("Whether link is external"),
  disabled: z.boolean().optional().describe("Whether link is disabled"),
  onClick: z.function().returns(z.void()).optional().describe("Click handler"),
});

// Footer Section Schema
const FooterSectionSchema = z.object({
  title: z.string().describe("Section title"),
  links: z.array(FooterLinkSchema).optional().describe("Section links"),
});

// Social Link Schema
const SocialLinkSchema = z.object({
  platform: z.string().describe("Social platform name"),
  href: z.string().describe("Social profile URL"),
  icon: z.any().describe("Social platform icon"),
  onClick: z.function().returns(z.void()).optional().describe("Click handler"),
});

// Newsletter Signup Schema
const NewsletterSignupSchema = z.object({
  title: z.string().optional().describe("Newsletter section title"),
  description: z.string().optional().describe("Newsletter description"),
  placeholder: z.string().optional().describe("Email input placeholder"),
  buttonText: z.string().optional().describe("Submit button text"),
  onSubmit: z.function().args(z.any()).returns(z.void()).optional().describe("Submit handler"),
});

// Footer-specific props
const FooterSpecificPropsSchema = z.object({
  variant: withMetadata(
    z.enum(["default", "minimal", "compact"]).default("default").describe("Footer variant"),
    { examples: ["default", "minimal", "compact"], since: "1.0.0" },
  ),

  layout: withMetadata(
    z.enum(["default", "grid", "centered", "compact"]).default("default").describe("Footer layout"),
    { examples: ["default", "grid", "centered", "compact"], since: "1.0.0" },
  ),

  background: withMetadata(
    z.enum(["default", "neutral", "primary", "secondary", "accent", "dark"]).default("neutral")
      .describe("Background variant"),
    { examples: ["default", "neutral", "primary", "secondary", "accent", "dark"], since: "1.0.0" },
  ),

  size: withMetadata(
    z.enum(["sm", "md", "lg"]).default("md").describe("Footer size"),
    { examples: ["sm", "md", "lg"], since: "1.0.0" },
  ),

  sections: z.array(FooterSectionSchema)
    .optional()
    .describe("Footer sections with navigation links"),

  copyright: z.string()
    .optional()
    .describe("Copyright text"),

  socialLinks: z.array(SocialLinkSchema)
    .optional()
    .describe("Social media links"),

  logo: z.any()
    .optional()
    .describe("Logo content (string or JSX)"),

  newsletter: NewsletterSignupSchema
    .optional()
    .describe("Newsletter signup configuration"),

  divider: withMetadata(
    z.boolean().default(true).describe("Whether to show divider before copyright"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  onNewsletterSubmit: z.function()
    .args(z.string())
    .returns(z.void())
    .optional()
    .describe("Enhanced newsletter submit handler"),

  onSocialClick: z.function()
    .args(z.string(), z.string())
    .returns(z.void())
    .optional()
    .describe("Enhanced social link click handler"),
});

// Complete Footer Props Schema
export const FooterPropsSchema = BaseComponentPropsSchema
  .merge(FooterSpecificPropsSchema)
  .describe("Website footer component with links, copyright, and social media");

// Export nested schemas for reuse
export { FooterLinkSchema, FooterSectionSchema, NewsletterSignupSchema, SocialLinkSchema };

// Infer TypeScript type from schema
export type FooterProps = z.infer<typeof FooterPropsSchema>;
export type FooterLink = z.infer<typeof FooterLinkSchema>;
export type FooterSection = z.infer<typeof FooterSectionSchema>;
export type SocialLink = z.infer<typeof SocialLinkSchema>;
export type NewsletterSignup = z.infer<typeof NewsletterSignupSchema>;

// Export validation function
export const validateFooterProps = (props: unknown): FooterProps => {
  return FooterPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateFooterProps = (props: unknown) => {
  return FooterPropsSchema.safeParse(props);
};
