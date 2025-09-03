import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
	// Get the authorization header
	const authHeader = request.headers.get('authorization');
	
	// Mock token validation
	if (authHeader && authHeader.startsWith('Bearer mock-token-')) {
		return json({
			id: '1',
			email: 'admin@example.com',
			name: 'Admin User',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		});
	}

	// Return error for invalid or missing token
	return json(
		{ error: 'Unauthorized' },
		{ status: 401 }
	);
};