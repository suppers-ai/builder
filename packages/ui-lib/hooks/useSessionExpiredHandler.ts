import { useCallback, useState } from "preact/hooks";

export interface SessionExpiredHandlerOptions {
  onLogin?: () => void;
  onSignOut?: () => void;
}

export function useSessionExpiredHandler(options: SessionExpiredHandlerOptions = {}) {
  const [isSessionExpiredModalOpen, setIsSessionExpiredModalOpen] = useState(false);

  const showSessionExpiredModal = useCallback(() => {
    setIsSessionExpiredModalOpen(true);
  }, []);

  const hideSessionExpiredModal = useCallback(() => {
    setIsSessionExpiredModalOpen(false);
  }, []);

  const handleLogin = useCallback(() => {
    hideSessionExpiredModal();
    options.onLogin?.();
  }, [options.onLogin]);

  const handleSignOut = useCallback(() => {
    hideSessionExpiredModal();
    options.onSignOut?.();
  }, [options.onSignOut]);

  const handleSessionExpiredError = useCallback((error: any) => {
    // Check if the error indicates an expired or invalid token
    const isTokenError = error?.message?.includes("Invalid or expired token") ||
      error?.message?.includes("token") && error?.message?.includes("invalid") ||
      error?.message?.includes("session") && error?.message?.includes("expired") ||
      error?.status === 401 ||
      error?.code === "token_expired" ||
      error?.code === "invalid_credentials";

    if (isTokenError) {
      console.log("🔒 Session expired error detected, showing modal instead of toast");
      showSessionExpiredModal();
      return true; // Indicates the error was handled
    }

    return false; // Error was not a session expired error
  }, [showSessionExpiredModal]);

  const handleApiResponseError = useCallback((responseError: string) => {
    return handleSessionExpiredError({ message: responseError });
  }, [handleSessionExpiredError]);

  const handleWithSessionCheck = useCallback((
    error: any,
    onSessionExpired: () => void,
    onNormalError: (error: any) => void,
  ) => {
    if (handleSessionExpiredError(error)) {
      onSessionExpired();
    } else {
      onNormalError(error);
    }
  }, [handleSessionExpiredError]);

  return {
    isSessionExpiredModalOpen,
    showSessionExpiredModal,
    hideSessionExpiredModal,
    handleLogin,
    handleSignOut,
    handleSessionExpiredError,
    handleApiResponseError,
    handleWithSessionCheck,
  };
}
