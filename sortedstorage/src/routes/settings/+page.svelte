<script lang="ts">
	import { User, Bell, Shield, Palette, HardDrive, CreditCard } from 'lucide-svelte';
	import Card from '$lib/components/common/Card.svelte';
	import Button from '$lib/components/common/Button.svelte';
	import { auth } from '$lib/stores/auth';
	import { toasts } from '$lib/stores/notifications';
	
	let activeTab = 'profile';
	
	// Profile settings
	let name = $auth.user?.name || '';
	let email = $auth.user?.email || '';
	let currentPassword = '';
	let newPassword = '';
	let confirmPassword = '';
	
	// Notification settings
	let emailNotifications = true;
	let shareNotifications = true;
	let quotaNotifications = true;
	
	// Theme settings
	let theme = 'system';
	
	const tabs = [
		{ id: 'profile', label: 'Profile', icon: User },
		{ id: 'notifications', label: 'Notifications', icon: Bell },
		{ id: 'security', label: 'Security', icon: Shield },
		{ id: 'appearance', label: 'Appearance', icon: Palette },
		{ id: 'storage', label: 'Storage', icon: HardDrive },
		{ id: 'billing', label: 'Billing', icon: CreditCard }
	];
	
	async function saveProfile() {
		try {
			await auth.updateProfile({ name });
			toasts.success('Profile updated successfully');
		} catch (error) {
			toasts.error('Failed to update profile');
		}
	}
	
	async function changePassword() {
		if (newPassword !== confirmPassword) {
			toasts.error('Passwords do not match');
			return;
		}
		
		if (newPassword.length < 8) {
			toasts.error('Password must be at least 8 characters');
			return;
		}
		
		// API call to change password
		toasts.success('Password changed successfully');
		currentPassword = '';
		newPassword = '';
		confirmPassword = '';
	}
	
	function saveNotifications() {
		// API call to save notification preferences
		toasts.success('Notification preferences saved');
	}
	
	function saveTheme() {
		// Apply theme
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else if (theme === 'light') {
			document.documentElement.classList.remove('dark');
		} else {
			// System preference
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
		
		localStorage.setItem('theme', theme);
		toasts.success('Theme preferences saved');
	}
</script>

<div class="container mx-auto px-4 py-6">
	<h1 class="text-2xl font-bold mb-6">Settings</h1>
	
	<div class="grid grid-cols-12 gap-6">
		<!-- Sidebar -->
		<div class="col-span-3">
			<nav class="space-y-1">
				{#each tabs as tab}
					<button
						on:click={() => activeTab = tab.id}
						class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
							{activeTab === tab.id 
								? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
								: 'hover:bg-gray-100 dark:hover:bg-gray-700'}"
					>
						<svelte:component this={tab.icon} class="w-5 h-5" />
						<span>{tab.label}</span>
					</button>
				{/each}
			</nav>
		</div>
		
		<!-- Content -->
		<div class="col-span-9">
			{#if activeTab === 'profile'}
				<Card title="Profile Settings" subtitle="Manage your personal information">
					<div class="space-y-4">
						<div>
							<label for="name" class="block text-sm font-medium mb-2">Full Name</label>
							<input
								id="name"
								type="text"
								bind:value={name}
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700"
							/>
						</div>
						
						<div>
							<label for="email" class="block text-sm font-medium mb-2">Email Address</label>
							<input
								id="email"
								type="email"
								bind:value={email}
								disabled
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 opacity-75"
							/>
							<p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
						</div>
						
						<Button on:click={saveProfile}>Save Changes</Button>
					</div>
				</Card>
				
				<Card title="Change Password" subtitle="Update your password" class="mt-6">
					<div class="space-y-4">
						<div>
							<label for="currentPassword" class="block text-sm font-medium mb-2">Current Password</label>
							<input
								id="currentPassword"
								type="password"
								bind:value={currentPassword}
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700"
							/>
						</div>
						
						<div>
							<label for="newPassword" class="block text-sm font-medium mb-2">New Password</label>
							<input
								id="newPassword"
								type="password"
								bind:value={newPassword}
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700"
							/>
						</div>
						
						<div>
							<label for="confirmPassword" class="block text-sm font-medium mb-2">Confirm New Password</label>
							<input
								id="confirmPassword"
								type="password"
								bind:value={confirmPassword}
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700"
							/>
						</div>
						
						<Button on:click={changePassword}>Change Password</Button>
					</div>
				</Card>
			{:else if activeTab === 'notifications'}
				<Card title="Notification Preferences" subtitle="Choose how you want to be notified">
					<div class="space-y-4">
						<label class="flex items-center justify-between">
							<div>
								<p class="font-medium">Email Notifications</p>
								<p class="text-sm text-gray-500">Receive notifications via email</p>
							</div>
							<input type="checkbox" bind:checked={emailNotifications} class="rounded" />
						</label>
						
						<label class="flex items-center justify-between">
							<div>
								<p class="font-medium">Share Notifications</p>
								<p class="text-sm text-gray-500">Notify when someone shares files with you</p>
							</div>
							<input type="checkbox" bind:checked={shareNotifications} class="rounded" />
						</label>
						
						<label class="flex items-center justify-between">
							<div>
								<p class="font-medium">Storage Quota Alerts</p>
								<p class="text-sm text-gray-500">Warn when approaching storage limit</p>
							</div>
							<input type="checkbox" bind:checked={quotaNotifications} class="rounded" />
						</label>
						
						<Button on:click={saveNotifications}>Save Preferences</Button>
					</div>
				</Card>
			{:else if activeTab === 'appearance'}
				<Card title="Appearance Settings" subtitle="Customize the look and feel">
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium mb-2">Theme</label>
							<select
								bind:value={theme}
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700"
							>
								<option value="system">System Default</option>
								<option value="light">Light</option>
								<option value="dark">Dark</option>
							</select>
						</div>
						
						<Button on:click={saveTheme}>Apply Theme</Button>
					</div>
				</Card>
			{:else if activeTab === 'storage'}
				<Card title="Storage Settings" subtitle="Manage your storage preferences">
					<div class="space-y-4">
						<div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
							<div class="flex justify-between mb-2">
								<span class="text-sm font-medium">Storage Used</span>
								<span class="text-sm">2.5 GB / 5 GB</span>
							</div>
							<div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
								<div class="h-full bg-primary-500" style="width: 50%"></div>
							</div>
						</div>
						
						<div class="space-y-2">
							<div class="flex justify-between text-sm">
								<span class="text-gray-500">Documents</span>
								<span>842 MB</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-gray-500">Images</span>
								<span>1.2 GB</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-gray-500">Videos</span>
								<span>458 MB</span>
							</div>
						</div>
						
						<Button href="/upgrade">Upgrade Storage</Button>
					</div>
				</Card>
			{:else if activeTab === 'billing'}
				<Card title="Billing & Subscription" subtitle="Manage your subscription and payment methods">
					<div class="space-y-4">
						<div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
							<div class="flex justify-between items-center">
								<div>
									<p class="font-medium">Free Plan</p>
									<p class="text-sm text-gray-500">5 GB Storage • 10 GB Bandwidth</p>
								</div>
								<Button href="/upgrade" size="sm">Upgrade</Button>
							</div>
						</div>
						
						<div>
							<h3 class="font-medium mb-2">Payment History</h3>
							<p class="text-sm text-gray-500">No payments yet</p>
						</div>
					</div>
				</Card>
			{:else if activeTab === 'security'}
				<Card title="Security Settings" subtitle="Keep your account secure">
					<div class="space-y-4">
						<div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
							<p class="text-sm font-medium text-green-800 dark:text-green-200">
								Two-factor authentication is not enabled
							</p>
							<Button size="sm" variant="secondary" class="mt-2">Enable 2FA</Button>
						</div>
						
						<div>
							<h3 class="font-medium mb-2">Active Sessions</h3>
							<div class="space-y-2">
								<div class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
									<div class="flex justify-between items-center">
										<div>
											<p class="text-sm font-medium">Current Session</p>
											<p class="text-xs text-gray-500">Chrome on Windows • 192.168.1.1</p>
										</div>
										<span class="text-xs text-green-600">Active now</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Card>
			{/if}
		</div>
	</div>
</div>