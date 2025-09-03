<script lang="ts">
	export let text = '';
	export let position: 'top' | 'bottom' | 'left' | 'right' = 'top';
	export let delay = 500;
	
	let showTooltip = false;
	let tooltipTimeout: NodeJS.Timeout;
	let targetElement: HTMLElement;
	let tooltipElement: HTMLElement;
	
	function handleMouseEnter() {
		tooltipTimeout = setTimeout(() => {
			showTooltip = true;
			positionTooltip();
		}, delay);
	}
	
	function handleMouseLeave() {
		clearTimeout(tooltipTimeout);
		showTooltip = false;
	}
	
	function positionTooltip() {
		if (!targetElement || !tooltipElement) return;
		
		const targetRect = targetElement.getBoundingClientRect();
		const tooltipRect = tooltipElement.getBoundingClientRect();
		
		let top = 0;
		let left = 0;
		
		switch (position) {
			case 'top':
				top = targetRect.top - tooltipRect.height - 8;
				left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
				break;
			case 'bottom':
				top = targetRect.bottom + 8;
				left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
				break;
			case 'left':
				top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
				left = targetRect.left - tooltipRect.width - 8;
				break;
			case 'right':
				top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
				left = targetRect.right + 8;
				break;
		}
		
		// Keep tooltip within viewport
		const padding = 8;
		left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
		top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
		
		tooltipElement.style.top = `${top}px`;
		tooltipElement.style.left = `${left}px`;
	}
</script>

<div 
	class="inline-block relative"
	bind:this={targetElement}
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
>
	<slot />
	
	{#if showTooltip && text}
		<div
			bind:this={tooltipElement}
			class="fixed z-50 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg pointer-events-none whitespace-nowrap"
			style="opacity: 0.95;"
		>
			{text}
			<div 
				class="absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45
					{position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
					{position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
					{position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
					{position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}"
			/>
		</div>
	{/if}
</div>