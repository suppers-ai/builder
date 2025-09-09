<script lang="ts">
	export let currentUser: any = null;
	export let currentPath: string = '/';
	export let onLogout: () => void = () => {};
	export let onOpenSettings: () => void = () => {};
</script>

<div class="minimal-layout">
	<!-- Main Content -->
	<main class="main-content">
		<slot />
	</main>
</div>

<style>
	.minimal-layout {
		min-height: 100vh;
		background: var(--bg-base, #f0f0f0);
		position: relative;
	}
	
	/* Main Content */
	.main-content {
		width: 100%;
		min-height: 100vh;
	}
	
	/* Dark mode support */
	:global(.dark) .minimal-layout {
		background: var(--bg-base, #0f172a);
	}
</style>