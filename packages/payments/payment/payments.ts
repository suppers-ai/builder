/**
 * Payment-related types and interfaces
 */

export interface PaymentRequest {
  userId: string;
  sessionToken: string;
  productId: string;
}

export interface ManageRequest {
  userId: string;
  sessionToken: string;
}

export interface UserVerificationResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  error?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  error?: string;
}

export interface ManageResponse {
  success: boolean;
  manageUrl?: string;
  error?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: any;
}
