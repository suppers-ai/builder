import { Mask } from "@suppers/ui-lib";

export const handler = {
  GET(ctx: any) {
    ctx.state.title = "Mask Component - DaisyUI Components";
    return ctx.render();
  },
};

export default function MaskPage() {
  // Sample image for demonstrations
  const sampleImage =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMF8xIiB4MT0iMCIgeTE9IjAiIHgyPSIyMDAiIHkyPSIyMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzY2NjZGRiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMzMzMzQ0MiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzBfMSkiLz4KPHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ3aGl0ZSI+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+Cjwvc3ZnPgo8L3N2Zz4=";

  return (
    <div className="min-h-screen bg-base-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Mask Component</h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Apply creative shapes and masks to images and content. Perfect for creating unique
            visual effects, profile pictures, and design elements.
          </p>
        </div>

        {/* Basic Shapes */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Basic Shapes</h2>
            <p className="text-base-content/70">
              Fundamental geometric shapes for content masking
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {/* Circle */}
            <div className="text-center space-y-2">
              <Mask variant="circle" className="w-24 h-24 mx-auto">
                <img src={sampleImage} alt="Circle mask" className="w-full h-full object-cover" />
              </Mask>
              <h3 className="font-semibold text-sm">Circle</h3>
            </div>

            {/* Square */}
            <div className="text-center space-y-2">
              <Mask variant="square" className="w-24 h-24 mx-auto">
                <img src={sampleImage} alt="Square mask" className="w-full h-full object-cover" />
              </Mask>
              <h3 className="font-semibold text-sm">Square</h3>
            </div>

            {/* Squircle */}
            <div className="text-center space-y-2">
              <Mask variant="squircle" className="w-24 h-24 mx-auto">
                <img src={sampleImage} alt="Squircle mask" className="w-full h-full object-cover" />
              </Mask>
              <h3 className="font-semibold text-sm">Squircle</h3>
            </div>

            {/* Heart */}
            <div className="text-center space-y-2">
              <Mask variant="heart" className="w-24 h-24 mx-auto">
                <img src={sampleImage} alt="Heart mask" className="w-full h-full object-cover" />
              </Mask>
              <h3 className="font-semibold text-sm">Heart</h3>
            </div>

            {/* Diamond */}
            <div className="text-center space-y-2">
              <Mask variant="diamond" className="w-24 h-24 mx-auto">
                <img src={sampleImage} alt="Diamond mask" className="w-full h-full object-cover" />
              </Mask>
              <h3 className="font-semibold text-sm">Diamond</h3>
            </div>

            {/* Pentagon */}
            <div className="text-center space-y-2">
              <Mask variant="pentagon" className="w-24 h-24 mx-auto">
                <img src={sampleImage} alt="Pentagon mask" className="w-full h-full object-cover" />
              </Mask>
              <h3 className="font-semibold text-sm">Pentagon</h3>
            </div>
          </div>
        </section>

        {/* Polygon Shapes */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Polygon Shapes</h2>
            <p className="text-base-content/70">
              Geometric polygon masks for creative layouts
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {/* Hexagon */}
            <div className="text-center space-y-2">
              <Mask variant="hexagon" className="w-24 h-24 mx-auto">
                <img src={sampleImage} alt="Hexagon mask" className="w-full h-full object-cover" />
              </Mask>
              <h3 className="font-semibold text-sm">Hexagon</h3>
            </div>

            {/* Hexagon 2 */}
            <div className="text-center space-y-2">
              <Mask variant="hexagon-2" className="w-24 h-24 mx-auto">
                <img
                  src={sampleImage}
                  alt="Hexagon 2 mask"
                  className="w-full h-full object-cover"
                />
              </Mask>
              <h3 className="font-semibold text-sm">Hexagon 2</h3>
            </div>

            {/* Decagon */}
            <div className="text-center space-y-2">
              <Mask variant="decagon" className="w-24 h-24 mx-auto">
                <img src={sampleImage} alt="Decagon mask" className="w-full h-full object-cover" />
              </Mask>
              <h3 className="font-semibold text-sm">Decagon</h3>
            </div>

            {/* Star */}
            <div className="text-center space-y-2">
              <Mask variant="star" className="w-24 h-24 mx-auto">
                <img src={sampleImage} alt="Star mask" className="w-full h-full object-cover" />
              </Mask>
              <h3 className="font-semibold text-sm">Star</h3>
            </div>

            {/* Star 2 */}
            <div className="text-center space-y-2">
              <Mask variant="star-2" className="w-24 h-24 mx-auto">
                <img src={sampleImage} alt="Star 2 mask" className="w-full h-full object-cover" />
              </Mask>
              <h3 className="font-semibold text-sm">Star 2</h3>
            </div>
          </div>
        </section>

        {/* Triangle Variants */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Triangle Variants</h2>
            <p className="text-base-content/70">
              Different triangle orientations and styles
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Triangle */}
            <div className="text-center space-y-2">
              <Mask variant="triangle" className="w-24 h-24 mx-auto">
                <img src={sampleImage} alt="Triangle mask" className="w-full h-full object-cover" />
              </Mask>
              <h3 className="font-semibold text-sm">Triangle</h3>
            </div>

            {/* Triangle 2 */}
            <div className="text-center space-y-2">
              <Mask variant="triangle-2" className="w-24 h-24 mx-auto">
                <img
                  src={sampleImage}
                  alt="Triangle 2 mask"
                  className="w-full h-full object-cover"
                />
              </Mask>
              <h3 className="font-semibold text-sm">Triangle 2</h3>
            </div>

            {/* Triangle 3 */}
            <div className="text-center space-y-2">
              <Mask variant="triangle-3" className="w-24 h-24 mx-auto">
                <img
                  src={sampleImage}
                  alt="Triangle 3 mask"
                  className="w-full h-full object-cover"
                />
              </Mask>
              <h3 className="font-semibold text-sm">Triangle 3</h3>
            </div>

            {/* Triangle 4 */}
            <div className="text-center space-y-2">
              <Mask variant="triangle-4" className="w-24 h-24 mx-auto">
                <img
                  src={sampleImage}
                  alt="Triangle 4 mask"
                  className="w-full h-full object-cover"
                />
              </Mask>
              <h3 className="font-semibold text-sm">Triangle 4</h3>
            </div>
          </div>
        </section>

        {/* Parallelogram Variants */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Parallelogram Variants</h2>
            <p className="text-base-content/70">
              Dynamic slanted shapes for modern designs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Parallelogram */}
            <div className="text-center space-y-2">
              <Mask variant="parallelogram" className="w-24 h-24 mx-auto">
                <img
                  src={sampleImage}
                  alt="Parallelogram mask"
                  className="w-full h-full object-cover"
                />
              </Mask>
              <h3 className="font-semibold text-sm">Parallelogram</h3>
            </div>

            {/* Parallelogram 2 */}
            <div className="text-center space-y-2">
              <Mask variant="parallelogram-2" className="w-24 h-24 mx-auto">
                <img
                  src={sampleImage}
                  alt="Parallelogram 2 mask"
                  className="w-full h-full object-cover"
                />
              </Mask>
              <h3 className="font-semibold text-sm">Parallelogram 2</h3>
            </div>

            {/* Parallelogram 3 */}
            <div className="text-center space-y-2">
              <Mask variant="parallelogram-3" className="w-24 h-24 mx-auto">
                <img
                  src={sampleImage}
                  alt="Parallelogram 3 mask"
                  className="w-full h-full object-cover"
                />
              </Mask>
              <h3 className="font-semibold text-sm">Parallelogram 3</h3>
            </div>

            {/* Parallelogram 4 */}
            <div className="text-center space-y-2">
              <Mask variant="parallelogram-4" className="w-24 h-24 mx-auto">
                <img
                  src={sampleImage}
                  alt="Parallelogram 4 mask"
                  className="w-full h-full object-cover"
                />
              </Mask>
              <h3 className="font-semibold text-sm">Parallelogram 4</h3>
            </div>
          </div>
        </section>

        {/* Size Variants */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Size Variants</h2>
            <p className="text-base-content/70">
              Different mask sizes for various use cases
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Half Size */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <h3 className="card-title justify-center">Half Size</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Smaller mask for compact layouts
                </p>

                <div className="space-y-4">
                  <Mask variant="circle" size="half" className="w-16 h-16 mx-auto">
                    <img
                      src={sampleImage}
                      alt="Half size circle"
                      className="w-full h-full object-cover"
                    />
                  </Mask>

                  <Mask variant="hexagon" size="half" className="w-16 h-16 mx-auto">
                    <img
                      src={sampleImage}
                      alt="Half size hexagon"
                      className="w-full h-full object-cover"
                    />
                  </Mask>
                </div>
              </div>
            </div>

            {/* Default Size */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <h3 className="card-title justify-center">Default Size</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Standard mask size for general use
                </p>

                <div className="space-y-4">
                  <Mask variant="circle" className="w-24 h-24 mx-auto">
                    <img
                      src={sampleImage}
                      alt="Default size circle"
                      className="w-full h-full object-cover"
                    />
                  </Mask>

                  <Mask variant="hexagon" className="w-24 h-24 mx-auto">
                    <img
                      src={sampleImage}
                      alt="Default size hexagon"
                      className="w-full h-full object-cover"
                    />
                  </Mask>
                </div>
              </div>
            </div>

            {/* Full Size */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <h3 className="card-title justify-center">Full Size</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Larger mask for emphasis and prominence
                </p>

                <div className="space-y-4">
                  <Mask variant="circle" size="full" className="w-32 h-32 mx-auto">
                    <img
                      src={sampleImage}
                      alt="Full size circle"
                      className="w-full h-full object-cover"
                    />
                  </Mask>

                  <Mask variant="hexagon" size="full" className="w-32 h-32 mx-auto">
                    <img
                      src={sampleImage}
                      alt="Full size hexagon"
                      className="w-full h-full object-cover"
                    />
                  </Mask>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real-world Applications */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Real-world Applications</h2>
            <p className="text-base-content/70">
              Practical examples of mask usage in modern interfaces
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Gallery */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">User Profile Gallery</h3>
                <p className="text-sm text-base-content/70 mb-6">
                  Creative profile picture layouts with different masks
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Mask variant="circle" className="w-16 h-16 mx-auto mb-2">
                      <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-bold">
                        JD
                      </div>
                    </Mask>
                    <p className="text-xs">John Doe</p>
                  </div>

                  <div className="text-center">
                    <Mask variant="hexagon" className="w-16 h-16 mx-auto mb-2">
                      <div className="w-full h-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-secondary-content font-bold">
                        AS
                      </div>
                    </Mask>
                    <p className="text-xs">Alice Smith</p>
                  </div>

                  <div className="text-center">
                    <Mask variant="squircle" className="w-16 h-16 mx-auto mb-2">
                      <div className="w-full h-full bg-gradient-to-br from-accent to-success flex items-center justify-center text-accent-content font-bold">
                        BJ
                      </div>
                    </Mask>
                    <p className="text-xs">Bob Johnson</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Showcase */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Product Showcase</h3>
                <p className="text-sm text-base-content/70 mb-6">
                  Creative product displays with geometric masks
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <Mask variant="diamond" className="w-full aspect-square">
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl">
                      💎
                    </div>
                  </Mask>

                  <Mask variant="star" className="w-full aspect-square">
                    <div className="w-full h-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white text-2xl">
                      ⭐
                    </div>
                  </Mask>
                </div>
              </div>
            </div>

            {/* Brand Logos */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Brand Logo Display</h3>
                <p className="text-sm text-base-content/70 mb-6">
                  Logo containers with creative masking
                </p>

                <div className="flex justify-center gap-6">
                  <Mask variant="hexagon" className="w-20 h-20">
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-lg">
                      A
                    </div>
                  </Mask>

                  <Mask variant="circle" className="w-20 h-20">
                    <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-bold text-lg">
                      B
                    </div>
                  </Mask>

                  <Mask variant="pentagon" className="w-20 h-20">
                    <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-lg">
                      C
                    </div>
                  </Mask>
                </div>
              </div>
            </div>

            {/* Interactive Gallery */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Interactive Portfolio</h3>
                <p className="text-sm text-base-content/70 mb-6">
                  Clickable masked images for portfolios
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <Mask
                    variant="triangle"
                    className="w-full aspect-square cursor-pointer hover:scale-105 transition-transform"
                    onMaskClick={() => alert("Design project clicked!")}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="text-2xl mb-1">🎨</div>
                        <div className="text-xs font-bold">Design</div>
                      </div>
                    </div>
                  </Mask>

                  <Mask
                    variant="heart"
                    className="w-full aspect-square cursor-pointer hover:scale-105 transition-transform"
                    onMaskClick={() => alert("Photography project clicked!")}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="text-2xl mb-1">📸</div>
                        <div className="text-xs font-bold">Photo</div>
                      </div>
                    </div>
                  </Mask>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Creative Text Masks */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Text & Content Masks</h2>
            <p className="text-base-content/70">
              Apply masks to text and other content elements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Text in Circle */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <h3 className="card-title justify-center text-sm">Circle Text</h3>

                <Mask
                  variant="circle"
                  className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-secondary"
                >
                  <div className="w-full h-full flex items-center justify-center text-primary-content font-bold text-lg">
                    NEW
                  </div>
                </Mask>
              </div>
            </div>

            {/* Text in Star */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <h3 className="card-title justify-center text-sm">Star Badge</h3>

                <Mask
                  variant="star"
                  className="w-24 h-24 mx-auto bg-gradient-to-br from-warning to-error"
                >
                  <div className="w-full h-full flex items-center justify-center text-warning-content font-bold text-sm">
                    SALE
                  </div>
                </Mask>
              </div>
            </div>

            {/* Text in Diamond */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <h3 className="card-title justify-center text-sm">Diamond Label</h3>

                <Mask
                  variant="diamond"
                  className="w-24 h-24 mx-auto bg-gradient-to-br from-accent to-info"
                >
                  <div className="w-full h-full flex items-center justify-center text-accent-content font-bold text-sm">
                    VIP
                  </div>
                </Mask>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
