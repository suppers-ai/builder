import { useState, useEffect, useRef } from "preact/hooks";

interface EmojiPickerSimpleProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  currentEmoji?: string;
}

// Curated emoji list for file/folder organization
const EMOJI_DATA = {
  "Folders": ["📁", "📂", "🗂️", "🗃️", "🗄️", "📦", "🗳️", "📥", "📤", "🗑️"],
  "Files": ["📄", "📃", "📑", "📜", "📋", "📝", "📊", "📈", "📉", "📐"],
  "Office": ["💼", "📎", "📌", "📍", "🖇️", "📏", "✂️", "🖊️", "🖋️", "✒️"],
  "Tech": ["💻", "🖥️", "💾", "💿", "📀", "⌨️", "🖱️", "🖨️", "☎️", "📱"],
  "Colors": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💗"],
  "Stars": ["⭐", "🌟", "✨", "💫", "⚡", "🔥", "💥", "❄️", "☀️", "🌙"],
  "Flags": ["🚩", "🏁", "🏴", "🏳️", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣"],
  "Nature": ["🌲", "🌳", "🌴", "🌵", "🌷", "🌸", "🌹", "🌺", "🌻", "🌼"],
  "Food": ["🍎", "🍊", "🍋", "🍌", "🍇", "🍓", "🍑", "🍒", "🥑", "🍕"],
  "Travel": ["✈️", "🚀", "🚗", "🚕", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒"],
  "Activity": ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸"],
  "Music": ["🎵", "🎶", "🎼", "🎹", "🥁", "🎷", "🎺", "🎸", "🎻", "🎤"],
  "Games": ["🎮", "🎯", "🎲", "🎰", "🧩", "♟️", "🎭", "🎨", "🎬", "🎪"],
  "Symbols": ["✅", "❌", "⚠️", "📵", "🔇", "🔕", "🚫", "⛔", "🛑", "💯"],
  "Arrows": ["⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️", "↕️", "↔️"],
  "Numbers": ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]
};

const RECENT_KEY = 'emoji-picker-recent';
const MAX_RECENT = 16;

export default function EmojiPickerSimple({ isOpen, onClose, onSelect, currentEmoji }: EmojiPickerSimpleProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Folders");
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load recent emojis
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_KEY);
    if (stored) {
      try {
        setRecentEmojis(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Filter emojis based on search
  const getFilteredEmojis = () => {
    if (search.trim()) {
      const results: string[] = [];
      Object.entries(EMOJI_DATA).forEach(([category, emojis]) => {
        if (category.toLowerCase().includes(search.toLowerCase())) {
          emojis.forEach(e => {
            if (!results.includes(e)) results.push(e);
          });
        }
      });
      return results.length > 0 ? results : Object.values(EMOJI_DATA).flat();
    }
    return EMOJI_DATA[selectedCategory as keyof typeof EMOJI_DATA] || [];
  };

  const handleEmojiSelect = (emoji: string) => {
    // Update recent emojis
    const newRecent = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, MAX_RECENT);
    setRecentEmojis(newRecent);
    localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent));
    
    onSelect(emoji);
    onClose();
    setSearch("");
  };

  const handleClose = () => {
    onClose();
    setSearch("");
    setSelectedCategory("Folders");
  };

  // Handle escape key and click outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
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
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[99999] w-[480px] max-w-[95vw]"
      >
        <div class="bg-base-100 rounded-2xl shadow-2xl border border-base-300 overflow-hidden">
          {/* Header */}
          <div class="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-base-300">
            <h3 class="font-semibold text-lg">Pick an Emoji</h3>
            <button
              onClick={handleClose}
              class="btn btn-ghost btn-sm btn-circle"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <div class="p-4 border-b border-base-300">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search emojis..."
                class="input input-bordered w-full pl-10 pr-10"
                value={search}
                onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
                autoFocus
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          {!search && (
            <div class="px-4 py-3 border-b border-base-300 bg-base-200/30">
              <div class="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                {recentEmojis.length > 0 && (
                  <button
                    onClick={() => setSelectedCategory("Recent")}
                    class={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                      selectedCategory === "Recent"
                        ? "bg-primary text-primary-content shadow-sm"
                        : "bg-base-200 hover:bg-base-300"
                    }`}
                  >
                    Recent
                  </button>
                )}
                {Object.keys(EMOJI_DATA).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    class={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? "bg-primary text-primary-content shadow-sm"
                        : "bg-base-200 hover:bg-base-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Emoji Grid */}
          <div class="p-4 max-h-[320px] overflow-y-auto">
            <div class="grid grid-cols-10 gap-1">
              {(selectedCategory === "Recent" ? recentEmojis : getFilteredEmojis()).map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  class={`
                    aspect-square p-2 text-2xl rounded-xl transition-all
                    hover:bg-primary/20 hover:scale-125 hover:shadow-lg
                    active:scale-110
                    ${currentEmoji === emoji ? "bg-primary/30 ring-2 ring-primary shadow-md" : "hover:bg-base-200"}
                  `}
                  title={emoji}
                >
                  <span class="block" style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;">
                    {emoji}
                  </span>
                </button>
              ))}
            </div>
            {getFilteredEmojis().length === 0 && (
              <div class="text-center py-8 text-base-content/50">
                <div class="text-4xl mb-2">🔍</div>
                <p>No emojis found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {currentEmoji && (
            <div class="px-4 py-3 border-t border-base-300 bg-base-200/30 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-sm text-base-content/60">Current:</span>
                <span class="text-2xl">{currentEmoji}</span>
              </div>
              <button
                onClick={() => handleEmojiSelect("")}
                class="btn btn-ghost btn-xs text-error"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}