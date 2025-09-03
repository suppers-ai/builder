/**
 * Keyboard shortcuts management for the application
 */

export interface KeyboardShortcut {
	keys: string[];
	description: string;
	handler: () => void;
	preventDefault?: boolean;
	allowInInput?: boolean;
	global?: boolean;
}

export class KeyboardShortcutManager {
	private shortcuts: Map<string, KeyboardShortcut> = new Map();
	private enabled = true;
	
	constructor() {
		this.handleKeyDown = this.handleKeyDown.bind(this);
		window.addEventListener('keydown', this.handleKeyDown);
	}
	
	/**
	 * Register a keyboard shortcut
	 */
	register(shortcut: KeyboardShortcut) {
		const key = this.getShortcutKey(shortcut.keys);
		this.shortcuts.set(key, shortcut);
	}
	
	/**
	 * Unregister a keyboard shortcut
	 */
	unregister(keys: string[]) {
		const key = this.getShortcutKey(keys);
		this.shortcuts.delete(key);
	}
	
	/**
	 * Enable/disable all shortcuts
	 */
	setEnabled(enabled: boolean) {
		this.enabled = enabled;
	}
	
	/**
	 * Get all registered shortcuts
	 */
	getShortcuts(): KeyboardShortcut[] {
		return Array.from(this.shortcuts.values());
	}
	
	/**
	 * Handle keydown events
	 */
	private handleKeyDown(event: KeyboardEvent) {
		if (!this.enabled) return;
		
		// Check if typing in an input field
		const target = event.target as HTMLElement;
		const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
		
		// Build shortcut key from event
		const keys: string[] = [];
		if (event.ctrlKey || event.metaKey) keys.push('Ctrl');
		if (event.altKey) keys.push('Alt');
		if (event.shiftKey) keys.push('Shift');
		keys.push(event.key.toUpperCase());
		
		const key = this.getShortcutKey(keys);
		const shortcut = this.shortcuts.get(key);
		
		if (shortcut) {
			// Check if shortcut is allowed in input fields
			if (isInput && !shortcut.allowInInput && !shortcut.global) {
				return;
			}
			
			// Prevent default if needed
			if (shortcut.preventDefault !== false) {
				event.preventDefault();
			}
			
			// Execute handler
			shortcut.handler();
		}
	}
	
	/**
	 * Generate key from keys array
	 */
	private getShortcutKey(keys: string[]): string {
		return keys.map(k => k.toUpperCase()).join('+');
	}
	
	/**
	 * Cleanup
	 */
	destroy() {
		window.removeEventListener('keydown', this.handleKeyDown);
		this.shortcuts.clear();
	}
}

/**
 * Default keyboard shortcuts for the application
 */
export const defaultShortcuts: KeyboardShortcut[] = [
	// File operations
	{
		keys: ['Ctrl', 'N'],
		description: 'New folder',
		handler: () => document.dispatchEvent(new CustomEvent('shortcut:new-folder'))
	},
	{
		keys: ['Ctrl', 'U'],
		description: 'Upload files',
		handler: () => document.dispatchEvent(new CustomEvent('shortcut:upload'))
	},
	{
		keys: ['Delete'],
		description: 'Delete selected',
		handler: () => document.dispatchEvent(new CustomEvent('shortcut:delete')),
		allowInInput: false
	},
	{
		keys: ['F2'],
		description: 'Rename selected',
		handler: () => document.dispatchEvent(new CustomEvent('shortcut:rename'))
	},
	
	// Navigation
	{
		keys: ['Ctrl', 'F'],
		description: 'Focus search',
		handler: () => {
			const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
			searchInput?.focus();
		}
	},
	{
		keys: ['Ctrl', '1'],
		description: 'Grid view',
		handler: () => document.dispatchEvent(new CustomEvent('shortcut:view-grid'))
	},
	{
		keys: ['Ctrl', '2'],
		description: 'List view',
		handler: () => document.dispatchEvent(new CustomEvent('shortcut:view-list'))
	},
	{
		keys: ['Alt', 'ArrowLeft'],
		description: 'Go back',
		handler: () => window.history.back(),
		global: true
	},
	{
		keys: ['Alt', 'ArrowRight'],
		description: 'Go forward',
		handler: () => window.history.forward(),
		global: true
	},
	
	// Selection
	{
		keys: ['Ctrl', 'A'],
		description: 'Select all',
		handler: () => document.dispatchEvent(new CustomEvent('shortcut:select-all'))
	},
	{
		keys: ['Escape'],
		description: 'Clear selection',
		handler: () => document.dispatchEvent(new CustomEvent('shortcut:clear-selection')),
		allowInInput: false
	},
	
	// Clipboard
	{
		keys: ['Ctrl', 'C'],
		description: 'Copy selected',
		handler: () => document.dispatchEvent(new CustomEvent('shortcut:copy'))
	},
	{
		keys: ['Ctrl', 'X'],
		description: 'Cut selected',
		handler: () => document.dispatchEvent(new CustomEvent('shortcut:cut'))
	},
	{
		keys: ['Ctrl', 'V'],
		description: 'Paste',
		handler: () => document.dispatchEvent(new CustomEvent('shortcut:paste'))
	},
	
	// Application
	{
		keys: ['Ctrl', 'K'],
		description: 'Open command palette',
		handler: () => document.dispatchEvent(new CustomEvent('shortcut:command-palette'))
	},
	{
		keys: ['Ctrl', '/'],
		description: 'Show keyboard shortcuts',
		handler: () => document.dispatchEvent(new CustomEvent('shortcut:show-help'))
	},
	{
		keys: ['Ctrl', ','],
		description: 'Open settings',
		handler: () => document.dispatchEvent(new CustomEvent('shortcut:settings'))
	}
];

/**
 * Format shortcut keys for display
 */
export function formatShortcutKeys(keys: string[]): string {
	const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
	
	return keys.map(key => {
		switch (key) {
			case 'Ctrl':
				return isMac ? '⌘' : 'Ctrl';
			case 'Alt':
				return isMac ? '⌥' : 'Alt';
			case 'Shift':
				return isMac ? '⇧' : 'Shift';
			case 'Enter':
				return isMac ? '⏎' : 'Enter';
			case 'Delete':
				return isMac ? '⌫' : 'Del';
			case 'Escape':
				return 'Esc';
			case 'ArrowUp':
				return '↑';
			case 'ArrowDown':
				return '↓';
			case 'ArrowLeft':
				return '←';
			case 'ArrowRight':
				return '→';
			default:
				return key;
		}
	}).join(isMac ? '' : '+');
}