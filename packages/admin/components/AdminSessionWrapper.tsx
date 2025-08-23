/**
 * AdminSessionWrapper Component
 *
 * Wraps admin components with global session management.
 * Add this at the root of admin routes to handle session expired modals globally.
 */

import { GlobalSessionProvider } from "@suppers/ui-lib";
import { getAuthClient } from "../lib/auth.ts";

export interface AdminSessionWrapperProps {
  children: preact.ComponentChildren;
}

export function AdminSessionWrapper({ children }: AdminSessionWrapperProps) {
  const handleLogin = () => {
    console.log("🔑 AdminSessionWrapper: Redirecting to login");
    globalThis.location.href = "/auth/login";
  };

  const handleSignOut = async () => {
    console.log("🚪 AdminSessionWrapper: Signing out");
    try {
      const authClient = await getAuthClient();
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
      modalMessage="Your admin session has expired. Please sign in again to continue managing the platform."
      loginButtonText="Sign In"
      signOutButtonText="Sign Out"
    >
      {children}
    </GlobalSessionProvider>
  );
}
