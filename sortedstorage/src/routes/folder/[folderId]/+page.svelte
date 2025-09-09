<script lang="ts">
	import { page } from '$app/stores';
	import FileExplorerPage from '$lib/components/storage/FileExplorerPage.svelte';
	
	// Get folder ID from URL
	$: folderId = $page.params.folderId;
</script>

<FileExplorerPage {folderId} />