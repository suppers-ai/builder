import { UserAvatar } from "../../shared/components/UserAvatar.tsx";

const smallUser = {
  id: "1",
  email: "john@example.com",
  first_name: "John",
  middle_names: null,
  last_name: "Doe",
  display_name: null,
  avatar_url: null,
};

const largeUser = {
  id: "2",
  email: "jane@example.com",
  first_name: "Jane",
  middle_names: "Marie",
  last_name: "Smith",
  display_name: "Jane Smith",
  avatar_url:
    "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
};

export default function UserAvatarDemo() {
  return (
    <div class="px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">UserAvatar Component</h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Avatar Sizes</h2>
              <p class="text-base-content/70 mb-4">
                Different sizes for various use cases.
              </p>
              <div class="flex items-center gap-6">
                <div class="text-center">
                  <UserAvatar user={smallUser} size="sm" />
                  <p class="mt-2 text-sm">Small</p>
                </div>
                <div class="text-center">
                  <UserAvatar user={smallUser} size="md" />
                  <p class="mt-2 text-sm">Medium</p>
                </div>
                <div class="text-center">
                  <UserAvatar user={smallUser} size="lg" />
                  <p class="mt-2 text-sm">Large</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">With/Without Avatar</h2>
              <p class="text-base-content/70 mb-4">
                Shows initials when no avatar image is available.
              </p>
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <span class="text-sm font-medium w-24">No Avatar:</span>
                  <UserAvatar user={smallUser} />
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-sm font-medium w-24">With Avatar:</span>
                  <UserAvatar user={largeUser} />
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
              <pre><code>{`<UserAvatar
  user={currentUser}
  size="md"
  className="border-2 border-primary"
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
                      <code class="badge badge-neutral">user</code>
                    </td>
                    <td>
                      <code>User</code>
                    </td>
                    <td>
                      <code>required</code>
                    </td>
                    <td>User object with display_name and avatar_url</td>
                  </tr>
                  <tr>
                    <td>
                      <code class="badge badge-neutral">size</code>
                    </td>
                    <td>
                      <code>"sm" | "md" | "lg"</code>
                    </td>
                    <td>
                      <code>"md"</code>
                    </td>
                    <td>Size of the avatar</td>
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
