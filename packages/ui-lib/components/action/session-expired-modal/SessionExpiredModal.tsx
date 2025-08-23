import { Modal } from "../modal/Modal.tsx";
import { Button } from "../button/Button.tsx";
import { AlertTriangle, LogIn, LogOut } from "lucide-preact";
import { BaseComponentProps } from "../../types.ts";

export interface SessionExpiredModalProps extends BaseComponentProps {
  open?: boolean;
  onLogin?: () => void;
  onSignOut?: () => void;
  onClose?: () => void;
  title?: string;
  message?: string;
  loginButtonText?: string;
  signOutButtonText?: string;
}

export function SessionExpiredModal({
  open = false,
  onLogin,
  onSignOut,
  onClose,
  title = "Session Expired",
  message = "Your session has expired. Please sign in again to continue using the application.",
  loginButtonText = "Sign In",
  signOutButtonText = "Sign Out",
  class: className = "",
  ...props
}: SessionExpiredModalProps) {
  const handleLogin = () => {
    console.log("🔑 SessionExpiredModal: User clicked Sign In");
    onLogin?.();
  };

  const handleSignOut = () => {
    console.log("🚪 SessionExpiredModal: User clicked Sign Out");
    onSignOut?.();
  };

  const handleClose = () => {
    console.log("❌ SessionExpiredModal: User closed modal, auto sign out");
    // If user closes modal without taking action, sign them out
    onSignOut?.();
    onClose?.();
  };

  const handleBackdropClick = () => {
    handleClose();
  };

  return (
    <Modal
      open={open}
      title={title}
      onBackdropClick={handleBackdropClick}
      backdrop
      responsive
      class={`session-expired-modal ${className}`}
      {...props}
    >
      <div class="flex flex-col items-center text-center space-y-6">
        <div class="text-warning">
          <AlertTriangle class="w-16 h-16 mx-auto" />
        </div>

        <div class="space-y-2">
          <p class="text-lg font-medium">{title}</p>
          <p class="text-sm text-base-content/70">
            {message}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 w-full pt-4">
          <Button
            onClick={handleLogin}
            color="primary"
            size="md"
            class="flex items-center justify-center gap-2 flex-1"
            data-testid="session-modal-signin"
          >
            <LogIn class="w-4 h-4" />
            {loginButtonText}
          </Button>

          <Button
            onClick={handleSignOut}
            color="ghost"
            size="md"
            class="flex items-center justify-center gap-2 flex-1"
            data-testid="session-modal-signout"
          >
            <LogOut class="w-4 h-4" />
            {signOutButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
