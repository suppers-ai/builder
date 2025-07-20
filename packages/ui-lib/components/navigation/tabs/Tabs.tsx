import { BaseComponentProps, SizeProps } from "../../types.ts";
import { ComponentChildren } from "preact";

export interface TabProps extends BaseComponentProps, SizeProps {
  tabs: TabItemProps[];
  activeTab?: string;
  bordered?: boolean;
  lifted?: boolean;
  boxed?: boolean;
  // Controlled mode props
  onTabChange?: (tabId: string) => void;
}

export interface TabItemProps {
  id: string;
  label: string;
  content: ComponentChildren;
  disabled?: boolean;
}

export function Tabs({
  class: className = "",
  size = "md",
  tabs,
  activeTab,
  bordered = false,
  lifted = false,
  boxed = false,
  onTabChange,
  id,
  ...props
}: TabProps) {
  const tabsClasses = [
    "tabs",
    size ? `tabs-${size}` : "",
    bordered ? "tabs-bordered" : "",
    lifted ? "tabs-lifted" : "",
    boxed ? "tabs-boxed" : "",
    className,
  ].filter(Boolean).join(" ");

  const currentActiveTab = activeTab || tabs[0]?.id;
  const activeTabData = tabs.find((tab) => tab.id === currentActiveTab);

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (!disabled && onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div class="w-full">
      <div class={tabsClasses} role="tablist" id={id} {...props}>
        {tabs.map((tab) => (
          <a
            key={tab.id}
            role="tab"
            class={`tab ${tab.id === currentActiveTab ? "tab-active" : ""} ${
              tab.disabled ? "tab-disabled" : ""
            } ${onTabChange && !tab.disabled ? "cursor-pointer" : ""}`}
            onClick={() => handleTabClick(tab.id, tab.disabled)}
            aria-selected={tab.id === currentActiveTab}
            aria-disabled={tab.disabled}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {activeTabData && (
        <div class="tab-content bg-base-100 border-base-300 rounded-box p-6 mt-2">
          {activeTabData.content}
        </div>
      )}
    </div>
  );
}
