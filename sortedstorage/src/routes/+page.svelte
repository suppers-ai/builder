<script lang="ts">
	import { Upload, FolderOpen, Share2, Clock, HardDrive, Shield, Zap, Check, ArrowRight } from 'lucide-svelte';
	import Card from '$lib/components/common/Card.svelte';
	import Button from '$lib/components/common/Button.svelte';
	import FileExplorer from '$lib/components/storage/FileExplorer.svelte';
	import type { FileItem, FolderItem } from '$lib/types/storage';
	
	export let data;
	const user = data?.user;
	
	// Mock data - will be replaced with API calls
	const recentFiles: FileItem[] = [
		{
			id: '1',
			name: 'Project Proposal.pdf',
			path: '/documents',
			size: 2548576,
			mimeType: 'application/pdf',
			isShared: true,
			permissions: [],
			createdAt: new Date('2024-01-15'),
			modifiedAt: new Date('2024-01-20'),
			owner: { id: '1', name: 'You' }
		},
		{
			id: '2',
			name: 'presentation.pptx',
			path: '/documents',
			size: 5242880,
			mimeType: 'application/vnd.ms-powerpoint',
			isShared: false,
			permissions: [],
			createdAt: new Date('2024-01-10'),
			modifiedAt: new Date('2024-01-18')
		}
	];
	
	const quickStats = [
		{ label: 'Total Files', value: '1,234', icon: FolderOpen, color: 'text-blue-500' },
		{ label: 'Shared Items', value: '45', icon: Share2, color: 'text-green-500' },
		{ label: 'Recent Uploads', value: '12', icon: Upload, color: 'text-purple-500' },
		{ label: 'Active Hours', value: '24h', icon: Clock, color: 'text-orange-500' }
	];
</script>

{#if user}
	<!-- Authenticated Dashboard -->
	<div class="space-y-6">
		<!-- Welcome Section -->
		<div class="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-8 text-white">
			<h1 class="text-3xl font-bold mb-2">Welcome back!</h1>
			<p class="text-primary-100 mb-6">Manage your files and folders in one secure place</p>
			<div class="flex gap-4">
				<Button href="/files" icon={Upload} variant="secondary">Upload Files</Button>
				<Button href="/files" icon={FolderOpen} variant="ghost">Browse Files</Button>
			</div>
		</div>
	
	<!-- Quick Stats -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		{#each quickStats as stat}
			<Card>
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
						<p class="text-2xl font-bold">{stat.value}</p>
					</div>
					<svelte:component this={stat.icon} class="w-8 h-8 {stat.color}" />
				</div>
			</Card>
		{/each}
	</div>
	
	<!-- Recent Files -->
	<Card title="Recent Files" subtitle="Files you've recently accessed">
		<FileExplorer files={recentFiles} folders={[]} view="list" />
	</Card>
	
	<!-- Quick Actions -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<Card>
			<div class="text-center py-4">
				<Upload class="w-12 h-12 mx-auto mb-3 text-primary-500" />
				<h3 class="font-semibold mb-2">Upload Files</h3>
				<p class="text-sm text-gray-500 mb-4">Drag and drop or click to upload</p>
				<Button size="sm">Start Upload</Button>
			</div>
		</Card>
		
		<Card>
			<div class="text-center py-4">
				<Share2 class="w-12 h-12 mx-auto mb-3 text-green-500" />
				<h3 class="font-semibold mb-2">Share Files</h3>
				<p class="text-sm text-gray-500 mb-4">Share files with others securely</p>
				<Button size="sm" variant="secondary">Create Share Link</Button>
			</div>
		</Card>
		
		<Card>
			<div class="text-center py-4">
				<FolderOpen class="w-12 h-12 mx-auto mb-3 text-blue-500" />
				<h3 class="font-semibold mb-2">Organize</h3>
				<p class="text-sm text-gray-500 mb-4">Create folders to organize files</p>
				<Button size="sm" variant="secondary">New Folder</Button>
			</div>
		</Card>
	</div>
</div>
{:else}
	<!-- Public Landing Page -->
	<div class="max-w-7xl mx-auto">
		<!-- Hero Section -->
		<section class="text-center py-12">
			<div class="flex justify-center mb-6">
				<HardDrive class="w-20 h-20 text-primary-600" />
			</div>
			<h1 class="text-5xl font-bold mb-4">
				Welcome to SortedStorage
			</h1>
			<p class="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
				The smart way to store, organize, and share your files. 
				Secure, fast, and beautifully simple.
			</p>
			<div class="flex gap-4 justify-center">
				<Button href="/auth/register" size="lg">
					Get Started Free
				</Button>
				<Button href="/auth/login" variant="secondary" size="lg">
					Sign In
				</Button>
			</div>
		</section>
		
		<!-- Features Section -->
		<section class="py-12">
			<h2 class="text-3xl font-bold text-center mb-12">Why Choose SortedStorage?</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card glass>
					<div class="text-center">
						<div class="flex justify-center mb-4">
							<div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
								<Shield class="w-8 h-8 text-primary-600" />
							</div>
						</div>
						<h3 class="text-xl font-bold mb-2">Secure Storage</h3>
						<p class="text-gray-600 dark:text-gray-400">Your files are encrypted and protected with enterprise-grade security</p>
					</div>
				</Card>
				<Card glass>
					<div class="text-center">
						<div class="flex justify-center mb-4">
							<div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
								<Share2 class="w-8 h-8 text-primary-600" />
							</div>
						</div>
						<h3 class="text-xl font-bold mb-2">Easy Sharing</h3>
						<p class="text-gray-600 dark:text-gray-400">Share files and folders with anyone using secure links</p>
					</div>
				</Card>
				<Card glass>
					<div class="text-center">
						<div class="flex justify-center mb-4">
							<div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
								<Zap class="w-8 h-8 text-primary-600" />
							</div>
						</div>
						<h3 class="text-xl font-bold mb-2">Lightning Fast</h3>
						<p class="text-gray-600 dark:text-gray-400">Upload and download files at maximum speed</p>
					</div>
				</Card>
			</div>
		</section>
	</div>
{/if}