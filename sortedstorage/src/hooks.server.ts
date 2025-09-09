import type { Handle, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';

// Security headers
const securityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	
	// Content Security Policy
	const csp = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"img-src 'self' data: blob: https:",
		"font-src 'self' data: https://fonts.gstatic.com",
		"connect-src 'self' wss: https:",
		"media-src 'self' blob:",
		"object-src 'none'",
		"frame-src 'self'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
		"upgrade-insecure-requests"
	].join('; ');
	
	// Set security headers
	response.headers.set('Content-Security-Policy', csp);
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	
	// HSTS (only in production)
	if (!dev) {
		response.headers.set(
			'Strict-Transport-Security',
			'max-age=31536000; includeSubDomains; preload'
		);
	}
	
	return response;
};

// Authentication middleware
const authentication: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('auth_token');
	
	if (token) {
		try {
			// Dynamic import for server-side only
			if (!dev) {
				const jwt = await import('jsonwebtoken');
				// Verify JWT token
				const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
				event.locals.user = {
					id: decoded.sub,
					email: decoded.email,
					name: decoded.name,
					role: decoded.role
				};
			} else {
				// In development, decode without verification
				const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
				event.locals.user = {
					id: payload.sub,
					email: payload.email,
					name: payload.name,
					role: payload.role
				};
			}
		} catch (err) {
			// Invalid token, clear it
			event.cookies.delete('auth_token', { path: '/' });
		}
	}
	
	// Protected routes
	const protectedRoutes = ['/dashboard', '/settings', '/profile', '/admin'];
	const isProtected = protectedRoutes.some(route => event.url.pathname.startsWith(route));
	
	if (isProtected && !event.locals.user) {
		return new Response(null, {
			status: 303,
			headers: { location: '/login' }
		});
	}
	
	return resolve(event);
};

// Rate limiting
const rateLimiting: Handle = async ({ event, resolve }) => {
	// Skip rate limiting during prerendering/build
	let ip: string;
	try {
		ip = event.getClientAddress();
	} catch {
		// getClientAddress throws during prerendering
		return resolve(event);
	}
	
	// Simple in-memory rate limiter (use Redis in production)
	const key = `${ip}:${event.url.pathname}`;
	
	// Rate limit configuration
	const limits: Record<string, { requests: number; window: number }> = {
		'/api/auth/login': { requests: 5, window: 900000 }, // 5 requests per 15 minutes
		'/api/auth/register': { requests: 3, window: 3600000 }, // 3 requests per hour
		'/api/storage/upload': { requests: 50, window: 3600000 }, // 50 uploads per hour
		'/api': { requests: 100, window: 60000 }, // 100 API requests per minute
		default: { requests: 1000, window: 60000 } // 1000 requests per minute
	};
	
	// Get appropriate limit
	const matchingPath = Object.keys(limits).find(path => event.url.pathname.startsWith(path));
	const limit = matchingPath ? limits[matchingPath] : limits.default;
	
	// Check rate limit (implement proper storage in production)
	if (!dev) {
		// This is a placeholder - use Redis or similar in production
		const requestCount = global.rateLimitStore?.get(key) || 0;
		
		if (requestCount >= limit.requests) {
			return new Response('Too Many Requests', {
				status: 429,
				headers: {
					'Retry-After': String(Math.ceil(limit.window / 1000)),
					'X-RateLimit-Limit': String(limit.requests),
					'X-RateLimit-Remaining': '0',
					'X-RateLimit-Reset': String(Date.now() + limit.window)
				}
			});
		}
		
		// Increment counter
		global.rateLimitStore?.set(key, requestCount + 1);
		setTimeout(() => {
			global.rateLimitStore?.delete(key);
		}, limit.window);
	}
	
	const response = await resolve(event);
	
	// Add rate limit headers
	response.headers.set('X-RateLimit-Limit', String(limit.requests));
	response.headers.set('X-RateLimit-Window', String(limit.window));
	
	return response;
};

// Request logging and monitoring
const monitoring: Handle = async ({ event, resolve }) => {
	const startTime = Date.now();
	const requestId = crypto.randomUUID();
	
	// Add request ID to event
	event.locals.requestId = requestId;
	
	// Log request
	console.log(`[${requestId}] ${event.request.method} ${event.url.pathname}`);
	
	const response = await resolve(event);
	
	// Calculate response time
	const duration = Date.now() - startTime;
	
	// Add monitoring headers
	response.headers.set('X-Request-Id', requestId);
	response.headers.set('X-Response-Time', `${duration}ms`);
	
	// Log response
	console.log(
		`[${requestId}] ${event.request.method} ${event.url.pathname} - ${response.status} (${duration}ms)`
	);
	
	// Send metrics to monitoring service (implement in production)
	if (!dev) {
		// sendMetrics({
		//   path: event.url.pathname,
		//   method: event.request.method,
		//   status: response.status,
		//   duration,
		//   requestId
		// });
	}
	
	return response;
};

// CORS handling
const cors: Handle = async ({ event, resolve }) => {
	// Handle preflight requests
	if (event.request.method === 'OPTIONS') {
		return new Response(null, {
			status: 204,
			headers: {
				'Access-Control-Allow-Origin': event.request.headers.get('origin') || '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
				'Access-Control-Allow-Credentials': 'true',
				'Access-Control-Max-Age': '86400'
			}
		});
	}
	
	const response = await resolve(event);
	
	// Add CORS headers to response
	const origin = event.request.headers.get('origin');
	const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');
	
	if (origin && allowedOrigins.includes(origin)) {
		response.headers.set('Access-Control-Allow-Origin', origin);
		response.headers.set('Access-Control-Allow-Credentials', 'true');
	}
	
	return response;
};

// Audit logging
const auditLogging: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	
	// Log sensitive operations
	const auditableActions = [
		{ pattern: /^\/api\/auth\/login$/, action: 'LOGIN' },
		{ pattern: /^\/api\/auth\/logout$/, action: 'LOGOUT' },
		{ pattern: /^\/api\/storage\/upload$/, action: 'FILE_UPLOAD' },
		{ pattern: /^\/api\/storage\/delete/, action: 'FILE_DELETE' },
		{ pattern: /^\/api\/sharing\//, action: 'SHARE_CREATE' },
		{ pattern: /^\/api\/users\/.*\/admin/, action: 'ADMIN_ACTION' }
	];
	
	const matchedAction = auditableActions.find(a => a.pattern.test(event.url.pathname));
	
	if (matchedAction && response.ok) {
		// Skip audit logging during prerendering
		let ip: string;
		try {
			ip = event.getClientAddress();
		} catch {
			// getClientAddress throws during prerendering
			return response;
		}
		
		const auditLog = {
			timestamp: new Date().toISOString(),
			action: matchedAction.action,
			userId: event.locals.user?.id || 'anonymous',
			ip: ip,
			userAgent: event.request.headers.get('user-agent'),
			path: event.url.pathname,
			method: event.request.method,
			status: response.status,
			requestId: event.locals.requestId
		};
		
		// Send to audit log service (implement in production)
		if (!dev) {
			// sendAuditLog(auditLog);
		}
		
		console.log('[AUDIT]', JSON.stringify(auditLog));
	}
	
	return response;
};

// Error handling
export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	const errorId = crypto.randomUUID();
	
	// Log error details
	console.error(`[${errorId}] Error:`, {
		message: error?.message || message,
		status,
		path: event.url.pathname,
		stack: error?.stack,
		requestId: event.locals.requestId
	});
	
	// Send error to monitoring service (implement in production)
	if (!dev) {
		// sendErrorToSentry({
		//   errorId,
		//   error,
		//   context: {
		//     path: event.url.pathname,
		//     userId: event.locals.user?.id,
		//     requestId: event.locals.requestId
		//   }
		// });
	}
	
	// Return user-friendly error
	return {
		message: dev ? error?.message || message : 'An unexpected error occurred',
		errorId
	};
};

// Initialize rate limit store (replace with Redis in production)
if (!global.rateLimitStore) {
	global.rateLimitStore = new Map();
}

// Combine all hooks
export const handle = sequence(
	cors,
	monitoring,
	securityHeaders,
	authentication,
	rateLimiting,
	auditLogging
);