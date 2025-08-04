import { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { ArrowRight, Search, X } from "lucide-preact";
import { Modal } from "../modal/Modal.tsx";
import { Input } from "../../input/input/Input.tsx";
import { Button } from "../button/Button.tsx";
import { Kbd } from "../../display/kbd/Kbd.tsx";

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  searchResults?: SearchResult[];
  loading?: boolean;
  className?: string;
  children?: ComponentChildren;
  autoFocus?: boolean;
  showKeyboardShortcut?: boolean;
  maxResults?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  url?: string;
  category?: string;
  icon?: ComponentChildren;
}

export function SearchModal({
  isOpen,
  onClose,
  onSearch,
  placeholder = "Search components...",
  searchResults = [],
  loading = false,
  className = "",
  children,
  autoFocus = true,
  showKeyboardShortcut = true,
  maxResults = 10,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && autoFocus && inputRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, autoFocus]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        onClose();
        break;
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, Math.min(searchResults.length, maxResults) - 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        if (searchResults.length > 0 && selectedIndex < searchResults.length) {
          e.preventDefault();
          const selectedResult = searchResults[selectedIndex];
          if (selectedResult.url) {
            globalThis.location.href = selectedResult.url;
          }
          onClose();
        }
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, searchResults]);

  const displayedResults = searchResults.slice(0, maxResults);

  // For documentation purposes, show modal content as a static card
  const isDocumentationMode = typeof window === "undefined" ||
    window.location?.pathname?.includes("/components/");

  if (isDocumentationMode && !isOpen) {
    return (
      <div
        class={`w-full max-w-2xl mx-auto bg-base-100 rounded-lg shadow-lg border border-base-300 ${className}`}
      >
        <div class="p-6 border-b border-base-300">
          <div class="flex items-center gap-4">
            <div class="flex-1 relative">
              <div class="flex items-center">
                <Search size={20} class="absolute left-3 text-base-content/60" />
                <Input
                  type="text"
                  placeholder={placeholder}
                  value=""
                  class="pl-10 pr-4 w-full border-0 focus:ring-0 bg-transparent text-lg"
                  disabled
                />
              </div>
            </div>
            <div class="flex items-center gap-2">
              {showKeyboardShortcut && (
                <div class="hidden sm:flex items-center gap-1 text-xs text-base-content/60">
                  <div class="kbd kbd-sm">⌘</div>
                  <div class="kbd kbd-sm">K</div>
                </div>
              )}
              <button class="btn btn-ghost btn-square text-base-content/60">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div class="max-h-96 overflow-y-auto">
          {loading && (
            <div class="p-4 text-center">
              <div class="loading loading-spinner loading-md mx-auto"></div>
              <p class="text-sm text-base-content/60 mt-2">Searching...</p>
            </div>
          )}

          {!loading && displayedResults.length > 0 && (
            <div class="py-2">
              {displayedResults.map((result, index) => (
                <div
                  key={result.id}
                  class={`flex items-center gap-4 p-4 hover:bg-base-200 cursor-pointer border-l-4 transition-colors ${
                    index === 0 ? "bg-base-200 border-l-primary" : "border-l-transparent"
                  }`}
                >
                  {result.icon && (
                    <div class="flex-shrink-0 text-base-content/60">
                      {result.icon}
                    </div>
                  )}

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="font-medium text-base-content truncate">
                        {result.title}
                      </h3>
                      {result.category && (
                        <span class="badge badge-ghost badge-sm">
                          {result.category}
                        </span>
                      )}
                    </div>
                    {result.description && (
                      <p class="text-sm text-base-content/60 mt-1 line-clamp-2">
                        {result.description}
                      </p>
                    )}
                  </div>

                  <ArrowRight size={16} class="text-base-content/40 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}

          {!loading && displayedResults.length === 0 && (
            <div class="p-8 text-center">
              <Search size={48} class="mx-auto text-base-content/30 mb-4" />
              <p class="text-base-content/60">Start typing to search</p>
              {showKeyboardShortcut && (
                <p class="text-sm text-base-content/40 mt-1">
                  Use <kbd class="kbd kbd-sm">↑</kbd> <kbd class="kbd kbd-sm">↓</kbd> to navigate,
                  {" "}
                  <kbd class="kbd kbd-sm">Enter</kbd> to select
                </p>
              )}
            </div>
          )}

          {children}
        </div>

        {displayedResults.length === maxResults && searchResults.length > maxResults && (
          <div class="p-4 border-t border-base-300 text-center">
            <p class="text-sm text-base-content/60">
              Showing {maxResults} of {searchResults.length} results
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      class={`modal-top ${className}`}
      closeOnBackdrop
      showCloseButton={false}
    >
      <div class="modal-box w-full max-w-2xl mx-auto mt-16 p-0 bg-base-100">
        <div class="p-6 border-b border-base-300">
          <form onSubmit={handleSubmit} class="flex items-center gap-4">
            <div class="flex-1 relative">
              <div class="flex items-center">
                <Search size={20} class="absolute left-3 text-base-content/60" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder={placeholder}
                  value={searchQuery}
                  onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                  class="pl-10 pr-4 w-full border-0 focus:ring-0 bg-transparent text-lg"
                />
              </div>
            </div>

            <div class="flex items-center gap-2">
              {showKeyboardShortcut && (
                <div class="hidden sm:flex items-center gap-1 text-xs text-base-content/60">
                  <Kbd size="sm">⌘</Kbd>
                  <Kbd size="sm">K</Kbd>
                </div>
              )}
              <Button
                variant="ghost"
                shape="square"
                onClick={onClose}
                class="text-base-content/60 hover:text-base-content"
              >
                <X size={20} />
              </Button>
            </div>
          </form>
        </div>

        <div class="max-h-96 overflow-y-auto">
          {loading && (
            <div class="p-4 text-center">
              <div class="loading loading-spinner loading-md mx-auto"></div>
              <p class="text-sm text-base-content/60 mt-2">Searching...</p>
            </div>
          )}

          {!loading && searchQuery && displayedResults.length === 0 && (
            <div class="p-8 text-center">
              <Search size={48} class="mx-auto text-base-content/30 mb-4" />
              <p class="text-base-content/60">No results found for "{searchQuery}"</p>
              <p class="text-sm text-base-content/40 mt-1">Try a different search term</p>
            </div>
          )}

          {!loading && displayedResults.length > 0 && (
            <div class="py-2">
              {displayedResults.map((result, index) => (
                <a
                  key={result.id}
                  href={result.url}
                  class={`flex items-center gap-4 p-4 hover:bg-base-200 cursor-pointer border-l-4 transition-colors ${
                    index === selectedIndex
                      ? "bg-base-200 border-l-primary"
                      : "border-l-transparent"
                  }`}
                  onClick={() => onClose()}
                >
                  {result.icon && (
                    <div class="flex-shrink-0 text-base-content/60">
                      {result.icon}
                    </div>
                  )}

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="font-medium text-base-content truncate">
                        {result.title}
                      </h3>
                      {result.category && (
                        <span class="badge badge-ghost badge-sm">
                          {result.category}
                        </span>
                      )}
                    </div>
                    {result.description && (
                      <p class="text-sm text-base-content/60 mt-1 line-clamp-2">
                        {result.description}
                      </p>
                    )}
                  </div>

                  <ArrowRight size={16} class="text-base-content/40 flex-shrink-0" />
                </a>
              ))}
            </div>
          )}

          {!loading && !searchQuery && (
            <div class="p-8 text-center">
              <Search size={48} class="mx-auto text-base-content/30 mb-4" />
              <p class="text-base-content/60">Start typing to search</p>
              {showKeyboardShortcut && (
                <p class="text-sm text-base-content/40 mt-1">
                  Use <kbd class="kbd kbd-sm">↑</kbd> <kbd class="kbd kbd-sm">↓</kbd> to navigate,
                  {" "}
                  <kbd class="kbd kbd-sm">Enter</kbd> to select
                </p>
              )}
            </div>
          )}

          {children}
        </div>

        {displayedResults.length === maxResults && searchResults.length > maxResults && (
          <div class="p-4 border-t border-base-300 text-center">
            <p class="text-sm text-base-content/60">
              Showing {maxResults} of {searchResults.length} results
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
