import { useState } from "preact/hooks";
import { Rating } from "@suppers/ui-lib";

export default function RatingPage() {
  const [ratingValue, setRatingValue] = useState(3);
  const [productRating, setProductRating] = useState(4.5);
  const [reviewRating, setReviewRating] = useState(0);

  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Rating Component</h1>
        <p>Star rating component for user feedback and displaying ratings</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Ratings</h2>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <span class="w-24">No rating:</span>
              <Rating value={0} />
            </div>
            <div class="flex items-center gap-4">
              <span class="w-24">2 stars:</span>
              <Rating value={2} />
            </div>
            <div class="flex items-center gap-4">
              <span class="w-24">4 stars:</span>
              <Rating value={4} />
            </div>
            <div class="flex items-center gap-4">
              <span class="w-24">Full 5 stars:</span>
              <Rating value={5} />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Sizes</h2>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <span class="w-24">Extra Small:</span>
              <Rating value={4} size="xs" />
            </div>
            <div class="flex items-center gap-4">
              <span class="w-24">Small:</span>
              <Rating value={4} size="sm" />
            </div>
            <div class="flex items-center gap-4">
              <span class="w-24">Medium:</span>
              <Rating value={4} size="md" />
            </div>
            <div class="flex items-center gap-4">
              <span class="w-24">Large:</span>
              <Rating value={4} size="lg" />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Masks</h2>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <span class="w-24">Star:</span>
              <Rating value={4} mask="star" />
            </div>
            <div class="flex items-center gap-4">
              <span class="w-24">Star-2:</span>
              <Rating value={4} mask="star-2" />
            </div>
            <div class="flex items-center gap-4">
              <span class="w-24">Heart:</span>
              <Rating value={4} mask="heart" />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Half Star Ratings</h2>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <span class="w-24">2.5 stars:</span>
              <Rating value={2.5} half />
            </div>
            <div class="flex items-center gap-4">
              <span class="w-24">3.5 stars:</span>
              <Rating value={3.5} half />
            </div>
            <div class="flex items-center gap-4">
              <span class="w-24">4.5 stars:</span>
              <Rating value={4.5} half />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive Ratings</h2>
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold mb-2">Basic Interactive Rating</h3>
              <div class="flex items-center gap-4">
                <span class="w-32">Current rating:</span>
                <Rating
                  value={ratingValue}
                  onChange={(value) => setRatingValue(value)}
                />
                <span class="badge badge-primary">{ratingValue} stars</span>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold mb-2">Product Rating with Half Stars</h3>
              <div class="flex items-center gap-4">
                <span class="w-32">Product rating:</span>
                <Rating
                  value={productRating}
                  half
                  onChange={(value) => setProductRating(value)}
                  onHover={(value) => console.log(`Hovering: ${value}`)}
                />
                <span class="badge badge-accent">{productRating} stars</span>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold mb-2">Review Rating (Start from 0)</h3>
              <div class="flex items-center gap-4">
                <span class="w-32">Your review:</span>
                <Rating
                  value={reviewRating}
                  onChange={(value) => setReviewRating(value)}
                />
                <span class="badge badge-secondary">{reviewRating || "No rating"}</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Star Counts</h2>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <span class="w-24">3 stars max:</span>
              <Rating value={2} max={3} />
            </div>
            <div class="flex items-center gap-4">
              <span class="w-24">10 stars max:</span>
              <Rating value={7} max={10} />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Product Card Examples</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="card bg-base-100 shadow-xl">
              <figure>
                <img
                  src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                  alt="Product"
                  class="h-48 w-full object-cover"
                />
              </figure>
              <div class="card-body">
                <h2 class="card-title">Amazing Product</h2>
                <div class="flex items-center gap-2">
                  <Rating value={4.5} half size="sm" />
                  <span class="text-sm text-base-content/70">(128 reviews)</span>
                </div>
                <p class="text-lg font-bold text-primary">$29.99</p>
                <div class="card-actions justify-end">
                  <button class="btn btn-primary btn-sm">Add to Cart</button>
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-xl">
              <figure>
                <img
                  src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp"
                  alt="Product"
                  class="h-48 w-full object-cover"
                />
              </figure>
              <div class="card-body">
                <h2 class="card-title">Great Service</h2>
                <div class="flex items-center gap-2">
                  <Rating value={5} size="sm" />
                  <span class="text-sm text-base-content/70">(42 reviews)</span>
                </div>
                <p class="text-lg font-bold text-primary">$49.99</p>
                <div class="card-actions justify-end">
                  <button class="btn btn-primary btn-sm">Add to Cart</button>
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-xl">
              <figure>
                <img
                  src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp"
                  alt="Product"
                  class="h-48 w-full object-cover"
                />
              </figure>
              <div class="card-body">
                <h2 class="card-title">Quality Item</h2>
                <div class="flex items-center gap-2">
                  <Rating value={3.5} half size="sm" />
                  <span class="text-sm text-base-content/70">(89 reviews)</span>
                </div>
                <p class="text-lg font-bold text-primary">$19.99</p>
                <div class="card-actions justify-end">
                  <button class="btn btn-primary btn-sm">Add to Cart</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Review Form Example</h2>
          <div class="card bg-base-100 shadow-xl max-w-md">
            <div class="card-body">
              <h2 class="card-title">Leave a Review</h2>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Your Rating</span>
                </label>
                <Rating
                  value={reviewRating}
                  onChange={(value) => setReviewRating(value)}
                  size="lg"
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Review Text</span>
                </label>
                <textarea class="textarea textarea-bordered" placeholder="Write your review...">
                </textarea>
              </div>
              <div class="card-actions justify-end">
                <button class="btn btn-primary">Submit Review</button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Usage Examples</h2>
          <div class="bg-base-200 p-6 rounded-box">
            <h3 class="text-lg font-medium mb-4">Code Examples</h3>
            <div class="space-y-4">
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Static Rating Display</code></pre>
                <pre data-prefix=">"><code>{'<Rating value={4.5} half />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Interactive Rating</code></pre>
                <pre data-prefix=">"><code>{'<Rating value={rating} onChange={(value) => setRating(value)} />'}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
