import { PageLayout } from "./page-layout/PageLayout.tsx";
import { FooterSection, SocialLink } from "./footer/Footer.tsx";
import { Breadcrumbs } from "../navigation/breadcrumbs/Breadcrumbs.tsx";

export interface MainLayoutProps {
  children: any;
  title?: string;
  description?: string;
  breadcrumbs?: Array<{
    name: string;
    path?: string;
    active?: boolean;
  }>;
  showSidebar?: boolean;
  footerConfig?: "default" | "minimal" | "company" | "custom";
  footerSections?: FooterSection[];
  footerCopyright?: string;
  footerSocialLinks?: SocialLink[];
  footerLogo?: any;
}

export function MainLayout({
  children,
  title,
  description,
  breadcrumbs,
  showSidebar = true,
  footerConfig = "default",
  footerSections,
  footerCopyright,
  footerSocialLinks,
  footerLogo,
}: MainLayoutProps) {
  return (
    <PageLayout
      footerConfig={footerConfig}
      footerSections={footerSections}
      footerCopyright={footerCopyright}
      footerSocialLinks={footerSocialLinks}
      footerLogo={footerLogo}
    >
      {/* Page Header */}
      {(title || description) && (
        <header class="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-base-300">
          <div class="px-4 lg:px-6 py-8">
            <div class="max-w-4xl">
              {title && (
                <h1 class="text-3xl lg:text-4xl font-bold text-base-content mb-2">
                  {title}
                </h1>
              )}
              {description && (
                <p class="text-lg text-base-content/70 max-w-2xl">
                  {description}
                </p>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav class="bg-base-200/50 border-b border-base-300">
          <div class="px-4 lg:px-6 py-3">
            <Breadcrumbs 
              size="sm"
              items={breadcrumbs.map(breadcrumb => ({
                label: breadcrumb.name,
                href: breadcrumb.path,
                active: breadcrumb.active
              }))}
            />
          </div>
        </nav>
      )}

      {/* Main Content */}
      <div class="px-4 lg:px-6 py-8">
        {children}
      </div>
    </PageLayout>
  );
}
