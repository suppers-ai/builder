/**
 * ItemMetadataEditor for editing name, description, and emoji
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { useState } from "preact/hooks";
import type { StorageMetadata, StorageObject } from "../types/storage.ts";
import { Badge, Button, Input, Modal, Textarea } from "@suppers/ui-lib";

interface ItemMetadataEditorProps {
  item: StorageObject;
  isOpen: boolean;
  onClose: () => void;
  onSave: (metadata: StorageMetadata) => Promise<void>;
  className?: string;
}

// Common emojis for quick selection
const COMMON_EMOJIS = [
  "📁",
  "📄",
  "📝",
  "📊",
  "📽️",
  "🖼️",
  "🎵",
  "🎥",
  "📦",
  "⭐",
  "❤️",
  "🔥",
  "💡",
  "🎯",
  "🚀",
  "🎨",
  "🔧",
  "📚",
  "🏠",
  "💼",
  "🎮",
  "🍕",
  "🌟",
  "🎉",
  "🔒",
  "📱",
  "💻",
];

// Folder color options
const FOLDER_COLORS = [
  { name: "Blue", value: "primary", class: "bg-primary" },
  { name: "Green", value: "success", class: "bg-success" },
  { name: "Yellow", value: "warning", class: "bg-warning" },
  { name: "Red", value: "error", class: "bg-error" },
  { name: "Purple", value: "secondary", class: "bg-secondary" },
  { name: "Orange", value: "accent", class: "bg-accent" },
  { name: "Gray", value: "neutral", class: "bg-neutral" },
];

export function ItemMetadataEditor({
  item,
  isOpen,
  onClose,
  onSave,
  className = "",
}: ItemMetadataEditorProps) {
  const [customName, setCustomName] = useState(item.metadata?.custom_name || "");
  const [description, setDescription] = useState(item.metadata?.description || "");
  const [emoji, setEmoji] = useState(item.metadata?.emoji || "");
  const [folderColor, setFolderColor] = useState(item.metadata?.folder_color || "primary");
  const [tags, setTags] = useState<string[]>(item.metadata?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const metadata: StorageMetadata = {
        ...item.metadata,
        custom_name: customName.trim() || undefined,
        description: description.trim() || undefined,
        emoji: emoji || undefined,
        folder_color: item.object_type === "folder" ? folderColor : undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      await onSave(metadata);
      onClose();
    } catch (error) {
      console.error("Failed to save metadata:", error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleEmojiSelect = (selectedEmoji: string) => {
    setEmoji(selectedEmoji);
  };

  return (
    <Modal
      open={isOpen}
      title={`Edit ${item.object_type === "folder" ? "Folder" : "File"}`}
      class={className}
    >
      <div class="space-y-6">
        {/* Original Name Display */}
        <div>
          <label class="label">
            <span class="label-text font-medium">Original Name</span>
          </label>
          <div class="p-3 bg-base-200 rounded-lg text-sm text-base-content/70">
            {item.name}
          </div>
        </div>

        {/* Custom Name */}
        <div>
          <label class="label">
            <span class="label-text font-medium">Display Name</span>
            <span class="label-text-alt">Optional custom name</span>
          </label>
          <Input
            type="text"
            placeholder="Enter custom name..."
            value={customName}
            onChange={(e) => setCustomName((e.target as HTMLInputElement).value)}
            class="w-full"
          />
        </div>

        {/* Emoji Selection */}
        <div>
          <label class="label">
            <span class="label-text font-medium">Emoji</span>
            <span class="label-text-alt">Choose an emoji icon</span>
          </label>

          <div class="space-y-3">
            {/* Current Emoji Display */}
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 flex items-center justify-center bg-base-200 rounded-lg text-2xl">
                {emoji || "📄"}
              </div>
              <Input
                type="text"
                placeholder="Or type emoji..."
                value={emoji}
                onChange={(e) => setEmoji((e.target as HTMLInputElement).value)}
                class="flex-1"
              />
              {emoji && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEmoji("")}
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Emoji Grid */}
            <div class="grid grid-cols-9 gap-2 p-3 bg-base-100 rounded-lg border">
              {COMMON_EMOJIS.map((emojiOption) => (
                <button
                  key={emojiOption}
                  type="button"
                  class={`w-8 h-8 flex items-center justify-center rounded hover:bg-base-200 transition-colors ${
                    emoji === emojiOption ? "bg-primary/20 ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleEmojiSelect(emojiOption)}
                >
                  {emojiOption}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Folder Color (only for folders) */}
        {item.object_type === "folder" && (
          <div>
            <label class="label">
              <span class="label-text font-medium">Folder Color</span>
              <span class="label-text-alt">Choose a color theme</span>
            </label>

            <div class="grid grid-cols-4 gap-3">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  class={`p-3 rounded-lg border-2 transition-all ${
                    folderColor === color.value
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-base-300 hover:border-base-400"
                  }`}
                  onClick={() => setFolderColor(color.value)}
                >
                  <div class={`w-6 h-6 ${color.class} rounded mx-auto mb-1`}></div>
                  <span class="text-xs">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label class="label">
            <span class="label-text font-medium">Description</span>
            <span class="label-text-alt">Optional description</span>
          </label>
          <Textarea
            placeholder="Enter description..."
            value={description}
            onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
            rows={3}
            class="w-full"
          />
        </div>

        {/* Tags */}
        <div>
          <label class="label">
            <span class="label-text font-medium">Tags</span>
            <span class="label-text-alt">Add tags for organization</span>
          </label>

          <div class="space-y-3">
            {/* Add Tag Input */}
            <div class="flex gap-2">
              <Input
                type="text"
                name="newTag"
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag((e.target as HTMLInputElement).value)}
                class="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!newTag.trim() || tags.includes(newTag.trim())}
              >
                Add
              </Button>
            </div>

            {/* Tags Display */}
            {tags.length > 0 && (
              <div class="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    class="gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      class="hover:text-error"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          loading={isLoading}
        >
          Save Changes
        </Button>
      </div>
    </Modal>
  );
}
