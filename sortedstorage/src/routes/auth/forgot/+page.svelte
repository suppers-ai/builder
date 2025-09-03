<script lang="ts">
	import { Mail, ArrowLeft } from 'lucide-svelte';
	import Button from '$lib/components/common/Button.svelte';
	import Card from '$lib/components/common/Card.svelte';
	
	let email = '';
	let submitted = false;
	let loading = false;
	
	async function handleSubmit() {
		if (!email) return;
		
		loading = true;
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 1500));
		loading = false;
		submitted = true;
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<img src="/images/long_light.svg" alt="SortedStorage" class="h-12 mx-auto mb-4" />
			<h1 class="text-3xl font-bold">Forgot Password?</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-2">
				{submitted ? 'Check your email' : 'No worries, we\'ll send you reset instructions'}
			</p>
		</div>
		
		<Card>
			{#if submitted}
				<div class="text-center py-8">
					<div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
						<Mail class="w-8 h-8 text-green-600 dark:text-green-400" />
					</div>
					<h2 class="text-xl font-semibold mb-2">Email sent!</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-6">
						We've sent password reset instructions to<br />
						<strong class="text-gray-900 dark:text-gray-100">{email}</strong>
					</p>
					<p class="text-sm text-gray-500 dark:text-gray-500 mb-6">
						Didn't receive the email? Check your spam folder or
						<button 
							class="text-primary-600 hover:text-primary-700 font-medium"
							on:click={() => { submitted = false; loading = false; }}
						>
							try again
						</button>
					</p>
					<a href="/auth/login" class="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
						<ArrowLeft class="w-4 h-4 mr-2" />
						Back to login
					</a>
				</div>
			{:else}
				<form on:submit|preventDefault={handleSubmit} class="space-y-6">
					<div>
						<label for="email" class="block text-sm font-medium mb-2">Email address</label>
						<div class="relative">
							<Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
							<input
								id="email"
								type="email"
								bind:value={email}
								required
								disabled={loading}
								class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700"
								placeholder="you@example.com"
							/>
						</div>
					</div>
					
					<Button type="submit" {loading} icon={Mail} class="w-full">
						Send reset instructions
					</Button>
					
					<div class="text-center">
						<a href="/auth/login" class="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
							<ArrowLeft class="w-4 h-4 mr-1" />
							Back to login
						</a>
					</div>
				</form>
			{/if}
		</Card>
	</div>
</div>