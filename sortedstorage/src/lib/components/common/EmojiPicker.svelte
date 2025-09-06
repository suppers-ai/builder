<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { X } from 'lucide-svelte';
	
	export let open = false;
	export let selectedEmoji = '';
	
	const dispatch = createEventDispatcher();
	
	// Common emoji categories
	const emojiCategories = {
		'Files & Folders': ['📁', '📂', '📄', '📃', '📑', '🗂️', '🗃️', '📋', '📇', '🗄️'],
		'Media': ['🖼️', '📷', '📸', '🎥', '📹', '🎬', '🎞️', '📽️', '🎵', '🎶', '🎧', '🎤', '🎨'],
		'Documents': ['📝', '✏️', '📓', '📔', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '📰'],
		'Tech': ['💻', '🖥️', '⌨️', '🖱️', '💾', '💿', '📀', '🔌', '🔋', '📡', '📱', '☁️'],
		'Business': ['💼', '📊', '📈', '📉', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️'],
		'Security': ['🔒', '🔓', '🔐', '🔑', '🗝️', '🛡️', '⚠️', '🚨', '🔔', '🔕'],
		'Communication': ['✉️', '📧', '📨', '📩', '📤', '📥', '📮', '📪', '📬', '📭'],
		'Tools': ['🔧', '🔨', '⚒️', '🛠️', '⚙️', '🗜️', '⚖️', '🔗', '⛓️', '🧰'],
		'Time': ['⏰', '⏱️', '⏲️', '🕐', '📅', '📆', '🗓️', '⏳', '⌛'],
		'Nature': ['🌲', '🌳', '🌴', '🌵', '🌿', '☘️', '🍀', '🌺', '🌻', '🌸', '🌼', '🌷'],
		'Fun': ['🎮', '🎯', '🎲', '🎭', '🎨', '🎪', '🎢', '🎡', '🎠', '🎪', '🎆', '🎇'],
		'Symbols': ['⭐', '🌟', '✨', '💫', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝']
	};
	
	let searchQuery = '';
	let selectedCategory = 'Files & Folders';
	
	$: filteredEmojis = searchQuery 
		? Object.values(emojiCategories).flat().filter(emoji => 
			emoji.toLowerCase().includes(searchQuery.toLowerCase())
		)
		: emojiCategories[selectedCategory] || [];
	
	function selectEmoji(emoji: string) {
		selectedEmoji = emoji;
		dispatch('select', emoji);
		open = false;
	}
	
	function close() {
		open = false;
		dispatch('close');
	}
</script>

{#if open}
	<div class="emoji-picker-backdrop" on:click={close}>
		<div class="emoji-picker" on:click|stopPropagation>
			<div class="picker-header">
				<h3>Choose an Icon</h3>
				<button class="close-btn" on:click={close}>
					<X size={18} />
				</button>
			</div>
			
			<input 
				type="text"
				class="search-input"
				placeholder="Search emojis..."
				bind:value={searchQuery}
			/>
			
			{#if !searchQuery}
				<div class="categories">
					{#each Object.keys(emojiCategories) as category}
						<button 
							class="category-tab {selectedCategory === category ? 'active' : ''}"
							on:click={() => selectedCategory = category}
						>
							{category}
						</button>
					{/each}
				</div>
			{/if}
			
			<div class="emoji-grid">
				{#each filteredEmojis as emoji}
					<button 
						class="emoji-btn {selectedEmoji === emoji ? 'selected' : ''}"
						on:click={() => selectEmoji(emoji)}
						title={emoji}
					>
						{emoji}
					</button>
				{/each}
			</div>
			
			{#if selectedEmoji}
				<div class="selected-preview">
					Current: <span class="preview-emoji">{selectedEmoji}</span>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.emoji-picker-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100001;
	}
	
	.emoji-picker {
		background: white;
		border-radius: 12px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
		width: 500px;
		max-width: 90vw;
		max-height: 600px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	
	.picker-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #e2e8f0;
	}
	
	.picker-header h3 {
		margin: 0;
		font-size: 1.1rem;
		color: #1a202c;
	}
	
	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.25rem;
		color: #64748b;
		transition: color 0.2s;
	}
	
	.close-btn:hover {
		color: #1a202c;
	}
	
	.search-input {
		margin: 1rem;
		padding: 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 0.95rem;
	}
	
	.search-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.categories {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0 1rem;
		margin-bottom: 1rem;
	}
	
	.category-tab {
		padding: 0.4rem 0.8rem;
		border: 1px solid #e2e8f0;
		border-radius: 20px;
		background: white;
		color: #64748b;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.category-tab:hover {
		background: #f1f5f9;
		color: #1a202c;
	}
	
	.category-tab.active {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}
	
	.emoji-grid {
		flex: 1;
		overflow-y: auto;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
		gap: 0.5rem;
		padding: 1rem;
	}
	
	.emoji-btn {
		aspect-ratio: 1;
		border: 1px solid transparent;
		border-radius: 8px;
		background: white;
		font-size: 1.5rem;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.emoji-btn:hover {
		background: #f1f5f9;
		border-color: #e2e8f0;
		transform: scale(1.1);
	}
	
	.emoji-btn.selected {
		background: #dbeafe;
		border-color: #3b82f6;
	}
	
	.selected-preview {
		padding: 0.75rem 1rem;
		border-top: 1px solid #e2e8f0;
		background: #f8fafc;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: #64748b;
	}
	
	.preview-emoji {
		font-size: 1.5rem;
	}
</style>