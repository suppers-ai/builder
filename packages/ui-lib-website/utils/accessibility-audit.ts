// Comprehensive Accessibility Audit Utilities (WAVE/axe-like functionality)

interface AccessibilityIssue {
  type: "error" | "warning" | "notice";
  rule: string;
  element: string;
  description: string;
  impact: "critical" | "serious" | "moderate" | "minor";
  help: string;
  selector: string;
}

interface AccessibilityReport {
  score: number;
  passedTests: number;
  totalTests: number;
  errors: AccessibilityIssue[];
  warnings: AccessibilityIssue[];
  notices: AccessibilityIssue[];
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
}

export class AccessibilityAuditor {
  private issues: AccessibilityIssue[] = [];
  private passedTests = 0;
  private totalTests = 0;

  constructor() {
    this.reset();
  }

  private reset() {
    this.issues = [];
    this.passedTests = 0;
    this.totalTests = 0;
  }

  private addIssue(issue: Omit<AccessibilityIssue, "selector">, element: Element) {
    this.issues.push({
      ...issue,
      selector: this.getElementSelector(element),
    });
  }

  private getElementSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className && typeof element.className === "string") {
      const classes = element.className.split(/\s+/).filter((c) => c);
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes[0]}`;
      }
    }

    let selector = element.tagName.toLowerCase();
    const parent = element.parentElement;

    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (child) => child.tagName === element.tagName,
      );

      if (siblings.length > 1) {
        const index = siblings.indexOf(element) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    return selector;
  }

  private testPassed() {
    this.passedTests++;
    this.totalTests++;
  }

  private testFailed() {
    this.totalTests++;
  }

  // Core accessibility tests
  auditImages(): void {
    const images = document.querySelectorAll("img");

    images.forEach((img) => {
      const alt = img.getAttribute("alt");
      const ariaLabel = img.getAttribute("aria-label");
      const ariaLabelledby = img.getAttribute("aria-labelledby");
      const role = img.getAttribute("role");

      // Decorative images should have empty alt or role="presentation"
      if (role === "presentation" || role === "none") {
        this.testPassed();
        return;
      }

      // Images need alternative text
      if (!alt && !ariaLabel && !ariaLabelledby) {
        this.addIssue({
          type: "error",
          rule: "image-alt",
          element: "img",
          description: "Image missing alternative text",
          impact: "critical",
          help: "Add alt attribute or aria-label to describe the image content",
        }, img);
        this.testFailed();
      } else if (alt === img.src || alt === img.src.split("/").pop()) {
        this.addIssue({
          type: "error",
          rule: "image-alt-filename",
          element: "img",
          description: "Image alt text is the same as filename",
          impact: "serious",
          help: "Provide descriptive alt text instead of filename",
        }, img);
        this.testFailed();
      } else if (alt && alt.length > 125) {
        this.addIssue({
          type: "warning",
          rule: "image-alt-length",
          element: "img",
          description: "Image alt text is very long",
          impact: "minor",
          help: "Keep alt text concise (under 125 characters)",
        }, img);
        this.testFailed();
      } else {
        this.testPassed();
      }
    });
  }

  auditHeadings(): void {
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

    if (headings.length === 0) {
      this.addIssue({
        type: "warning",
        rule: "heading-structure",
        element: "page",
        description: "Page has no heading structure",
        impact: "moderate",
        help: "Add proper heading hierarchy (h1, h2, h3, etc.)",
      }, document.body);
      this.testFailed();
      return;
    }

    const h1s = document.querySelectorAll("h1");
    if (h1s.length === 0) {
      this.addIssue({
        type: "error",
        rule: "h1-missing",
        element: "page",
        description: "Page missing h1 heading",
        impact: "serious",
        help: "Add exactly one h1 element to identify the main content",
      }, document.body);
      this.testFailed();
    } else if (h1s.length > 1) {
      this.addIssue({
        type: "warning",
        rule: "h1-multiple",
        element: "page",
        description: "Page has multiple h1 headings",
        impact: "moderate",
        help: "Use only one h1 per page",
      }, document.body);
      this.testFailed();
    } else {
      this.testPassed();
    }

    // Check heading hierarchy
    let prevLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));

      if (prevLevel > 0 && level > prevLevel + 1) {
        this.addIssue({
          type: "warning",
          rule: "heading-order",
          element: heading.tagName.toLowerCase(),
          description: "Heading levels skip hierarchy",
          impact: "moderate",
          help: "Use headings in sequential order (h1, h2, h3, etc.)",
        }, heading);
        this.testFailed();
      } else {
        this.testPassed();
      }

      prevLevel = level;
    });

    // Check for empty headings
    headings.forEach((heading) => {
      const text = heading.textContent?.trim();
      if (!text) {
        this.addIssue({
          type: "error",
          rule: "heading-empty",
          element: heading.tagName.toLowerCase(),
          description: "Heading is empty",
          impact: "serious",
          help: "Provide meaningful heading text",
        }, heading);
        this.testFailed();
      } else {
        this.testPassed();
      }
    });
  }

  auditForms(): void {
    const inputs = document.querySelectorAll("input, textarea, select");

    inputs.forEach((input) => {
      const id = input.id;
      const ariaLabel = input.getAttribute("aria-label");
      const ariaLabelledby = input.getAttribute("aria-labelledby");
      const title = input.getAttribute("title");
      const placeholder = input.getAttribute("placeholder");

      // Find associated label
      let label: Element | null = null;
      if (id) {
        label = document.querySelector(`label[for="${id}"]`);
      }
      if (!label && input.parentElement?.tagName === "LABEL") {
        label = input.parentElement;
      }

      // Check for proper labeling
      if (!label && !ariaLabel && !ariaLabelledby && !title) {
        this.addIssue({
          type: "error",
          rule: "form-label-missing",
          element: input.tagName.toLowerCase(),
          description: "Form control missing label",
          impact: "critical",
          help: "Associate a label element with this form control",
        }, input);
        this.testFailed();
      } else if (!label && placeholder && !ariaLabel) {
        this.addIssue({
          type: "warning",
          rule: "placeholder-only-label",
          element: input.tagName.toLowerCase(),
          description: "Form control labeled only by placeholder",
          impact: "moderate",
          help: "Use a proper label element instead of relying on placeholder",
        }, input);
        this.testFailed();
      } else {
        this.testPassed();
      }

      // Check for required field indicators
      if (input.hasAttribute("required")) {
        const requiredIndicator = label?.textContent?.includes("*") ||
          ariaLabel?.includes("required") ||
          input.getAttribute("aria-required") === "true";

        if (!requiredIndicator) {
          this.addIssue({
            type: "warning",
            rule: "required-field-indicator",
            element: input.tagName.toLowerCase(),
            description: "Required field not clearly indicated",
            impact: "minor",
            help: "Add visual and programmatic indicators for required fields",
          }, input);
          this.testFailed();
        } else {
          this.testPassed();
        }
      }
    });

    // Check fieldsets for radio button groups
    const radioGroups = new Map<string, NodeListOf<Element>>();
    document.querySelectorAll('input[type="radio"]').forEach((radio) => {
      const name = (radio as HTMLInputElement).name;
      if (name && !radioGroups.has(name)) {
        radioGroups.set(name, document.querySelectorAll(`input[type="radio"][name="${name}"]`));
      }
    });

    radioGroups.forEach((radios, groupName) => {
      if (radios.length > 1) {
        const fieldset = Array.from(radios).find((radio) => radio.closest("fieldset"))?.closest(
          "fieldset",
        );

        if (!fieldset) {
          this.addIssue({
            type: "warning",
            rule: "radio-group-fieldset",
            element: 'input[type="radio"]',
            description: "Radio button group not wrapped in fieldset",
            impact: "moderate",
            help: "Wrap related radio buttons in a fieldset with legend",
          }, radios[0]);
          this.testFailed();
        } else {
          this.testPassed();
        }
      }
    });
  }

  auditButtons(): void {
    const buttons = document.querySelectorAll(
      'button, input[type="button"], input[type="submit"], input[type="reset"], [role="button"]',
    );

    buttons.forEach((button) => {
      const text = button.textContent?.trim();
      const ariaLabel = button.getAttribute("aria-label");
      const ariaLabelledby = button.getAttribute("aria-labelledby");
      const title = button.getAttribute("title");
      const value = (button as HTMLInputElement).value;

      // Check for accessible name
      if (!text && !ariaLabel && !ariaLabelledby && !title && !value) {
        this.addIssue({
          type: "error",
          rule: "button-name",
          element: button.tagName.toLowerCase(),
          description: "Button has no accessible name",
          impact: "critical",
          help: "Provide button text, aria-label, or aria-labelledby",
        }, button);
        this.testFailed();
      } else if (text && (text.toLowerCase() === "click here" || text.toLowerCase() === "more")) {
        this.addIssue({
          type: "warning",
          rule: "button-context",
          element: button.tagName.toLowerCase(),
          description: "Button text is not descriptive",
          impact: "minor",
          help: "Use descriptive button text that explains the action",
        }, button);
        this.testFailed();
      } else {
        this.testPassed();
      }

      // Check for keyboard accessibility
      const tabIndex = button.getAttribute("tabindex");
      if (tabIndex === "-1" && button.tagName !== "BUTTON" && !button.hasAttribute("disabled")) {
        this.addIssue({
          type: "warning",
          rule: "button-keyboard",
          element: button.tagName.toLowerCase(),
          description: "Button not keyboard accessible",
          impact: "serious",
          help: 'Remove tabindex="-1" or add keyboard event handlers',
        }, button);
        this.testFailed();
      } else {
        this.testPassed();
      }
    });
  }

  auditLinks(): void {
    const links = document.querySelectorAll("a[href]");

    links.forEach((link) => {
      const text = link.textContent?.trim();
      const ariaLabel = link.getAttribute("aria-label");
      const ariaLabelledby = link.getAttribute("aria-labelledby");
      const title = link.getAttribute("title");

      // Check for accessible name
      if (!text && !ariaLabel && !ariaLabelledby && !title) {
        this.addIssue({
          type: "error",
          rule: "link-name",
          element: "a",
          description: "Link has no accessible name",
          impact: "critical",
          help: "Provide link text, aria-label, or aria-labelledby",
        }, link);
        this.testFailed();
      } else if (
        text &&
        (text.toLowerCase() === "click here" || text.toLowerCase() === "more" ||
          text.toLowerCase() === "read more")
      ) {
        this.addIssue({
          type: "warning",
          rule: "link-context",
          element: "a",
          description: "Link text is not descriptive",
          impact: "minor",
          help: "Use descriptive link text that explains the destination",
        }, link);
        this.testFailed();
      } else {
        this.testPassed();
      }

      // Check for new window/tab indicators
      const target = link.getAttribute("target");
      if (target === "_blank") {
        const hasIndicator = text?.includes("opens in new") ||
          ariaLabel?.includes("opens in new") ||
          title?.includes("opens in new");

        if (!hasIndicator) {
          this.addIssue({
            type: "warning",
            rule: "link-new-window",
            element: "a",
            description: "Link opens in new window without indication",
            impact: "minor",
            help: "Indicate when links open in new windows",
          }, link);
          this.testFailed();
        } else {
          this.testPassed();
        }
      }
    });
  }

  auditColorContrast(): void {
    const textElements = document.querySelectorAll(
      "p, span, div, h1, h2, h3, h4, h5, h6, button, a, label, input, textarea",
    );

    textElements.forEach((element) => {
      const styles = getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      const fontSize = parseFloat(styles.fontSize);
      const fontWeight = styles.fontWeight;

      // Skip if no text content
      if (!element.textContent?.trim()) {
        return;
      }

      // Basic contrast check (simplified)
      const colorValues = this.parseColor(color);
      const bgColorValues = this.parseColor(backgroundColor);

      if (colorValues && bgColorValues) {
        const contrastRatio = this.calculateContrastRatio(colorValues, bgColorValues);
        const isLargeText = fontSize >= 18 ||
          (fontSize >= 14 && (fontWeight === "bold" || parseInt(fontWeight) >= 700));
        const requiredRatio = isLargeText ? 3 : 4.5;

        if (contrastRatio < requiredRatio) {
          this.addIssue({
            type: "error",
            rule: "color-contrast",
            element: element.tagName.toLowerCase(),
            description: `Color contrast too low (${contrastRatio.toFixed(2)}:1)`,
            impact: "serious",
            help: `Increase contrast to at least ${requiredRatio}:1`,
          }, element);
          this.testFailed();
        } else {
          this.testPassed();
        }
      }
    });
  }

  private parseColor(color: string): number[] | null {
    // Simple RGB parser for basic colors
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }

    // Handle some basic named colors
    const namedColors: { [key: string]: number[] } = {
      "black": [0, 0, 0],
      "white": [255, 255, 255],
      "red": [255, 0, 0],
      "green": [0, 128, 0],
      "blue": [0, 0, 255],
    };

    return namedColors[color.toLowerCase()] || null;
  }

  private calculateContrastRatio(color1: number[], color2: number[]): number {
    const luminance1 = this.getLuminance(color1);
    const luminance2 = this.getLuminance(color2);

    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private getLuminance(rgb: number[]): number {
    const [r, g, b] = rgb.map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  auditLandmarks(): void {
    const landmarks = document.querySelectorAll(
      'main, nav, header, footer, aside, section[aria-label], section[aria-labelledby], [role="banner"], [role="navigation"], [role="main"], [role="contentinfo"], [role="complementary"]',
    );

    // Check for main landmark
    const mainElements = document.querySelectorAll('main, [role="main"]');
    if (mainElements.length === 0) {
      this.addIssue({
        type: "warning",
        rule: "landmark-main",
        element: "page",
        description: "Page missing main landmark",
        impact: "moderate",
        help: 'Add a main element or role="main" to identify primary content',
      }, document.body);
      this.testFailed();
    } else if (mainElements.length > 1) {
      this.addIssue({
        type: "warning",
        rule: "landmark-main-multiple",
        element: "page",
        description: "Page has multiple main landmarks",
        impact: "minor",
        help: "Use only one main landmark per page",
      }, document.body);
      this.testFailed();
    } else {
      this.testPassed();
    }

    // Check for navigation landmarks
    const navElements = document.querySelectorAll('nav, [role="navigation"]');
    if (navElements.length > 1) {
      navElements.forEach((nav) => {
        const ariaLabel = nav.getAttribute("aria-label");
        const ariaLabelledby = nav.getAttribute("aria-labelledby");

        if (!ariaLabel && !ariaLabelledby) {
          this.addIssue({
            type: "warning",
            rule: "landmark-navigation-label",
            element: "nav",
            description: "Multiple navigation landmarks should be labeled",
            impact: "minor",
            help: "Add aria-label to distinguish navigation areas",
          }, nav);
          this.testFailed();
        } else {
          this.testPassed();
        }
      });
    }
  }

  // Run complete accessibility audit
  runCompleteAudit(): AccessibilityReport {
    this.reset();

    this.auditImages();
    this.auditHeadings();
    this.auditForms();
    this.auditButtons();
    this.auditLinks();
    this.auditColorContrast();
    this.auditLandmarks();

    const errors = this.issues.filter((issue) => issue.type === "error");
    const warnings = this.issues.filter((issue) => issue.type === "warning");
    const notices = this.issues.filter((issue) => issue.type === "notice");

    const summary = {
      critical: this.issues.filter((issue) => issue.impact === "critical").length,
      serious: this.issues.filter((issue) => issue.impact === "serious").length,
      moderate: this.issues.filter((issue) => issue.impact === "moderate").length,
      minor: this.issues.filter((issue) => issue.impact === "minor").length,
    };

    // Calculate score (100 - penalty points)
    let score = 100;
    score -= summary.critical * 20;
    score -= summary.serious * 10;
    score -= summary.moderate * 5;
    score -= summary.minor * 2;
    score = Math.max(0, score);

    return {
      score,
      passedTests: this.passedTests,
      totalTests: this.totalTests,
      errors,
      warnings,
      notices,
      summary,
    };
  }

  // Generate accessibility report
  generateAccessibilityReport(report: AccessibilityReport): string {
    let output = `# Accessibility Audit Report\n\n`;

    output += `## Overall Score: ${report.score}/100\n\n`;
    output += `**Tests Passed:** ${report.passedTests}/${report.totalTests}\n\n`;

    output += `## Issue Summary\n\n`;
    output += `- **Critical:** ${report.summary.critical}\n`;
    output += `- **Serious:** ${report.summary.serious}\n`;
    output += `- **Moderate:** ${report.summary.moderate}\n`;
    output += `- **Minor:** ${report.summary.minor}\n\n`;

    if (report.errors.length > 0) {
      output += `## Errors (${report.errors.length})\n\n`;
      report.errors.forEach((error, index) => {
        output += `### ${index + 1}. ${error.description}\n`;
        output += `**Rule:** ${error.rule}\n`;
        output += `**Element:** ${error.selector}\n`;
        output += `**Impact:** ${error.impact.toUpperCase()}\n`;
        output += `**Solution:** ${error.help}\n\n`;
      });
    }

    if (report.warnings.length > 0) {
      output += `## Warnings (${report.warnings.length})\n\n`;
      report.warnings.forEach((warning, index) => {
        output += `### ${index + 1}. ${warning.description}\n`;
        output += `**Rule:** ${warning.rule}\n`;
        output += `**Element:** ${warning.selector}\n`;
        output += `**Impact:** ${warning.impact.toUpperCase()}\n`;
        output += `**Solution:** ${warning.help}\n\n`;
      });
    }

    return output;
  }
}

// Usage example
export function runAccessibilityAudit(): void {
  const auditor = new AccessibilityAuditor();
  const report = auditor.runCompleteAudit();
  const reportText = auditor.generateAccessibilityReport(report);

  console.log(reportText);
  console.log("Detailed Report:", report);
}

// Auto-run accessibility audit
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    // Wait for page to fully load before auditing
    setTimeout(runAccessibilityAudit, 2000);
  });
}
