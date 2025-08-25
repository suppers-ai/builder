import { useState, useEffect, useRef } from "preact/hooks";

interface EmojiPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  currentEmoji?: string;
}

// Popular emojis organized by category
const EMOJI_CATEGORIES = {
  "Recent": ["📁", "📂", "📄", "⭐", "❤️", "📌", "🔗", "✨"],
  "Files": ["📁", "📂", "🗂️", "🗃️", "🗄️", "📦", "📤", "📥", "📫", "📪", "💾", "💿", "📀", "🖥️", "💻"],
  "Docs": ["📄", "📃", "📑", "📜", "📋", "📝", "📰", "🗞️", "📓", "📔", "📕", "📗", "📘", "📙", "📚"],
  "Work": ["💼", "📊", "📈", "📉", "📐", "📏", "🖇️", "📍", "✂️", "🖊️", "🖋️", "✒️", "📌", "📎", "🔍"],
  "Stars": ["⭐", "✨", "💫", "🌟", "🌠", "💥", "✴️", "❇️", "🔆", "🌞", "☀️", "🌝", "🌛", "🌜", "🌚"],
  "Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💗", "💖", "💕", "💓", "💔", "❣️"],
  "Tech": ["💻", "🖥️", "⌨️", "🖱️", "💽", "💾", "💿", "📀", "🔌", "🔋", "📱", "☎️", "📞", "📟", "📠"],
  "Fun": ["🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🎮", "🎲", "🎯", "🎳", "🎪", "🎨", "🎭", "🎬", "🎤"],
};

export default function EmojiPickerModal({ isOpen, onClose, onSelect, currentEmoji }: EmojiPickerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Recent");

  // Filter emojis based on search
  const getFilteredEmojis = () => {
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      const results = new Set<string>();
      
      // Search through all categories
      Object.entries(EMOJI_CATEGORIES).forEach(([category, emojis]) => {
        if (category.toLowerCase().includes(searchLower)) {
          emojis.forEach(emoji => results.add(emoji));
        }
      });
      
      // If no category matches, return all emojis
      if (results.size === 0) {
        Object.values(EMOJI_CATEGORIES).forEach(emojis => {
          emojis.forEach(emoji => results.add(emoji));
        });
      }
      
      return Array.from(results);
    }
    return EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES] || [];
  };

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji);
    onClose();
    setSearch("");
  };

  const handleClose = () => {
    onClose();
    setSearch("");
    setSelectedCategory("Recent");
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        class="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-200"
        style="z-index: 99998;"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-base-100 rounded-2xl shadow-2xl border border-base-300"
        style="z-index: 99999; width: 420px; max-width: 90vw; max-height: 520px;"
      >
        {/* Header */}
        <div class="flex items-center justify-between px-5 py-4 border-b border-base-300">
          <h3 class="font-semibold text-base">Choose an emoji</h3>
          <button
            onClick={handleClose}
            class="btn btn-ghost btn-sm btn-circle hover:bg-base-200"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div class="px-5 py-3">
          <div class="relative">
            <input
              type="text"
              placeholder="Search emojis..."
              class="input input-bordered w-full pr-10 h-10 text-sm"
              value={search}
              onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                class="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        {!search && (
          <div class="px-5 pb-3">
            <div class="flex gap-1 overflow-x-auto no-scrollbar">
              {Object.keys(EMOJI_CATEGORIES).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  class={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? "bg-primary text-primary-content"
                      : "bg-base-200 hover:bg-base-300 text-base-content"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Emoji Grid */}
        <div class="px-5 pb-5 overflow-y-auto" style="max-height: 300px;">
          {getFilteredEmojis().length > 0 ? (
            <div class="grid grid-cols-8 gap-1">
              {getFilteredEmojis().map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  class={`
                    aspect-square flex items-center justify-center text-2xl
                    rounded-lg transition-all duration-150
                    hover:bg-base-200 hover:scale-110
                    active:scale-95
                    ${currentEmoji === emoji ? "bg-primary/20 ring-2 ring-primary" : ""}
                  `}
                  title={emoji}
                >
                  <span style="font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif;">
                    {emoji}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div class="text-center py-12 text-base-content/50">
              <div class="text-5xl mb-3 opacity-50">🔍</div>
              <p class="text-sm">No emojis found</p>
              <p class="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer with recently used */}
        <div class="border-t border-base-300 px-5 py-3 bg-base-200/30">
          <div class="flex items-center justify-between">
            <span class="text-xs text-base-content/60 font-medium">RECENTLY USED</span>
            {currentEmoji && (
              <button
                onClick={() => handleEmojiSelect("")}
                class="text-xs text-error hover:underline"
              >
                Clear selection
              </button>
            )}
          </div>
          <div class="flex gap-1 mt-2">
            {["📁", "📄", "⭐", "❤️", "📌", "✨", "🎯", "🚀"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                class={`
                  p-1.5 text-xl rounded-lg transition-all
                  hover:bg-base-300 hover:scale-110
                  ${currentEmoji === emoji ? "bg-primary/20 ring-1 ring-primary" : ""}
                `}
              >
                <span style="font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif;">
                  {emoji}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}