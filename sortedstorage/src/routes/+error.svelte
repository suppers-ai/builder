<script lang="ts">
	import { page } from '$app/stores';
	import { AlertCircle, Home, RefreshCw } from 'lucide-svelte';
	
	// Get error details
	$: error = $page.error;
	$: status = $page.status;
	$: errorId = error?.errorId;
	
	// Error messages by status
	const errorMessages: Record<number, { title: string; description: string }> = {
		400: {
			title: 'Bad Request',
			description: 'The request could not be understood or was missing required parameters.'
		},
		401: {
			title: 'Unauthorized',
			description: 'You need to be logged in to access this page.'
		},
		403: {
			title: 'Forbidden',
			description: 'You don\'t have permission to access this resource.'
		},
		404: {
			title: 'Page Not Found',
			description: 'The page you\'re looking for doesn\'t exist or has been moved.'
		},
		429: {
			title: 'Too Many Requests',
			description: 'You\'ve made too many requests. Please wait a moment and try again.'
		},
		500: {
			title: 'Server Error',
			description: 'Something went wrong on our end. We\'re working to fix it.'
		},
		503: {
			title: 'Service Unavailable',
			description: 'The service is temporarily unavailable. Please try again later.'
		}
	};
	
	$: errorInfo = errorMessages[status] || {
		title: `Error ${status}`,
		description: error?.message || 'An unexpected error occurred.'
	};
	
	function handleRefresh() {
		window.location.reload();
	}
	
	function handleGoHome() {
		window.location.href = '/';
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
	<div class="max-w-md w-full">
		<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
			<!-- Error Icon -->
			<div class="flex justify-center mb-6">
				<div class="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
					<AlertCircle class="w-10 h-10 text-red-600 dark:text-red-400" />
				</div>
			</div>
			
			<!-- Error Status -->
			<div class="text-center mb-4">
				<h1 class="text-6xl font-bold text-gray-900 dark:text-white">
					{status}
				</h1>
			</div>
			
			<!-- Error Title -->
			<h2 class="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-3">
				{errorInfo.title}
			</h2>
			
			<!-- Error Description -->
			<p class="text-center text-gray-600 dark:text-gray-400 mb-8">
				{errorInfo.description}
			</p>
			
			<!-- Error ID -->
			{#if errorId}
				<div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-6">
					<p class="text-xs text-gray-500 dark:text-gray-400 text-center">
						Error ID: <code class="font-mono">{errorId}</code>
					</p>
				</div>
			{/if}
			
			<!-- Actions -->
			<div class="flex gap-3">
				<button
					on:click={handleGoHome}
					class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
				>
					<Home class="w-4 h-4" />
					Go Home
				</button>
				
				<button
					on:click={handleRefresh}
					class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors duration-200"
				>
					<RefreshCw class="w-4 h-4" />
					Try Again
				</button>
			</div>
			
			<!-- Support Link -->
			<div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
				<p class="text-center text-sm text-gray-500 dark:text-gray-400">
					Need help? 
					<a href="/support" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
						Contact Support
					</a>
				</p>
			</div>
		</div>
	</div>
</div>