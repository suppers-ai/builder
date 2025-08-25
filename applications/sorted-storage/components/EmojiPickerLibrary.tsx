import { useEffect, useRef } from "preact/hooks";

interface EmojiPickerLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  currentEmoji?: string;
}

export default function EmojiPickerLibrary({ isOpen, onClose, onSelect, currentEmoji }: EmojiPickerLibraryProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && pickerRef.current && !pickerInstanceRef.current) {
      // Dynamically import the library to avoid SSR issues
      import("emoji-picker-element").then(({ Picker }) => {
        const picker = new Picker({
          dataSource: "https://cdn.jsdelivr.net/npm/emoji-picker-element-data@^1/en/emojibase/data.json",
          skinToneEmoji: "🖐️",
          theme: "auto", // Will use light/dark based on system theme
          perLine: 8,
          emojiSize: 32,
          emojiButtonRadius: "8px",
          maxSearchResults: 50,
          navPosition: "bottom",
          noCountryFlags: false,
          previewPosition: "none", // Disable preview for cleaner look
          showSearchBar: true,
          showSkinTonePicker: false,
          showCategoryButtons: true,
        });

        // Add custom styles
        const style = document.createElement("style");
        style.textContent = `
          emoji-picker {
            --background: hsl(var(--b1));
            --border-color: hsl(var(--bc) / 0.2);
            --button-active-background: hsl(var(--p) / 0.2);
            --button-hover-background: hsl(var(--b2));
            --category-emoji-size: 20px;
            --emoji-size: 28px;
            --indicator-color: hsl(var(--p));
            --input-border-color: hsl(var(--bc) / 0.2);
            --input-font-color: hsl(var(--bc));
            --input-placeholder-color: hsl(var(--bc) / 0.5);
            --outline-color: hsl(var(--p));
            --num-columns: 8;
            --emoji-padding: 0.5rem;
            border-radius: 1rem;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
            max-width: 420px;
            width: 100%;
          }
          
          emoji-picker input.search {
            padding: 0.75rem !important;
            border-radius: 0.5rem !important;
            font-size: 0.875rem !important;
          }
          
          emoji-picker .nav {
            padding: 0.5rem !important;
          }
          
          emoji-picker button.emoji {
            border-radius: 0.5rem !important;
          }
          
          emoji-picker button.emoji:hover {
            transform: scale(1.1);
            transition: transform 0.15s;
          }
        `;
        document.head.appendChild(style);

        pickerRef.current?.appendChild(picker);
        pickerInstanceRef.current = picker;

        // Listen for emoji selection
        picker.addEventListener("emoji-click", (event: any) => {
          onSelect(event.detail.unicode);
          onClose();
        });
      });
    }

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
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
        class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        style="z-index: 99998;"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style="z-index: 99999;"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          class="absolute -top-2 -right-2 btn btn-circle btn-sm bg-base-100 hover:bg-base-200 shadow-lg z-10"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Emoji Picker Container */}
        <div ref={pickerRef} class="bg-base-100 rounded-xl overflow-hidden"></div>
      </div>
    </>
  );
}