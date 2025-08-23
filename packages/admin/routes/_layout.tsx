import { PageProps } from "fresh";
import CustomSidebarIsland from "../islands/CustomSidebarIsland.tsx";
import FloatingMenuButton from "../islands/FloatingMenuButton.tsx";
import ToastContainer from "../islands/ToastContainer.tsx";
import AuthGuard from "../islands/AuthGuard.tsx";

export default function Layout({ Component, url }: PageProps) {
  const currentPath = url.pathname;
  
  // Skip authentication for auth routes
  const isAuthRoute = currentPath.startsWith("/auth");

  // Auth routes don't need the full layout
  if (isAuthRoute) {
    return (
      <div class="min-h-screen bg-base-100">
        <Component />
        <ToastContainer />
      </div>
    );
  }

  // Protected routes with full layout
  return (
    <AuthGuard>
      <div class="min-h-screen bg-base-100">
        {/* Floating menu button */}
        <FloatingMenuButton />

        {/* Custom sidebar */}
        <CustomSidebarIsland currentPath={currentPath} />

        {/* Main content with sidebar awareness */}
        <main class="flex-1 min-h-screen">
          <div class="admin-sidebar-aware-layout">
            <div class="p-4 sm:p-6 lg:p-8">
              <Component />
            </div>
          </div>
        </main>

        {/* Toast notifications */}
        <ToastContainer />

        {/* Live region for screen reader announcements */}
        <div aria-live="polite" aria-atomic="true" class="sr-only" id="admin-live-region"></div>
        <div
          aria-live="assertive"
          aria-atomic="true"
          class="sr-only"
          id="admin-live-region-assertive"
        >
        </div>
      </div>
    </AuthGuard>
  );
}
