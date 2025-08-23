/**
 * PaymentsSessionWrapper Component
 *
 * Wraps payments components with global session management.
 * Add this at the root of payments routes to handle session expired modals globally.
 */

import { GlobalSessionProvider } from "@suppers/ui-lib";
import { OAuthAuthClient } from "@suppers/auth-client";

export interface PaymentsSessionWrapperProps {
  children: preact.ComponentChildren;
}

export function PaymentsSessionWrapper({ children }: PaymentsSessionWrapperProps) {
  const handleLogin = () => {
    console.log("🔑 PaymentsSessionWrapper: Showing login modal");
    // For payments, we typically use OAuth, so show the login modal
    try {
      const authClient = new OAuthAuthClient("http://localhost:8001", "payments");
      authClient.showLoginModal();
    } catch (error) {
      console.error("Error showing login modal:", error);
      // Fallback to redirect
      globalThis.location.href = "/auth/login";
    }
  };

  const handleSignOut = async () => {
    console.log("🚪 PaymentsSessionWrapper: Signing out");
    try {
      const authClient = new OAuthAuthClient("http://localhost:8001", "payments");
      await authClient.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
    globalThis.location.href = "/";
  };

  return (
    <GlobalSessionProvider
      onLogin={handleLogin}
      onSignOut={handleSignOut}
      modalTitle="Session Expired"
      modalMessage="Your session has expired. Please sign in again to continue using the payments platform."
      loginButtonText="Sign In"
      signOutButtonText="Sign Out"
    >
      {children}
    </GlobalSessionProvider>
  );
}
