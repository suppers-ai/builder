/**
 * Environment configuration and validation
 */

import { z } from 'zod';
import { dev } from '$app/environment';
import { PUBLIC_VITE_API_URL, PUBLIC_VITE_WS_URL, PUBLIC_VITE_APP_URL } from '$env/static/public';

// Environment variable schema
const envSchema = z.object({
	// Public variables (available to client)
	PUBLIC_VITE_API_URL: z.string().url().default('http://localhost:8090'),
	PUBLIC_VITE_WS_URL: z.string().url().default('ws://localhost:8090'),
	PUBLIC_VITE_APP_URL: z.string().url().default('http://localhost:5173'),
	PUBLIC_VITE_MAX_FILE_SIZE: z.string().transform(Number).default('104857600'), // 100MB
	PUBLIC_VITE_ENABLE_OAUTH: z.string().transform(v => v === 'true').default('false'),
	PUBLIC_VITE_ENABLE_PAYMENTS: z.string().transform(v => v === 'true').default('false'),
	PUBLIC_VITE_ENABLE_ANALYTICS: z.string().transform(v => v === 'true').default('false'),
	PUBLIC_VITE_ENABLE_PWA: z.string().transform(v => v === 'true').default('true'),
	
	// Server-only variables (in production these come from process.env)
	JWT_SECRET: z.string().optional(),
	DATABASE_URL: z.string().optional(),
	CORS_ORIGINS: z.string().optional(),
	SMTP_HOST: z.string().optional(),
	SMTP_PORT: z.string().transform(Number).optional(),
	SMTP_USER: z.string().optional(),
	SMTP_PASSWORD: z.string().optional(),
	AWS_ACCESS_KEY_ID: z.string().optional(),
	AWS_SECRET_ACCESS_KEY: z.string().optional(),
	S3_BUCKET: z.string().optional(),
	S3_REGION: z.string().optional(),
	REDIS_URL: z.string().optional(),
	SENTRY_DSN: z.string().optional()
});

// Parse and validate environment variables
function validateEnv() {
	try {
		const env = {
			PUBLIC_VITE_API_URL,
			PUBLIC_VITE_WS_URL,
			PUBLIC_VITE_APP_URL,
			PUBLIC_VITE_MAX_FILE_SIZE: import.meta.env.VITE_MAX_FILE_SIZE,
			PUBLIC_VITE_ENABLE_OAUTH: import.meta.env.VITE_ENABLE_OAUTH,
			PUBLIC_VITE_ENABLE_PAYMENTS: import.meta.env.VITE_ENABLE_PAYMENTS,
			PUBLIC_VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
			PUBLIC_VITE_ENABLE_PWA: import.meta.env.VITE_ENABLE_PWA,
			// Server variables would come from process.env in production
		};
		
		return envSchema.parse(env);
	} catch (error) {
		if (dev) {
			console.error('Environment validation failed:', error);
			// Use defaults in development
			return envSchema.parse({});
		}
		throw new Error('Invalid environment configuration');
	}
}

// Validated environment configuration
export const env = validateEnv();

// Convenience exports
export const config = {
	// API Configuration
	apiUrl: env.PUBLIC_VITE_API_URL,
	wsUrl: env.PUBLIC_VITE_WS_URL,
	appUrl: env.PUBLIC_VITE_APP_URL,
	
	// Features
	features: {
		oauth: env.PUBLIC_VITE_ENABLE_OAUTH,
		payments: env.PUBLIC_VITE_ENABLE_PAYMENTS,
		analytics: env.PUBLIC_VITE_ENABLE_ANALYTICS,
		pwa: env.PUBLIC_VITE_ENABLE_PWA
	},
	
	// Limits
	limits: {
		maxFileSize: env.PUBLIC_VITE_MAX_FILE_SIZE,
		maxUploads: 10,
		maxShares: 100,
		maxStoragePerUser: 10 * 1024 * 1024 * 1024 // 10GB
	},
	
	// Development
	isDev: dev,
	isProduction: !dev,
	
	// Security
	security: {
		jwtExpiry: 86400, // 24 hours
		refreshTokenExpiry: 604800, // 7 days
		sessionTimeout: 3600, // 1 hour
		maxLoginAttempts: 5,
		lockoutDuration: 900 // 15 minutes
	}
};

// Type exports
export type Config = typeof config;
export type Features = typeof config.features;