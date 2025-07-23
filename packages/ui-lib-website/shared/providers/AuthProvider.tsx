import { createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { AuthHelpers } from "../lib/auth-helpers.ts";
import { ApiHelpers } from "../lib/api-helpers.ts";
import type { SignInData, SignUpData } from "../lib/auth-helpers.ts";
import type { AuthState, AuthUser } from "../../../shared/types/auth.ts";
import type { User as DBUser } from "../lib/api-helpers.ts";
import type { Session, User } from "@supabase/supabase-js";
import { TypeMappers } from "../../../shared/utils/type-mappers.ts";

interface AuthContextType extends AuthState {
  dbUser: DBUser | null;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: "google" | "github" | "discord" | "twitter") => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateUser: (
    data: {
      firstName?: string;
      middleNames?: string;
      lastName?: string;
      displayName?: string;
      avatarUrl?: string;
    },
  ) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ComponentChildren;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentSession = await AuthHelpers.getCurrentSession();
        const currentUser = await AuthHelpers.getCurrentUser();

        setSession(currentSession);

        if (currentUser) {
          const userData = await ApiHelpers.getUser(currentUser.id);
          const authUser = TypeMappers.supabaseUserToAuthUser(currentUser, userData || undefined);
          setUser(authUser);
          setDbUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = AuthHelpers.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (session?.user) {
        // Get or create user data
        let userData = await ApiHelpers.getUser(session.user.id);
        if (!userData && session.user.email) {
          userData = await ApiHelpers.upsertUser({
            id: session.user.id,
            email: session.user.email,
            first_name: session.user.user_metadata?.first_name || null,
            middle_names: session.user.user_metadata?.middle_names || null,
            last_name: session.user.user_metadata?.last_name || null,
            display_name: session.user.user_metadata?.display_name || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
          });
        }

        // Convert Supabase user to our AuthUser format
        const authUser = TypeMappers.supabaseUserToAuthUser(session.user, userData || undefined);
        setUser(authUser);
        setDbUser(userData);
      } else {
        setUser(null);
        setDbUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (data: SignUpData) => {
    setLoading(true);
    try {
      await AuthHelpers.signUp(data);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data: SignInData) => {
    setLoading(true);
    try {
      await AuthHelpers.signIn(data);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await AuthHelpers.signOut();
    } finally {
      setLoading(false);
    }
  };

  const signInWithOAuth = async (provider: "google" | "github" | "discord" | "twitter") => {
    setLoading(true);
    try {
      await AuthHelpers.signInWithOAuth(provider);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await AuthHelpers.resetPassword({ email });
  };

  const updatePassword = async (newPassword: string) => {
    await AuthHelpers.updatePassword(newPassword);
  };

  const updateUser = async (
    data: {
      firstName?: string;
      middleNames?: string;
      lastName?: string;
      displayName?: string;
      avatarUrl?: string;
    },
  ) => {
    if (!user) throw new Error("No user logged in");

    await AuthHelpers.updateUser(data);

    // Update local database user
    if (dbUser) {
      const updatedUser = await ApiHelpers.updateUser(user.id, {
        firstName: data.firstName,
        middleNames: data.middleNames,
        lastName: data.lastName,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
      });
      setDbUser(updatedUser);
    }
  };

  const refreshUser = async () => {
    if (!user) return;

    const userData = await ApiHelpers.getUser(user.id);
    setDbUser(userData);
  };

  const value: AuthContextType = {
    user,
    session,
    dbUser,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithOAuth,
    resetPassword,
    updatePassword,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  // Handle SSR case where context might not be available
  if (typeof window === "undefined") {
    // Return a default state for SSR
    return {
      user: null,
      session: null,
      dbUser: null,
      loading: true,
      signUp: async () => {},
      signIn: async () => {},
      signOut: async () => {},
      signInWithOAuth: async () => {},
      resetPassword: async () => {},
      updatePassword: async () => {},
      updateUser: async () => {},
      refreshUser: async () => {},
    };
  }

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
