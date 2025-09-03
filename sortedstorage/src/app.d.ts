/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
			errorId?: string;
			code?: string;
		}

		interface Locals {
			user?: {
				id: string;
				email: string;
				name: string;
				role: string;
			};
			requestId?: string;
		}

		interface PageData {
			user?: {
				id: string;
				email: string;
				name: string;
				avatar?: string;
				role: string;
			};
		}

		interface Platform {
			// Add platform-specific properties if needed
		}
	}

	// Rate limit store type for hooks.server.ts
	var rateLimitStore: Map<string, number> | undefined;

	// Environment variables
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production' | 'test';
			JWT_SECRET: string;
			DATABASE_URL: string;
			CORS_ORIGINS: string;
			SMTP_HOST?: string;
			SMTP_PORT?: string;
			SMTP_USER?: string;
			SMTP_PASSWORD?: string;
			AWS_ACCESS_KEY_ID?: string;
			AWS_SECRET_ACCESS_KEY?: string;
			S3_BUCKET?: string;
			S3_REGION?: string;
		}
	}
}

// Ensure this file is treated as a module
export {};

// Import types
import type { User } from '$lib/types/auth';
import type { FileItem, FolderItem } from '$lib/types/storage';