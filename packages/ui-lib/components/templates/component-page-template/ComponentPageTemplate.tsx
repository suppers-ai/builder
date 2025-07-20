import { Accessibility, BookOpen, Code2, Copy, ExternalLink, Info, Palette } from "lucide-preact";
import { Button } from "../../action/button/Button.tsx";
import { Badge } from "../../display/badge/Badge.tsx";
import { Alert } from "../../feedback/alert/Alert.tsx";
import { Card } from "../../display/card/Card.tsx";
import { Breadcrumbs } from "../../navigation/breadcrumbs/Breadcrumbs.tsx";

export interface ComponentPageProps {
  title: string;
  description: string;
  category: string;
  examples: Array<{
    title: string;
    description?: string;
    code: string;
    preview: any;
  }>;
  apiProps?: Array<{
    name: string;
    type: string;
    default?: string;
    description: string;
    required?: boolean;
  }>;
  usageNotes?: string[];
}

export function ComponentPageTemplate({
  title,
  description,
  category,
  examples,
  apiProps = [],
  usageNotes = [],
}: ComponentPageProps) {
  return (
    <>
      {/* Breadcrumbs */}
      <div class="px-4 lg:px-6 pb-3 pt-20">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Components", href: "/components" },
            { label: title },
          ]}
        />
      </div>

      <div class="px-4 lg:px-6 pb-8">
        <div class="max-w-6xl mx-auto">
          {/* Header */}
          <div class="mb-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 class="text-3xl font-bold mb-2">{title}</h1>
                <p class="text-lg text-base-content/70">{description}</p>
              </div>
              <Badge color="primary" size="lg">{category}</Badge>
            </div>
          </div>

          {/* Examples Section */}
          <div class="space-y-12 mb-16">
            {examples.map((example, index) => (
              <div key={index} class="space-y-6">
                <div>
                  <h3 class="text-xl font-semibold mb-2">{example.title}</h3>
                  {example.description && <p class="text-base-content/70">{example.description}</p>}
                </div>

                {/* Preview */}
                <Card class="bg-gradient-to-br from-base-200/50 to-base-300/30 border border-base-300">
                  <div class="card-body p-8">
                    <div class="flex items-center justify-center min-h-[200px]">
                      {example.preview}
                    </div>
                  </div>
                </Card>

                {/* Code */}
                <div class="relative">
                  <div class="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-t-lg border-b border-gray-700">
                    <div class="flex items-center gap-2">
                      <div class="flex gap-1.5">
                        <div class="w-3 h-3 rounded-full bg-red-500"></div>
                        <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div class="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span class="text-sm font-medium text-gray-300 ml-2">Code</span>
                    </div>
                    <Button
                      size="xs"
                      variant="ghost"
                      class="text-gray-300 hover:text-white hover:bg-gray-700"
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(example.code).then(() => {
                            // Optional: Show a temporary feedback
                            const button = document.activeElement as HTMLElement;
                            if (button) {
                              const originalText = button.textContent;
                              button.textContent = "Copied!";
                              setTimeout(() => {
                                button.textContent = originalText;
                              }, 1000);
                            }
                          }).catch((err) => {
                            console.error("Failed to copy: ", err);
                          });
                        }
                      }}
                    >
                      <Copy size={12} />
                      Copy
                    </Button>
                  </div>
                  <div class="bg-gray-900 rounded-t-none rounded-b-lg p-4 overflow-x-auto">
                    <pre class="text-sm leading-relaxed">
                      <code
                        class="text-gray-100"
                        dangerouslySetInnerHTML={{
                          __html: example.code
                            .replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/"/g, "&quot;")
                            .replace(/'/g, "&#39;")
                            .replace(
                              /(&lt;\/?)(\w+)/g,
                              '<span class="text-blue-400">$1$2</span>',
                            )
                            .replace(
                              /(color|size|variant|disabled|loading|active|onClick)=/g,
                              '<span class="text-green-400">$1</span>=',
                            )
                            .replace(
                              /(&quot;[^&]*&quot;)/g,
                              '<span class="text-yellow-300">$1</span>',
                            )
                            .replace(
                              /(&gt;[^&<]*&lt;)/g,
                              '<span class="text-gray-100">$1</span>',
                            ),
                        }}
                      >
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}

            {/* Usage Notes */}
            {usageNotes.length > 0 && (
              <Alert color="info">
                <div>
                  <h4 class="font-semibold mb-2">Usage Notes</h4>
                  <ul class="list-disc list-inside space-y-1 text-sm">
                    {usageNotes.map((note, index) => <li key={index}>{note}</li>)}
                  </ul>
                </div>
              </Alert>
            )}
          </div>

          {/* API Section */}
          {apiProps.length > 0 && (
            <div class="space-y-6 mb-16">
              <div class="flex items-center gap-3 mb-8">
                <Code2 size={24} className="text-primary" />
                <h2 class="text-2xl font-semibold">API Reference</h2>
              </div>

              <div class="overflow-x-auto">
                <table class="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Prop</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiProps.map((prop, index) => (
                      <tr key={index}>
                        <td class="font-mono text-sm font-semibold">{prop.name}</td>
                        <td class="font-mono text-sm text-primary">{prop.type}</td>
                        <td class="font-mono text-sm text-base-content/60">
                          {prop.default || "—"}
                        </td>
                        <td>
                          {prop.required && <Badge color="error" size="sm">Required</Badge>}
                        </td>
                        <td class="text-sm">{prop.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
