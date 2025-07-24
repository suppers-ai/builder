import { BaseComponentProps } from "../../types.ts";
import { Loading } from "../../feedback/loading/Loading.tsx";
import { Input } from "../../input/input/Input.tsx";
import { Button } from "../../action/button/Button.tsx";
import { Alert } from "../../feedback/alert/Alert.tsx";
import { Card } from "../../display/card/Card.tsx";
import { Divider } from "../../layout/divider/Divider.tsx";
// TODO: SSOClientLogin component was removed - need to implement or restore
// import { SSOClientLogin } from "../../../shared/components/SSOClientLogin.tsx";
import type { AuthUser } from "@suppers/auth-client";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface AuthClientLoginPageProps extends BaseComponentProps {
  user: AuthUser | null;
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

export function AuthClientLoginPage({
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
}: AuthClientLoginPageProps) {
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

          {/* OAuth Buttons */}
          {showOAuth && !showForgotPassword && (
            <div class="mb-6">
              {/* TODO: Restore SSOClientLogin component */}
              {/* <SSOClientLogin
                providers={oauthProviders}
                redirectUri={redirectUri}
                onSuccess={() => {}} */}
                onError={(error) => console.error("OAuth error:", error)} */}
              {/* </SSOClientLogin> */}
            </div>
          )}

          {showOAuth && !showForgotPassword && (
            <div class="mb-6">
              <Divider>Or continue with email</Divider>
            </div>
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
                {/* Email/Password Form */}
                <form onSubmit={onSubmit} class="space-y-6">
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
                ← Back to Home
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default AuthClientLoginPage;
