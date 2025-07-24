import { PageProps } from "fresh";
import { Footer } from "@suppers/ui-lib";
import FloatingMenuButton from "../islands/FloatingMenuButton.tsx";
import CustomSidebarIsland from "../islands/CustomSidebarIsland.tsx";
import SidebarAwareLayout from "../islands/SidebarAwareLayout.tsx";

export default function Layout({ Component, url }: PageProps) {
  const currentPath = url.pathname;

  return (
    <div class="min-h-screen bg-base-100">
      {/* Floating menu button */}
      <FloatingMenuButton />

      {/* Custom sidebar with login and theme controls */}
      <CustomSidebarIsland
        currentPath={currentPath}
        showLogin
        showProfile={false}
        user={undefined}
      />

      {/* Main content with sidebar awareness */}
      <main class="flex-1 min-h-screen">
        <SidebarAwareLayout>
          <div>
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
                    { text: "Deno", href: "https://fresh.deno.dev" },
                    { text: "daisyUI", href: "https://daisyui.com" },
                  ],
                },
              ]}
              copyright="© 2025 Suppers Software Limited. Built with Deno, Fresh, Preact & DaisyUI."
              socialLinks={[]}
            />
          </div>
        </SidebarAwareLayout>
      </main>
    </div>
  );
}
