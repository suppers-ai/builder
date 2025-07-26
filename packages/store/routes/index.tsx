import { type PageProps } from "fresh";
import MarketplaceHomepage from "../islands/MarketplaceHomepage.tsx";

export default function Home(props: PageProps) {
  // In a real implementation, these would be fetched from the database
  const recentApps = [];
  const templates = [];

  return (
    <>
      <MarketplaceHomepage 
        templates={templates}
        recentApps={recentApps}
      />
      
      {/* Footer */}
      <footer class="bg-base-300 py-12">
        <div class="container mx-auto px-4">
          <div class="text-center">
            <div class="mb-6">
              <h4 class="text-2xl font-bold text-base-content mb-2">Suppers Store</h4>
              <p class="text-base-content/70">Your application marketplace</p>
            </div>
            <div class="divider max-w-xs mx-auto"></div>
            <p class="text-base-content/60 text-sm">
              © 2024 Suppers Store. Built with ❤️ using Fresh, Deno, and Supabase.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
