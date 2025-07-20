import { BaseComponentProps } from "../../types.ts";
import { ComponentChildren } from "preact";
import { globalSidebarOpen } from "../../../utils/signals.ts";
import { Footer, FooterSection, SocialLink } from "../footer/Footer.tsx";
import { HeaderLayout } from "../header-layout/HeaderLayout.tsx";
import {
  companyFooterConfig,
  defaultFooterCopyright,
  defaultFooterSections,
  defaultSocialLinks,
  minimalFooterConfig,
} from "../../../utils/footer-config.tsx";
import { useState } from "preact/hooks";

export interface PageLayoutProps extends BaseComponentProps {
  children: ComponentChildren;
  footerConfig?: "default" | "minimal" | "company" | "custom";
  footerSections?: FooterSection[];
  footerCopyright?: string;
  footerSocialLinks?: SocialLink[];
  footerLogo?: ComponentChildren;
  // Interactive features
  showControls?: boolean;
  allowFooterCustomization?: boolean;
  showHeaderControls?: boolean;
  adaptiveMargin?: boolean;
  headerProps?: any;
}

export function PageLayout({
  class: className = "",
  children,
  footerConfig = "default",
  footerSections,
  footerCopyright,
  footerSocialLinks,
  footerLogo,
  showControls = false,
  allowFooterCustomization = false,
  showHeaderControls = false,
  adaptiveMargin = true,
  headerProps = {},
  id,
  ...props
}: PageLayoutProps) {
  const [currentFooterConfig, setCurrentFooterConfig] = useState<"default" | "minimal" | "company">(
    footerConfig === "custom" ? "default" : footerConfig,
  );
  const [customFooterEnabled, setCustomFooterEnabled] = useState(footerConfig === "custom");

  // Get current path for active link highlighting
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

  // Resolve footer configuration
  const getFooterConfig = () => {
    // If custom props are provided, use them
    if (
      customFooterEnabled && (footerSections || footerCopyright || footerSocialLinks || footerLogo)
    ) {
      return {
        sections: footerSections || defaultFooterSections,
        copyright: footerCopyright || defaultFooterCopyright,
        socialLinks: footerSocialLinks || defaultSocialLinks,
        logo: footerLogo,
      };
    }

    // Otherwise use predefined configurations
    switch (currentFooterConfig) {
      case "minimal":
        return minimalFooterConfig;
      case "company":
        return companyFooterConfig;
      case "default":
      default:
        return {
          sections: defaultFooterSections,
          copyright: defaultFooterCopyright,
          socialLinks: defaultSocialLinks,
          logo: footerLogo,
        };
    }
  };

  // Controls component
  const renderControls = () => {
    if (!showControls) return null;

    return (
      <div class="bg-base-200 p-4 border-b border-base-300">
        <h3 class="text-lg font-bold mb-4">Page Layout Controls</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allowFooterCustomization && (
            <>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Footer Configuration</span>
                </label>
                <select
                  class="select select-bordered"
                  value={currentFooterConfig}
                  onChange={(e) =>
                    setCurrentFooterConfig((e.target as HTMLSelectElement).value as any)}
                >
                  <option value="default">Default</option>
                  <option value="minimal">Minimal</option>
                  <option value="company">Company</option>
                </select>
              </div>

              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">Custom Footer</span>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={customFooterEnabled}
                    onChange={(e) => setCustomFooterEnabled((e.target as HTMLInputElement).checked)}
                  />
                </label>
              </div>
            </>
          )}

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Adaptive Margin</span>
              <input
                type="checkbox"
                class="toggle toggle-secondary"
                checked={adaptiveMargin}
                disabled
              />
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Header Controls</span>
              <input
                type="checkbox"
                class="toggle toggle-accent"
                checked={showHeaderControls}
                disabled
              />
            </label>
          </div>
        </div>

        <div class="stats stats-horizontal shadow mt-4">
          <div class="stat">
            <div class="stat-title">Footer Config</div>
            <div class="stat-value text-sm">
              {customFooterEnabled ? "Custom" : currentFooterConfig}
            </div>
          </div>
          <div class="stat">
            <div class="stat-title">Sidebar</div>
            <div class="stat-value text-sm">{globalSidebarOpen.value ? "Open" : "Closed"}</div>
          </div>
        </div>
      </div>
    );
  };

  const footerProps = getFooterConfig();
  const mainClasses = [
    "flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out",
    adaptiveMargin && globalSidebarOpen.value ? "lg:ml-80" : "lg:ml-0",
  ].filter(Boolean).join(" ");

  return (
    <div class={`min-h-screen bg-base-100 ${className}`} id={id} {...props}>
      {renderControls()}

      {/* HeaderLayout - Provides navigation, search, and sidebar */}
      <HeaderLayout
        currentPath={currentPath}
        showControls={showHeaderControls}
        {...headerProps}
      />

      {/* PageLayout wrapper for consistent spacing and structure */}
      <div class="flex">
        <main class={mainClasses}>
          {children}
          <Footer
            sections={footerProps.sections}
            copyright={footerProps.copyright}
            socialLinks={footerProps.socialLinks}
            logo={footerProps.logo}
          />
        </main>
      </div>
    </div>
  );
}
