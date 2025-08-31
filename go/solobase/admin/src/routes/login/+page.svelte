<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-svelte';
	
	let email = '';
	let password = '';
	let loading = false;
	let error = '';
	let showPassword = false;
	
	async function handleLogin() {
		loading = true;
		error = '';
		
		const success = await auth.login(email, password);
		
		if (success) {
			goto('/');
		} else {
			const authState = get(auth);
			error = authState.error || 'Invalid email or password';
		}
		
		loading = false;
	}
	
	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}
</script>

<div class="login-page">
	<div class="login-container">
		<!-- Logo Section -->
		<div class="login-logo">
			<img src="/logo_long.png" alt="Solobase" class="logo-image" />
			<p class="login-subtitle">Welcome back! Please login to your account.</p>
		</div>
		
		<!-- Error Message -->
		{#if error}
			<div class="login-error">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
				</svg>
				{error}
			</div>
		{/if}
		
		<!-- Login Form -->
		<form on:submit|preventDefault={handleLogin} class="login-form">
			<div class="form-group">
				<label for="email" class="form-label">
					<Mail size={16} />
					Email Address
				</label>
				<input
					id="email"
					type="email"
					class="form-input"
					bind:value={email}
					placeholder="admin@example.com"
					required
					disabled={loading}
					autocomplete="email"
				/>
			</div>
			
			<div class="form-group">
				<label for="password" class="form-label">
					<Lock size={16} />
					Password
				</label>
				<div class="password-input-container">
					{#if showPassword}
						<input
							id="password"
							type="text"
							class="form-input with-icon"
							bind:value={password}
							placeholder="Enter your password"
							required
							disabled={loading}
							autocomplete="current-password"
						/>
					{:else}
						<input
							id="password"
							type="password"
							class="form-input with-icon"
							bind:value={password}
							placeholder="Enter your password"
							required
							disabled={loading}
							autocomplete="current-password"
						/>
					{/if}
					<button
						type="button"
						class="password-toggle"
						on:click={togglePasswordVisibility}
						tabindex="-1"
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{#if showPassword}
							<EyeOff size={20} />
						{:else}
							<Eye size={20} />
						{/if}
					</button>
				</div>
			</div>
			
			<div class="form-actions">
				<label class="remember-me">
					<input type="checkbox" />
					<span>Remember me</span>
				</label>
				<a href="/forgot-password" class="forgot-link">Forgot password?</a>
			</div>
			
			<button
				type="submit"
				class="login-button"
				disabled={loading}
			>
				{#if loading}
					<div class="spinner"></div>
					<span>Logging in...</span>
				{:else}
					<LogIn size={20} />
					<span>Login</span>
				{/if}
			</button>
		</form>
		
		<!-- Sign Up Link -->
		<div class="signup-link">
			Don't have an account? 
			<a href="/signup">Sign up now</a>
		</div>
	</div>
</div>

<style>
	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f0f0f0;
		padding: 1rem;
	}
	
	.login-container {
		width: 100%;
		max-width: 420px;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 2.5rem;
		animation: slideUp 0.4s ease-out;
	}
	
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.login-logo {
		text-align: center;
		margin-bottom: 2rem;
	}
	
	.logo-image {
		height: 60px;
		width: auto;
		margin: 0 auto 1rem auto;
		display: block;
	}
	
	.login-subtitle {
		color: #6b7280;
		font-size: 0.875rem;
		margin: 0;
	}
	
	.login-error {
		background: #fee2e2;
		color: #dc2626;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		animation: shake 0.3s ease-in-out;
	}
	
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-5px); }
		75% { transform: translateX(5px); }
	}
	
	.login-form {
		margin-bottom: 1.5rem;
	}
	
	.form-group {
		margin-bottom: 1.25rem;
	}
	
	.form-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
	}
	
	.form-input {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.875rem;
		transition: all 0.2s;
		background: white;
		color: #1f2937;
	}
	
	.form-input:focus {
		outline: none;
		border-color: #189AB4;
		box-shadow: 0 0 0 3px rgba(24, 154, 180, 0.1);
	}
	
	.form-input:disabled {
		background: #f9fafb;
		cursor: not-allowed;
		opacity: 0.7;
	}
	
	.form-input::placeholder {
		color: #9ca3af;
	}
	
	.password-input-container {
		position: relative;
		display: flex;
		align-items: center;
	}
	
	.form-input.with-icon {
		padding-right: 3rem;
	}
	
	.password-toggle {
		position: absolute;
		right: 0.75rem;
		background: none;
		border: none;
		color: #6b7280;
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}
	
	.password-toggle:hover {
		color: #374151;
	}
	
	.password-toggle:focus {
		outline: none;
	}
	
	.form-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
	}
	
	.remember-me {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #6b7280;
		cursor: pointer;
	}
	
	.remember-me input[type="checkbox"] {
		width: 1rem;
		height: 1rem;
		cursor: pointer;
	}
	
	.forgot-link {
		color: #189AB4;
		text-decoration: none;
		transition: color 0.2s;
	}
	
	.forgot-link:hover {
		color: #0284c7;
		text-decoration: underline;
	}
	
	.login-button {
		width: 100%;
		padding: 0.875rem 1.5rem;
		background: #189AB4;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
	
	.login-button:hover:not(:disabled) {
		background: #0284c7;
		transform: translateY(-1px);
	}
	
	.login-button:active:not(:disabled) {
		transform: translateY(0);
	}
	
	.login-button:disabled {
		cursor: not-allowed;
		opacity: 0.7;
	}
	
	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.signup-link {
		text-align: center;
		font-size: 0.875rem;
		color: #6b7280;
	}
	
	.signup-link a {
		color: #189AB4;
		text-decoration: none;
		font-weight: 600;
		transition: color 0.2s;
	}
	
	.signup-link a:hover {
		color: #0284c7;
		text-decoration: underline;
	}
	
	/* Responsive adjustments */
	@media (max-width: 480px) {
		.login-container {
			padding: 2rem;
		}
		
		.login-title {
			font-size: 1.75rem;
		}
	}
</style>