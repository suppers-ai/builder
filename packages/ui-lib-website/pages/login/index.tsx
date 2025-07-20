import { useEffect, useState } from "preact/hooks";
import { useAsyncOperation, useFormHandler, usePageAuth } from "../../shared/hooks/mod.ts";
import { LoginPage as LoginPageDisplay } from "./components/LoginPage.tsx";

interface LoginPageProps {
  className?: string;
  redirectTo?: string;
  // Optional auth prop for testing/mocking
  auth?: {
    user: any;
    loading?: boolean;
    signIn?: (data: any) => Promise<void>;
    signUp?: (data: any) => Promise<void>;
    signInWithOAuth?: (provider: string) => Promise<void>;
    resetPassword?: (email: string) => Promise<void>;
  };
}

export function LoginPage(
  { className = "", redirectTo = "/my-applications", auth }: LoginPageProps,
) {
  // SSR safety check - return early during server-side rendering
  if (typeof document === "undefined") {
    return (
      <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
          <div class="text-center">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">🚀 App Builder</h1>
            <h2 class="text-xl text-gray-600">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Form state management
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Use page auth hook for authentication handling
  const { user, loading: authLoading, authContext, redirectUrl } = usePageAuth({
    auth,
    redirectTo,
    redirectIfAuthenticated: true,
  });

  // Get auth methods from context
  const { signIn, signUp, signInWithOAuth, resetPassword } = authContext;

  // Auth operations hooks
  const loginOperation = useAsyncOperation();
  const registerOperation = useAsyncOperation();
  const oauthOperation = useAsyncOperation();
  const forgotPasswordOperation = useAsyncOperation();

  // Login form
  const loginForm = useFormHandler({
    fields: {
      email: {
        initialValue: "",
        validation: {
          required: true,
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Please enter a valid email address",
        },
      },
      password: {
        initialValue: "",
        validation: {
          required: true,
          minLength: 6,
        },
      },
    },
    onSubmit: async (data) => {
      await loginOperation.execute(async () => {
        await signIn?.(data);
      });
    },
  });

  // Register form
  const registerForm = useFormHandler({
    fields: {
      email: {
        initialValue: "",
        validation: {
          required: true,
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Please enter a valid email address",
        },
      },
      password: {
        initialValue: "",
        validation: {
          required: true,
          minLength: 6,
        },
      },
      confirmPassword: {
        initialValue: "",
        validation: {
          required: true,
        },
      },
      firstName: {
        initialValue: "",
        validation: { required: true },
      },
      lastName: {
        initialValue: "",
        validation: { required: true },
      },
    },
    onSubmit: async (data) => {
      // Validate password match manually
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      await registerOperation.execute(async () => {
        await signUp?.({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          displayName: `${data.firstName} ${data.lastName}`,
        });
      });
    },
  });

  // Forgot password form
  const forgotPasswordForm = useFormHandler({
    fields: {
      email: {
        initialValue: "",
        validation: {
          required: true,
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Please enter a valid email address",
        },
      },
    },
    onSubmit: async (data) => {
      await forgotPasswordOperation.execute(async () => {
        await resetPassword?.(data.email);
      });
    },
  });

  // Handle redirects
  useEffect(() => {
    if (redirectUrl && typeof redirectUrl === "string") {
      globalThis.location.href = redirectUrl;
    }
  }, [redirectUrl]);

  // Form handlers
  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    registerForm.reset();
    loginOperation.reset();
    registerOperation.reset();
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    await oauthOperation.execute(async () => {
      await signInWithOAuth?.(provider);
    });
  };

  const handleShowForgotPassword = () => {
    setShowForgotPassword(true);
    forgotPasswordForm.reset();
    forgotPasswordOperation.reset();
  };

  const handleHideForgotPassword = () => {
    setShowForgotPassword(false);
  };

  // Prepare form data for display component
  const currentForm = isLogin ? loginForm : registerForm;
  const currentOperation = isLogin ? loginOperation : registerOperation;

  const formData = {
    email: currentForm.formData.email,
    password: currentForm.formData.password,
    confirmPassword: isLogin ? "" : registerForm.formData.confirmPassword,
    firstName: isLogin ? "" : registerForm.formData.firstName,
    lastName: isLogin ? "" : registerForm.formData.lastName,
  };

  // Determine success message
  const getSuccessMessage = (): string | null => {
    if (registerOperation.success) {
      return "Registration successful! Please check your email to verify your account.";
    }
    if (forgotPasswordOperation.success) {
      return "Password reset email sent! Check your inbox.";
    }
    return null;
  };

  return (
    <LoginPageDisplay
      className={className}
      user={user}
      authLoading={authLoading}
      isLogin={isLogin}
      isLoading={currentOperation.loading || oauthOperation.loading}
      showForgotPassword={showForgotPassword}
      error={currentOperation.error || oauthOperation.error}
      success={getSuccessMessage()}
      formData={formData}
      onToggleMode={handleToggleMode}
      onShowForgotPassword={handleShowForgotPassword}
      onHideForgotPassword={handleHideForgotPassword}
      onInputChange={(field, value) => {
        currentForm.updateField(field as keyof typeof currentForm.formData, value);
        if (showForgotPassword) {
          forgotPasswordForm.updateField("email", value);
        }
      }}
      onSubmit={showForgotPassword ? forgotPasswordForm.handleSubmit : currentForm.handleSubmit}
      onOAuthLogin={handleOAuthLogin}
      onForgotPassword={forgotPasswordForm.handleSubmit}
    />
  );
}

export default LoginPage;
