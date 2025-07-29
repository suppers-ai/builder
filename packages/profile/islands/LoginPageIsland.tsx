import { useEffect, useState } from "preact/hooks";
import { signal } from "@preact/signals";
import { AuthHelpers } from "../lib/auth-helpers.ts";
import type { User } from "@supabase/supabase-js";
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
        const user = await AuthHelpers.getCurrentUser();
        userSignal.value = user;

        if (user) {
          // Redirect if already logged in
          globalThis.location.href = redirectTo;
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
        await AuthHelpers.signIn({
          email: formData.email,
          password: formData.password,
        });
        setSuccess("Login successful! Redirecting...");

        // Redirect after successful login
        setTimeout(() => {
          globalThis.location.href = redirectTo;
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
          setTimeout(() => {
            globalThis.location.href = redirectTo;
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
      const currentUrl = new URL(globalThis.location.href);
      const callbackUrl = new URL("/auth/callback", globalThis.location.origin);
      callbackUrl.searchParams.set("redirect_to", redirectTo);

      await AuthHelpers.signInWithOAuth(provider, callbackUrl.toString());
    } catch (err) {
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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url(/backgrounds/hero-gradient.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-md w-full">
        <Card bordered class="bg-base-100 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <img
                src={theme === "dark" ? "/logos/long_dark.png" : "/logos/long_light.png"}
                alt="Suppers"
                className="h-12 mx-auto"
              />
            </div>
            <p className="text-base-content/70">
              {showForgotPassword
                ? "Reset your password"
                : isLogin
                ? "Sign in to your account"
                : "Create a new account"}
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4">
              <Alert color="error">
                {error}
              </Alert>
            </div>
          )}
          {success && (
            <div className="mb-4">
              <Alert color="success">
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
                    className="block text-sm font-medium text-base-content mb-1"
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
                    class="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  loading={isLoading}
                  color="primary"
                  wide
                >
                  {isLoading ? "Sending..." : "Send Reset Email"}
                </Button>

                <Button
                  type="button"
                  onClick={handleHideForgotPassword}
                  variant="ghost"
                  wide
                >
                  Back to Sign In
                </Button>
              </form>
            )
            : (
              /* Login/Register Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <>
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-base-content mb-1"
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
                        placeholder="First Name"
                        class="w-full"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-base-content mb-1"
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
                        placeholder="Last Name"
                        class="w-full"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-base-content mb-1"
                  >
                    Email address
                  </label>
                  <EmailInput
                    id="email"
                    value={formData.email}
                    onInput={(e) =>
                      handleInputChange("email", (e.target as HTMLInputElement).value)}
                    required
                    placeholder="Email address"
                    class="w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-base-content mb-1"
                  >
                    Password
                  </label>
                  <PasswordInput
                    id="password"
                    value={formData.password}
                    onInput={(e) =>
                      handleInputChange("password", (e.target as HTMLInputElement).value)}
                    required
                    placeholder="Password"
                    class="w-full"
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-base-content mb-1"
                    >
                      Confirm Password
                    </label>
                    <PasswordInput
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onInput={(e) =>
                        handleInputChange("confirmPassword", (e.target as HTMLInputElement).value)}
                      required
                      placeholder="Confirm Password"
                      class="w-full"
                    />
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
              {/* OAuth Buttons */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-base-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-base-100 text-base-content/50">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={() => handleOAuthLogin("google")}
                    variant="outline"
                    size="sm"
                  >
                    Google
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleOAuthLogin("github")}
                    variant="outline"
                    size="sm"
                  >
                    GitHub
                  </Button>
                </div>
              </div>

              {/* Toggle Mode & Forgot Password */}
              <div className="mt-6 text-center space-y-2">
                <Button
                  type="button"
                  onClick={handleToggleMode}
                  variant="link"
                  size="sm"
                >
                  {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                </Button>

                {isLogin && (
                  <div>
                    <Button
                      type="button"
                      onClick={handleShowForgotPassword}
                      variant="link"
                      size="sm"
                    >
                      Forgot your password?
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
