import { BaseComponentProps } from "../../types.ts";

export interface ModalProps extends BaseComponentProps {
  open?: boolean;
  title?: string;
  backdrop?: boolean;
  responsive?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  onBackdropClick?: () => void;
}

export function Modal({
  children,
  class: className = "",
  open = false,
  title,
  backdrop = true,
  responsive = true,
  id,
  ...props
}: ModalProps) {
  if (!open) return null;

  const modalClasses = [
    "modal",
    open ? "modal-open" : "",
    className,
  ].filter(Boolean).join(" ");

  const modalBoxClasses = [
    "modal-box",
    responsive ? "w-11/12 max-w-5xl" : "",
  ].filter(Boolean).join(" ");

  return (
    <div class={modalClasses} id={id} {...props}>
      <div class={modalBoxClasses}>
        {title && <h3 class="font-bold text-lg mb-4">{title}</h3>}
        {children}
      </div>
      {backdrop && <div class="modal-backdrop"></div>}
    </div>
  );
}
