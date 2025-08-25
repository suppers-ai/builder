import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AuthEventCallback,
  AuthEventType,
  AuthSession,
  UpdateUserData,
} from "@suppers/shared/types";

/**
 * Authentication data types for DirectAuthClient
 */

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
}

// Re-export UpdateUserData from shared types for convenience
export type { UpdateUserData } from "@suppers/shared/types";

export interface ResetPasswordData {
  email: string;
}

/**
 * Internal manager interfaces and dependency types
 */

export interface ManagerDependencies {
  supabase: SupabaseClient;
  storageKey: string;
  eventManager: EventManagerInterface;
}

export interface BaseManager {
  initialize?(dependencies: ManagerDependencies): void;
  destroy?(): void;
}

/**
 * Session management types
 */

export interface SessionStatus {
  isAuthenticated: boolean;
  userId?: string;
}

export interface QuickAuthResult {
  isAuthenticated: boolean;
  userId?: string;
  error?: string;
}

/**
 * Storage operation types
 */

export interface StorageUploadResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Authentication method result types
 */

export interface AuthMethodResult {
  error?: string;
}

/**
 * File operation types
 */

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  url?: string;
}

export interface FileListResult {
  success: boolean;
  files?: FileInfo[];
  error?: string;
}

/**
 * Event management types
 */

export interface EventManagerInterface {
  addEventListener(event: AuthEventType, callback: AuthEventCallback): void;
  removeEventListener(event: AuthEventType, callback: AuthEventCallback): void;
  emitEvent(event: AuthEventType, data?: any): void;
  destroy(): void;
}

/**
 * Manager interface definitions
 */

export interface SessionManagerInterface extends BaseManager {
  getSession(): Promise<AuthSession | null>;
  getSessionStatus(): Promise<SessionStatus>;
  quickAuthCheck(): Promise<QuickAuthResult>;
  hasExistingSession(): Promise<boolean>;
  isAuthenticated(): boolean;
  getAccessToken(): Promise<string | null>;
  getUserId(): string | null;
  saveUserIdToStorage(userId: string): void;
  getUserIdFromStorage(): string | null;
  clearUserIdFromStorage(): void;
  emitLoginEvent(): Promise<void>;
  emitLogoutEvent(): void;
  handleSuccessfulAuth(userId: string): Promise<void>;
  handleSignOut(): void;
}

export interface AuthMethodsInterface extends BaseManager {
  signIn(data: SignInData): Promise<AuthMethodResult>;
  signUp(data: SignUpData): Promise<AuthMethodResult>;
  signOut(): Promise<void>;
  resetPassword(data: ResetPasswordData): Promise<AuthMethodResult>;
  signInWithOAuth(provider: string, redirectTo?: string): Promise<AuthMethodResult>;
  setSessionManager(sessionManager: SessionManagerInterface): void;
}

export interface UserManagerInterface extends BaseManager {
  getUser(): Promise<any | null>;
  updateUser(data: UpdateUserData): Promise<AuthMethodResult>;
  ensureUserProfile(supabaseUser: any): Promise<void>;
  createUserProfileIfNeeded(): Promise<boolean>;
}

export interface StorageManagerInterface extends BaseManager {
  uploadFile(
    applicationSlug: string,
    file: File,
    filePath?: string
  ): Promise<StorageUploadResult>;
  uploadContent(
    applicationSlug: string,
    filePath: string,
    content: string | ArrayBuffer,
    contentType?: string
  ): Promise<StorageUploadResult>;
  downloadFile(applicationSlug: string, filePath: string): Promise<StorageUploadResult>;
  listFiles(applicationSlug: string, path?: string): Promise<FileListResult>;
  getFileInfo(applicationSlug: string, filePath: string): Promise<StorageUploadResult>;
  deleteFile(applicationSlug: string, filePath: string): Promise<StorageUploadResult>;
}

/**
 * DirectAuthClient configuration
 */

export interface DirectAuthClientConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  storageKey?: string;
}

/**
 * API request options
 */

export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
}