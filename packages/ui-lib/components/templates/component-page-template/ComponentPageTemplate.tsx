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
                  <div class="flex items-center justify-between bg-base-300 px-4 py-2 rounded-t-lg">
                    <span class="text-sm font-medium">Code</span>
                    <Button size="xs" variant="ghost">
                      <Copy size={12} />
                      Copy
                    </Button>
                  </div>
                  <div class="mockup-code rounded-t-none">
                    <pre><code>{example.code}</code></pre>
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
