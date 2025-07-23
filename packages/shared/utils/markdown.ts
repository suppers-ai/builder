/**
 * Markdown parsing utilities for component examples
 * Converts markdown files with frontmatter into structured example data
 */

import { extractYaml } from "jsr:@std/front-matter@^1.0.9";

export interface ExampleSection {
  title: string;
  description: string;
  code: string;
}

export interface ComponentExamplesData {
  title: string;
  description: string;
  category: string;
  examples: ExampleSection[];
  apiProps?: Array<{
    name: string;
    type: string;
    default?: string;
    description: string;
    required?: boolean;
  }>;
  usageNotes?: string[];
}

/**
 * Parse a markdown file with frontmatter into structured component example data
 */
export function parseComponentExamplesMarkdown(content: string): ComponentExamplesData {
  const { attrs, body } = extractYaml(content);
  const metadata = attrs as Record<string, unknown>;

  // Parse the frontmatter metadata
  const title = metadata.title as string;
  const description = metadata.description as string;
  const category = metadata.category as string;
  const apiProps = metadata.apiProps as ComponentExamplesData["apiProps"];
  const usageNotes = metadata.usageNotes as string[];

  // Parse examples from the markdown body
  const examples = parseExamplesFromMarkdown(body);

  return {
    title,
    description,
    category,
    examples,
    apiProps,
    usageNotes,
  };
}

/**
 * Parse example sections from markdown body
 * Expects format: ## Title\nDescription\n```tsx\ncode\n```
 */
function parseExamplesFromMarkdown(markdown: string): ExampleSection[] {
  const examples: ExampleSection[] = [];

  // Split by ## headings to get sections
  const sections = markdown.split(/^## /gm).filter(Boolean);

  for (const section of sections) {
    const lines = section.trim().split("\n");
    if (lines.length < 3) continue;

    const title = lines[0].trim();

    // Find the description (everything before the first code block)
    let descriptionLines: string[] = [];
    let codeBlockStart = -1;

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim().startsWith("```")) {
        codeBlockStart = i;
        break;
      }
      descriptionLines.push(lines[i]);
    }

    const description = descriptionLines.join("\n").trim();

    // Extract code from the first code block
    if (codeBlockStart === -1) continue;

    let codeBlockEnd = -1;
    for (let i = codeBlockStart + 1; i < lines.length; i++) {
      if (lines[i].trim() === "```") {
        codeBlockEnd = i;
        break;
      }
    }

    if (codeBlockEnd === -1) continue;

    const code = lines
      .slice(codeBlockStart + 1, codeBlockEnd)
      .join("\n")
      .trim();

    examples.push({
      title,
      description,
      code,
    });
  }

  return examples;
}

/**
 * Read and parse a component examples markdown file
 */
export async function loadComponentExamples(filePath: string): Promise<ComponentExamplesData> {
  try {
    const content = await Deno.readTextFile(filePath);
    return parseComponentExamplesMarkdown(content);
  } catch (error) {
    throw new Error(`Failed to load component examples from ${filePath}: ${error.message}`);
  }
}
