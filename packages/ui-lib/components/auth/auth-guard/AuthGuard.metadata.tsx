import { AuthGuard } from "./AuthGuard.tsx";
import { AuthGuardPropsSchema } from "./AuthGuard.schema.ts";
import { User, LogOut, Settings as SettingsIcon } from "lucide-preact";

// Sample dropdown items for examples
const basicDropdownItems = [
  {
    label: "View Profile",
    onClick: () => console.log("Navigate to profile"),
    icon: User
  },
  {
    label: "Logout",
    onClick: () => console.log("Logout clicked"),
    icon: LogOut
  }
];

const adminDropdownItems = [
  {
    label: "View Profile", 
    onClick: () => console.log("Navigate to profile"),
    icon: User
  },
  {
    label: "Settings",
    onClick: () => console.log("Navigate to settings"),
    icon: SettingsIcon
  },
  {
    label: "Logout",
    onClick: () => console.log("Logout clicked"),
    icon: LogOut
  }
];

export const componentMetadata = {
  component: AuthGuard,
  category: "Auth",
  name: "AuthGuard",
  path: "/components/auth/auth-guard",
  description: "Authentication-aware component that renders login button when not authenticated or user info when authenticated. Requires AuthClientProvider for full functionality, but gracefully falls back to login-only mode without it.",
  schema: { schema: AuthGuardPropsSchema },
  props: {
    loginButtonText: {
      type: "string",
      default: '"Login"',
      required: false,
      description: "Text to display on the login button"
    },
    loginButtonVariant: {
      type: '"primary" | "secondary" | "accent" | "ghost" | "link" | "info" | "success" | "warning" | "error"',
      default: '"primary"',
      required: false,
      description: "Variant style for the login button"
    },
    loginButtonSize: {
      type: '"xs" | "sm" | "md" | "lg"',
      default: '"md"',
      required: false,
      description: "Size of the login button"
    },
    loginHref: {
      type: "string",
      required: false,
      description: "URL to navigate to for login (if not using OAuth)"
    },
    onLogin: {
      type: "() => void",
      required: false,
      description: "Custom login handler function"
    },
    dropdownItems: {
      type: "DropdownItem[]",
      required: false,
      description: "Custom dropdown menu items for the user info settings menu"
    },
    loadingComponent: {
      type: "ComponentChildren",
      required: false,
      description: "Custom loading component to show while auth state is initializing"
    },
    renderLogin: {
      type: "(loginFn: () => void) => ComponentChildren",
      required: false,
      description: "Custom render function for login state"
    },
    renderUserInfo: {
      type: "(user: AuthUser, logoutFn: () => void) => ComponentChildren",
      required: false,
      description: "Custom render function for authenticated state"
    },
    class: {
      type: "string",
      required: false,
      description: "Additional CSS classes to apply"
    }
  },
  examples: [
    {
      name: "Basic AuthGuard",
      code: `// Note: Wrap your app with AuthClientProvider for full functionality
<AuthClientProvider storeUrl="..." clientId="...">
  <AuthGuard />
</AuthClientProvider>`,
      props: {}
    },
    {
      name: "Custom Login Button",
      code: `<AuthGuard 
  loginButtonText="Sign In" 
  loginButtonVariant="secondary"
  loginButtonSize="lg"
/>`,
      props: {
        loginButtonText: "Sign In",
        loginButtonVariant: "secondary",
        loginButtonSize: "lg"
      }
    },
    {
      name: "With Custom Dropdown Items",
      code: `<AuthGuard
  dropdownItems={[
    {
      label: "View Profile",
      onClick: () => navigate('/profile'),
      icon: User
    },
    {
      label: "Settings", 
      onClick: () => navigate('/settings'),
      icon: Settings
    },
    {
      label: "Logout",
      onClick: () => logout(),
      icon: LogOut
    }
  ]}
/>`,
      props: {
        dropdownItems: adminDropdownItems
      }
    },
    {
      name: "Custom Login Handler",
      code: `<AuthGuard
  onLogin={() => {
    // Custom login logic
    analytics.track('login_attempted');
    login();
  }}
/>`,
      props: {
        onLogin: () => console.log("Custom login handler")
      }
    },
    {
      name: "With Custom Loading",
      code: `<AuthGuard
  loadingComponent={
    <div className="flex items-center space-x-2">
      <div className="loading loading-spinner loading-sm"></div>
      <span>Authenticating...</span>
    </div>
  }
/>`,
      props: {
        loadingComponent: "Custom loading component"
      }
    },
    {
      name: "Custom Render Functions",
      code: `<AuthGuard
  renderLogin={(login) => (
    <div className="text-center">
      <h2>Welcome!</h2>
      <button onClick={login} className="btn btn-primary">
        Join Now
      </button>
    </div>
  )}
  renderUserInfo={(user, logout) => (
    <div className="flex items-center space-x-3">
      <span>Hello, {user.display_name}!</span>
      <button onClick={logout} className="btn btn-sm">
        Exit
      </button>
    </div>
  )}
/>`,
      props: {
        renderLogin: () => "Custom login render",
        renderUserInfo: () => "Custom user info render"
      }
    }
  ]
};