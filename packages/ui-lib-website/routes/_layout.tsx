import { PageProps } from "fresh";
import { Footer } from "@suppers/ui-lib";
import HeaderLayoutIsland from "../islands/HeaderLayoutIsland.tsx";
import SidebarAwareLayout from "../islands/SidebarAwareLayout.tsx";

export default function Layout({ Component, url }: PageProps) {
  const currentPath = url.pathname;

  return (
    <div class="min-h-screen bg-base-100">
      {/* Header with interactive features */}
      <HeaderLayoutIsland
        title="Suppers Software"
        currentPath={currentPath}
        showSearch={false}
        showLogin
        showProfile={false}
        user={undefined}
      />

      {/* Main content with proper spacing for header and sidebar */}
      <main class="flex-1 min-h-[calc(100vh-4rem)]">
        <SidebarAwareLayout>
          <Component />

          {/* Footer */}
          <Footer
            sections={[
              {
                title: "Components",
                links: [
                  { text: "UI Library", href: "/components" },
                  { text: "Browse All", href: "/components" },
                  { text: "Getting Started", href: "/docs" },
                ],
              },
              {
                title: "Builder",
                links: [
                  { text: "Generate App", href: "/generate" },
                  { text: "Templates", href: "/templates" },
                  { text: "API Reference", href: "/api" },
                ],
              },
              {
                title: "Resources",
                links: [
                  { text: "Documentation", href: "/docs" },
                  { text: "Deno", href: "https://deno.com" },
                  { text: "Fresh", href: "https://fresh.deno.dev" },
                  { text: "daisyUI", href: "https://daisyui.com" },
                ],
              },
            ]}
            copyright="© 2025 Suppers Software Limited. Built with Deno, Fresh, Preact & DaisyUI."
            socialLinks={[]}
          />
        </SidebarAwareLayout>
      </main>
    </div>
  );
}
