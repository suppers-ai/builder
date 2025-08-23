import { ComponentChildren } from "preact";
import SimpleNavbar from "../islands/SimpleNavbar.tsx";
import ToastContainer from "../islands/ToastContainer.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import { NetworkStatus, OfflineBanner } from "./NetworkStatus.tsx";

interface LayoutProps {
  children: ComponentChildren;
  title?: string;
  currentPath?: string;
  showNavbar?: boolean;
  showNetworkStatus?: boolean;
  errorBoundary?: boolean;
}

export default function Layout({
  children,
  title = "Sorted Storage",
  currentPath = "/",
  showNavbar = true,
  showNetworkStatus = true,
  errorBoundary = true,
}: LayoutProps) {
  const content = (
    <div class="min-h-screen bg-base-100">
      {/* Network Status Banner */}
      {showNetworkStatus && <OfflineBanner />}

      {/* Navigation */}
      {showNavbar && <SimpleNavbar currentPath={currentPath} />}

      {/* Main Content */}
      <main class="flex-1">
        {children}
      </main>

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Network Status Indicator (floating) */}
      {showNetworkStatus && <NetworkStatus />}
    </div>
  );

  return (
    <html data-theme="light" lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta
          name="description"
          content="Accessible minimalist cloud storage application with keyboard navigation and screen reader support"
        />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />

        {/* Accessibility meta tags */}
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />

        {/* Integrated error monitoring, performance monitoring, and accessibility initialization */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // Initialize application systems on DOM ready
            document.addEventListener('DOMContentLoaded', function() {
              // Error monitoring is automatically initialized via module import
              
              // Initialize accessibility features
              if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
                document.documentElement.classList.add('high-contrast');
              }
              
              if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                document.documentElement.classList.add('reduced-motion');
              }
              
              // Initialize keyboard navigation detection
              let isUsingKeyboard = false;
              
              document.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                  isUsingKeyboard = true;
                  document.documentElement.classList.add('keyboard-navigation');
                }
              });
              
              document.addEventListener('mousedown', function() {
                if (isUsingKeyboard) {
                  isUsingKeyboard = false;
                  document.documentElement.classList.remove('keyboard-navigation');
                }
              });
              
              // Create live region for screen reader announcements
              const liveRegion = document.createElement('div');
              liveRegion.id = 'sr-live-region';
              liveRegion.setAttribute('aria-live', 'polite');
              liveRegion.setAttribute('aria-atomic', 'true');
              liveRegion.className = 'sr-only';
              document.body.appendChild(liveRegion);
              
              // Add main content ID for skip links
              const mainContent = document.querySelector('main');
              if (mainContent && !mainContent.id) {
                mainContent.id = 'main-content';
              }
            });
          `,
          }}
        />
      </head>
      <body>
        {/* Skip to main content link */}
        <a href="#main-content" class="skip-link">
          Skip to main content
        </a>

        {errorBoundary
          ? (
            <ErrorBoundary context="Application Layout">
              {content}
            </ErrorBoundary>
          )
          : content}
      </body>
    </html>
  );
}
