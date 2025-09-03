<script lang="ts">
	import '../../app.css';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { 
		User, Lock, LogOut, Shield, ChevronRight,
		Mail, Phone, Calendar, MapPin, Save, X, Settings,
		Edit, Home, Package
	} from 'lucide-svelte';
	import { api } from '$lib/api';
	import { authStore } from '$lib/stores/auth';
	
	let user: any = null;
	let loading = true;
	let saving = false;
	let error = '';
	let successMessage = '';
	
	// Modals
	let showAccountSettings = false;
	let showPasswordChange = false;
	
	// Profile form data
	let profileForm = {
		firstName: '',
		lastName: '',
		displayName: '',
		email: '',
		phone: '',
		location: ''
	};
	
	// Password change form
	let passwordForm = {
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	};
	let passwordError = '';
	let passwordSuccess = '';
	
	onMount(async () => {
		// Check if user is logged in
		const currentUser = $authStore.user;
		if (!currentUser) {
			goto('/login');
			return;
		}
		
		try {
			// Fetch current user details
			const response = await api.get('/auth/me');
			user = response;
			
			// Populate form with current user data
			profileForm = {
				firstName: user.first_name || '',
				lastName: user.last_name || '',
				displayName: user.display_name || user.email.split('@')[0],
				email: user.email,
				phone: user.phone || '',
				location: user.location || ''
			};
			
			loading = false;
		} catch (err: any) {
			error = err.message || 'Failed to load user profile';
			loading = false;
		}
	});
	
	async function saveProfile() {
		saving = true;
		error = '';
		successMessage = '';
		
		try {
			await api.patch(`/users/${user.id}`, {
				first_name: profileForm.firstName,
				last_name: profileForm.lastName,
				display_name: profileForm.displayName,
				phone: profileForm.phone,
				location: profileForm.location
			});
			
			successMessage = 'Profile updated successfully';
			
			// Update auth store
			authStore.updateUser({
				...user,
				first_name: profileForm.firstName,
				last_name: profileForm.lastName,
				display_name: profileForm.displayName,
				phone: profileForm.phone,
				location: profileForm.location
			});
			
			// Update local user object
			user = {
				...user,
				first_name: profileForm.firstName,
				last_name: profileForm.lastName,
				display_name: profileForm.displayName,
				phone: profileForm.phone,
				location: profileForm.location
			};
			
			showAccountSettings = false;
			
			setTimeout(() => {
				successMessage = '';
			}, 3000);
		} catch (err: any) {
			error = err.message || 'Failed to update profile';
		} finally {
			saving = false;
		}
	}
	
	async function changePassword() {
		passwordError = '';
		passwordSuccess = '';
		
		// Validate passwords
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			passwordError = 'New passwords do not match';
			return;
		}
		
		if (passwordForm.newPassword.length < 8) {
			passwordError = 'Password must be at least 8 characters';
			return;
		}
		
		try {
			await api.post('/auth/change-password', {
				current_password: passwordForm.currentPassword,
				new_password: passwordForm.newPassword
			});
			
			passwordSuccess = 'Password changed successfully';
			showPasswordChange = false;
			
			// Clear form
			passwordForm = {
				currentPassword: '',
				newPassword: '',
				confirmPassword: ''
			};
			
			setTimeout(() => {
				passwordSuccess = '';
			}, 3000);
		} catch (err: any) {
			passwordError = err.message || 'Failed to change password';
		}
	}
	
	async function logout() {
		try {
			await api.post('/auth/logout', {});
			authStore.logout();
			goto('/login');
		} catch (err) {
			// Even if logout fails on server, clear local auth
			authStore.logout();
			goto('/login');
		}
	}
	
	function getInitials(email: string): string {
		return email.substring(0, 2).toUpperCase();
	}
	
	function getAvatarColor(email: string): string {
		const colors = [
			'#3b82f6', '#ef4444', '#10b981', '#f59e0b',
			'#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
		];
		let hash = 0;
		for (let i = 0; i < email.length; i++) {
			hash = email.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
	}
</script>

<svelte:head>
	<title>Profile - Solobase</title>
</svelte:head>

<div class="profile-page">
	<div class="profile-container">
		<div class="profile-card">
			<!-- Logo Header -->
			<div class="logo-header">
				<img src="/logo_long.png" alt="Solobase" class="logo" />
			</div>
			
			{#if loading}
				<div class="loading">
					<div class="spinner"></div>
					<p>Loading profile...</p>
				</div>
			{:else if user}
				<!-- User Avatar and Basic Info -->
				<div class="user-header">
					<div class="avatar" style="background-color: {getAvatarColor(user.email)}">
						{getInitials(user.email)}
					</div>
					<div class="user-info">
						<h2>{profileForm.displayName || user.email}</h2>
						<p class="email">{user.email}</p>
						<p class="role">
							<span class="role-badge {user.role}">
								{user.role === 'admin' ? 'Administrator' : 'User'}
							</span>
						</p>
					</div>
				</div>
				
				{#if successMessage}
					<div class="alert alert-success">{successMessage}</div>
				{/if}
				
				{#if passwordSuccess}
					<div class="alert alert-success">{passwordSuccess}</div>
				{/if}
				
				<!-- Quick Actions -->
				<div class="actions-grid">
					<!-- Products -->
					<button 
						class="action-card"
						on:click={() => goto('/profile/products')}
					>
						<Package size={24} />
						<span>Products</span>
					</button>
					
					<!-- Home (for non-admins) -->
					<a href="/" class="action-card">
						<Home size={24} />
						<span>Home</span>
					</a>

					<!-- Account Settings -->
					<button 
						class="action-card"
						on:click={() => showAccountSettings = true}
					>
						<Settings size={24} />
						<span>Account Settings</span>
					</button>
					
					<!-- Change Password -->
					<button 
						class="action-card"
						on:click={() => showPasswordChange = true}
					>
						<Lock size={24} />
						<span>Change Password</span>
					</button>
					
					<!-- Admin Dashboard (only for admins) -->
					{#if user.role === 'admin'}
						<a href="/" class="action-card">
							<Shield size={24} />
							<span>Admin Dashboard</span>
						</a>
					{/if}
					
					<!-- Logout -->
					<button class="action-card logout" on:click={logout}>
						<LogOut size={24} />
						<span>Logout</span>
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Account Settings Modal -->
{#if showAccountSettings}
	<div class="modal-overlay" on:click={() => showAccountSettings = false}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h3>Account Settings</h3>
				<button class="close-btn" on:click={() => showAccountSettings = false}>
					<X size={20} />
				</button>
			</div>
			
			<div class="modal-body">
				{#if error}
					<div class="alert alert-error">{error}</div>
				{/if}
				
				<div class="form-row">
					<div class="form-group">
						<label for="firstName">First Name</label>
						<input
							type="text"
							id="firstName"
							bind:value={profileForm.firstName}
							placeholder="Enter first name"
						/>
					</div>
					
					<div class="form-group">
						<label for="lastName">Last Name</label>
						<input
							type="text"
							id="lastName"
							bind:value={profileForm.lastName}
							placeholder="Enter last name"
						/>
					</div>
				</div>
				
				<div class="form-group">
					<label for="displayName">Display Name</label>
					<input
						type="text"
						id="displayName"
						bind:value={profileForm.displayName}
						placeholder="Enter display name"
					/>
				</div>
				
				<div class="form-group">
					<label for="email">Email</label>
					<input
						type="email"
						id="email"
						value={profileForm.email}
						disabled
						class="disabled"
					/>
				</div>
				
				<div class="form-group">
					<label for="phone">Phone</label>
					<input
						type="tel"
						id="phone"
						bind:value={profileForm.phone}
						placeholder="Enter phone number"
					/>
				</div>
				
				<div class="form-group">
					<label for="location">Location</label>
					<input
						type="text"
						id="location"
						bind:value={profileForm.location}
						placeholder="Enter location"
					/>
				</div>
			</div>
			
			<div class="modal-footer">
				<button 
					class="btn btn-secondary"
					on:click={() => showAccountSettings = false}
				>
					Cancel
				</button>
				<button 
					class="btn btn-primary"
					on:click={saveProfile}
					disabled={saving}
				>
					{#if saving}
						<span class="spinner-small"></span>
						Saving...
					{:else}
						<Save size={16} />
						Save Changes
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Change Password Modal -->
{#if showPasswordChange}
	<div class="modal-overlay" on:click={() => showPasswordChange = false}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h3>Change Password</h3>
				<button class="close-btn" on:click={() => showPasswordChange = false}>
					<X size={20} />
				</button>
			</div>
			
			<div class="modal-body">
				{#if passwordError}
					<div class="alert alert-error">{passwordError}</div>
				{/if}
				
				<div class="form-group">
					<label for="currentPassword">Current Password</label>
					<input
						type="password"
						id="currentPassword"
						bind:value={passwordForm.currentPassword}
						placeholder="Enter current password"
					/>
				</div>
				
				<div class="form-group">
					<label for="newPassword">New Password</label>
					<input
						type="password"
						id="newPassword"
						bind:value={passwordForm.newPassword}
						placeholder="Enter new password (min 8 characters)"
					/>
				</div>
				
				<div class="form-group">
					<label for="confirmPassword">Confirm New Password</label>
					<input
						type="password"
						id="confirmPassword"
						bind:value={passwordForm.confirmPassword}
						placeholder="Confirm new password"
					/>
				</div>
			</div>
			
			<div class="modal-footer">
				<button 
					class="btn btn-secondary"
					on:click={() => {
						showPasswordChange = false;
						passwordForm = {
							currentPassword: '',
							newPassword: '',
							confirmPassword: ''
						};
						passwordError = '';
					}}
				>
					Cancel
				</button>
				<button 
					class="btn btn-primary"
					on:click={changePassword}
				>
					Change Password
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.profile-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f0f0f0;
		padding: 1rem;
	}
	
	.profile-container {
		width: 100%;
		max-width: 500px;
	}
	
	.profile-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 2rem;
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
	
	.logo-header {
		text-align: center;
		margin-bottom: 2rem;
	}
	
	.logo {
		height: 60px;
		width: auto;
		margin: 0 auto;
		display: block;
	}
	
	.loading {
		padding: 3rem;
		text-align: center;
	}
	
	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid var(--border-color);
		border-top-color: var(--primary-color);
		border-radius: 50%;
		margin: 0 auto 1rem;
		animation: spin 1s linear infinite;
	}
	
	.spinner-small {
		display: inline-block;
		width: 14px;
		height: 14px;
		border: 2px solid #ffffff;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		margin-right: 0.5rem;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.user-header {
		padding: 2rem 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 1rem;
		border-bottom: 1px solid #e5e7eb;
		margin-bottom: 1.5rem;
	}
	
	.avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.75rem;
		font-weight: 600;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}
	
	.user-info h2 {
		margin: 0;
		font-size: 1.5rem;
		color: #1f2937;
	}
	
	.user-info .email {
		margin: 0.25rem 0;
		color: #6b7280;
		font-size: 0.875rem;
	}
	
	.role-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		margin-top: 0.25rem;
	}
	
	.role-badge.admin {
		background: rgba(24, 154, 180, 0.1);
		color: #189AB4;
	}
	
	.role-badge.user {
		background: rgba(99, 102, 241, 0.1);
		color: #6366f1;
	}
	
	.alert {
		margin: 1rem 2rem;
		padding: 0.75rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
	}
	
	.alert-error {
		background: #fee2e2;
		color: #991b1b;
		border: 1px solid #fca5a5;
	}
	
	.alert-success {
		background: #d1fae5;
		color: #065f46;
		border: 1px solid #6ee7b7;
	}
	
	.actions-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		padding: 0;
	}
	
	.action-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		color: #374151;
		text-decoration: none;
		font-size: 0.813rem;
		font-weight: 500;
		transition: all 0.2s;
		cursor: pointer;
	}
	
	.action-card:hover {
		background: #f3f4f6;
		border-color: #189AB4;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}
	
	.action-card.logout {
		color: #ef4444;
	}
	
	.action-card.logout:hover {
		background: rgba(239, 68, 68, 0.05);
		border-color: #ef4444;
	}
	
	/* Modal Styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}
	
	.modal {
		background: white;
		border-radius: 12px;
		width: 100%;
		max-width: 500px;
		max-height: 90vh;
		overflow: auto;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}
	
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.modal-header h3 {
		margin: 0;
		font-size: 1.25rem;
		color: #1f2937;
	}
	
	.close-btn {
		background: none;
		border: none;
		color: #6b7280;
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.2s;
	}
	
	.close-btn:hover {
		background: #f3f4f6;
		color: #1f2937;
	}
	
	.modal-body {
		padding: 1.5rem;
	}
	
	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}
	
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	
	.form-group {
		margin-bottom: 1rem;
	}
	
	.form-group:last-child {
		margin-bottom: 0;
	}
	
	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}
	
	.form-group input {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.875rem;
		background: white;
		color: #1f2937;
		transition: all 0.2s;
	}
	
	.form-group input:focus {
		outline: none;
		border-color: #189AB4;
		box-shadow: 0 0 0 3px rgba(24, 154, 180, 0.1);
	}
	
	.form-group input.disabled,
	.form-group input:disabled {
		background: #f9fafb;
		color: #9ca3af;
		cursor: not-allowed;
	}
	
	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.btn-primary {
		background: #189AB4;
		color: white;
	}
	
	.btn-primary:hover:not(:disabled) {
		background: #147b91;
	}
	
	.btn-secondary {
		background: #f3f4f6;
		color: #1f2937;
		border: 1px solid #e5e7eb;
	}
	
	.btn-secondary:hover {
		background: #e5e7eb;
	}
	
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	@media (max-width: 640px) {
		.profile-page {
			padding: 1rem;
		}
		
		.actions-grid {
			grid-template-columns: 1fr;
		}
		
		.form-row {
			grid-template-columns: 1fr;
		}
		
		.modal {
			max-width: calc(100vw - 2rem);
		}
	}
	
</style>