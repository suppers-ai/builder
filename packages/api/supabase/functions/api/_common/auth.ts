/**
 * Authentication utilities for API handlers
 */

import { UnauthorizedError, ForbiddenError } from './errors.ts';
import { config } from './config.ts';
import { getSupabaseClient } from './supabase.ts';

export interface JWTPayload {
  sub: string; // User ID
  email?: string;
  role?: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
    role?: string;
    [key: string]: unknown;
  };
  user_metadata?: {
    [key: string]: unknown;
  };
  aud?: string;
  exp?: number;
  iat?: number;
}

export interface AuthContext {
  user: {
    id: string;
    email?: string;
  };
  token: string;
  isAuthenticated: boolean;
}

/**
 * Extract and verify JWT token from request
 */
export async function extractToken(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

/**
 * Decode JWT token (without verification for now)
 * In production, you should verify the signature
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Verify JWT token and extract payload
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  const payload = decodeJWT(token);
  
  if (!payload) {
    throw new UnauthorizedError('Invalid token format');
  }

  // Check expiration
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new UnauthorizedError('Token expired');
  }

  return payload;
}

/**
 * Get authentication context from request
 */
export async function getAuthContext(request: Request): Promise<AuthContext | null> {
  const token = await extractToken(request);
  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    
    // Ensure we have a valid user ID
    if (!payload.sub) {
      console.error('JWT payload missing sub field:', payload);
      return null;
    }
    
    return {
      user: {
        id: payload.sub,
        email: payload.email,
      },
      token,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Check if user is admin by checking the users table
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    // Add validation to prevent invalid UUID error
    if (!userId || userId === 'undefined' || userId === '') {
      console.error('Error checking admin status: Invalid or missing user ID:', userId);
      return false;
    }
    
    const supabase = getSupabaseClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error || !user) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return user.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Require authentication middleware
 */
export async function requireAuth(request: Request): Promise<AuthContext> {
  const context = await getAuthContext(request);
  
  if (!context || !context.isAuthenticated) {
    throw new UnauthorizedError('Authentication required');
  }

  return context;
}

/**
 * Require admin role middleware
 */
export async function requireAdmin(request: Request): Promise<AuthContext> {
  const context = await requireAuth(request);
  
  const adminStatus = await isAdmin(context.user.id);
  if (!adminStatus) {
    throw new ForbiddenError('Admin access required');
  }

  return context;
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  // Check if user is admin first
  const adminStatus = await isAdmin(userId);
  if (adminStatus) return true;
  
  // In the future, you can extend this to check specific permissions
  // from a permissions table or user metadata
  return false;
}

/**
 * Generate a simple API key for service-to-service communication
 */
export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate API key
 */
export function validateApiKey(apiKey: string): boolean {
  // In a real implementation, check against stored API keys
  // For now, just check format
  return apiKey.length === 32 && /^[A-Za-z0-9]+$/.test(apiKey);
}

/**
 * Extract user ID from various sources
 */
export function extractUserId(request: Request): string | null {
  // Try from auth context first
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const payload = decodeJWT(token);
    if (payload?.sub) return payload.sub;
  }

  // Try from query params
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id');
  if (userId) return userId;

  // Try from custom header
  const customUserId = request.headers.get('x-user-id');
  if (customUserId) return customUserId;

  return null;
}