import { type PageProps } from "fresh";
import { Button, Card, Hero } from "@suppers/ui-lib";

export default function Home(props: PageProps) {
  return (
    <div class="store-container">
      <Hero class="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
        <div class="hero-content text-center">
          <div class="max-w-2xl">
            <h1 class="text-5xl font-bold text-primary mb-6">
              🚀 Suppers Store
            </h1>
            <h2 class="text-2xl font-semibold text-base-content mb-4">
              Your Authentication Hub
            </h2>
            <p class="text-lg text-base-content/80 mb-8">
              Secure, centralized authentication for all your applications. Sign in once, access
              everywhere.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as="a"
                href="/login"
                color="primary"
                size="lg"
                class="shadow-lg"
              >
                Sign In
              </Button>
              <Button
                as="a"
                href="/login?mode=register"
                variant="outline"
                color="primary"
                size="lg"
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </Hero>

      <div class="container mx-auto px-4 py-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-base-content mb-4">
            Why Choose Suppers Store?
          </h2>
          <p class="text-lg text-base-content/70 max-w-2xl mx-auto">
            Built for developers, designed for users. Experience seamless authentication across all
            your applications.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <Card class="text-center p-8">
            <div class="text-4xl mb-4">🔒</div>
            <h3 class="text-xl font-semibold mb-3">Secure</h3>
            <p class="text-base-content/70">
              Enterprise-grade security with OAuth 2.0, JWT tokens, and multi-factor authentication
              support.
            </p>
          </Card>

          <Card class="text-center p-8">
            <div class="text-4xl mb-4">⚡</div>
            <h3 class="text-xl font-semibold mb-3">Fast</h3>
            <p class="text-base-content/70">
              Lightning-fast authentication with optimized session management and token refresh.
            </p>
          </Card>

          <Card class="text-center p-8">
            <div class="text-4xl mb-4">🔗</div>
            <h3 class="text-xl font-semibold mb-3">Connected</h3>
            <p class="text-base-content/70">
              Single sign-on across all your applications with seamless integration.
            </p>
          </Card>
        </div>

        <div class="mt-16 text-center">
          <Card class="bg-base-200 p-8">
            <h3 class="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p class="text-base-content/70 mb-6">
              Join thousands of users who trust Suppers Store for their authentication needs.
            </p>
            <Button
              as="a"
              href="/login"
              color="primary"
              size="lg"
            >
              Get Started Now
            </Button>
          </Card>
        </div>
      </div>

      <footer class="bg-base-300 text-center py-8">
        <div class="container mx-auto px-4">
          <p class="text-base-content/60">
            © 2024 Suppers Store. Built with ❤️ using Fresh and Deno.
          </p>
        </div>
      </footer>
    </div>
  );
}
