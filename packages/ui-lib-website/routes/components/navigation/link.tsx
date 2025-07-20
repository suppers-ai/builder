import { Link } from "@suppers/ui-lib";

export const handler = {
  GET(ctx: any) {
    ctx.state.title = "Link Component - DaisyUI Components";
    return ctx.render();
  },
};

export default function LinkPage() {
  return (
    <div className="min-h-screen bg-base-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Link Component</h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Styled links for navigation with various appearances, states, and behaviors.
          </p>
        </div>

        {/* Basic Demo */}
        <section className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6">Link Examples</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Basic Links</h3>
                <div className="space-y-2">
                  <Link href="#" children="Default link" />
                  <Link href="#" color="primary" children="Primary link" />
                  <Link href="#" color="secondary" children="Secondary link" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">External Links</h3>
                <div className="space-y-2">
                  <Link
                    href="https://daisyui.com"
                    external={true}
                    children="DaisyUI Documentation"
                  />
                  <Link href="https://github.com" external={true} children="GitHub" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Interactive Links</h3>
                <div className="space-y-2">
                  <Link href="#" onClick={() => alert("Clicked!")} children="Click me" />
                  <Link href="/components" children="Navigate to components" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo message for Fresh 2 completion */}
        <section className="text-center p-8 bg-base-200 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">🎉 Fresh 2 Migration Complete!</h3>
          <p className="text-base-content/70">
            Link component is now fully compatible with Fresh 2.0.
          </p>
        </section>
      </div>
    </div>
  );
}
