import { GlobalThemeController } from "@suppers/ui-lib";

export interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <GlobalThemeController
        showButton={false}
        onThemeChange={(theme) => {
          // Theme change happens automatically via global state
          onClose();
        }}
        onClose={onClose}
      />
    </div>
  );
}
