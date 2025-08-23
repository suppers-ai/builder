import { PageProps } from "fresh";

export default function IndexPage(props: PageProps) {
  // Redirect to the profile package's products page
  return (
    <div class="min-h-screen bg-base-200 flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-2xl font-bold mb-4">Redirecting...</h1>
        <p class="text-base-content/70 mb-6">
          The payments dashboard has been moved to the profile section.
        </p>
        <a href="/products" class="btn btn-primary">
          Go to My Products
        </a>
        <script>{`
          setTimeout(() => {
            window.location.href = '/products';
          }, 2000);
        `}</script>
      </div>
    </div>
  );
}
