import { HeroSection, BenefitsSection } from "@suppers/ui-lib";

export default function Home() {
  return (
    <>
      <HeroSection />
      
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
            <div class="card bg-base-200 shadow-lg">
              <div class="card-body text-center">
                <div class="text-4xl mb-4">🦕</div>
                <h3 class="card-title justify-center text-xl mb-2">Deno</h3>
                <p class="text-base-content/70">
                  Modern TypeScript runtime with built-in security and performance
                </p>
              </div>
            </div>
            
            <div class="card bg-base-200 shadow-lg">
              <div class="card-body text-center">
                <div class="text-4xl mb-4">🍋</div>
                <h3 class="card-title justify-center text-xl mb-2">Fresh</h3>
                <p class="text-base-content/70">
                  Zero-config web framework with islands architecture
                </p>
              </div>
            </div>
            
            <div class="card bg-base-200 shadow-lg">
              <div class="card-body text-center">
                <div class="text-4xl mb-4">⚛️</div>
                <h3 class="card-title justify-center text-xl mb-2">Preact</h3>
                <p class="text-base-content/70">
                  Fast, lightweight React alternative with the same API
                </p>
              </div>
            </div>
            
            <div class="card bg-base-200 shadow-lg">
              <div class="card-body text-center">
                <div class="text-4xl mb-4">🌼</div>
                <h3 class="card-title justify-center text-xl mb-2">DaisyUI</h3>
                <p class="text-base-content/70">
                  Beautiful Tailwind CSS components with semantic class names
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <BenefitsSection />
    </>
  );
}
