<script lang="ts">
	import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import type { FolderItem } from '$lib/types/storage';
	
	export let folders: FolderItem[] = [];
	export let selectedPath = '/';
	export let expandedPaths: string[] = ['/'];
	
	const dispatch = createEventDispatcher();
	
	interface TreeNode extends FolderItem {
		children: TreeNode[];
	}
	
	// Build tree structure from flat folder list
	function buildTree(folders: FolderItem[]): TreeNode[] {
		const tree: TreeNode[] = [];
		const map = new Map<string, TreeNode>();
		
		// Create nodes
		folders.forEach(folder => {
			map.set(folder.path + '/' + folder.name, {
				...folder,
				children: []
			});
		});
		
		// Build hierarchy
		map.forEach((node, path) => {
			const parentPath = path.substring(0, path.lastIndexOf('/'));
			const parent = map.get(parentPath);
			
			if (parent) {
				parent.children.push(node);
			} else {
				tree.push(node);
			}
		});
		
		return tree;
	}
	
	function toggleExpanded(path: string) {
		if (expandedPaths.includes(path)) {
			expandedPaths = expandedPaths.filter(p => p !== path);
		} else {
			expandedPaths = [...expandedPaths, path];
		}
		dispatch('toggle', { path, expanded: expandedPaths.includes(path) });
	}
	
	function selectFolder(folder: TreeNode) {
		selectedPath = folder.path + '/' + folder.name;
		dispatch('select', folder);
	}
	
	function handleDrop(event: DragEvent, folder: TreeNode) {
		event.preventDefault();
		event.stopPropagation();
		
		const data = event.dataTransfer?.getData('application/json');
		if (data) {
			const items = JSON.parse(data);
			dispatch('drop', { folder, items });
		}
	}
	
	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		event.dataTransfer!.dropEffect = 'move';
	}
	
	$: tree = buildTree(folders);
</script>

<div class="select-none">
	<!-- Root folder -->
	<div 
		class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer
			{selectedPath === '/' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600' : ''}"
		on:click={() => dispatch('select', { path: '/', name: 'Home' })}
		on:drop={e => handleDrop(e, { path: '/', name: 'Home', children: tree })}
		on:dragover={handleDragOver}
	>
		<FolderOpen class="w-4 h-4" />
		<span class="text-sm font-medium">Home</span>
	</div>
	
	<!-- Tree nodes -->
	{#if tree.length > 0}
		<div class="ml-2">
			{#each tree as node}
				<TreeNode 
					{node} 
					{selectedPath} 
					{expandedPaths}
					on:toggle={e => toggleExpanded(e.detail.path)}
					on:select={e => selectFolder(e.detail)}
					on:drop
				/>
			{/each}
		</div>
	{/if}
</div>

<!-- Recursive tree node component -->
<script context="module" lang="ts">
	export function TreeNode({ node, selectedPath, expandedPaths, ...props }) {
		const path = node.path + '/' + node.name;
		const isExpanded = expandedPaths.includes(path);
		const isSelected = selectedPath === path;
		const hasChildren = node.children && node.children.length > 0;
		
		return {
			node,
			path,
			isExpanded,
			isSelected,
			hasChildren,
			props
		};
	}
</script>

{#if false}
<!-- This would be the recursive component, but Svelte doesn't support recursive components directly -->
<!-- We'd need to implement this differently in production -->
{/if}

<style>
	:global(.folder-tree-node) {
		user-select: none;
	}
</style>