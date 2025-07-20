import { PageLayout } from "./page-layout/PageLayout.tsx";
import { FooterSection, SocialLink } from "./footer/Footer.tsx";

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
            <div class="breadcrumbs text-sm">
              <ul>
                {breadcrumbs.map((breadcrumb, index) => (
                  <li key={index}>
                    {breadcrumb.path && !breadcrumb.active
                      ? (
                        <a href={breadcrumb.path} class="link link-hover">
                          {breadcrumb.name}
                        </a>
                      )
                      : (
                        <span class={breadcrumb.active ? "text-base-content/60" : ""}>
                          {breadcrumb.name}
                        </span>
                      )}
                  </li>
                ))}
              </ul>
            </div>
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
