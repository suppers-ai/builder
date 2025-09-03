import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { email, password, name } = body;

	// Mock registration - for demo purposes, just return success
	// In production, this would create a new user in the database
	return json({
		user: {
			id: `user-${Date.now()}`,
			email,
			name: name || email.split('@')[0],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		token: `mock-token-${Date.now()}`
	});
};