import { BenefitsSection, Card, Hero } from "@suppers/ui-lib";

export default function Home() {
  return (
    <>
      <Hero
        title="Build Beautiful Websites at scale and speed"
        subtitle="A comprehensive UI component library built for Fresh applications. 90+ components, 30+ themes, and TypeScript-first design."
        titleColor="white"
        primaryCTA={{
          text: "Browse Components",
          href: "/components",
        }}
        secondaryCTA={{
          text: "View on GitHub",
          href: "https://github.com/suppers/ui-lib",
        }}
        variant="centered"
        background="gradient"
        size="lg"
        className="hero-gradient-bg"
      />

      {/* Technology Stack Section */}
      <section class="py-16 bg-base-100">
        <div class="container mx-auto px-6">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-base-content mb-4">
              Built with Modern Technologies
            </h2>
            <p class="text-lg text-base-content/70">
              Powered by the latest tools for optimal performance and developer experience
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card class="bg-base-200 hover:shadow-xl transition-shadow text-center">
              <div class="flex justify-center mb-4">
                <img src="https://cdn.suppers.ai/logos/deno.svg" alt="Deno" class="w-12 h-12" />
              </div>
              <h3 class="text-xl mb-2 font-semibold">Deno</h3>
              <p class="text-base-content/70">
                Modern TypeScript runtime with built-in security and performance
              </p>
            </Card>

            <Card class="bg-base-200 hover:shadow-xl transition-shadow text-center">
              <div class="flex justify-center mb-4">
                <img src="https://cdn.suppers.ai/logos/fresh.svg" alt="Fresh" class="w-12 h-12" />
              </div>
              <h3 class="text-xl mb-2 font-semibold">Fresh</h3>
              <p class="text-base-content/70">
                Zero-config web framework with islands architecture
              </p>
            </Card>

            <Card class="bg-base-200 hover:shadow-xl transition-shadow text-center">
              <div class="flex justify-center mb-4">
                <img src="https://cdn.suppers.ai/logos/preact.svg" alt="Preact" class="w-12 h-12" />
              </div>
              <h3 class="text-xl mb-2 font-semibold">Preact</h3>
              <p class="text-base-content/70">
                Fast, lightweight React alternative with the same API
              </p>
            </Card>

            <Card class="bg-base-200 hover:shadow-xl transition-shadow text-center">
              <div class="flex justify-center mb-4">
                <img src="https://cdn.suppers.ai/logos/daisyui.svg" alt="daisyUI" class="w-12 h-12" />
              </div>
              <h3 class="text-xl mb-2 font-semibold">DaisyUI</h3>
              <p class="text-base-content/70">
                Beautiful Tailwind CSS components with semantic class names
              </p>
            </Card>
          </div>
        </div>
      </section>

      <BenefitsSection />
    </>
  );
}
