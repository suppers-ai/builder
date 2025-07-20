import { ComponentChildren } from "preact";
import { BaseComponentProps } from "../../types.ts";

export interface FooterProps extends BaseComponentProps {
  /** Footer variant */
  variant?: "default" | "minimal" | "compact";
  /** Footer layout */
  layout?: "default" | "grid" | "centered" | "compact";
  /** Background variant */
  background?: "default" | "neutral" | "primary" | "secondary" | "accent" | "dark";
  /** Footer size */
  size?: "sm" | "md" | "lg";
  /** Footer sections with navigation links */
  sections?: FooterSection[];
  /** Copyright text */
  copyright?: string;
  /** Social media links */
  socialLinks?: SocialLink[];
  /** Logo content (string or JSX) */
  logo?: ComponentChildren;
  /** Newsletter signup configuration */
  newsletter?: NewsletterSignup;
  /** Whether to show divider before copyright */
  divider?: boolean;
  /** Enhanced newsletter submit handler */
  onNewsletterSubmit?: (email: string) => void;
  /** Enhanced social link click handler */
  onSocialClick?: (platform: string, href: string) => void;
  className?: string;
}

export interface FooterSection {
  /** Section title */
  title: string;
  /** Section links */
  links?: FooterLink[];
}

export interface SocialLink {
  /** Social platform name */
  platform: string;
  /** Social profile URL */
  href: string;
  /** Social platform icon */
  icon: ComponentChildren;
  /** Click handler */
  onClick?: () => void;
}

export interface NewsletterSignup {
  /** Newsletter section title */
  title?: string;
  /** Newsletter description */
  description?: string;
  /** Email input placeholder */
  placeholder?: string;
  /** Submit button text */
  buttonText?: string;
  /** Submit handler */
  onSubmit?: (e: Event) => void;
}

// Footer interfaces
export interface FooterLink {
  /** Link text */
  text: string;
  /** Link URL */
  href: string;
  /** Whether link is external */
  external?: boolean;
  /** Whether link is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export function Footer({
  variant = "default",
  layout = "default",
  background = "neutral",
  size = "md",
  sections,
  copyright,
  socialLinks,
  logo,
  newsletter,
  divider = true,
  className,
  ...props
}: FooterProps) {
  // Build background classes
  const backgroundClasses = {
    default: "bg-base-200 text-base-content",
    neutral: "bg-neutral text-neutral-content",
    primary: "bg-primary text-primary-content",
    secondary: "bg-secondary text-secondary-content",
    accent: "bg-accent text-accent-content",
    dark: "bg-base-300 text-base-content",
  };

  // Build size classes
  const sizeClasses = {
    sm: "p-4",
    md: "p-6 md:p-10",
    lg: "p-8 md:p-16",
  };

  // Build layout classes
  const layoutClasses = {
    default: "footer",
    grid: "footer footer-grid grid-flow-col",
    centered: "footer footer-center",
    compact: "footer footer-compact",
  };

  const footerClasses = `
    ${layoutClasses[layout]}
    ${backgroundClasses[background]}
    ${sizeClasses[size]}
    ${className || ""}
  `.trim();

  // Render logo section
  const renderLogo = () => {
    if (!logo) return null;

    return (
      <aside className="grid-flow-row">
        {typeof logo === "string" ? <div className="text-2xl font-bold">{logo}</div> : logo}
      </aside>
    );
  };

  // Render navigation sections
  const renderSections = () => {
    if (!sections || sections.length === 0) return null;

    return sections.map((section, index) => (
      <nav key={index} className="grid-flow-row">
        <h6 className="footer-title">{section.title}</h6>
        {section.links?.map((link, linkIndex) => (
          <a
            key={linkIndex}
            href={link.href}
            className={`link link-hover ${
              link.disabled ? "text-base-content/50 pointer-events-none" : ""
            }`}
            onClick={link.onClick}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
          >
            {link.text}
          </a>
        ))}
      </nav>
    ));
  };

  // Render social links
  const renderSocialLinks = () => {
    if (!socialLinks || socialLinks.length === 0) return null;

    return (
      <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
        <div className="grid grid-flow-col gap-4">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.href}
              className="link link-hover text-2xl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.platform}
              onClick={social.onClick}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </nav>
    );
  };

  // Render newsletter signup
  const renderNewsletter = () => {
    if (!newsletter) return null;

    return (
      <form className="grid-flow-row">
        <h6 className="footer-title">{newsletter.title || "Newsletter"}</h6>
        <fieldset className="form-control w-80">
          <label className="label">
            <span className="label-text">{newsletter.description}</span>
          </label>
          <div className="join">
            <input
              type="email"
              placeholder={newsletter.placeholder || "Enter your email"}
              className="input input-bordered join-item"
              required
            />
            <button
              type="submit"
              className="btn btn-primary join-item"
              onClick={newsletter.onSubmit}
            >
              {newsletter.buttonText || "Subscribe"}
            </button>
          </div>
        </fieldset>
      </form>
    );
  };

  // Render copyright section
  const renderCopyright = () => {
    if (!copyright) return null;

    return (
      <aside className="items-center grid-flow-col">
        <p className="text-sm ">
          {copyright}
        </p>
      </aside>
    );
  };

  if (variant === "minimal") {
    return (
      <footer className={footerClasses} {...props}>
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {logo && (
              <div className="flex items-center">
                {typeof logo === "string" ? <div className="text-xl font-bold">{logo}</div> : logo}
              </div>
            )}
            {copyright && <p className="text-sm text-base-content/70">{copyright}</p>}
            {socialLinks && (
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="link link-hover"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.platform}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={footerClasses} {...props}>
      {renderLogo()}
      {renderSections()}
      {renderNewsletter()}
      {renderSocialLinks()}

      {divider && (
        <div className="footer footer-center border-t border-base-300 pt-4">
          {renderCopyright()}
        </div>
      )}
    </footer>
  );
}
