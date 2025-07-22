/**
 * Authentication Constants
 */

export const AUTH_PROVIDERS = {
  GOOGLE: 'google',
  GITHUB: 'github',
  DISCORD: 'discord',
} as const;

export const AUTH_SCOPES = {
  GOOGLE: 'openid email profile',
  GITHUB: 'user:email',
  DISCORD: 'identify email',
} as const;