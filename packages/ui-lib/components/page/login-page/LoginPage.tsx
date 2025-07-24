import { BaseComponentProps } from "../../types.ts";
import { Loading } from "../../feedback/loading/Loading.tsx";
import { Input } from "../../input/input/Input.tsx";
import { Button } from "../../action/button/Button.tsx";
import { Alert } from "../../feedback/alert/Alert.tsx";
import { Card } from "../../display/card/Card.tsx";
import { Divider } from "../../layout/divider/Divider.tsx";

// Import AuthUser type for typed components
export type { AuthUser } from "@suppers/auth-client";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface LoginPageProps<TUser = any> extends BaseComponentProps {
  user: TUser | null;
  authLoading: boolean;
  isLogin: boolean;
  isLoading: boolean;
  showForgotPassword: boolean;
  error: string | null;
  success: string | null;
  formData: FormData;
  onToggleMode: () => void;
  onShowForgotPassword: () => void;
  onHideForgotPassword: () => void;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: Event) => void;
  onOAuthLogin?: (provider: "google" | "github") => void;
  onForgotPassword: (e: Event) => void;
  // Additional props for customization
  appName?: string;
  appIcon?: string;
  showOAuth?: boolean;
  oauthProviders?: ("google" | "github")[];
  showBackToHome?: boolean;
  homeUrl?: string;
  redirectUri?: string;
}

export function LoginPage<TUser = any>({
  class: className = "",
  user,
  authLoading,
  isLogin,
  isLoading,
  showForgotPassword,
  error,
  success,
  formData,
  onToggleMode,
  onShowForgotPassword,
  onHideForgotPassword,
  onInputChange,
  onSubmit,
  onOAuthLogin,
  onForgotPassword,
  appName = "App Builder",
  appIcon = "🚀",
  showOAuth = true,
  oauthProviders = ["google", "github"],
  showBackToHome = true,
  homeUrl = "/",
  redirectUri,
  id,
  ...props
}: LoginPageProps<TUser>) {
  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (user) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="text-green-500 text-6xl mb-4">✅</div>
          <h1 class="text-2xl font-bold mb-4">Already Logged In</h1>
          <p class="text-gray-600 mb-4">Redirecting you...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      class={`min-h-screen bg-base-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${className}`}
      id={id}
      {...props}
    >
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="text-center">
          <h1 class="text-3xl font-bold mb-2">
            {appIcon} {appName}
          </h1>
          <h2 class="text-xl text-base-content/70">
            {showForgotPassword
              ? "Reset your password"
              : isLogin
              ? "Sign in to your account"
              : "Create your account"}
          </h2>
        </div>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card class="shadow-lg">
          {/* Error/Success Messages */}
          {error && (
            <Alert type="error" class="mb-4">
              {error}
            </Alert>
          )}

          {success && (
            <Alert type="success" class="mb-4">
              {success}
            </Alert>
          )}

          {/* Forgot Password Form */}
          {showForgotPassword
            ? (
              <form onSubmit={onForgotPassword} class="space-y-6">
                <div>
                  <label htmlFor="email" class="label">
                    <span class="label-text">Email address</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onInput={(e) => onInputChange("email", (e.target as HTMLInputElement).value)}
                    placeholder="Enter your email"
                    bordered
                    class="w-full"
                  />
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    color="primary"
                    class="w-full"
                  >
                    {isLoading ? <Loading size="sm" /> : "Send Reset Email"}
                  </Button>
                </div>

                <div class="text-center">
                  <Button
                    type="button"
                    onClick={onHideForgotPassword}
                    variant="link"
                    size="sm"
                    color="primary"
                  >
                    ← Back to login
                  </Button>
                </div>
              </form>
            )
            : (
              <>
                {/* OAuth Buttons */}
                {showOAuth && onOAuthLogin && (
                  <div class="space-y-3">
                    {oauthProviders.includes("google") && (
                      <Button
                        onClick={() => onOAuthLogin("google")}
                        disabled={isLoading}
                        variant="outline"
                        class="w-full"
                      >
                        <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </Button>
                    )}

                    {oauthProviders.includes("github") && (
                      <Button
                        onClick={() => onOAuthLogin("github")}
                        disabled={isLoading}
                        variant="outline"
                        class="w-full"
                      >
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        Continue with GitHub
                      </Button>
                    )}
                  </div>
                )}

                {showOAuth && onOAuthLogin && (
                  <div class="mt-6">
                    <Divider>Or continue with email</Divider>
                  </div>
                )}

                {/* Email/Password Form */}
                <form onSubmit={onSubmit} class="mt-6 space-y-6">
                  {/* Registration Fields */}
                  {!isLogin && (
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="firstName" class="label">
                          <span class="label-text">First name</span>
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          value={formData.firstName}
                          onInput={(e) =>
                            onInputChange("firstName", (e.target as HTMLInputElement).value)}
                          bordered
                          class="w-full"
                        />
                      </div>

                      <div>
                        <label htmlFor="lastName" class="label">
                          <span class="label-text">Last name</span>
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          value={formData.lastName}
                          onInput={(e) =>
                            onInputChange("lastName", (e.target as HTMLInputElement).value)}
                          bordered
                          class="w-full"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" class="label">
                      <span class="label-text">Email address</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onInput={(e) => onInputChange("email", (e.target as HTMLInputElement).value)}
                      bordered
                      class="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" class="label">
                      <span class="label-text">Password</span>
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      required
                      value={formData.password}
                      onInput={(e) =>
                        onInputChange("password", (e.target as HTMLInputElement).value)}
                      bordered
                      class="w-full"
                    />
                  </div>

                  {/* Confirm Password for Registration */}
                  {!isLogin && (
                    <div>
                      <label htmlFor="confirmPassword" class="label">
                        <span class="label-text">Confirm password</span>
                      </label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onInput={(e) =>
                          onInputChange(
                            "confirmPassword",
                            (e.target as HTMLInputElement).value,
                          )}
                        bordered
                        class="w-full"
                      />
                    </div>
                  )}

                  {/* Forgot Password Link */}
                  {isLogin && (
                    <div class="flex items-center justify-end">
                      <Button
                        type="button"
                        onClick={onShowForgotPassword}
                        variant="link"
                        size="sm"
                        color="primary"
                      >
                        Forgot your password?
                      </Button>
                    </div>
                  )}

                  <div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      color="primary"
                      class="w-full"
                    >
                      {isLoading ? <Loading size="sm" /> : isLogin ? "Sign in" : "Create account"}
                    </Button>
                  </div>

                  {/* Toggle Login/Register */}
                  <div class="text-center">
                    <Button
                      type="button"
                      onClick={onToggleMode}
                      variant="link"
                      size="sm"
                      color="primary"
                    >
                      {isLogin
                        ? "Don't have an account? Sign up"
                        : "Already have an account? Sign in"}
                    </Button>
                  </div>
                </form>
              </>
            )}

          {/* Back to Home */}
          {showBackToHome && (
            <div class="mt-6 text-center">
              <Button
                as="a"
                href={homeUrl}
                variant="link"
                size="sm"
                class="text-base-content/60"
              >
                ← Back to Published Applications
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
