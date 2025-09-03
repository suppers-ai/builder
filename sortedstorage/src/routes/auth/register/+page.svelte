<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import Button from '$lib/components/common/Button.svelte';
	import Card from '$lib/components/common/Card.svelte';
	import { UserPlus, Mail, Lock, User, HardDrive } from 'lucide-svelte';
	
	let name = 'Admin User';
	let email = 'admin@example.com';
	let password = 'admin123';
	let confirmPassword = 'admin123';
	let loading = false;
	let error = '';
	
	async function handleSubmit() {
		error = '';
		
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}
		
		if (password.length < 8) {
			error = 'Password must be at least 8 characters';
			return;
		}
		
		loading = true;
		
		try {
			await auth.register(email, password, name);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Registration failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<div class="flex justify-center mb-4">
				<HardDrive class="w-16 h-16 text-primary-600" />
			</div>
			<h1 class="text-3xl font-bold">Create Account</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-2">Start storing your files securely</p>
		</div>
		
		<Card>
			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				{#if error}
					<div class="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
						{error}
					</div>
				{/if}
				
				<div>
					<label for="name" class="block text-sm font-medium mb-2">Full Name</label>
					<div class="relative">
						<User class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							id="name"
							type="text"
							bind:value={name}
							required
							class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700"
							placeholder="John Doe"
						/>
					</div>
				</div>
				
				<div>
					<label for="email" class="block text-sm font-medium mb-2">Email</label>
					<div class="relative">
						<Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							id="email"
							type="email"
							bind:value={email}
							required
							class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700"
							placeholder="you@example.com"
						/>
					</div>
				</div>
				
				<div>
					<label for="password" class="block text-sm font-medium mb-2">Password</label>
					<div class="relative">
						<Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							id="password"
							type="password"
							bind:value={password}
							required
							minlength="8"
							class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700"
							placeholder="••••••••"
						/>
					</div>
					<p class="text-xs text-gray-500 mt-1">At least 8 characters</p>
				</div>
				
				<div>
					<label for="confirmPassword" class="block text-sm font-medium mb-2">Confirm Password</label>
					<div class="relative">
						<Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							id="confirmPassword"
							type="password"
							bind:value={confirmPassword}
							required
							class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700"
							placeholder="••••••••"
						/>
					</div>
				</div>
				
				<div class="flex items-center">
					<input type="checkbox" required class="rounded border-gray-300 dark:border-gray-600" />
					<span class="ml-2 text-sm">
						I agree to the <a href="/terms" class="text-primary-600 hover:text-primary-700">Terms of Service</a> 
						and <a href="/privacy" class="text-primary-600 hover:text-primary-700">Privacy Policy</a>
					</span>
				</div>
				
				<Button type="submit" {loading} icon={UserPlus} class="w-full">
					Create Account
				</Button>
				
				<p class="text-center text-sm text-gray-600 dark:text-gray-400">
					Already have an account?
					<a href="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium">
						Sign in
					</a>
				</p>
			</form>
		</Card>
	</div>
</div>