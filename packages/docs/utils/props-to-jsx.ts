/**
 * Props-to-JSX conversion utility for the simplified component metadata system
 *
 * This utility is a core part of the simplified component documentation system.
 * It automatically generates clean, readable JSX code from props objects, eliminating
 * the need for manual JSX string maintenance in component metadata.
 *
 * Key benefits of the simplified approach:
 * - Automatic code generation: No more manual JSX strings in metadata
 * - Type safety: Props are validated against component schemas
 * - Consistency: All examples follow the same format
 * - Maintainability: Changes to components automatically reflect in documentation
 * - DRY principle: Single source of truth for component props
 *
 * This replaces the old system that required manual `code` strings and complex
 * parsing logic, making component documentation much easier to maintain.
 *
 * @since Component Metadata Simplification v1.0 - Cleanup completed
 * @see Requirements 3.4, 1.4 - System optimization and simplified approach
 */

/**
 * Convert a props object to a readable JSX string representation
 *
 * @param componentName - The name of the component (e.g., "Button", "Card")
 * @param props - The props object to convert to JSX
 * @param indentLevel - Current indentation level for nested JSX (default: 0)
 * @returns Formatted JSX string
 *
 * @example
 * propsToJSX("Button", { color: "primary", children: "Click me" })
 * // Returns: '<Button color="primary">Click me</Button>'
 *
 * @example
 * propsToJSX("Button", { disabled: true, onClick: () => {} })
 * // Returns: '<Button disabled onClick={() => {}} />'
 */
export function propsToJSX(
  componentName: string,
  props: Record<string, any>,
  indentLevel: number = 0,
): string {
  const indent = "  ".repeat(indentLevel);
  const childIndent = "  ".repeat(indentLevel + 1);

  // Extract children prop separately
  const { children, ...otherProps } = props;

  // Convert props to JSX attributes
  const attributes = Object.entries(otherProps)
    .map(([key, value]) => formatPropAsAttribute(key, value))
    .filter(Boolean)
    .join(" ");

  const attributesString = attributes ? ` ${attributes}` : "";

  // Handle self-closing vs container component
  if (children === undefined || children === null || children === "") {
    return `${indent}<${componentName}${attributesString} />`;
  }

  // Handle children content
  const childrenContent = formatChildren(children, indentLevel + 1);

  // Check if children content is simple (single line, no JSX)
  const isSimpleChildren = typeof children === "string" ||
    typeof children === "number" ||
    (typeof childrenContent === "string" && !childrenContent.includes("\n") &&
      !childrenContent.includes("<"));

  if (isSimpleChildren) {
    return `${indent}<${componentName}${attributesString}>${childrenContent}</${componentName}>`;
  }

  // Multi-line children
  return `${indent}<${componentName}${attributesString}>\n${childrenContent}\n${indent}</${componentName}>`;
}

/**
 * Format a single prop as a JSX attribute
 *
 * @param key - The prop name
 * @param value - The prop value
 * @returns Formatted attribute string or null if should be omitted
 */
function formatPropAsAttribute(key: string, value: any): string | null {
  // Skip undefined and null values
  if (value === undefined || value === null) {
    return null;
  }

  // Handle boolean props
  if (typeof value === "boolean") {
    return value ? key : null; // true = "disabled", false = omitted
  }

  // Handle string props
  if (typeof value === "string") {
    // Check if this looks like JSX/HTML content
    if (value.trim().startsWith("<") && value.trim().endsWith(">")) {
      // Format as JSX expression for HTML-like strings
      const formattedJSX = value
        .split("\n")
        .map((line, index) => index === 0 ? line : `  ${line}`)
        .join("\n");
      return `${key}={(\n  ${formattedJSX}\n)}`;
    }

    // Escape quotes in regular string values
    const escapedValue = value.replace(/"/g, '\\"');
    return `${key}="${escapedValue}"`;
  }

  // Handle number props
  if (typeof value === "number") {
    return `${key}={${value}}`;
  }

  // Handle function props
  if (typeof value === "function") {
    // Always use simplified function representation for consistency
    return `${key}={() => {}}`;
  }

  // Handle array props
  if (Array.isArray(value)) {
    const arrayContent = value.map((item) => formatValueForJSX(item)).join(", ");
    return `${key}={[${arrayContent}]}`;
  }

  // Handle JSX objects (Preact VNodes)
  if (typeof value === "object" && value !== null && typeof value.type !== "undefined") {
    const jsxContent = formatJSXObjectToString(value);
    return `${key}={${jsxContent}}`;
  }

  // Handle object props
  if (typeof value === "object") {
    const objectContent = formatObjectForJSX(value);
    return `${key}={${objectContent}}`;
  }

  // Fallback for other types
  return `${key}={${JSON.stringify(value)}}`;
}

/**
 * Format children content for JSX
 *
 * @param children - The children content
 * @param indentLevel - Current indentation level
 * @returns Formatted children string
 */
function formatChildren(children: any, indentLevel: number): string {
  const indent = "  ".repeat(indentLevel);

  // Handle string children
  if (typeof children === "string") {
    return children;
  }

  // Handle number children
  if (typeof children === "number") {
    return children.toString();
  }

  // Handle array of children
  if (Array.isArray(children)) {
    return children
      .map((child) => {
        if (typeof child === "string" || typeof child === "number") {
          return `${indent}${child}`;
        }
        // For complex children, just return a placeholder
        return `${indent}{/* Complex child */}`;
      })
      .join("\n");
  }

  // Handle JSX-like objects (basic support)
  if (typeof children === "object" && children !== null) {
    // This is a simplified representation for JSX objects
    return `${indent}{/* JSX content */}`;
  }

  return String(children);
}

/**
 * Format a value for use inside JSX expressions
 *
 * @param value - The value to format
 * @returns Formatted value string
 */
function formatValueForJSX(value: any): string {
  if (typeof value === "string") {
    return `"${value.replace(/"/g, '\\"')}"`;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "function") {
    return "() => {}";
  }

  if (Array.isArray(value)) {
    const items = value.map((item) => formatValueForJSX(item)).join(", ");
    return `[${items}]`;
  }

  if (typeof value === "object" && value !== null) {
    return formatObjectForJSX(value);
  }

  return JSON.stringify(value);
}

/**
 * Format a JSX object (Preact VNode) to a readable JSX string
 *
 * @param jsxObj - The JSX object to format
 * @returns Formatted JSX string
 */
function formatJSXObjectToString(jsxObj: any): string {
  // Handle null or undefined
  if (!jsxObj) {
    return "null";
  }

  // Handle fragments (Preact fragments have a function as type)
  if (typeof jsxObj.type === "function" || jsxObj.type === "" || jsxObj.type === null) {
    if (jsxObj.props && jsxObj.props.children) {
      const children = Array.isArray(jsxObj.props.children)
        ? jsxObj.props.children
        : [jsxObj.props.children];

      return `(\n  <>\n${
        children.map((child: any) => `    ${formatJSXChildToString(child)}`).join("\n")
      }\n  </>\n)`;
    }
    return "(<></>)";
  }

  // Handle regular elements
  const tagName = jsxObj.type;
  const props = jsxObj.props || {};
  const { children, ...otherProps } = props;

  // Format attributes
  const attributes = Object.entries(otherProps)
    .filter(([key, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (typeof value === "boolean") {
        return value ? key : null;
      }
      if (typeof value === "string") {
        return `${key}="${value.replace(/"/g, '\\"')}"`;
      }
      if (typeof value === "number") {
        return `${key}={${value}}`;
      }
      return `${key}={${JSON.stringify(value)}}`;
    })
    .filter(Boolean)
    .join(" ");

  const attributesString = attributes ? ` ${attributes}` : "";

  // Handle self-closing tags
  if (!children || (Array.isArray(children) && children.length === 0)) {
    return `(\n  <${tagName}${attributesString} />\n)`;
  }

  // Handle children
  const childrenArray = Array.isArray(children) ? children : [children];
  const formattedChildren = childrenArray
    .map((child) => `    ${formatJSXChildToString(child)}`)
    .join("\n");

  return `(\n  <${tagName}${attributesString}>\n${formattedChildren}\n  </${tagName}>\n)`;
}

/**
 * Format a JSX child element to string
 *
 * @param child - The child element to format
 * @returns Formatted child string
 */
function formatJSXChildToString(child: any): string {
  // Handle string children
  if (typeof child === "string") {
    return child;
  }

  // Handle number children
  if (typeof child === "number") {
    return child.toString();
  }

  // Handle JSX objects
  if (typeof child === "object" && child !== null && typeof child.type !== "undefined") {
    return formatJSXObjectToString(child).replace(/^\(\n  /, "").replace(/\n\)$/, "");
  }

  // Fallback
  return "{/* Complex child */}";
}

/**
 * Format an object for use in JSX
 *
 * @param obj - The object to format
 * @returns Formatted object string
 */
function formatObjectForJSX(obj: Record<string, any>): string {
  const entries = Object.entries(obj);

  if (entries.length === 0) {
    return "{}";
  }

  // For simple objects, use single line
  if (
    entries.length <= 3 &&
    entries.every(([_, value]) =>
      typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    )
  ) {
    const props = entries
      .map(([key, value]) => `${key}: ${formatValueForJSX(value)}`)
      .join(", ");
    return `{ ${props} }`;
  }

  // For complex objects, use multi-line (simplified)
  const props = entries
    .map(([key, value]) => `  ${key}: ${formatValueForJSX(value)}`)
    .join(",\n");

  return `{\n${props}\n}`;
}

/**
 * Convert multiple component props to JSX string with proper container
 *
 * @param componentName - The name of the component
 * @param propsArray - Array of props objects for multiple component instances
 * @param containerClass - CSS class for the container div (default: "flex gap-2")
 * @returns Formatted JSX string with container
 *
 * @example
 * multiplePropsToJSX("Button", [
 *   { children: "Primary", color: "primary" },
 *   { children: "Secondary", color: "secondary" }
 * ])
 * // Returns:
 * // <div class="flex gap-2">
 * //   <Button color="primary">Primary</Button>
 * //   <Button color="secondary">Secondary</Button>
 * // </div>
 */
export function multiplePropsToJSX(
  componentName: string,
  propsArray: Array<Record<string, any>>,
  containerClass: string = "flex gap-2",
): string {
  if (propsArray.length === 0) {
    return `<div class="${containerClass}"></div>`;
  }

  if (propsArray.length === 1) {
    // Single component, no container needed
    return propsToJSX(componentName, propsArray[0]);
  }

  const components = propsArray
    .map((props) => propsToJSX(componentName, props, 1))
    .join("\n");

  return `<div class="${containerClass}">\n${components}\n</div>`;
}

/**
 * Main utility function that handles both single and multiple component props
 *
 * @param componentName - The name of the component
 * @param props - Single props object or array of props objects
 * @param containerClass - CSS class for container when using multiple props
 * @returns Formatted JSX string
 */
export function generateJSXFromProps(
  componentName: string,
  props: Record<string, any> | Array<Record<string, any>>,
  containerClass?: string,
): string {
  if (Array.isArray(props)) {
    return multiplePropsToJSX(componentName, props, containerClass);
  }

  return propsToJSX(componentName, props);
}
