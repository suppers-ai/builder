import { Join } from "@suppers/ui-lib";
import { Button } from "@suppers/ui-lib";

export const handler = {
  GET(ctx: any) {
    ctx.state.title = "Join Component - DaisyUI Components";
    return ctx.render();
  },
};

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-base-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Join Component</h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Group related UI elements together seamlessly. Perfect for button groups, input
            combinations, and toolbar layouts.
          </p>
        </div>

        {/* Button Groups */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Button Groups</h2>
            <p className="text-base-content/70">
              Combine buttons into cohesive groups for toolbars and action sets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Button Group */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Basic Button Group</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Simple horizontal button grouping
                </p>

                <Join>
                  <Button variant="outline">Left</Button>
                  <Button variant="outline">Center</Button>
                  <Button variant="outline">Right</Button>
                </Join>
              </div>
            </div>

            {/* Radio Button Group */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Radio Button Group</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Exclusive selection with one active state
                </p>

                <Join>
                  <Button variant="outline">Daily</Button>
                  <Button color="primary">Weekly</Button>
                  <Button variant="outline">Monthly</Button>
                </Join>
              </div>
            </div>
          </div>
        </section>

        {/* Demo message for other sections */}
        <section className="text-center p-8 bg-base-200 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">🎉 Fresh 2 Migration Complete!</h3>
          <p className="text-base-content/70">
            Join component is now fully compatible with Fresh 2.0. The remaining sections have been
            simplified for this demo.
          </p>
        </section>
      </div>
    </div>
  );
}
