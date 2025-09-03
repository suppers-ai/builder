import { writable, derived, get } from 'svelte/store';
import type { FileItem, FolderItem } from '$lib/types/storage';

export interface SearchFilter {
	type?: 'all' | 'file' | 'folder' | 'image' | 'document' | 'video' | 'audio' | 'archive';
	dateRange?: {
		from?: Date;
		to?: Date;
	};
	sizeRange?: {
		min?: number;
		max?: number;
	};
	owner?: string;
	shared?: boolean;
	extension?: string[];
	tags?: string[];
}

export interface SearchOptions {
	query: string;
	filters: SearchFilter;
	sortBy: 'relevance' | 'name' | 'date' | 'size';
	sortOrder: 'asc' | 'desc';
	limit?: number;
}

export interface SearchResult {
	item: FileItem | FolderItem;
	score: number;
	highlights: {
		field: string;
		matches: Array<{ start: number; end: number }>;
	}[];
}

export interface RecentSearch {
	query: string;
	filters: SearchFilter;
	timestamp: Date;
	resultCount: number;
}

class SearchStore {
	// Core search state
	private query = writable('');
	private filters = writable<SearchFilter>({});
	private isSearching = writable(false);
	private results = writable<SearchResult[]>([]);
	private recentSearches = writable<RecentSearch[]>([]);
	private suggestions = writable<string[]>([]);
	
	// Public stores
	query$ = { subscribe: this.query.subscribe };
	filters$ = { subscribe: this.filters.subscribe };
	isSearching$ = { subscribe: this.isSearching.subscribe };
	results$ = { subscribe: this.results.subscribe };
	recentSearches$ = { subscribe: this.recentSearches.subscribe };
	suggestions$ = { subscribe: this.suggestions.subscribe };
	
	// Derived stores
	hasActiveFilters$ = derived(this.filters, ($filters) => {
		return Object.keys($filters).length > 0;
	});
	
	resultCount$ = derived(this.results, ($results) => $results.length);
	
	constructor() {
		// Load recent searches from localStorage
		this.loadRecentSearches();
		
		// Auto-save recent searches
		this.recentSearches.subscribe(searches => {
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('recentSearches', JSON.stringify(searches.slice(0, 10)));
			}
		});
	}
	
	/**
	 * Perform a search with the given query and filters
	 */
	async search(options: SearchOptions): Promise<void> {
		this.isSearching.set(true);
		this.query.set(options.query);
		this.filters.set(options.filters);
		
		try {
			// TODO: Replace with actual API call
			const results = await this.performSearch(options);
			this.results.set(results);
			
			// Add to recent searches
			if (options.query.trim()) {
				this.addRecentSearch({
					query: options.query,
					filters: options.filters,
					timestamp: new Date(),
					resultCount: results.length
				});
			}
			
			// Generate suggestions based on results
			this.generateSuggestions(results);
		} catch (error) {
			console.error('Search failed:', error);
			this.results.set([]);
		} finally {
			this.isSearching.set(false);
		}
	}
	
	/**
	 * Quick search with just a query string
	 */
	async quickSearch(query: string): Promise<void> {
		return this.search({
			query,
			filters: {},
			sortBy: 'relevance',
			sortOrder: 'desc'
		});
	}
	
	/**
	 * Perform the actual search (mock implementation)
	 */
	private async performSearch(options: SearchOptions): Promise<SearchResult[]> {
		// Mock implementation - replace with API call
		const { query, filters } = options;
		
		// Simulate API delay
		await new Promise(resolve => setTimeout(resolve, 300));
		
		// Mock data for demonstration
		const allItems: (FileItem | FolderItem)[] = [
			// Add mock items here or fetch from storage store
		];
		
		// Filter and score items
		const results: SearchResult[] = [];
		
		for (const item of allItems) {
			const score = this.calculateScore(item, query, filters);
			if (score > 0) {
				results.push({
					item,
					score,
					highlights: this.getHighlights(item, query)
				});
			}
		}
		
		// Sort by relevance
		results.sort((a, b) => b.score - a.score);
		
		// Apply limit if specified
		if (options.limit) {
			return results.slice(0, options.limit);
		}
		
		return results;
	}
	
	/**
	 * Calculate relevance score for an item
	 */
	private calculateScore(
		item: FileItem | FolderItem,
		query: string,
		filters: SearchFilter
	): number {
		let score = 0;
		const lowerQuery = query.toLowerCase();
		const lowerName = item.name.toLowerCase();
		
		// Name matching
		if (lowerName === lowerQuery) {
			score += 100; // Exact match
		} else if (lowerName.startsWith(lowerQuery)) {
			score += 75; // Starts with query
		} else if (lowerName.includes(lowerQuery)) {
			score += 50; // Contains query
		}
		
		// Apply filter bonuses
		if (filters.type && this.matchesType(item, filters.type)) {
			score += 20;
		}
		
		if (filters.dateRange && this.matchesDateRange(item, filters.dateRange)) {
			score += 15;
		}
		
		if (filters.owner && 'owner' in item && item.owner?.id === filters.owner) {
			score += 10;
		}
		
		return score;
	}
	
	/**
	 * Get text highlights for search results
	 */
	private getHighlights(
		item: FileItem | FolderItem,
		query: string
	): SearchResult['highlights'] {
		const highlights: SearchResult['highlights'] = [];
		const lowerQuery = query.toLowerCase();
		const lowerName = item.name.toLowerCase();
		
		// Find matches in name
		let index = lowerName.indexOf(lowerQuery);
		while (index !== -1) {
			highlights.push({
				field: 'name',
				matches: [{ start: index, end: index + query.length }]
			});
			index = lowerName.indexOf(lowerQuery, index + 1);
		}
		
		return highlights;
	}
	
	/**
	 * Check if item matches type filter
	 */
	private matchesType(item: FileItem | FolderItem, type: string): boolean {
		if (type === 'all') return true;
		if (type === 'folder') return item.type === 'folder';
		if (type === 'file') return item.type === 'file';
		
		if (item.type === 'file') {
			const mimeType = (item as FileItem).mimeType;
			switch (type) {
				case 'image':
					return mimeType.startsWith('image/');
				case 'document':
					return mimeType.includes('document') || 
						   mimeType.includes('text/') ||
						   mimeType.includes('pdf');
				case 'video':
					return mimeType.startsWith('video/');
				case 'audio':
					return mimeType.startsWith('audio/');
				case 'archive':
					return mimeType.includes('zip') || 
						   mimeType.includes('tar') ||
						   mimeType.includes('rar');
			}
		}
		
		return false;
	}
	
	/**
	 * Check if item matches date range
	 */
	private matchesDateRange(
		item: FileItem | FolderItem,
		range: { from?: Date; to?: Date }
	): boolean {
		const itemDate = item.modifiedAt;
		if (range.from && itemDate < range.from) return false;
		if (range.to && itemDate > range.to) return false;
		return true;
	}
	
	/**
	 * Generate search suggestions
	 */
	private generateSuggestions(results: SearchResult[]): void {
		const suggestions = new Set<string>();
		
		// Add file extensions
		results.forEach(result => {
			if (result.item.type === 'file') {
				const ext = result.item.name.split('.').pop();
				if (ext) suggestions.add(`*.${ext}`);
			}
		});
		
		// Add common prefixes
		const names = results.map(r => r.item.name);
		const prefixes = this.findCommonPrefixes(names);
		prefixes.forEach(p => suggestions.add(p));
		
		this.suggestions.set(Array.from(suggestions).slice(0, 5));
	}
	
	/**
	 * Find common prefixes in file names
	 */
	private findCommonPrefixes(names: string[]): string[] {
		const prefixes = new Map<string, number>();
		
		for (const name of names) {
			for (let i = 3; i <= Math.min(name.length, 10); i++) {
				const prefix = name.substring(0, i);
				prefixes.set(prefix, (prefixes.get(prefix) || 0) + 1);
			}
		}
		
		return Array.from(prefixes.entries())
			.filter(([_, count]) => count >= 2)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map(([prefix]) => prefix);
	}
	
	/**
	 * Add a recent search
	 */
	private addRecentSearch(search: RecentSearch): void {
		this.recentSearches.update(searches => {
			// Remove duplicates
			const filtered = searches.filter(
				s => s.query !== search.query || 
					 JSON.stringify(s.filters) !== JSON.stringify(search.filters)
			);
			// Add new search at beginning
			return [search, ...filtered].slice(0, 10);
		});
	}
	
	/**
	 * Load recent searches from localStorage
	 */
	private loadRecentSearches(): void {
		if (typeof localStorage !== 'undefined') {
			try {
				const stored = localStorage.getItem('recentSearches');
				if (stored) {
					const searches = JSON.parse(stored);
					// Convert date strings back to Date objects
					searches.forEach((s: any) => {
						s.timestamp = new Date(s.timestamp);
					});
					this.recentSearches.set(searches);
				}
			} catch (error) {
				console.error('Failed to load recent searches:', error);
			}
		}
	}
	
	/**
	 * Clear search results
	 */
	clearSearch(): void {
		this.query.set('');
		this.filters.set({});
		this.results.set([]);
		this.suggestions.set([]);
	}
	
	/**
	 * Clear recent searches
	 */
	clearRecentSearches(): void {
		this.recentSearches.set([]);
	}
	
	/**
	 * Apply a recent search
	 */
	applyRecentSearch(search: RecentSearch): void {
		this.search({
			query: search.query,
			filters: search.filters,
			sortBy: 'relevance',
			sortOrder: 'desc'
		});
	}
	
	/**
	 * Update filters
	 */
	updateFilters(filters: Partial<SearchFilter>): void {
		this.filters.update(f => ({ ...f, ...filters }));
	}
	
	/**
	 * Remove a specific filter
	 */
	removeFilter(key: keyof SearchFilter): void {
		this.filters.update(f => {
			const newFilters = { ...f };
			delete newFilters[key];
			return newFilters;
		});
	}
}

export const searchStore = new SearchStore();