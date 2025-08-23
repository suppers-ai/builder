/**
 * User Settings Modal Component
 * Comprehensive settings interface for all user preferences
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { useEffect, useState } from "preact/hooks";
import { Alert, Button, Card, Modal } from "@suppers/ui-lib";
import { DEFAULT_PREFERENCES, UserPreferences, userPreferences } from "../lib/user-preferences.ts";
import { AccessibilitySettings } from "./AccessibilitySettings.tsx";
import { toastManager } from "../lib/toast-manager.ts";

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = "general" | "layout" | "accessibility" | "performance" | "privacy" | "advanced";

export function UserSettingsModal({ isOpen, onClose }: UserSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);
  const [importExportData, setImportExportData] = useState("");
  const [showImportExport, setShowImportExport] = useState(false);

  // Load current preferences when modal opens
  useEffect(() => {
    if (isOpen) {
      const currentPrefs = userPreferences.getPreferences();
      setPreferences(currentPrefs);
      setHasChanges(false);
    }
  }, [isOpen]);

  // Update preference and mark as changed
  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Save preferences
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await userPreferences.updatePreferences(preferences);
      setHasChanges(false);
      toastManager.success("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toastManager.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      setPreferences(DEFAULT_PREFERENCES);
      setHasChanges(true);
    }
  };

  // Export preferences
  const handleExport = () => {
    const exported = userPreferences.exportPreferences();
    setImportExportData(exported);
    setShowImportExport(true);
  };

  // Import preferences
  const handleImport = async () => {
    try {
      await userPreferences.importPreferences(importExportData);
      const newPrefs = userPreferences.getPreferences();
      setPreferences(newPrefs);
      setHasChanges(false);
      setShowImportExport(false);
      setImportExportData("");
      toastManager.success("Settings imported successfully");
    } catch (error) {
      console.error("Failed to import settings:", error);
      toastManager.error("Failed to import settings: Invalid format");
    }
  };

  // Tab navigation
  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: "general", label: "General", icon: "⚙️" },
    { id: "layout", label: "Layout", icon: "📋" },
    { id: "accessibility", label: "Accessibility", icon: "♿" },
    { id: "performance", label: "Performance", icon: "⚡" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "advanced", label: "Advanced", icon: "🔧" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div class="space-y-6">
            <Card class="p-4">
              <h3 class="text-lg font-semibold mb-4">Theme & Appearance</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Theme</label>
                  <select
                    class="select select-bordered w-full"
                    value={preferences.theme}
                    onChange={(e) => updatePreference("theme", e.currentTarget.value as any)}
                  >
                    <option value="auto">Auto (System)</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Show File Extensions</label>
                    <p class="text-sm text-base-content/70">
                      Display file extensions in item names
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.showFileExtensions}
                    onChange={(e) =>
                      updatePreference("showFileExtensions", e.currentTarget.checked)}
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Show Item Count</label>
                    <p class="text-sm text-base-content/70">Display number of items in folders</p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.showItemCount}
                    onChange={(e) => updatePreference("showItemCount", e.currentTarget.checked)}
                  />
                </div>
              </div>
            </Card>

            <Card class="p-4">
              <h3 class="text-lg font-semibold mb-4">Notifications</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Show Toast Notifications</label>
                    <p class="text-sm text-base-content/70">
                      Display popup notifications for actions
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.showToastNotifications}
                    onChange={(e) =>
                      updatePreference("showToastNotifications", e.currentTarget.checked)}
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">
                    Notification Duration: {preferences.notificationDuration / 1000}s
                  </label>
                  <input
                    type="range"
                    class="range range-primary"
                    min="1000"
                    max="10000"
                    step="1000"
                    value={preferences.notificationDuration}
                    onChange={(e) =>
                      updatePreference("notificationDuration", parseInt(e.currentTarget.value))}
                  />
                  <div class="w-full flex justify-between text-xs px-2">
                    <span>1s</span>
                    <span>5s</span>
                    <span>10s</span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Sound Effects</label>
                    <p class="text-sm text-base-content/70">Play sounds for notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.soundEnabled}
                    onChange={(e) => updatePreference("soundEnabled", e.currentTarget.checked)}
                  />
                </div>
              </div>
            </Card>
          </div>
        );

      case "layout":
        return (
          <div class="space-y-6">
            <Card class="p-4">
              <h3 class="text-lg font-semibold mb-4">Default Layout</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Layout Type</label>
                  <div class="grid grid-cols-2 gap-4">
                    <label class="cursor-pointer">
                      <input
                        type="radio"
                        name="layout"
                        value="default"
                        checked={preferences.defaultLayout === "default"}
                        onChange={() => updatePreference("defaultLayout", "default")}
                        class="radio radio-primary"
                      />
                      <span class="ml-2">Grid View</span>
                    </label>
                    <label class="cursor-pointer">
                      <input
                        type="radio"
                        name="layout"
                        value="timeline"
                        checked={preferences.defaultLayout === "timeline"}
                        onChange={() => updatePreference("defaultLayout", "timeline")}
                        class="radio radio-primary"
                      />
                      <span class="ml-2">Timeline View</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">Item Size</label>
                  <select
                    class="select select-bordered w-full"
                    value={preferences.itemSize}
                    onChange={(e) => updatePreference("itemSize", e.currentTarget.value as any)}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">Sort By</label>
                  <div class="flex gap-2">
                    <select
                      class="select select-bordered flex-1"
                      value={preferences.sortBy}
                      onChange={(e) => updatePreference("sortBy", e.currentTarget.value as any)}
                    >
                      <option value="name">Name</option>
                      <option value="date">Date</option>
                      <option value="size">Size</option>
                      <option value="type">Type</option>
                    </select>
                    <select
                      class="select select-bordered"
                      value={preferences.sortOrder}
                      onChange={(e) => updatePreference("sortOrder", e.currentTarget.value as any)}
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Show Thumbnails</label>
                    <p class="text-sm text-base-content/70">Display image previews</p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.showThumbnails}
                    onChange={(e) => updatePreference("showThumbnails", e.currentTarget.checked)}
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Show Hidden Files</label>
                    <p class="text-sm text-base-content/70">Display hidden files and folders</p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.showHiddenFiles}
                    onChange={(e) => updatePreference("showHiddenFiles", e.currentTarget.checked)}
                  />
                </div>
              </div>
            </Card>

            <Card class="p-4">
              <h3 class="text-lg font-semibold mb-4">Upload Settings</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Auto-generate Thumbnails</label>
                    <p class="text-sm text-base-content/70">
                      Create thumbnails for uploaded images
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.autoGenerateThumbnails}
                    onChange={(e) =>
                      updatePreference("autoGenerateThumbnails", e.currentTarget.checked)}
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Compress Images</label>
                    <p class="text-sm text-base-content/70">Reduce file size for uploaded images</p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.compressImages}
                    onChange={(e) => updatePreference("compressImages", e.currentTarget.checked)}
                  />
                </div>
              </div>
            </Card>
          </div>
        );

      case "accessibility":
        return (
          <div class="space-y-6">
            <Card class="p-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold">Accessibility Settings</h3>
                <Button
                  size="sm"
                  class="btn-outline"
                  onClick={() => setShowAccessibilityModal(true)}
                >
                  Advanced Settings
                </Button>
              </div>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">High Contrast Mode</label>
                    <p class="text-sm text-base-content/70">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.highContrastMode}
                    onChange={(e) => updatePreference("highContrastMode", e.currentTarget.checked)}
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Keyboard Navigation</label>
                    <p class="text-sm text-base-content/70">Enhanced keyboard navigation support</p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.keyboardNavigationMode}
                    onChange={(e) =>
                      updatePreference("keyboardNavigationMode", e.currentTarget.checked)}
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Screen Reader Mode</label>
                    <p class="text-sm text-base-content/70">Optimizations for screen readers</p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.screenReaderMode}
                    onChange={(e) => updatePreference("screenReaderMode", e.currentTarget.checked)}
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Reduced Motion</label>
                    <p class="text-sm text-base-content/70">Minimize animations and transitions</p>
                  </div>
                  <div class="badge badge-outline">
                    {preferences.reducedMotion ? "Enabled" : "Disabled"}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case "performance":
        return (
          <div class="space-y-6">
            <Card class="p-4">
              <h3 class="text-lg font-semibold mb-4">Performance Settings</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Virtual Scrolling</label>
                    <p class="text-sm text-base-content/70">
                      Improve performance with large file lists
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.enableVirtualScrolling}
                    onChange={(e) =>
                      updatePreference("enableVirtualScrolling", e.currentTarget.checked)}
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">Thumbnail Quality</label>
                  <select
                    class="select select-bordered w-full"
                    value={preferences.thumbnailQuality}
                    onChange={(e) =>
                      updatePreference("thumbnailQuality", e.currentTarget.value as any)}
                  >
                    <option value="low">Low (Faster)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Better Quality)</option>
                  </select>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Enable Caching</label>
                    <p class="text-sm text-base-content/70">Cache data for faster loading</p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.cacheEnabled}
                    onChange={(e) => updatePreference("cacheEnabled", e.currentTarget.checked)}
                  />
                </div>
              </div>
            </Card>
          </div>
        );

      case "privacy":
        return (
          <div class="space-y-6">
            <Card class="p-4">
              <h3 class="text-lg font-semibold mb-4">Privacy Settings</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Analytics</label>
                    <p class="text-sm text-base-content/70">
                      Help improve the app with usage analytics
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.analyticsEnabled}
                    onChange={(e) => updatePreference("analyticsEnabled", e.currentTarget.checked)}
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Error Reporting</label>
                    <p class="text-sm text-base-content/70">
                      Send error reports to help fix issues
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.errorReportingEnabled}
                    onChange={(e) =>
                      updatePreference("errorReportingEnabled", e.currentTarget.checked)}
                  />
                </div>
              </div>
            </Card>
          </div>
        );

      case "advanced":
        return (
          <div class="space-y-6">
            <Card class="p-4">
              <h3 class="text-lg font-semibold mb-4">Advanced Settings</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Debug Mode</label>
                    <p class="text-sm text-base-content/70">Show debug information and logs</p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.debugMode}
                    onChange={(e) => updatePreference("debugMode", e.currentTarget.checked)}
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium">Experimental Features</label>
                    <p class="text-sm text-base-content/70">
                      Enable beta features (may be unstable)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={preferences.experimentalFeatures}
                    onChange={(e) =>
                      updatePreference("experimentalFeatures", e.currentTarget.checked)}
                  />
                </div>
              </div>
            </Card>

            <Card class="p-4">
              <h3 class="text-lg font-semibold mb-4">Import/Export Settings</h3>
              <div class="space-y-4">
                <div class="flex gap-2">
                  <Button class="btn-outline flex-1" onClick={handleExport}>
                    Export Settings
                  </Button>
                  <Button class="btn-outline flex-1" onClick={() => setShowImportExport(true)}>
                    Import Settings
                  </Button>
                </div>

                <Button class="btn-error w-full" onClick={handleReset}>
                  Reset to Defaults
                </Button>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Modal
        open={isOpen}
        onClose={onClose}
        title="Settings"
      >
        <div class="flex h-96">
          {/* Sidebar */}
          <div class="w-48 border-r border-base-300 pr-4">
            <nav class="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  class={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id ? "bg-primary text-primary-content" : "hover:bg-base-200"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span class="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div class="flex-1 pl-4 overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>

        {/* Footer */}
        <div class="flex justify-between items-center pt-4 border-t border-base-300">
          <div class="text-sm text-base-content/70">
            {hasChanges && "You have unsaved changes"}
          </div>

          <div class="flex gap-2">
            <Button class="btn-ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              class="btn-primary"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              loading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Accessibility Settings Modal */}
      <AccessibilitySettings
        isOpen={showAccessibilityModal}
        onClose={() => setShowAccessibilityModal(false)}
      />

      {/* Import/Export Modal */}
      <Modal
        open={showImportExport}
        onClose={() => setShowImportExport(false)}
        title="Import/Export Settings"
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">
              Settings Data (JSON)
            </label>
            <textarea
              class="textarea textarea-bordered w-full h-32"
              value={importExportData}
              onChange={(e) => setImportExportData(e.currentTarget.value)}
              placeholder="Paste exported settings here..."
            />
          </div>

          <Alert variant="info">
            <p class="text-sm">
              Export your settings to backup or share them. Import settings from a backup to restore
              your preferences.
            </p>
          </Alert>

          <div class="flex justify-end gap-2">
            <Button class="btn-ghost" onClick={() => setShowImportExport(false)}>
              Cancel
            </Button>
            <Button
              class="btn-primary"
              onClick={handleImport}
              disabled={!importExportData.trim()}
            >
              Import Settings
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
