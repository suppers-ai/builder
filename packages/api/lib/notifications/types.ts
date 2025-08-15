// Base notification provider types
export * from "../../../shared/types/notifications.ts";

export interface ProviderValidationError {
  field: string;
  message: string;
}

export interface TemplateContext {
  sender_name: string;
  object_type: string;
  object_name: string;
  message?: string;
  share_url: string;
  expiry_date: string;
}

export interface EmailDeliveryOptions {
  retries?: number;
  timeout?: number;
  priority?: 'low' | 'normal' | 'high';
}

export interface RateLimitInfo {
  userId: string;
  action: 'email_share';
  windowMs: number;
  maxRequests: number;
}