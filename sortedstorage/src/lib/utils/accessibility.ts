/**
 * Accessibility utilities for keyboard navigation and screen reader support
 */

/**
 * Trap focus within a container element
 */
export function trapFocus(container: HTMLElement) {
	const focusableElements = container.querySelectorAll<HTMLElement>(
		'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
	);
	
	const firstFocusable = focusableElements[0];
	const lastFocusable = focusableElements[focusableElements.length - 1];
	
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Tab') {
			if (e.shiftKey) {
				// Shift + Tab
				if (document.activeElement === firstFocusable) {
					e.preventDefault();
					lastFocusable?.focus();
				}
			} else {
				// Tab
				if (document.activeElement === lastFocusable) {
					e.preventDefault();
					firstFocusable?.focus();
				}
			}
		}
		
		if (e.key === 'Escape') {
			// Allow escape to close modals/dialogs
			container.dispatchEvent(new CustomEvent('escape'));
		}
	}
	
	container.addEventListener('keydown', handleKeyDown);
	firstFocusable?.focus();
	
	return () => {
		container.removeEventListener('keydown', handleKeyDown);
	};
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
	const announcement = document.createElement('div');
	announcement.setAttribute('role', 'status');
	announcement.setAttribute('aria-live', priority);
	announcement.setAttribute('aria-atomic', 'true');
	announcement.className = 'sr-only';
	announcement.textContent = message;
	
	document.body.appendChild(announcement);
	
	// Remove after announcement
	setTimeout(() => {
		document.body.removeChild(announcement);
	}, 1000);
}

/**
 * Handle keyboard navigation for list items
 */
export function handleListKeyboardNavigation(
	container: HTMLElement,
	items: NodeListOf<HTMLElement> | HTMLElement[],
	onSelect?: (item: HTMLElement, index: number) => void
) {
	let currentIndex = 0;
	const itemArray = Array.from(items);
	
	function focusItem(index: number) {
		if (index >= 0 && index < itemArray.length) {
			itemArray[index].focus();
			currentIndex = index;
		}
	}
	
	function handleKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				focusItem((currentIndex + 1) % itemArray.length);
				break;
			case 'ArrowUp':
				e.preventDefault();
				focusItem((currentIndex - 1 + itemArray.length) % itemArray.length);
				break;
			case 'Home':
				e.preventDefault();
				focusItem(0);
				break;
			case 'End':
				e.preventDefault();
				focusItem(itemArray.length - 1);
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				if (onSelect && itemArray[currentIndex]) {
					onSelect(itemArray[currentIndex], currentIndex);
				}
				break;
		}
	}
	
	container.addEventListener('keydown', handleKeyDown);
	
	// Set tabindex on items
	itemArray.forEach((item, index) => {
		item.setAttribute('tabindex', index === 0 ? '0' : '-1');
		item.addEventListener('focus', () => {
			currentIndex = index;
		});
	});
	
	return () => {
		container.removeEventListener('keydown', handleKeyDown);
	};
}

/**
 * Manage ARIA attributes for expandable elements
 */
export function setupExpandable(
	trigger: HTMLElement,
	content: HTMLElement,
	expanded = false
) {
	const contentId = content.id || `expandable-${Math.random().toString(36).substr(2, 9)}`;
	content.id = contentId;
	
	trigger.setAttribute('aria-expanded', String(expanded));
	trigger.setAttribute('aria-controls', contentId);
	
	if (!expanded) {
		content.setAttribute('aria-hidden', 'true');
	}
	
	function toggle() {
		expanded = !expanded;
		trigger.setAttribute('aria-expanded', String(expanded));
		content.setAttribute('aria-hidden', String(!expanded));
	}
	
	return { toggle, setExpanded: (value: boolean) => {
		expanded = value;
		trigger.setAttribute('aria-expanded', String(expanded));
		content.setAttribute('aria-hidden', String(!expanded));
	}};
}

/**
 * Debounce function for live regions
 */
export function debounceAnnouncement(fn: (message: string) => void, delay = 500) {
	let timeoutId: NodeJS.Timeout;
	
	return (message: string) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(message), delay);
	};
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Apply ARIA labels for sorting
 */
export function setSortingAriaLabel(
	element: HTMLElement,
	column: string,
	sortOrder: 'asc' | 'desc' | 'none'
) {
	const orderText = sortOrder === 'asc' ? 'ascending' : sortOrder === 'desc' ? 'descending' : 'not sorted';
	element.setAttribute('aria-label', `Sort by ${column}, currently ${orderText}`);
	element.setAttribute('aria-sort', sortOrder);
}

/**
 * Create skip links for keyboard navigation
 */
export function createSkipLink(targetId: string, text = 'Skip to main content'): HTMLAnchorElement {
	const link = document.createElement('a');
	link.href = `#${targetId}`;
	link.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded z-50';
	link.textContent = text;
	
	link.addEventListener('click', (e) => {
		e.preventDefault();
		const target = document.getElementById(targetId);
		if (target) {
			target.focus();
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	});
	
	return link;
}

/**
 * Handle roving tabindex for composite widgets
 */
export class RovingTabIndex {
	private items: HTMLElement[];
	private currentIndex = 0;
	
	constructor(items: HTMLElement[] | NodeListOf<HTMLElement>) {
		this.items = Array.from(items);
		this.init();
	}
	
	private init() {
		this.items.forEach((item, index) => {
			item.setAttribute('tabindex', index === 0 ? '0' : '-1');
			
			item.addEventListener('keydown', (e) => this.handleKeyDown(e as KeyboardEvent));
			item.addEventListener('click', () => this.setCurrentIndex(index));
		});
	}
	
	private handleKeyDown(e: KeyboardEvent) {
		let newIndex = this.currentIndex;
		
		switch (e.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				e.preventDefault();
				newIndex = (this.currentIndex + 1) % this.items.length;
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				e.preventDefault();
				newIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
				break;
			case 'Home':
				e.preventDefault();
				newIndex = 0;
				break;
			case 'End':
				e.preventDefault();
				newIndex = this.items.length - 1;
				break;
		}
		
		if (newIndex !== this.currentIndex) {
			this.setCurrentIndex(newIndex);
			this.items[newIndex].focus();
		}
	}
	
	private setCurrentIndex(index: number) {
		// Update tabindex
		this.items[this.currentIndex].setAttribute('tabindex', '-1');
		this.items[index].setAttribute('tabindex', '0');
		this.currentIndex = index;
	}
	
	public destroy() {
		// Clean up if needed
	}
}

/**
 * Format file size for screen readers
 */
export function formatFileSizeForScreenReader(bytes: number): string {
	const units = ['bytes', 'kilobytes', 'megabytes', 'gigabytes'];
	let size = bytes;
	let unitIndex = 0;
	
	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}
	
	return `${Math.round(size)} ${units[unitIndex]}`;
}

/**
 * Generate descriptive text for file icons
 */
export function getFileTypeDescription(mimeType: string): string {
	const typeMap: Record<string, string> = {
		'application/pdf': 'PDF document',
		'image/jpeg': 'JPEG image',
		'image/png': 'PNG image',
		'image/gif': 'GIF image',
		'image/svg+xml': 'SVG image',
		'video/mp4': 'MP4 video',
		'audio/mpeg': 'MP3 audio',
		'application/zip': 'ZIP archive',
		'text/plain': 'Text file',
		'text/html': 'HTML document',
		'text/css': 'CSS stylesheet',
		'text/javascript': 'JavaScript file',
		'application/json': 'JSON file',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word document',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel spreadsheet',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint presentation'
	};
	
	return typeMap[mimeType] || 'File';
}