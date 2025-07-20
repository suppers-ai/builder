// Search utility for fuzzy searching components
export interface SearchableComponent {
  name: string;
  description: string;
  category: string;
  tags: string[];
  path: string;
  keywords?: string[];
}

export interface SearchResult extends SearchableComponent {
  score: number;
  matchedFields: string[];
}

/**
 * Fuzzy search implementation
 * Returns a score from 0-1 where 1 is perfect match
 */
export function fuzzySearch(query: string, text: string): number {
  if (!query || !text) return 0;

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Exact match gets highest score
  if (textLower === queryLower) return 1;

  // Starts with query gets high score
  if (textLower.startsWith(queryLower)) return 0.9;

  // Contains query gets medium score
  if (textLower.includes(queryLower)) return 0.7;

  // Fuzzy matching - check for subsequence
  let queryIndex = 0;
  let textIndex = 0;
  let matches = 0;

  while (queryIndex < queryLower.length && textIndex < textLower.length) {
    if (queryLower[queryIndex] === textLower[textIndex]) {
      matches++;
      queryIndex++;
    }
    textIndex++;
  }

  if (matches === queryLower.length) {
    // All characters found in sequence
    return 0.5 * (matches / textLower.length);
  }

  return 0;
}

/**
 * Search components with fuzzy matching
 */
export function searchComponents(
  components: SearchableComponent[],
  query: string,
): SearchResult[] {
  if (!query.trim()) return [];

  const results: SearchResult[] = [];

  for (const component of components) {
    const nameScore = fuzzySearch(query, component.name);
    const descriptionScore = fuzzySearch(query, component.description) * 0.8;
    const categoryScore = fuzzySearch(query, component.category) * 0.6;

    // Search in tags
    const tagScores = component.tags.map((tag) => fuzzySearch(query, tag) * 0.7);
    const bestTagScore = Math.max(...tagScores, 0);

    // Search in keywords if available
    const keywordScores = component.keywords
      ? component.keywords.map((keyword) => fuzzySearch(query, keyword) * 0.9)
      : [];
    const bestKeywordScore = Math.max(...keywordScores, 0);

    const maxScore = Math.max(
      nameScore,
      descriptionScore,
      categoryScore,
      bestTagScore,
      bestKeywordScore,
    );

    if (maxScore > 0.1) { // Minimum threshold
      const matchedFields: string[] = [];

      if (nameScore > 0.3) matchedFields.push("name");
      if (descriptionScore > 0.3) matchedFields.push("description");
      if (categoryScore > 0.3) matchedFields.push("category");
      if (bestTagScore > 0.3) matchedFields.push("tags");
      if (bestKeywordScore > 0.3) matchedFields.push("keywords");

      results.push({
        ...component,
        score: maxScore,
        matchedFields,
      });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Get search suggestions based on partial query
 */
export function getSearchSuggestions(
  components: SearchableComponent[],
  query: string,
  limit: number = 5,
): string[] {
  if (!query.trim()) return [];

  const suggestions = new Set<string>();
  const queryLower = query.toLowerCase();

  // Collect all searchable text
  const allTerms: string[] = [];

  for (const component of components) {
    allTerms.push(component.name);
    allTerms.push(component.category);
    allTerms.push(...component.tags);
    if (component.keywords) {
      allTerms.push(...component.keywords);
    }

    // Add words from description
    const descWords = component.description.toLowerCase().split(/\s+/);
    allTerms.push(...descWords.filter((word) => word.length > 3));
  }

  // Find terms that start with or contain the query
  for (const term of allTerms) {
    const termLower = term.toLowerCase();
    if (termLower.startsWith(queryLower) || termLower.includes(queryLower)) {
      suggestions.add(term);
      if (suggestions.size >= limit) break;
    }
  }

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Highlight matching text in search results
 */
export function highlightText(text: string, query: string): string {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
}

/**
 * Search categories and get component counts
 */
export function searchCategories(
  components: SearchableComponent[],
  query: string,
): Array<{ category: string; count: number; score: number }> {
  if (!query.trim()) return [];

  const categoryResults = new Map<string, { count: number; score: number }>();

  for (const component of components) {
    const score = fuzzySearch(query, component.category);
    if (score > 0.1) {
      const existing = categoryResults.get(component.category);
      if (existing) {
        existing.count++;
        existing.score = Math.max(existing.score, score);
      } else {
        categoryResults.set(component.category, { count: 1, score });
      }
    }
  }

  return Array.from(categoryResults.entries())
    .map(([category, { count, score }]) => ({ category, count, score }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Advanced search with filters
 */
export interface SearchFilters {
  category?: string;
  tags?: string[];
  minScore?: number;
}

export function advancedSearch(
  components: SearchableComponent[],
  query: string,
  filters: SearchFilters = {},
): SearchResult[] {
  let results = searchComponents(components, query);

  // Apply category filter
  if (filters.category) {
    results = results.filter((result) =>
      result.category.toLowerCase() === filters.category!.toLowerCase()
    );
  }

  // Apply tags filter
  if (filters.tags && filters.tags.length > 0) {
    results = results.filter((result) =>
      filters.tags!.some((tag) =>
        result.tags.some((resultTag) => resultTag.toLowerCase().includes(tag.toLowerCase()))
      )
    );
  }

  // Apply minimum score filter
  if (filters.minScore !== undefined) {
    results = results.filter((result) => result.score >= filters.minScore!);
  }

  return results;
}
