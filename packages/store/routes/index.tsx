import { type PageProps } from "fresh";
import { Button, Card, Hero } from "@suppers/ui-lib";

export default function Home(props: PageProps) {
  return (
    <div class="min-h-screen">
      {/* Hero Section */}
      <Hero 
        title="🚀 Suppers Store"
        subtitle="Your centralized authentication hub. Secure, fast, and seamless login for all your applications."
        primaryCTA={{
          text: "Sign In",
          href: "/login"
        }}
        secondaryCTA={{
          text: "Create Account",
          href: "/login?mode=register"
        }}
        class="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20"
        variant="centered"
        size="full"
      />

      {/* Features Section */}
      <section class="py-24 bg-base-100">
        <div class="container mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-base-content mb-6">
              Why Choose Suppers Store?
            </h2>
            <p class="text-xl text-base-content/80 max-w-3xl mx-auto leading-relaxed">
              Built for developers, designed for users. Experience seamless authentication 
              with enterprise-grade security and lightning-fast performance.
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card class="text-center p-8 hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-base-200 to-base-100">
              <div class="text-6xl mb-6">🔒</div>
              <h3 class="text-2xl font-bold mb-4 text-primary">Secure</h3>
              <p class="text-base-content/70 leading-relaxed text-lg">
                Enterprise-grade security with OAuth 2.0, JWT tokens, and multi-factor 
                authentication support. Your data is protected at every level.
              </p>
            </Card>

            <Card class="text-center p-8 hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-base-200 to-base-100">
              <div class="text-6xl mb-6">⚡</div>
              <h3 class="text-2xl font-bold mb-4 text-secondary">Fast</h3>
              <p class="text-base-content/70 leading-relaxed text-lg">
                Lightning-fast authentication with optimized session management and 
                intelligent token refresh. No waiting, just seamless access.
              </p>
            </Card>

            <Card class="text-center p-8 hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-base-200 to-base-100">
              <div class="text-6xl mb-6">🔗</div>
              <h3 class="text-2xl font-bold mb-4 text-accent">Connected</h3>
              <p class="text-base-content/70 leading-relaxed text-lg">
                Single sign-on across all your applications. One login, unlimited access 
                to your entire ecosystem of tools and services.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section class="py-24 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto">
            <Card class="text-center p-12 shadow-2xl border-0 bg-base-100/90 backdrop-blur-sm">
              <h3 class="text-3xl font-bold mb-6 text-base-content">
                Ready to Get Started?
              </h3>
              <p class="text-xl text-base-content/80 mb-8 leading-relaxed">
                Join thousands of developers and users who trust Suppers Store 
                for their authentication needs. Get started in minutes.
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  as="a"
                  href="/login"
                  color="primary"
                  size="lg"
                  class="px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started Now
                </Button>
                <Button
                  as="a"
                  href="/login?mode=register"
                  variant="outline"
                  color="primary"
                  size="lg"
                  class="px-8 py-4 text-lg"
                >
                  Create Free Account
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer class="bg-base-300 py-12">
        <div class="container mx-auto px-4">
          <div class="text-center">
            <div class="mb-6">
              <h4 class="text-2xl font-bold text-base-content mb-2">Suppers Store</h4>
              <p class="text-base-content/70">Your trusted authentication hub</p>
            </div>
            <div class="divider max-w-xs mx-auto"></div>
            <p class="text-base-content/60 text-sm">
              © 2024 Suppers Store. Built with ❤️ using Fresh, Deno, and Supabase.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
