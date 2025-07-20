import { Skeleton } from "@suppers/ui-lib";

export default function SkeletonPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Skeleton Component</h1>
        <p>Loading placeholder components for better user experience</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Skeletons</h2>
          <div class="space-y-4">
            <Skeleton width="100%" height="20px" />
            <Skeleton width="80%" height="20px" />
            <Skeleton width="60%" height="20px" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Sizes</h2>
          <div class="space-y-4">
            <Skeleton width="200px" height="16px" />
            <Skeleton width="300px" height="24px" />
            <Skeleton width="400px" height="32px" />
            <Skeleton width="500px" height="40px" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Circle Skeletons</h2>
          <div class="flex gap-4 items-center">
            <Skeleton circle />
            <Skeleton circle class="w-16 h-16" />
            <Skeleton circle class="w-20 h-20" />
            <Skeleton circle class="w-24 h-24" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Card Loading Example</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} class="card bg-base-100 shadow-xl">
                <figure class="px-4 pt-4">
                  <Skeleton width="100%" height="200px" rounded />
                </figure>
                <div class="card-body">
                  <Skeleton width="100%" height="24px" class="mb-2" />
                  <Skeleton width="80%" height="16px" class="mb-2" />
                  <Skeleton width="60%" height="16px" class="mb-4" />
                  <div class="card-actions justify-end">
                    <Skeleton width="80px" height="32px" />
                    <Skeleton width="100px" height="32px" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Profile Loading Example</h2>
          <div class="flex items-center space-x-4">
            <Skeleton circle class="w-16 h-16" />
            <div class="space-y-2">
              <Skeleton width="200px" height="20px" />
              <Skeleton width="150px" height="16px" />
              <Skeleton width="100px" height="14px" />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Table Loading Example</h2>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}>
                    <td>
                      <div class="flex items-center gap-3">
                        <Skeleton circle class="w-12 h-12" />
                        <div class="space-y-1">
                          <Skeleton width="120px" height="16px" />
                          <Skeleton width="100px" height="14px" />
                        </div>
                      </div>
                    </td>
                    <td>
                      <Skeleton width="100px" height="16px" />
                    </td>
                    <td>
                      <Skeleton width="120px" height="16px" />
                    </td>
                    <td>
                      <Skeleton width="80px" height="16px" />
                    </td>
                    <td>
                      <div class="flex gap-2">
                        <Skeleton width="60px" height="32px" />
                        <Skeleton width="60px" height="32px" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Chat Loading Example</h2>
          <div class="space-y-4">
            <div class="chat chat-start">
              <div class="chat-image avatar">
                <Skeleton circle class="w-10 h-10" />
              </div>
              <div class="chat-bubble bg-transparent p-0">
                <Skeleton width="200px" height="40px" />
              </div>
            </div>
            <div class="chat chat-end">
              <div class="chat-image avatar">
                <Skeleton circle class="w-10 h-10" />
              </div>
              <div class="chat-bubble bg-transparent p-0">
                <Skeleton width="160px" height="40px" />
              </div>
            </div>
            <div class="chat chat-start">
              <div class="chat-image avatar">
                <Skeleton circle class="w-10 h-10" />
              </div>
              <div class="chat-bubble bg-transparent p-0">
                <Skeleton width="240px" height="60px" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Feed Loading Example</h2>
          <div class="space-y-6">
            {Array.from(
              { length: 3 },
              (_, i) => (
                <div key={i} class="card bg-base-100 shadow-sm border">
                  <div class="card-body">
                    <div class="flex items-center space-x-3 mb-4">
                      <Skeleton circle class="w-12 h-12" />
                      <div class="space-y-2">
                        <Skeleton width="150px" height="16px" />
                        <Skeleton width="100px" height="14px" />
                      </div>
                    </div>
                    <div class="space-y-2 mb-4">
                      <Skeleton width="100%" height="16px" />
                      <Skeleton width="90%" height="16px" />
                      <Skeleton width="75%" height="16px" />
                    </div>
                    <Skeleton width="100%" height="200px" class="mb-4" />
                    <div class="flex gap-4">
                      <Skeleton width="60px" height="32px" />
                      <Skeleton width="80px" height="32px" />
                      <Skeleton width="70px" height="32px" />
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
