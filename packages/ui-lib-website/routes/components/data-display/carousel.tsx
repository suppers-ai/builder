import { Carousel } from "@suppers/ui-lib";
import { useState } from "preact/hooks";

export default function CarouselPage() {
  const productImages = [
    "https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp",
    "https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp",
    "https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp",
    "https://img.daisyui.com/images/stock/photo-1494253109108-2e30c049369b.webp",
  ];

  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Carousel Component</h1>
        <p>Image and content carousel with navigation, indicators, and auto-slide functionality</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Image Carousel</h2>
          <div class="max-w-md mx-auto">
            <Carousel>
              <img
                src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp"
                class="w-full"
                alt="Slide 1"
              />
              <img
                src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp"
                class="w-full"
                alt="Slide 2"
              />
              <img
                src="https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp"
                class="w-full"
                alt="Slide 3"
              />
            </Carousel>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive Carousel with Controls</h2>
          <div class="max-w-lg mx-auto">
            <Carousel
              showControls={true}
              allowAutoSlideToggle={true}
              showSlideCounter={true}
              autoSlide={false}
              interval={3000}
            >
              {productImages.map((src, index) => (
                <img key={index} src={src} class="w-full rounded-lg" alt={`Product ${index + 1}`} />
              ))}
            </Carousel>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Content Cards Carousel</h2>
          <div class="max-w-2xl mx-auto">
            <Carousel snap="center">
              <div class="card bg-base-100 shadow-xl mx-2">
                <div class="card-body">
                  <h2 class="card-title">Card 1</h2>
                  <p>
                    This is the first card in the carousel. It contains some interesting content.
                  </p>
                  <div class="card-actions justify-end">
                    <button class="btn btn-primary">Action</button>
                  </div>
                </div>
              </div>

              <div class="card bg-base-100 shadow-xl mx-2">
                <div class="card-body">
                  <h2 class="card-title">Card 2</h2>
                  <p>This is the second card with different content to showcase variety.</p>
                  <div class="card-actions justify-end">
                    <button class="btn btn-secondary">Action</button>
                  </div>
                </div>
              </div>

              <div class="card bg-base-100 shadow-xl mx-2">
                <div class="card-body">
                  <h2 class="card-title">Card 3</h2>
                  <p>The third card demonstrates how carousel works with various content types.</p>
                  <div class="card-actions justify-end">
                    <button class="btn btn-accent">Action</button>
                  </div>
                </div>
              </div>
            </Carousel>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Product Gallery Example</h2>
          <div class="max-w-4xl mx-auto">
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <Carousel indicators={true} navigation={true}>
                  <img
                    src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                    class="w-full h-80 object-cover rounded-lg"
                    alt="Product Main"
                  />
                  <img
                    src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp"
                    class="w-full h-80 object-cover rounded-lg"
                    alt="Product Alt 1"
                  />
                  <img
                    src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp"
                    class="w-full h-80 object-cover rounded-lg"
                    alt="Product Alt 2"
                  />
                  <img
                    src="https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp"
                    class="w-full h-80 object-cover rounded-lg"
                    alt="Product Alt 3"
                  />
                </Carousel>
              </div>

              <div class="space-y-4">
                <h3 class="text-2xl font-bold">Amazing Product</h3>
                <div class="flex items-center gap-2">
                  <div class="rating rating-sm">
                    <input type="radio" name="rating-5" class="mask mask-star-2 bg-orange-400" />
                    <input type="radio" name="rating-5" class="mask mask-star-2 bg-orange-400" />
                    <input type="radio" name="rating-5" class="mask mask-star-2 bg-orange-400" />
                    <input
                      type="radio"
                      name="rating-5"
                      class="mask mask-star-2 bg-orange-400"
                      checked
                    />
                    <input type="radio" name="rating-5" class="mask mask-star-2 bg-orange-400" />
                  </div>
                  <span class="text-sm">(42 reviews)</span>
                </div>
                <p class="text-3xl font-bold text-primary">$299.99</p>
                <p class="text-base-content/80">
                  This amazing product features multiple angles shown in the carousel. Navigate
                  through the images to see all the details and features.
                </p>
                <div class="flex gap-4">
                  <button class="btn btn-primary">Add to Cart</button>
                  <button class="btn btn-outline">Add to Wishlist</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">No Navigation/Indicators</h2>
          <div class="max-w-md mx-auto">
            <Carousel navigation={false} indicators={false}>
              <div class="bg-gradient-to-r from-primary to-secondary text-primary-content p-8 text-center rounded-lg">
                <h3 class="text-xl font-bold">Slide 1</h3>
                <p>Content without navigation</p>
              </div>
              <div class="bg-gradient-to-r from-secondary to-accent text-secondary-content p-8 text-center rounded-lg">
                <h3 class="text-xl font-bold">Slide 2</h3>
                <p>Pure content display</p>
              </div>
            </Carousel>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Vertical Carousel</h2>
          <div class="max-w-xs mx-auto h-96">
            <Carousel vertical={true} snap="center">
              <div class="bg-primary text-primary-content p-6 text-center rounded-lg h-24 flex items-center justify-center">
                <span class="text-lg font-bold">Vertical Slide 1</span>
              </div>
              <div class="bg-secondary text-secondary-content p-6 text-center rounded-lg h-24 flex items-center justify-center">
                <span class="text-lg font-bold">Vertical Slide 2</span>
              </div>
              <div class="bg-accent text-accent-content p-6 text-center rounded-lg h-24 flex items-center justify-center">
                <span class="text-lg font-bold">Vertical Slide 3</span>
              </div>
            </Carousel>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Auto-Slide Carousel</h2>
          <div class="max-w-lg mx-auto">
            <Carousel autoSlide={true} interval={2000}>
              <div class="bg-info text-info-content p-8 text-center rounded-lg">
                <h3 class="text-xl font-bold">Auto Slide 1</h3>
                <p>Changes every 2 seconds</p>
              </div>
              <div class="bg-success text-success-content p-8 text-center rounded-lg">
                <h3 class="text-xl font-bold">Auto Slide 2</h3>
                <p>Automatic progression</p>
              </div>
              <div class="bg-warning text-warning-content p-8 text-center rounded-lg">
                <h3 class="text-xl font-bold">Auto Slide 3</h3>
                <p>No manual interaction needed</p>
              </div>
            </Carousel>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Testimonials Carousel</h2>
          <div class="max-w-2xl mx-auto">
            <Carousel autoSlide={true} interval={5000}>
              <div class="card bg-base-100 shadow-xl">
                <div class="card-body text-center">
                  <div class="avatar">
                    <div class="w-16 rounded-full">
                      <img
                        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        alt="User 1"
                      />
                    </div>
                  </div>
                  <p class="text-lg italic">
                    "This product changed my life! Amazing quality and service."
                  </p>
                  <h3 class="font-bold">Sarah Johnson</h3>
                  <p class="text-sm opacity-70">CEO, TechCorp</p>
                </div>
              </div>

              <div class="card bg-base-100 shadow-xl">
                <div class="card-body text-center">
                  <div class="avatar">
                    <div class="w-16 rounded-full">
                      <img
                        src="https://img.daisyui.com/images/stock/photo-1507003211169-0a1dd7228f2d.webp"
                        alt="User 2"
                      />
                    </div>
                  </div>
                  <p class="text-lg italic">
                    "Excellent experience from start to finish. Highly recommended!"
                  </p>
                  <h3 class="font-bold">Mike Chen</h3>
                  <p class="text-sm opacity-70">Designer, Creative Studio</p>
                </div>
              </div>

              <div class="card bg-base-100 shadow-xl">
                <div class="card-body text-center">
                  <div class="avatar">
                    <div class="w-16 rounded-full">
                      <img
                        src="https://img.daisyui.com/images/stock/photo-1517841905240-472988babdf9.webp"
                        alt="User 3"
                      />
                    </div>
                  </div>
                  <p class="text-lg italic">
                    "Outstanding quality and customer support. Will definitely buy again."
                  </p>
                  <h3 class="font-bold">Emma Davis</h3>
                  <p class="text-sm opacity-70">Marketing Manager, GrowthCo</p>
                </div>
              </div>
            </Carousel>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Usage Examples</h2>
          <div class="bg-base-200 p-6 rounded-box">
            <h3 class="text-lg font-medium mb-4">Code Examples</h3>
            <div class="space-y-4">
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Basic Carousel Display</code></pre>
                <pre data-prefix=">"><code>{'<Carousel><img src="..." /><img src="..." /></Carousel>'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Interactive Carousel with auto-slide</code></pre>
                <pre data-prefix=">"><code>{'<Carousel autoSlide interval={3000} onSlideChange={(index) => console.log(index)}>'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Vertical Carousel</code></pre>
                <pre data-prefix=">"><code>{'<Carousel vertical snap="center">...</Carousel>'}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
