<script lang="ts">
	import { page } from '$app/stores';
	import { 
		Home, Users, Database, FolderOpen, 
		Layers, Settings
	} from 'lucide-svelte';
	
	export let collapsed = false;
	
	const navigation = [
		{ title: 'Dashboard', href: '/', icon: Home },
		{ title: 'Users', href: '/users', icon: Users },
		{ title: 'Database', href: '/database', icon: Database },
		{ title: 'Storage', href: '/storage', icon: FolderOpen },
		{ title: 'Collections', href: '/collections', icon: Layers },
		{ title: 'Settings', href: '/settings', icon: Settings },
	];
	
	$: currentPath = $page.url.pathname;
</script>

<nav class="sidebar-nav">
	{#each navigation as item}
		<a
			href={item.href}
			class="sidebar-nav-link {currentPath === item.href ? 'active' : ''}"
		>
			<svelte:component this={item.icon} class="sidebar-nav-icon" />
			{#if !collapsed}
				<span class="sidebar-nav-text">{item.title}</span>
			{/if}
		</a>
	{/each}
</nav>