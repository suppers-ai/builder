// Common types used across the SDK

export interface SolobaseConfig {
  url: string;
  apiKey?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'manager';
  confirmed: boolean;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export interface StorageObject {
  id: string;
  bucket_id: string;
  name: string;
  size: number;
  content_type: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  url?: string;
}

export interface Bucket {
  id: string;
  name: string;
  public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  schema?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  order?: string;
  filter?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, any>;
  public?: boolean;
  onProgress?: (progress: number) => void;
}