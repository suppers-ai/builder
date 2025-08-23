/**
 * Accessibility settings component for high contrast mode and other accessibility options
 * Requirements: 7.5, 8.4
 */

import { useEffect, useState } from "preact/hooks";
import { Button, Card, Modal } from "@suppers/ui-lib";
import {
  AccessibilityTester,
  HighContrastUtils,
  ScreenReaderUtils,
} from "../lib/accessibility-utils.ts";

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccessibilityState {
  highContrastMode: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  screenReaderMode: boolean;
  accessibilityScore: number;
  accessibilityIssues: string[];
}

export function AccessibilitySettings({ isOpen, onClose }: AccessibilitySettingsProps) {
  const [state, setState] = useState<AccessibilityState>({
    highContrastMode: false,
    reducedMotion: false,
    keyboardNavigation: false,
    screenReaderMode: false,
    accessibilityScore: 0,
    accessibilityIssues: [],
  });

  // Initialize accessibility state
  useEffect(() => {
    const highContrastMode = HighContrastUtils.isHighContrastMode();
    const reducedMotion = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const keyboardNavigation = document.documentElement.classList.contains("keyboard-navigation");
    const screenReaderMode = localStorage.getItem("screen-reader-mode") === "true";

    setState((prev) => ({
      ...prev,
      highContrastMode,
      reducedMotion,
      keyboardNavigation,
      screenReaderMode,
    }));

    // Run accessibility check
    runAccessibilityCheck();
  }, [isOpen]);

  // Run accessibility check
  const runAccessibilityCheck = () => {
    if (!isOpen) return;

    const container = document.querySelector(".storage-dashboard") || document.body;
    const result = AccessibilityTester.runAllChecks(container);

    setState((prev) => ({
      ...prev,
      accessibilityScore: result.score,
      accessibilityIssues: result.issues,
    }));
  };

  // Toggle high contrast mode
  const toggleHighContrast = () => {
    HighContrastUtils.toggleHighContrastMode();
    setState((prev) => ({
      ...prev,
      highContrastMode: !prev.highContrastMode,
    }));
  };

  // Toggle keyboard navigation mode
  const toggleKeyboardNavigation = () => {
    const newValue = !state.keyboardNavigation;

    if (newValue) {
      document.documentElement.classList.add("keyboard-navigation");
      localStorage.setItem("keyboard-navigation-mode", "true");
    } else {
      document.documentElement.classList.remove("keyboard-navigation");
      localStorage.setItem("keyboard-navigation-mode", "false");
    }

    setState((prev) => ({
      ...prev,
      keyboardNavigation: newValue,
    }));

    ScreenReaderUtils.announce(
      `Keyboard navigation mode ${newValue ? "enabled" : "disabled"}`,
      "assertive",
    );
  };

  // Toggle screen reader mode
  const toggleScreenReaderMode = () => {
    const newValue = !state.screenReaderMode;

    localStorage.setItem("screen-reader-mode", newValue.toString());

    if (newValue) {
      document.documentElement.classList.add("screen-reader-mode");
    } else {
      document.documentElement.classList.remove("screen-reader-mode");
    }

    setState((prev) => ({
      ...prev,
      screenReaderMode: newValue,
    }));

    ScreenReaderUtils.announce(
      `Screen reader optimizations ${newValue ? "enabled" : "disabled"}`,
      "assertive",
    );
  };

  // Reset all accessibility settings
  const resetSettings = () => {
    // Reset high contrast
    if (state.highContrastMode) {
      HighContrastUtils.toggleHighContrastMode();
    }

    // Reset keyboard navigation
    document.documentElement.classList.remove("keyboard-navigation");
    localStorage.setItem("keyboard-navigation-mode", "false");

    // Reset screen reader mode
    document.documentElement.classList.remove("screen-reader-mode");
    localStorage.setItem("screen-reader-mode", "false");

    setState((prev) => ({
      ...prev,
      highContrastMode: false,
      keyboardNavigation: false,
      screenReaderMode: false,
    }));

    ScreenReaderUtils.announce("All accessibility settings reset to default", "assertive");
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Accessibility Settings"
    >
      <div class="space-y-6">
        {/* Accessibility Score */}
        <Card class="p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Accessibility Score</h3>
            <Button
              size="sm"
              class="btn-outline"
              onClick={runAccessibilityCheck}
              aria-label="Refresh accessibility score"
            >
              🔄 Refresh
            </Button>
          </div>

          <div class="flex items-center gap-4">
            <div class="radial-progress text-primary" style={`--value:${state.accessibilityScore}`}>
              {state.accessibilityScore}%
            </div>
            <div class="flex-1">
              <p class="text-sm text-base-content/70">
                Your current accessibility score based on WCAG 2.1 guidelines
              </p>
              {state.accessibilityIssues.length > 0 && (
                <details class="mt-2">
                  <summary class="cursor-pointer text-sm font-medium">
                    View Issues ({state.accessibilityIssues.length})
                  </summary>
                  <ul class="list-disc list-inside text-xs text-base-content/60 mt-2 space-y-1">
                    {state.accessibilityIssues.map((issue, index) => <li key={index}>{issue}</li>)}
                  </ul>
                </details>
              )}
            </div>
          </div>
        </Card>

        {/* Visual Settings */}
        <Card class="p-4">
          <h3 class="text-lg font-semibold mb-4">Visual Settings</h3>

          <div class="space-y-4">
            {/* High Contrast Mode */}
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label class="font-medium" for="high-contrast-toggle">
                  High Contrast Mode
                </label>
                <p class="text-sm text-base-content/70">
                  Increases contrast for better visibility
                </p>
              </div>
              <input
                id="high-contrast-toggle"
                type="checkbox"
                class="toggle toggle-primary"
                checked={state.highContrastMode}
                onChange={toggleHighContrast}
                aria-describedby="high-contrast-description"
              />
            </div>
            <div id="high-contrast-description" class="sr-only">
              Toggle high contrast mode for improved visibility and readability
            </div>

            {/* Reduced Motion */}
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label class="font-medium">Reduced Motion</label>
                <p class="text-sm text-base-content/70">
                  {state.reducedMotion
                    ? "System preference detected - animations are reduced"
                    : "System preference allows animations"}
                </p>
              </div>
              <div class="badge badge-outline">
                {state.reducedMotion ? "Enabled" : "Disabled"}
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation Settings */}
        <Card class="p-4">
          <h3 class="text-lg font-semibold mb-4">Navigation Settings</h3>

          <div class="space-y-4">
            {/* Keyboard Navigation */}
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label class="font-medium" for="keyboard-nav-toggle">
                  Enhanced Keyboard Navigation
                </label>
                <p class="text-sm text-base-content/70">
                  Improved focus indicators and keyboard shortcuts
                </p>
              </div>
              <input
                id="keyboard-nav-toggle"
                type="checkbox"
                class="toggle toggle-primary"
                checked={state.keyboardNavigation}
                onChange={toggleKeyboardNavigation}
                aria-describedby="keyboard-nav-description"
              />
            </div>
            <div id="keyboard-nav-description" class="sr-only">
              Enable enhanced keyboard navigation with improved focus indicators
            </div>

            {/* Screen Reader Mode */}
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label class="font-medium" for="screen-reader-toggle">
                  Screen Reader Optimizations
                </label>
                <p class="text-sm text-base-content/70">
                  Enhanced announcements and descriptions
                </p>
              </div>
              <input
                id="screen-reader-toggle"
                type="checkbox"
                class="toggle toggle-primary"
                checked={state.screenReaderMode}
                onChange={toggleScreenReaderMode}
                aria-describedby="screen-reader-description"
              />
            </div>
            <div id="screen-reader-description" class="sr-only">
              Enable optimizations for screen readers with enhanced announcements
            </div>
          </div>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card class="p-4">
          <h3 class="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 class="font-medium mb-2">Navigation</h4>
              <ul class="space-y-1 text-base-content/70">
                <li>
                  <kbd class="kbd kbd-xs">Arrow Keys</kbd> Navigate items
                </li>
                <li>
                  <kbd class="kbd kbd-xs">Home</kbd> First item
                </li>
                <li>
                  <kbd class="kbd kbd-xs">End</kbd> Last item
                </li>
                <li>
                  <kbd class="kbd kbd-xs">Page Up/Down</kbd> Jump navigation
                </li>
              </ul>
            </div>

            <div>
              <h4 class="font-medium mb-2">Actions</h4>
              <ul class="space-y-1 text-base-content/70">
                <li>
                  <kbd class="kbd kbd-xs">Enter</kbd> Open/Preview
                </li>
                <li>
                  <kbd class="kbd kbd-xs">Space</kbd> Select
                </li>
                <li>
                  <kbd class="kbd kbd-xs">Delete</kbd> Delete item
                </li>
                <li>
                  <kbd class="kbd kbd-xs">Ctrl+A</kbd> Select all
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div class="flex justify-between items-center pt-4">
          <Button
            class="btn-outline"
            onClick={resetSettings}
            aria-label="Reset all accessibility settings to default"
          >
            Reset All Settings
          </Button>

          <div class="flex gap-2">
            <Button
              class="btn-ghost"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              class="btn-primary"
              onClick={() => {
                ScreenReaderUtils.announce("Accessibility settings saved", "polite");
                onClose();
              }}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Initialize accessibility settings on app load
export function initializeAccessibilitySettings() {
  // Only run on client side
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }
  
  // Initialize high contrast mode
  HighContrastUtils.initializeHighContrastMode();

  // Initialize keyboard navigation mode
  const keyboardNavMode = localStorage.getItem("keyboard-navigation-mode");
  if (keyboardNavMode === "true") {
    document.documentElement.classList.add("keyboard-navigation");
  }

  // Initialize screen reader mode
  const screenReaderMode = localStorage.getItem("screen-reader-mode");
  if (screenReaderMode === "true") {
    document.documentElement.classList.add("screen-reader-mode");
  }

  // Add keyboard event listener for accessibility shortcuts
  document.addEventListener("keydown", (e) => {
    // Alt + A: Open accessibility settings
    if (e.altKey && e.key === "a") {
      e.preventDefault();
      // Dispatch custom event to open accessibility settings
      document.dispatchEvent(new CustomEvent("open-accessibility-settings"));
    }

    // Alt + H: Toggle high contrast
    if (e.altKey && e.key === "h") {
      e.preventDefault();
      HighContrastUtils.toggleHighContrastMode();
    }
  });

  // Create skip link
  const skipLink = document.createElement("a");
  skipLink.href = "#main-content";
  skipLink.className = "skip-link";
  skipLink.textContent = "Skip to main content";
  skipLink.setAttribute("aria-label", "Skip to main content");
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Add main content landmark
  const mainContent = document.querySelector(".storage-dashboard") ||
    document.querySelector("main");
  if (mainContent && !mainContent.id) {
    mainContent.id = "main-content";
  }
}
