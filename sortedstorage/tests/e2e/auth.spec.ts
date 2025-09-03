import { test, expect, type Page } from '@playwright/test';

// Test data
const TEST_USER = {
	email: 'test@example.com',
	password: 'TestPassword123!',
	name: 'Test User'
};

const NEW_USER = {
	email: `user${Date.now()}@example.com`,
	password: 'SecurePass123!',
	name: 'New Test User'
};

test.describe('Authentication', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should display login page for unauthenticated users', async ({ page }) => {
		await expect(page).toHaveURL('/login');
		await expect(page.locator('h1')).toContainText('Sign In');
		await expect(page.locator('input[type="email"]')).toBeVisible();
		await expect(page.locator('input[type="password"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toContainText('Sign In');
	});

	test('should show validation errors for invalid inputs', async ({ page }) => {
		// Try to submit empty form
		await page.click('button[type="submit"]');
		await expect(page.locator('.error-message')).toContainText('Email is required');

		// Invalid email format
		await page.fill('input[type="email"]', 'invalid-email');
		await page.click('button[type="submit"]');
		await expect(page.locator('.error-message')).toContainText('Invalid email format');

		// Short password
		await page.fill('input[type="email"]', TEST_USER.email);
		await page.fill('input[type="password"]', '123');
		await page.click('button[type="submit"]');
		await expect(page.locator('.error-message')).toContainText('Password must be at least');
	});

	test('should successfully register a new user', async ({ page }) => {
		// Navigate to registration
		await page.click('text=Sign Up');
		await expect(page).toHaveURL('/register');

		// Fill registration form
		await page.fill('input[name="name"]', NEW_USER.name);
		await page.fill('input[name="email"]', NEW_USER.email);
		await page.fill('input[name="password"]', NEW_USER.password);
		await page.fill('input[name="confirmPassword"]', NEW_USER.password);
		
		// Accept terms
		await page.check('input[name="acceptTerms"]');

		// Submit
		await page.click('button[type="submit"]');

		// Should redirect to dashboard or email verification
		await expect(page).toHaveURL(/\/(dashboard|verify-email)/);
	});

	test('should successfully login with valid credentials', async ({ page }) => {
		await page.fill('input[type="email"]', TEST_USER.email);
		await page.fill('input[type="password"]', TEST_USER.password);
		await page.click('button[type="submit"]');

		// Should redirect to dashboard
		await expect(page).toHaveURL('/dashboard');
		await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
	});

	test('should handle incorrect credentials', async ({ page }) => {
		await page.fill('input[type="email"]', TEST_USER.email);
		await page.fill('input[type="password"]', 'WrongPassword123!');
		await page.click('button[type="submit"]');

		await expect(page.locator('.error-message')).toContainText('Invalid email or password');
		await expect(page).toHaveURL('/login');
	});

	test('should remember user with "Remember me" option', async ({ page, context }) => {
		await page.fill('input[type="email"]', TEST_USER.email);
		await page.fill('input[type="password"]', TEST_USER.password);
		await page.check('input[name="rememberMe"]');
		await page.click('button[type="submit"]');

		// Check that auth cookie is set with long expiry
		const cookies = await context.cookies();
		const authCookie = cookies.find(c => c.name === 'auth_token');
		expect(authCookie).toBeDefined();
		expect(authCookie?.expires).toBeGreaterThan(Date.now() / 1000 + 86400 * 7); // > 7 days
	});

	test('should successfully logout', async ({ page }) => {
		// First login
		await loginUser(page, TEST_USER);

		// Click user menu
		await page.click('[data-testid="user-menu"]');
		
		// Click logout
		await page.click('text=Sign Out');

		// Should redirect to login
		await expect(page).toHaveURL('/login');
		await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
	});

	test('should handle password reset flow', async ({ page }) => {
		// Click forgot password
		await page.click('text=Forgot password?');
		await expect(page).toHaveURL('/forgot-password');

		// Enter email
		await page.fill('input[type="email"]', TEST_USER.email);
		await page.click('button[type="submit"]');

		// Should show success message
		await expect(page.locator('.success-message')).toContainText('Password reset email sent');
	});

	test('should handle OAuth login', async ({ page }) => {
		// Check OAuth buttons are visible
		await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();
		await expect(page.locator('button:has-text("Continue with GitHub")')).toBeVisible();

		// Click Google OAuth (will redirect to Google)
		const [popup] = await Promise.all([
			page.waitForEvent('popup'),
			page.click('button:has-text("Continue with Google")')
		]);

		// Check popup URL is Google OAuth
		expect(popup.url()).toContain('accounts.google.com');
		await popup.close();
	});

	test('should enforce session timeout', async ({ page }) => {
		await loginUser(page, TEST_USER);

		// Simulate session expiry by clearing cookies
		await page.context().clearCookies();

		// Try to access protected route
		await page.goto('/dashboard');

		// Should redirect to login
		await expect(page).toHaveURL('/login');
		await expect(page.locator('.info-message')).toContainText('Session expired');
	});

	test('should handle two-factor authentication', async ({ page }) => {
		// Login with 2FA enabled account
		await page.fill('input[type="email"]', '2fa@example.com');
		await page.fill('input[type="password"]', 'SecurePass123!');
		await page.click('button[type="submit"]');

		// Should show 2FA input
		await expect(page).toHaveURL('/login/2fa');
		await expect(page.locator('input[name="code"]')).toBeVisible();

		// Enter 2FA code
		await page.fill('input[name="code"]', '123456');
		await page.click('button[type="submit"]');

		// Should redirect to dashboard
		await expect(page).toHaveURL('/dashboard');
	});

	test('should update user profile', async ({ page }) => {
		await loginUser(page, TEST_USER);

		// Navigate to profile
		await page.click('[data-testid="user-menu"]');
		await page.click('text=Profile');
		await expect(page).toHaveURL('/profile');

		// Update name
		await page.fill('input[name="name"]', 'Updated Name');
		
		// Update bio
		await page.fill('textarea[name="bio"]', 'This is my updated bio');

		// Save changes
		await page.click('button:has-text("Save Changes")');

		// Check success message
		await expect(page.locator('.success-message')).toContainText('Profile updated');

		// Verify changes persisted
		await page.reload();
		await expect(page.locator('input[name="name"]')).toHaveValue('Updated Name');
		await expect(page.locator('textarea[name="bio"]')).toHaveValue('This is my updated bio');
	});

	test('should change password', async ({ page }) => {
		await loginUser(page, TEST_USER);

		// Navigate to security settings
		await page.goto('/settings/security');

		// Fill password change form
		await page.fill('input[name="currentPassword"]', TEST_USER.password);
		await page.fill('input[name="newPassword"]', 'NewSecurePass123!');
		await page.fill('input[name="confirmPassword"]', 'NewSecurePass123!');

		// Submit
		await page.click('button:has-text("Change Password")');

		// Check success message
		await expect(page.locator('.success-message')).toContainText('Password changed successfully');

		// Logout and login with new password
		await page.click('[data-testid="user-menu"]');
		await page.click('text=Sign Out');

		await page.fill('input[type="email"]', TEST_USER.email);
		await page.fill('input[type="password"]', 'NewSecurePass123!');
		await page.click('button[type="submit"]');

		await expect(page).toHaveURL('/dashboard');
	});
});

// Helper function to login a user
async function loginUser(page: Page, user: typeof TEST_USER) {
	await page.goto('/login');
	await page.fill('input[type="email"]', user.email);
	await page.fill('input[type="password"]', user.password);
	await page.click('button[type="submit"]');
	await expect(page).toHaveURL('/dashboard');
}