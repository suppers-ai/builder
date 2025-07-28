import { ComponentChildren } from "preact";
import { LoginButton } from "../../action/login-button/LoginButton.tsx";
import { UserInfo, DropdownItem } from "../../display/user-info/UserInfo.tsx";
import { useAuthClient } from "../../../providers/AuthClientProvider.tsx";
import { AuthGuardProps } from "./AuthGuard.schema.ts";
import { User, LogOut } from "lucide-preact";

export function AuthGuard({
  // Login button props
  loginButtonText = "Login",
  loginButtonVariant = "primary",
  loginButtonSize = "md",
  loginHref,
  onLogin,
  
  // User info props
  dropdownItems,
  
  // Layout props
  class: className = "",
  loadingComponent,
  
  // Custom render props
  renderLogin,
  renderUserInfo,
}: AuthGuardProps) {
  // Try to use AuthClient, but handle gracefully if not available
  let authState = null;
  try {
    authState = useAuthClient();
  } catch (error) {
    // AuthClientProvider not available - use fallback behavior
    console.warn("AuthGuard: AuthClientProvider not found, using fallback mode");
  }

  const { user, loading, login, logout, isAuthenticated } = authState || {
    user: null,
    loading: false,
    login: () => console.warn("AuthGuard: No auth provider configured"),
    logout: () => console.warn("AuthGuard: No auth provider configured"),
    isAuthenticated: () => false,
  };

  // Show loading state
  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="loading loading-spinner loading-md"></div>
      </div>
    );
  }

  // User is authenticated - show UserInfo
  if (isAuthenticated() && user) {
    // Use custom render function if provided
    if (renderUserInfo) {
      return <>{renderUserInfo(user, logout)}</>;
    }

    // Default dropdown items if none provided
    const defaultDropdownItems: DropdownItem[] = [
      {
        label: "View Profile",
        onClick: () => {
          // Navigate to profile - could be enhanced with navigation callback
          console.log("Navigate to profile");
        },
        icon: User
      },
      {
        label: "Logout",
        onClick: logout,
        icon: LogOut
      }
    ];

    return (
      <UserInfo
        user={user}
        dropdownItems={dropdownItems || defaultDropdownItems}
        class={className}
      />
    );
  }

  // User is not authenticated - show LoginButton
  // Use custom render function if provided
  if (renderLogin) {
    return <>{renderLogin(onLogin || login)}</>;
  }

  const handleLoginClick = () => {
    if (onLogin) {
      onLogin();
    } else {
      login();
    }
  };

  return (
    <LoginButton
      variant={loginButtonVariant}
      size={loginButtonSize}
      onClick={loginHref ? undefined : handleLoginClick}
      href={loginHref}
      class={className}
    >
      {loginButtonText}
    </LoginButton>
  );
}

export default AuthGuard;