import { ApplicationCard } from "../../shared/components/ApplicationCard.tsx";

export default function ApplicationCardDemo() {
  const mockApplications = [
    {
      id: "1",
      owner_id: "user1",
      name: "My Portfolio Website",
      description:
        "A modern portfolio website showcasing my work and skills. Built with Fresh and deployed on Deno Deploy.",
      template_id: "fresh-basic",
      configuration: {
        theme: "dark",
        showContact: true,
      },
      status: "published" as const,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      owner_id: "user2",
      name: "E-commerce Store",
      description:
        "Full-featured online store with authentication, payments, and inventory management. Built with Fresh and Supabase.",
      template_id: "fresh-basic",
      configuration: {
        currency: "USD",
        paymentMethods: ["stripe", "paypal"],
      },
      status: "pending" as const,
      created_at: "2024-01-12T14:20:00Z",
      updated_at: "2024-01-14T09:15:00Z",
    },
    {
      id: "3",
      owner_id: "user3",
      name: "Blog Platform",
      description:
        "A content management system for bloggers with markdown support, comments, and SEO optimization.",
      template_id: "nextjs-basic",
      configuration: {
        comments: true,
        seo: true,
      },
      status: "draft" as const,
      created_at: "2024-01-10T16:45:00Z",
      updated_at: "2024-01-13T11:30:00Z",
    },
  ];

  const handleView = (application: any) => {
    console.log("View application:", application);
    alert(`Viewing: ${application.name}`);
  };

  const handleEdit = (application: any) => {
    console.log("Edit application:", application);
    alert(`Editing: ${application.name}`);
  };

  const handleDelete = (application: any) => {
    console.log("Delete application:", application);
    alert(`Deleting: ${application.name}`);
  };

  return (
    <div class="px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">ApplicationCard Component</h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="space-y-6">
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h2 class="card-title">Status Examples</h2>
                <p class="text-base-content/70 mb-4">
                  Cards showing different application statuses with appropriate styling.
                </p>
                <div class="space-y-4">
                  {mockApplications.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h2 class="card-title">Features</h2>
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <div class="badge badge-primary">✓</div>
                    <span class="text-sm">Status-based styling</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="badge badge-primary">✓</div>
                    <span class="text-sm">User avatar display</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="badge badge-primary">✓</div>
                    <span class="text-sm">Action buttons</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="badge badge-primary">✓</div>
                    <span class="text-sm">Date formatting</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="badge badge-primary">✓</div>
                    <span class="text-sm">Responsive design</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h2 class="card-title">Status Colors</h2>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <div class="badge badge-success">published</div>
                    <span class="text-sm">Live and available to users</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="badge badge-warning">pending</div>
                    <span class="text-sm">Waiting for admin review</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="badge badge-neutral">draft</div>
                    <span class="text-sm">Work in progress</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="badge badge-error">archived</div>
                    <span class="text-sm">No longer active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div class="mt-8 card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Code Example</h2>
            <div class="mockup-code">
              <pre><code>{`<ApplicationCard
  application={application}
  onView={(app) => router.push('/applications/' + app.id)}
  onEdit={(app) => setEditingApp(app)}
  onDelete={(app) => handleDeleteApp(app)}
  className="mb-4"
/>`}</code></pre>
            </div>
          </div>
        </div>

        {/* Props Documentation */}
        <div class="mt-8 card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Props</h2>
            <div class="overflow-x-auto">
              <table class="table">
                <thead>
                  <tr>
                    <th>Prop</th>
                    <th>Type</th>
                    <th>Default</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code class="badge badge-neutral">application</code>
                    </td>
                    <td>
                      <code>Application</code>
                    </td>
                    <td>
                      <code>required</code>
                    </td>
                    <td>Application object to display</td>
                  </tr>
                  <tr>
                    <td>
                      <code class="badge badge-neutral">onView</code>
                    </td>
                    <td>
                      <code>(app: Application) =&gt; void</code>
                    </td>
                    <td>
                      <code>undefined</code>
                    </td>
                    <td>Callback when view button is clicked</td>
                  </tr>
                  <tr>
                    <td>
                      <code class="badge badge-neutral">onEdit</code>
                    </td>
                    <td>
                      <code>(app: Application) =&gt; void</code>
                    </td>
                    <td>
                      <code>undefined</code>
                    </td>
                    <td>Callback when edit button is clicked</td>
                  </tr>
                  <tr>
                    <td>
                      <code class="badge badge-neutral">onDelete</code>
                    </td>
                    <td>
                      <code>(app: Application) =&gt; void</code>
                    </td>
                    <td>
                      <code>undefined</code>
                    </td>
                    <td>Callback when delete button is clicked</td>
                  </tr>
                  <tr>
                    <td>
                      <code class="badge badge-neutral">className</code>
                    </td>
                    <td>
                      <code>string</code>
                    </td>
                    <td>
                      <code>""</code>
                    </td>
                    <td>Additional CSS classes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
