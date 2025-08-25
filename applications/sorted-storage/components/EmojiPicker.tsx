import { useState } from "preact/hooks";
import EmojiPickerPortal from "../islands/EmojiPickerPortal.tsx";

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  placeholder?: string;
}

export default function EmojiPicker({ value, onChange, placeholder = "Select emoji" }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClear = () => {
    onChange("");
  };

  return (
    <>
      {/* Input Field */}
      <div class="form-control">
        <label class="label">
          <span class="label-text">Emoji</span>
        </label>
        <div class="input-group">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            class="input input-bordered flex items-center justify-between w-full"
          >
            <span class="text-2xl">
              {value || <span class="text-base text-base-content/50">{placeholder}</span>}
            </span>
            <svg class="w-4 h-4 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {value && (
            <button
              type="button"
              onClick={handleClear}
              class="btn btn-square"
              title="Clear emoji"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Emoji Picker Modal - Rendered via Portal */}
      <EmojiPickerPortal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={onChange}
        currentEmoji={value}
      />
    </>
  );
}