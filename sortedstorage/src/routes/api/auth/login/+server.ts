import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { email, password } = body;

	// Mock authentication - accept admin@example.com / admin123
	if (email === 'admin@example.com' && password === 'admin123') {
		return json({
			user: {
				id: '1',
				email: 'admin@example.com',
				name: 'Admin User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			},
			token: `mock-token-${Date.now()}`
		});
	}

	// Return error for invalid credentials
	return json(
		{ error: 'Invalid email or password' },
		{ status: 401 }
	);
};