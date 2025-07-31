import { useEffect, useState } from "preact/hooks";
import { signal } from "@preact/signals";
import { AuthHelpers } from "../lib/auth-helpers.ts";
import type { User } from "../lib/api-client.ts";
import {
  Alert,
  Button,
  Card,
  EmailInput,
  Input,
  Loading,
  PasswordInput,
  Toast,
} from "@suppers/ui-lib";

// Signals for reactive state
const userSignal = signal<User | null>(null);
const authLoadingSignal = signal(true);

interface LoginPageIslandProps {
  initialMode?: "login" | "register";
  redirectTo?: string;
}

export default function LoginPageIsland({
  initialMode = "login",
  redirectTo = "/profile",
}: LoginPageIslandProps) {
  console.log("🔵 LoginPageIsland: Component loaded", { initialMode, redirectTo, currentUrl: globalThis.location?.href });
  
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [theme, setTheme] = useState<string>("light");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  // Check auth state and theme on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔴 LoginPage: Checking if user is logged in...");
        const user = await AuthHelpers.getCurrentUser();
        console.log("🔴 LoginPage: getCurrentUser result:", user ? `User: ${user.email}` : "No user");
        userSignal.value = user;

        if (user) {
          // Check if this is an external SSO request first
          const isPopup = globalThis.window?.opener && globalThis.window?.opener !== globalThis.window;
          const urlParams = new URLSearchParams(globalThis.location.search);
          const externalApp = urlParams.get("external_app");
          const origin = urlParams.get("origin");

          if (isPopup && externalApp && origin) {
            console.log("🔵 LoginPage: User already logged in - handling external SSO directly");
            
            try {
              const session = await AuthHelpers.getCurrentSession();
              if (session) {
                const message = {
                  type: "SSO_SUCCESS",
                  accessToken: session.access_token,
                  refreshToken: session.refresh_token,
                  user: session.user,
                  expiresIn: session.expires_in
                };
                
                console.log("🔵 LoginPage: Sending SSO success message to parent:", message);
                globalThis.window?.opener?.postMessage(message, origin);
                
                // Close popup
                setTimeout(() => {
                  console.log("🔵 LoginPage: Closing SSO popup");
                  globalThis.window?.close();
                }, 500);
                return; // Don't continue with normal redirect
              }
            } catch (error) {
              console.error("❌ LoginPage: Error handling external SSO for already logged in user:", error);
              const errorMessage = {
                type: "SSO_ERROR",
                error: error instanceof Error ? error.message : "Unknown error"
              };
              globalThis.window?.opener?.postMessage(errorMessage, origin);
              globalThis.window?.close();
              return;
            }
          }
          
          // Normal redirect if not external SSO - preserve external SSO params if they exist
          if (externalApp && origin) {
            // Preserve external SSO parameters in the redirect
            const redirectUrl = new URL(redirectTo, globalThis.location.origin);
            redirectUrl.searchParams.set("external_app", externalApp);
            redirectUrl.searchParams.set("origin", origin);
            globalThis.location.href = redirectUrl.toString();
          } else {
            globalThis.location.href = redirectTo;
          }
        }
      } catch (err) {
        console.log("No authenticated user");
      } finally {
        authLoadingSignal.value = false;
      }
    };

    // Get initial theme
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(currentTheme);

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
          const newTheme = document.documentElement.getAttribute("data-theme") || "light";
          setTheme(newTheme);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    checkAuth();

    return () => observer.disconnect();

    // Note: Auth state changes are not implemented yet
    // TODO: Implement proper auth state listening when API supports it
  }, [redirectTo]);

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    });
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
    setError(null);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        // Login
        const loginResult = await AuthHelpers.signIn({
          email: formData.email,
          password: formData.password,
        });
        setSuccess("Login successful! Redirecting...");

        // Redirect after successful login
        setTimeout(async () => {
          // Check if we're in a popup window for external SSO
          const isPopup = globalThis.window?.opener && globalThis.window?.opener !== globalThis.window;
          const urlParams = new URLSearchParams(globalThis.location.search);
          const externalApp = urlParams.get("external_app");
          const origin = urlParams.get("origin");
          
          console.log("🔵 Profile: Post-login redirect check:", {
            isPopup,
            externalApp,
            origin,
            currentUrl: globalThis.location.href
          });
          
          if (isPopup && externalApp && origin) {
            console.log("🔵 Profile: Handling external SSO success for app:", externalApp);
            console.log("🔵 Profile: Target origin:", origin);
            
            try {
              // Use session from login result instead of making another API call
              const session = loginResult.session;
              console.log("🔵 Profile: Using session from login result:", { 
                hasSession: !!session, 
                hasUser: !!session?.user,  
                userEmail: session?.user?.email
              });
              
              if (session) {
                const message = {
                  type: "SSO_SUCCESS",
                  accessToken: session.access_token,
                  refreshToken: session.refresh_token,
                  user: session.user,
                  expiresIn: session.expires_in
                };
                
                console.log("🔵 Profile: Sending SSO success message to parent:", message);
                globalThis.window?.opener?.postMessage(message, origin);
                
                // Small delay then close
                setTimeout(() => {
                  console.log("🔵 Profile: Closing popup window");
                  globalThis.window?.close();
                }, 500);
              } else {
                throw new Error("No session found after login");
              }
            } catch (error) {
              console.error("❌ Profile: Error sending SSO success:", error);
              const errorMessage = {
                type: "SSO_ERROR",
                error: error instanceof Error ? error.message : "Unknown error"
              };
              globalThis.window?.opener?.postMessage(errorMessage, origin);
              globalThis.window?.close();
            }
          } else if (isPopup) {
            // Regular popup close
            console.log("🔵 Profile: Regular popup close (no external SSO)");
            globalThis.window?.close();
          } else {
            console.log("🔵 Profile: Regular redirect to:", redirectTo);
            globalThis.location.href = redirectTo;
          }
        }, 1000);
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const result = await AuthHelpers.signUp({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: `${formData.firstName} ${formData.lastName}`.trim(),
        });

        if (result.user && !result.user.email_confirmed_at) {
          setSuccess(
            "Account created! Please check your email and click the verification link to complete your registration.",
          );
        } else if (result.user && result.user.email_confirmed_at) {
          setSuccess("Account created and verified! Redirecting...");
          setTimeout(async () => {
            // Check if we're in a popup window for external SSO
            const isPopup = globalThis.window?.opener && globalThis.window?.opener !== globalThis.window;
            const urlParams = new URLSearchParams(globalThis.location.search);
            const externalApp = urlParams.get("external_app");
            const origin = urlParams.get("origin");
            
            if (isPopup && externalApp && origin) {
              try {
                // Use session from registration result instead of making another API call
                const session = result.session;
                if (session) {
                  const message = {
                    type: "SSO_SUCCESS",
                    accessToken: session.access_token,
                    refreshToken: session.refresh_token,
                    user: session.user,
                    expiresIn: session.expires_in
                  };
                  globalThis.window?.opener?.postMessage(message, origin);
                  setTimeout(() => globalThis.window?.close(), 500);
                } else {
                  throw new Error("No session found after registration");
                }
              } catch (error) {
                const errorMessage = {
                  type: "SSO_ERROR",
                  error: error instanceof Error ? error.message : "Unknown error"
                };
                globalThis.window?.opener?.postMessage(errorMessage, origin);
                globalThis.window?.close();
              }
            } else if (isPopup) {
              globalThis.window?.close();
            } else {
              globalThis.location.href = redirectTo;
            }
          }, 1000);
        } else {
          setSuccess("Account created! Please check your email for verification.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      setError(null);
      
      // Check if we're in a popup window opened for external SSO
      const isPopup = globalThis.window?.opener && globalThis.window?.opener !== globalThis.window;
      const urlParams = new URLSearchParams(globalThis.location.search);
      const externalApp = urlParams.get("external_app");
      const origin = urlParams.get("origin");
      
      console.log("🔵 Profile: OAuth login attempt:", {
        provider,
        isPopup,
        externalApp,
        origin,
        redirectTo
      });
      
      if (isPopup && externalApp && origin) {
        // External SSO - build callback URL that preserves the external SSO parameters
        const callbackUrl = new URL("/auth/callback", globalThis.location.origin);
        callbackUrl.searchParams.set("redirect_to", globalThis.location.href); // Keep current URL with params
        
        console.log("🔵 Profile: External SSO OAuth callback URL:", callbackUrl.toString());
        await AuthHelpers.signInWithOAuth(provider, callbackUrl.toString());
      } else {
        // Normal flow - same origin callback
        const callbackUrl = new URL("/auth/callback", globalThis.location.origin);
        callbackUrl.searchParams.set("redirect_to", redirectTo);
        
        console.log("🔵 Profile: Normal OAuth callback URL:", callbackUrl.toString());
        await AuthHelpers.signInWithOAuth(provider, callbackUrl.toString());
      }
    } catch (err) {
      console.error("❌ Profile: OAuth login failed:", err);
      setError(err instanceof Error ? err.message : "OAuth login failed");
    }
  };

  const handleForgotPassword = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await AuthHelpers.resetPassword({
        email: formData.email,
      });
      setSuccess("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoadingSignal.value) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading variant="spinner" size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-300">
      <div className="max-w-md w-full">
        <Card bordered class="bg-base-100 shadow-xl border-base-200 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <div className="text-center">
                              <div className="mb-4">
                  <img
                    src={theme === "dark" ? "/logos/long_dark.png" : "/logos/long_light.png"}
                    alt="Suppers"
                    className="h-8 mx-auto"
                  />
                </div>
              <h1 className="text-xl font-semibold text-base-content">
                {showForgotPassword
                  ? "Reset Password"
                  : isLogin
                  ? "Welcome Back"
                  : "Join Suppers"}
              </h1>
              <p className="text-sm text-base-content/60">
                {showForgotPassword
                  ? "Enter your email to reset your password"
                  : isLogin
                  ? "Sign in to your account to continue"
                  : "Create your account to get started"}
              </p>
            </div>
          </div>

          <div className="px-6 pb-6">
            {/* Error/Success Messages */}
          {error && (
            <div className="mb-6">
              <Alert color="error" class="bg-error/5 border-error/20 text-error">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.186-.833-2.956 0L3.858 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {error}
              </Alert>
            </div>
          )}
          {success && (
            <div className="mb-6">
              <Alert color="success" class="bg-success/5 border-success/20 text-success">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {success}
              </Alert>
            </div>
          )}

          {showForgotPassword
            ? (
              /* Forgot Password Form */
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm text-base-content mb-1"
                  >
                    Email address
                  </label>
                  <EmailInput
                    id="email"
                    value={formData.email}
                    onInput={(e) =>
                      handleInputChange("email", (e.target as HTMLInputElement).value)}
                    required
                    placeholder="Enter your email"
                    size="md"
                    bordered={true}
                    class="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  loading={isLoading}
                  color="primary"
                  wide
                  class="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 font-semibold"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {isLoading ? "Sending..." : "Send Reset Email"}
                </Button>

                <Button
                  type="button"
                  onClick={handleHideForgotPassword}
                  variant="ghost"
                  wide
                  class="text-base-content/60 hover:text-base-content font-medium"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Sign In
                </Button>
              </form>
            )
            : (
              /* Login/Register Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm text-base-content mb-1"
                      >
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onInput={(e) =>
                          handleInputChange("firstName", (e.target as HTMLInputElement).value)}
                        required
                        placeholder="Enter first name"
                        size="md"
                        bordered={true}
                        class="w-full"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm text-base-content mb-1"
                      >
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onInput={(e) =>
                          handleInputChange("lastName", (e.target as HTMLInputElement).value)}
                        required
                        placeholder="Enter last name"
                        size="md"
                        bordered={true}
                        class="w-full"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm text-base-content mb-1"
                  >
                    Email address
                  </label>
                  <EmailInput
                    id="email"
                    value={formData.email}
                    onInput={(e) =>
                      handleInputChange("email", (e.target as HTMLInputElement).value)}
                    required
                    placeholder="Enter your email address"
                    size="md"
                    bordered={true}
                    class="w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm text-base-content mb-1"
                  >
                    Password
                  </label>
                  <PasswordInput
                    id="password"
                    value={formData.password}
                    onInput={(e) =>
                      handleInputChange("password", (e.target as HTMLInputElement).value)}
                    required
                    placeholder="Enter your password"
                    size="md"
                    bordered={true}
                    class="w-full"
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm text-base-content mb-1"
                    >
                      Confirm Password
                    </label>
                    <PasswordInput
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onInput={(e) =>
                        handleInputChange("confirmPassword", (e.target as HTMLInputElement).value)}
                      required
                      placeholder="Confirm your password"
                      size="md"
                      bordered={true}
                      class="w-full"
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p class="text-error text-xs mt-1">Passwords do not match</p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  loading={isLoading}
                  color="primary"
                  class="w-full"
                >
                  {isLoading ? "Loading..." : (isLogin ? "Sign In" : "Create Account")}
                </Button>
              </form>
            )}

          {!showForgotPassword && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-base-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-base-100 text-base-content/60">Or continue with</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={() => handleOAuthLogin("google")}
                    variant="outline"
                    size="sm"
                  >
                    <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleOAuthLogin("github")}
                    variant="outline"
                    size="sm"
                  >
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center space-y-2 border-t border-base-300 pt-4 flex gap-4">
                <Button
                  type="button"
                  onClick={handleToggleMode}
                  variant="link"
                  size="sm"
                >
                  {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                </Button>

                {isLogin && (
                  <Button
                    type="button"
                    onClick={handleShowForgotPassword}
                    variant="link"
                    size="sm"
                  >
                    Forgot your password?
                  </Button>
                )}
              </div>
            </>
          )}
          </div>
        </Card>
      </div>
    </div>
  );
}
