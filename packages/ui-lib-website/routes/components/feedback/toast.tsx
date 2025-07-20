import { useState } from "preact/hooks";
import { Toast } from "@suppers/ui-lib";

export default function ToastPage() {
  const [toasts, setToasts] = useState<
    Array<{
      id: number;
      message: string;
      type: "info" | "success" | "warning" | "error";
      position?: string;
    }>
  >([]);

  const showToast = (
    message: string,
    type: "info" | "success" | "warning" | "error",
    position?: string,
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, position }]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Toast Component</h1>
        <p>Notification toasts for user feedback and system messages</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Static Toast Examples</h2>
          <div class="space-y-4">
            <Toast message="This is an info message" type="info" />
            <Toast message="Success! Your action was completed" type="success" />
            <Toast message="Warning: Please check your input" type="warning" />
            <Toast message="Error: Something went wrong" type="error" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Custom Icons</h2>
          <div class="space-y-4">
            <Toast
              message="Custom icon toast"
              type="info"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <Toast
              message="Heart icon toast"
              type="success"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              }
            />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive Toast Triggers</h2>
          <div class="flex flex-wrap gap-4">
            <button
              class="btn btn-info"
              onClick={() => showToast("Info notification triggered!", "info")}
            >
              Show Info Toast
            </button>
            <button
              class="btn btn-success"
              onClick={() => showToast("Success notification!", "success")}
            >
              Show Success Toast
            </button>
            <button
              class="btn btn-warning"
              onClick={() => showToast("Warning notification!", "warning")}
            >
              Show Warning Toast
            </button>
            <button
              class="btn btn-error"
              onClick={() => showToast("Error notification!", "error")}
            >
              Show Error Toast
            </button>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Position Examples</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              class="btn btn-outline"
              onClick={() => showToast("Top Start", "info", "top-start")}
            >
              Top Start
            </button>
            <button
              class="btn btn-outline"
              onClick={() => showToast("Top Center", "info", "top-center")}
            >
              Top Center
            </button>
            <button
              class="btn btn-outline"
              onClick={() => showToast("Top End", "info", "top-end")}
            >
              Top End
            </button>
            <button
              class="btn btn-outline"
              onClick={() => showToast("Bottom Start", "success", "bottom-start")}
            >
              Bottom Start
            </button>
            <button
              class="btn btn-outline"
              onClick={() => showToast("Bottom Center", "success", "bottom-center")}
            >
              Bottom Center
            </button>
            <button
              class="btn btn-outline"
              onClick={() => showToast("Bottom End", "success", "bottom-end")}
            >
              Bottom End
            </button>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Non-dismissible Toasts</h2>
          <div class="space-y-4">
            <Toast
              message="This toast cannot be dismissed manually"
              type="info"
              dismissible={false}
            />
            <button
              class="btn btn-primary"
              onClick={() =>
                setToasts((prev) => [...prev, {
                  id: Date.now(),
                  message: "Auto-dismiss in 6 seconds",
                  type: "warning",
                }])}
            >
              Show Auto-dismiss Toast
            </button>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Complex Toast Content</h2>
          <div class="space-y-4">
            <Toast
              message="File upload completed successfully. 3 files were processed and saved to your account."
              type="success"
            />
            <Toast
              message="Network connection lost. Please check your internet connection and try again."
              type="error"
            />
            <Toast
              message="Your session will expire in 5 minutes. Save your work to avoid losing changes."
              type="warning"
            />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Toast Stack Example</h2>
          <div class="space-y-4">
            <button
              class="btn btn-accent"
              onClick={() => {
                showToast("First toast", "info");
                setTimeout(() => showToast("Second toast", "success"), 500);
                setTimeout(() => showToast("Third toast", "warning"), 1000);
              }}
            >
              Show Multiple Toasts
            </button>

            <button
              class="btn btn-neutral"
              onClick={() => setToasts([])}
            >
              Clear All Toasts
            </button>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Usage Examples</h2>
          <div class="bg-base-200 p-6 rounded-box">
            <h3 class="text-lg font-medium mb-4">Code Examples</h3>
            <div class="space-y-4">
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Static Toast Display</code></pre>
                <pre data-prefix=">"><code>{'<Toast message="Success!" type="success" />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Interactive Toast with callbacks</code></pre>
                <pre data-prefix=">"><code>{'<Toast message="Auto-dismiss" type="info" duration={3000} onDismiss={() => console.log("dismissed")} />'}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Toast Container */}
      {toasts.map((toast) => (
        <div key={toast.id} class={`toast toast-${toast.position || "top-end"}`}>
          <Toast
            message={toast.message}
            type={toast.type}
            dismissible={true}
          />
        </div>
      ))}
    </div>
  );
}
