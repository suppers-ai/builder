/**
 * GlobalSessionProvider Component
 *
 * Add this once at the root of your application to handle session expired
 * modals globally. No need to add SessionExpiredModal to individual components.
 */

import { SessionExpiredModal } from "../components/action/session-expired-modal/SessionExpiredModal.tsx";
import {
  globalSessionManager,
  handleSessionLogin,
  handleSessionSignOut,
  isSessionExpiredModalOpen,
} from "../utils/global-session-manager.ts";

export interface GlobalSessionProviderProps {
  children: preact.ComponentChildren;
  onLogin?: () => void;
  onSignOut?: () => void;
  loginUrl?: string;
  homeUrl?: string;
  modalTitle?: string;
  modalMessage?: string;
  loginButtonText?: string;
  signOutButtonText?: string;
}

export function GlobalSessionProvider({
  children,
  onLogin,
  onSignOut,
  loginUrl,
  homeUrl,
  modalTitle,
  modalMessage,
  loginButtonText,
  signOutButtonText,
}: GlobalSessionProviderProps) {
  // Configure the session manager with provided options
  if (onLogin || onSignOut || loginUrl || homeUrl) {
    globalSessionManager.configure({
      onLogin,
      onSignOut,
      loginUrl,
      homeUrl,
    });
  }

  return (
    <>
      {children}

      {/* Global Session Expired Modal */}
      <SessionExpiredModal
        open={isSessionExpiredModalOpen.value}
        onLogin={handleSessionLogin}
        onSignOut={handleSessionSignOut}
        onClose={() => globalSessionManager.hideSessionExpiredModal()}
        title={modalTitle}
        message={modalMessage}
        loginButtonText={loginButtonText}
        signOutButtonText={signOutButtonText}
      />
    </>
  );
}
