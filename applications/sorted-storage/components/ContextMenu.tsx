import { useEffect, useRef } from "preact/hooks";

interface ContextMenuItem {
  label: string;
  icon?: string;
  action: () => void;
  divider?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      class="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[200px]"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {items.map((item, index) => (
        item.divider ? (
          <hr key={index} class="my-2 border-gray-200" />
        ) : (
          <button
            key={index}
            onClick={() => {
              item.action();
              onClose();
            }}
            class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-sm"
          >
            {item.icon && <span class="text-gray-600">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        )
      ))}
    </div>
  );
}