<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { 
		Search, File, Folder, Upload, Download, Share2, Settings, 
		HelpCircle, LogOut, User, Grid, List, Clock, Star, Trash,
		Copy, Move, Edit, Plus, Filter, Command
	} from 'lucide-svelte';
	import { searchStore } from '$lib/stores/search';
	import { storage } from '$lib/stores/storage-api';
	import { auth } from '$lib/stores/auth';
	import Input from './Input.svelte';
	
	export let open = false;
	
	let query = '';
	let selectedIndex = 0;
	let filteredCommands: Command[] = [];
	let inputElement: HTMLInputElement;
	
	interface Command {
		id: string;
		title: string;
		description?: string;
		icon: any;
		category: string;
		shortcut?: string;
		action: () => void | Promise<void>;
		keywords?: string[];
	}
	
	const commands: Command[] = [
		// Navigation
		{
			id: 'nav-files',
			title: 'Go to Files',
			description: 'Navigate to your files',
			icon: File,
			category: 'Navigation',
			shortcut: 'Ctrl+1',
			action: () => goto('/')
		},
		{
			id: 'nav-shared',
			title: 'Go to Shared',
			description: 'View shared files',
			icon: Share2,
			category: 'Navigation',
			shortcut: 'Ctrl+2',
			action: () => goto('/shared')
		},
		{
			id: 'nav-recent',
			title: 'Go to Recent',
			description: 'View recently accessed files',
			icon: Clock,
			category: 'Navigation',
			action: () => goto('/?view=recent')
		},
		{
			id: 'nav-starred',
			title: 'Go to Starred',
			description: 'View starred files',
			icon: Star,
			category: 'Navigation',
			action: () => goto('/?view=starred')
		},
		{
			id: 'nav-trash',
			title: 'Go to Trash',
			description: 'View deleted files',
			icon: Trash,
			category: 'Navigation',
			action: () => goto('/?view=trash')
		},
		{
			id: 'nav-settings',
			title: 'Go to Settings',
			description: 'Manage your settings',
			icon: Settings,
			category: 'Navigation',
			shortcut: 'Ctrl+,',
			action: () => goto('/settings')
		},
		
		// File Operations
		{
			id: 'file-upload',
			title: 'Upload Files',
			description: 'Upload new files',
			icon: Upload,
			category: 'Files',
			shortcut: 'Ctrl+U',
			action: () => document.dispatchEvent(new CustomEvent('command:upload')),
			keywords: ['add', 'new']
		},
		{
			id: 'file-new-folder',
			title: 'New Folder',
			description: 'Create a new folder',
			icon: Plus,
			category: 'Files',
			shortcut: 'Ctrl+N',
			action: () => document.dispatchEvent(new CustomEvent('command:new-folder')),
			keywords: ['create', 'directory']
		},
		{
			id: 'file-download',
			title: 'Download Selected',
			description: 'Download selected files',
			icon: Download,
			category: 'Files',
			action: () => document.dispatchEvent(new CustomEvent('command:download')),
			keywords: ['save', 'export']
		},
		{
			id: 'file-share',
			title: 'Share Selected',
			description: 'Share selected files',
			icon: Share2,
			category: 'Files',
			action: () => document.dispatchEvent(new CustomEvent('command:share')),
			keywords: ['link', 'send']
		},
		{
			id: 'file-rename',
			title: 'Rename Selected',
			description: 'Rename selected file',
			icon: Edit,
			category: 'Files',
			shortcut: 'F2',
			action: () => document.dispatchEvent(new CustomEvent('command:rename'))
		},
		{
			id: 'file-copy',
			title: 'Copy Selected',
			description: 'Copy selected files',
			icon: Copy,
			category: 'Files',
			shortcut: 'Ctrl+C',
			action: () => document.dispatchEvent(new CustomEvent('command:copy'))
		},
		{
			id: 'file-move',
			title: 'Move Selected',
			description: 'Move selected files',
			icon: Move,
			category: 'Files',
			shortcut: 'Ctrl+X',
			action: () => document.dispatchEvent(new CustomEvent('command:move'))
		},
		{
			id: 'file-delete',
			title: 'Delete Selected',
			description: 'Delete selected files',
			icon: Trash,
			category: 'Files',
			shortcut: 'Delete',
			action: () => document.dispatchEvent(new CustomEvent('command:delete'))
		},
		
		// View
		{
			id: 'view-grid',
			title: 'Grid View',
			description: 'Switch to grid view',
			icon: Grid,
			category: 'View',
			shortcut: 'Ctrl+1',
			action: () => storage.setViewMode('grid'),
			keywords: ['tiles', 'thumbnails']
		},
		{
			id: 'view-list',
			title: 'List View',
			description: 'Switch to list view',
			icon: List,
			category: 'View',
			shortcut: 'Ctrl+2',
			action: () => storage.setViewMode('list'),
			keywords: ['table', 'details']
		},
		{
			id: 'view-filter',
			title: 'Filter Files',
			description: 'Apply filters',
			icon: Filter,
			category: 'View',
			action: () => document.dispatchEvent(new CustomEvent('command:filter'))
		},
		
		// Search
		{
			id: 'search-files',
			title: 'Search Files',
			description: 'Search for files and folders',
			icon: Search,
			category: 'Search',
			shortcut: 'Ctrl+F',
			action: () => document.dispatchEvent(new CustomEvent('command:search')),
			keywords: ['find', 'query']
		},
		{
			id: 'search-advanced',
			title: 'Advanced Search',
			description: 'Open advanced search',
			icon: Search,
			category: 'Search',
			action: () => document.dispatchEvent(new CustomEvent('command:advanced-search'))
		},
		
		// Account
		{
			id: 'account-profile',
			title: 'Profile',
			description: 'View your profile',
			icon: User,
			category: 'Account',
			action: () => goto('/settings/profile')
		},
		{
			id: 'account-logout',
			title: 'Log Out',
			description: 'Sign out of your account',
			icon: LogOut,
			category: 'Account',
			action: () => auth.logout()
		},
		
		// Help
		{
			id: 'help-docs',
			title: 'Documentation',
			description: 'View help documentation',
			icon: HelpCircle,
			category: 'Help',
			action: () => window.open('/help', '_blank'),
			keywords: ['guide', 'tutorial']
		},
		{
			id: 'help-shortcuts',
			title: 'Keyboard Shortcuts',
			description: 'View keyboard shortcuts',
			icon: Command,
			category: 'Help',
			shortcut: 'Ctrl+/',
			action: () => document.dispatchEvent(new CustomEvent('command:shortcuts'))
		}
	];
	
	// Filter commands based on query
	$: {
		if (!query) {
			filteredCommands = commands;
		} else {
			const lowerQuery = query.toLowerCase();
			filteredCommands = commands.filter(cmd => {
				const searchText = [
					cmd.title,
					cmd.description,
					cmd.category,
					...(cmd.keywords || [])
				].join(' ').toLowerCase();
				return searchText.includes(lowerQuery);
			});
		}
		// Reset selection when filtered results change
		selectedIndex = 0;
	}
	
	// Group commands by category
	$: groupedCommands = filteredCommands.reduce((acc, cmd) => {
		if (!acc[cmd.category]) {
			acc[cmd.category] = [];
		}
		acc[cmd.category].push(cmd);
		return acc;
	}, {} as Record<string, Command[]>);
	
	function handleKeyDown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = (selectedIndex + 1) % filteredCommands.length;
				scrollToSelected();
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
				scrollToSelected();
				break;
			case 'Enter':
				event.preventDefault();
				if (filteredCommands[selectedIndex]) {
					executeCommand(filteredCommands[selectedIndex]);
				}
				break;
			case 'Escape':
				event.preventDefault();
				close();
				break;
		}
	}
	
	function executeCommand(command: Command) {
		command.action();
		close();
	}
	
	function close() {
		open = false;
		query = '';
		selectedIndex = 0;
	}
	
	function scrollToSelected() {
		const selectedElement = document.querySelector(`[data-command-index="${selectedIndex}"]`);
		selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	}
	
	// Global keyboard shortcut to open
	function handleGlobalKeyDown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
			event.preventDefault();
			open = true;
		}
	}
	
	onMount(() => {
		window.addEventListener('keydown', handleGlobalKeyDown);
		// Listen for command palette event
		const handleCommandPalette = () => { open = true; };
		document.addEventListener('shortcut:command-palette', handleCommandPalette);
		
		return () => {
			window.removeEventListener('keydown', handleGlobalKeyDown);
			document.removeEventListener('shortcut:command-palette', handleCommandPalette);
		};
	});
	
	$: if (open && inputElement) {
		inputElement.focus();
	}
</script>

{#if open}
	<div 
		class="fixed inset-0 z-[100] flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm"
		on:click={close}
		on:keydown={handleKeyDown}
	>
		<div 
			class="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
			on:click|stopPropagation
		>
			<!-- Search Input -->
			<div class="p-4 border-b border-base-200">
				<div class="relative">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/60" />
					<input
						bind:this={inputElement}
						bind:value={query}
						type="text"
						placeholder="Type a command or search..."
						class="w-full pl-10 pr-4 py-3 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
					/>
					<div class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-base-content/60">
						ESC to close
					</div>
				</div>
			</div>
			
			<!-- Command List -->
			<div class="max-h-96 overflow-y-auto">
				{#if filteredCommands.length === 0}
					<div class="p-8 text-center text-base-content/60">
						No commands found for "{query}"
					</div>
				{:else}
					{#each Object.entries(groupedCommands) as [category, categoryCommands], categoryIndex}
						<div class="px-4 py-2">
							<div class="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1">
								{category}
							</div>
							{#each categoryCommands as command, cmdIndex}
								{@const globalIndex = filteredCommands.indexOf(command)}
								<button
									data-command-index={globalIndex}
									type="button"
									class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
										{globalIndex === selectedIndex ? 'bg-primary/10 text-primary' : 'hover:bg-base-200'}"
									on:click={() => executeCommand(command)}
									on:mouseenter={() => selectedIndex = globalIndex}
								>
									<svelte:component this={command.icon} class="w-4 h-4 shrink-0" />
									<div class="flex-1 text-left">
										<div class="font-medium">{command.title}</div>
										{#if command.description}
											<div class="text-sm text-base-content/60">
												{command.description}
											</div>
										{/if}
									</div>
									{#if command.shortcut}
										<kbd class="px-2 py-1 bg-base-300 rounded text-xs font-mono">
											{command.shortcut}
										</kbd>
									{/if}
								</button>
							{/each}
						</div>
					{/each}
				{/if}
			</div>
			
			<!-- Footer -->
			<div class="p-3 border-t border-base-200 flex items-center justify-between text-xs text-base-content/60">
				<div class="flex items-center gap-4">
					<span class="flex items-center gap-1">
						<kbd class="px-1.5 py-0.5 bg-base-200 rounded">↑</kbd>
						<kbd class="px-1.5 py-0.5 bg-base-200 rounded">↓</kbd>
						Navigate
					</span>
					<span class="flex items-center gap-1">
						<kbd class="px-1.5 py-0.5 bg-base-200 rounded">↵</kbd>
						Select
					</span>
				</div>
				<div class="flex items-center gap-1">
					<Command class="w-3 h-3" />
					<span>+K to open</span>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	kbd {
		box-shadow: 0 2px 0 1px rgba(0,0,0,0.1);
	}
</style>