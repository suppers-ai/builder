import { BaseComponentProps } from "../../types.ts";

export interface ChatBubbleProps extends BaseComponentProps {
  message: string;
  time?: string;
  avatar?: string;
  name?: string;
  position?: "start" | "end";
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "info";
  isTyping?: boolean;
  // Controlled mode props
  onMessageClick?: () => void;
  onAvatarClick?: () => void;
}

export function ChatBubble({
  class: className = "",
  message,
  time,
  avatar,
  name,
  position = "start",
  color,
  isTyping = false,
  onMessageClick,
  onAvatarClick,
  id,
  ...props
}: ChatBubbleProps) {
  const chatClasses = [
    "chat",
    position === "end" ? "chat-end" : "chat-start",
    className,
  ].filter(Boolean).join(" ");

  const bubbleClasses = [
    "chat-bubble",
    color ? `chat-bubble-${color}` : "",
    onMessageClick ? "cursor-pointer hover:opacity-80" : "",
  ].filter(Boolean).join(" ");

  return (
    <div class={chatClasses} id={id} {...props}>
      {avatar && (
        <div
          class={`chat-image avatar ${onAvatarClick ? "cursor-pointer" : ""}`}
          onClick={onAvatarClick}
        >
          <div class="w-10 rounded-full">
            <img src={avatar} alt={name || "User"} />
          </div>
        </div>
      )}

      {name && (
        <div class="chat-header">
          {name}
          {time && <time class="text-xs opacity-50 ml-1">{time}</time>}
        </div>
      )}

      <div class={bubbleClasses} onClick={onMessageClick}>
        {isTyping
          ? (
            <div class="flex items-center space-x-1">
              <div class="typing">
                <span class="circle scaling"></span>
                <span class="circle scaling"></span>
                <span class="circle scaling"></span>
              </div>
            </div>
          )
          : message}
      </div>

      {time && !name && (
        <div class="chat-footer opacity-50">
          <time class="text-xs">{time}</time>
        </div>
      )}
    </div>
  );
}
