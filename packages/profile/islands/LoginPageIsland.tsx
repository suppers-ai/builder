import { useEffect, useState } from "preact/hooks";
import type { User } from "@suppers/shared/utils/type-mappers.ts";
import { Button, Card, EmailInput, Input, Loading, PasswordInput, Toast, Logo } from "@suppers/ui-lib";
import { getAuthClient } from "../lib/auth.ts";

// Get the profile auth client (direct Supabase connection)
const authClient = getAuthClient();

interface LoginPageIslandProps {
  initialMode?: "login" | "register";
  redirectTo?: string;
  isModal?: boolean;
}

export default function LoginPageIsland({
  initialMode = "login",
  redirectTo = "/profile",
  isModal = false,
}: LoginPageIslandProps) {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Helper function to handle success redirect or postMessage
  const handleAuthSuccess = async () => {
    if (isModal) {
      try {
        // Get current user data to include in the message
        const currentUser = await authClient.getUser();
        const message = {
          type: "SSO_AUTH_SUCCESS",
          user: currentUser, // Pass the full user object from the profile page
        };

        console.log("🎯 LoginPageIsland: Sending auth success message:", message);

        // For popup windows, use window.opener instead of window.parent
        if (globalThis.window.opener) {
          globalThis.window.opener.postMessage(message, "*");
        } else if (globalThis.window.parent && globalThis.window.parent !== globalThis.window) {
          globalThis.window.parent.postMessage(message, "*");
        } else {
          console.error("No parent or opener window found");
        }
      } catch (error) {
        console.error("Failed to send postMessage:", error);
      }

      // Also try to close the popup if it's a popup
      if (globalThis.window.opener) {
        globalThis.window.close();
      } else {
        console.log("No window.opener found");
      }
    } else {
      // Normal redirect
      globalThis.window.location.href = redirectTo;
    }
  };

  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: "success" | "error" }>
  >([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  // Add toast function
  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  // Remove toast function
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Show toasts when error or success changes
  if (error && !toasts.some((t) => t.message === error)) {
    addToast(error, "error");
  }
  if (success && !toasts.some((t) => t.message === success)) {
    addToast(success, "success");
  }

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔍 LoginPageIsland: Starting auth check, isModal:", isModal);
        
        // Try to initialize auth client for both modal and non-modal contexts
        console.log("🔍 LoginPageIsland: Initializing auth client...");
        
        // Add timeout to prevent hanging
        const initPromise = authClient.initialize();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Auth initialization timeout")), 30000);
        });
        
        await Promise.race([initPromise, timeoutPromise]);
        const currentUser = await authClient.getUser();
        console.log("🔍 LoginPageIsland: Current user:", currentUser?.email || 'none');
        setUser(currentUser);

        if (currentUser && !isModal) {
          // User is already logged in and this is not a modal, redirect to intended destination
          // For modal mode, we don't auto-redirect as it might be part of OAuth flow
          console.log("🔍 LoginPageIsland: User authenticated, redirecting (non-modal)");
          handleAuthSuccess();
        } else if (currentUser && isModal) {
          console.log("🔍 LoginPageIsland: User authenticated in modal mode, waiting for user action");
          // In modal mode with authenticated user, just show the form but don't auto-redirect
          // This prevents infinite loops in OAuth popup flows
        }
      } catch (error) {
        console.error("🔍 LoginPageIsland: Auth initialization failed:", error);
        if (error instanceof Error && error.message.includes("timeout")) {
          console.log("🔍 LoginPageIsland: Auth timeout - proceeding to show login form");
          // For timeout, just show the login form
        } else {
          addToast("Failed to initialize authentication", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [redirectTo, isModal]);

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
  };

  const handleShowForgotPassword = () => {
    setShowForgotPassword(true);
    setError(null);
    setSuccess(null);
  };

  const handleHideForgotPassword = () => {
    setShowForgotPassword(false);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        // Sign in
        const result = await authClient.signIn({
          email: formData.email,
          password: formData.password,
        });

        if (result.error) {
          throw new Error(result.error);
        }
        const currentUser = await authClient.getUser();
        console.log("currentUser", currentUser);
              setUser(currentUser);

        addToast("Sign in successful!", "success");
        
        // Redirect to intended destination
        setTimeout(() => {
          handleAuthSuccess();
        }, 1000);
      } else {
        // Sign up
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const result = await authClient.signUp({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
        });

        if (result.error) {
          throw new Error(result.error);
        }

        addToast("Account created successfully!", "success");
        const currentUser = await authClient.getUser();
        console.log("currentUser", currentUser);
        setUser(currentUser);
        
        // Redirect to intended destination
        setTimeout(() => {
          handleAuthSuccess();
        }, 1000);
      }
    } catch (err) {
      console.error("Auth error:", err);
      const errorMessage = err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
      addToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      setError(null);
      const result = await authClient.signInWithOAuth(
        provider,
        window.location.origin + redirectTo,
      );

      if (result.error) {
        throw new Error(result.error);
      }

      // OAuth will redirect automatically
    } catch (err) {
      console.error("OAuth login failed:", err);
      addToast(err instanceof Error ? err.message : "OAuth login failed", "error");
    }
  };

  const handleForgotPassword = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await authClient.resetPassword({
        email: formData.email,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      addToast("Password reset email sent!", "success");
      setShowForgotPassword(false);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to send reset email", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div class="min-h-screen flex items-center justify-center">
        <Loading variant="spinner" size="lg" />
      </div>
    );
  }

  return (
    <div class="min-h-screen flex items-center justify-center p-2 bg-gradient-to-br from-base-200 to-base-300">
      {/* Toast Container */}
      <div class="fixed top-2 right-2 z-50 space-y-1">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            dismissible={true}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <div class="w-full max-w-xs">
        {/* Login Card */}
        <Card class="shadow-lg border-0 bg-base-100/90 backdrop-blur-sm">
          <div class="card-body p-3">
            {/* Logo as Header */}
            <div class="text-center mb-3">
              <div class="flex justify-center">
                <Logo size="md" variant="long" />
              </div>
            </div>

          {!showForgotPassword
            ? (
              <>
                {/* OAuth Buttons */}
                <div class="space-y-1 mb-2">
                  {/* Google Sign-In Button - Following Google Branding Guidelines */}
                  <button
                    class="w-full h-9 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                    onClick={() => handleOAuthLogin("google")}
                    disabled={isLoading}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <svg class="w-4 h-4 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span class="text-xs font-medium text-gray-700">
                      {isLogin ? "Sign in with Google" : "Sign up with Google"}
                    </span>
                  </button>

                  <button
                    class="w-full h-9 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                    onClick={() => handleOAuthLogin("github")}
                    disabled={isLoading}
                  >
                    <svg class="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span class="text-xs font-medium text-gray-700">
                      {isLogin ? "Sign in with GitHub" : "Sign up with GitHub"}
                    </span>
                  </button>
                </div>

                <div class="divider my-2 text-xs">OR USE YOUR ACCOUNT</div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} class="space-y-2">
                  {!isLogin && (
                    <div class="grid grid-cols-2 gap-1">
                      <Input
                        value={formData.firstName}
                        onInput={(e) =>
                          handleInputChange("firstName", (e.target as HTMLInputElement).value)}
                        required={!isLogin}
                        disabled={isLoading}
                        placeholder="First"
                        class="input input-xs input-bordered bg-base-200/50 focus:bg-base-100"
                      />
                      <Input
                        value={formData.lastName}
                        onInput={(e) =>
                          handleInputChange("lastName", (e.target as HTMLInputElement).value)}
                        required={!isLogin}
                        disabled={isLoading}
                        placeholder="Last"
                        class="input input-xs input-bordered bg-base-200/50 focus:bg-base-100"
                      />
                    </div>
                  )}

                  <div class="form-control">
                    <EmailInput
                      value={formData.email}
                      onInput={(e) =>
                        handleInputChange("email", (e.target as HTMLInputElement).value)}
                      required
                      disabled={isLoading}
                      placeholder="email@example.com"
                      class="input input-sm input-bordered bg-base-200/50 focus:bg-base-100"
                    />
                  </div>

                  <div class="form-control">
                    <PasswordInput
                      value={formData.password}
                      onInput={(e) =>
                        handleInputChange("password", (e.target as HTMLInputElement).value)}
                      required
                      disabled={isLoading}
                      placeholder="password"
                      class="input input-sm input-bordered bg-base-200/50 focus:bg-base-100"
                    />
                  </div>

                  {!isLogin && (
                    <PasswordInput
                      value={formData.confirmPassword}
                      onInput={(e) =>
                        handleInputChange("confirmPassword", (e.target as HTMLInputElement).value)}
                      required={!isLogin}
                      disabled={isLoading}
                      placeholder="confirm"
                      class="input input-sm input-bordered bg-base-200/50 focus:bg-base-100"
                    />
                  )}

                  <Button
                    type="submit"
                    color="primary"
                    size="sm"
                    class="w-full h-8 mt-2 font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loading variant="spinner" size="xs" /> : isLogin
                      ? (
                        "Sign In"
                      )
                      : (
                        "Create Account"
                      )}
                  </Button>
                </form>

                <div class="mt-2 text-center space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleMode}
                    class="text-xs h-8 px-3"
                    disabled={isLoading}
                  >
                    {isLogin
                      ? "Need account? Sign up"
                      : "Have account? Sign in"}
                  </Button>
                  
                  {isLogin && (
                    <div class="pt-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShowForgotPassword}
                        class="text-xs h-8 px-3 text-base-content/60 hover:text-base-content"
                        disabled={isLoading}
                      >
                        Forgot password?
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )
            : (
              /* Forgot Password Form */
              <form onSubmit={handleForgotPassword} class="space-y-2">
                <h3 class="text-xs font-semibold mb-2">Reset Password</h3>
                <p class="text-xs text-gray-600 mb-2">
                  Enter email for reset link.
                </p>

                <EmailInput
                  value={formData.email}
                  onInput={(e) => handleInputChange("email", (e.target as HTMLInputElement).value)}
                  required
                  disabled={isLoading}
                  placeholder="Email"
                  class="input input-sm input-bordered bg-base-200/50 focus:bg-base-100"
                />

                <Button
                  type="submit"
                  size="sm"
                  class="w-full h-8"
                  disabled={isLoading}
                >
                  {isLoading ? <Loading variant="spinner" size="xs" /> : (
                    "Send Link"
                  )}
                </Button>

                <div class="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleHideForgotPassword}
                    class="text-xs h-8 px-3 text-primary hover:text-primary-focus"
                    disabled={isLoading}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
