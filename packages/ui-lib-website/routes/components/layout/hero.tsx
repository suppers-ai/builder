import { Hero } from "@suppers/ui-lib";

export const handler = {
  GET(ctx: any) {
    ctx.state.title = "Hero Component - DaisyUI Components";
    return ctx.render();
  },
};

export default function HeroPage() {
  // Sample content components
  const sampleImage = (
    <div className="mockup-phone">
      <div className="camera"></div>
      <div className="display">
        <div className="artboard artboard-demo phone-1 bg-gradient-to-br from-primary to-secondary p-8">
          <div className="text-white text-center">
            <div className="text-2xl font-bold mb-4">📱</div>
            <div className="text-sm">Sample App UI</div>
          </div>
        </div>
      </div>
    </div>
  );

  const dashboardPreview = (
    <div className="mockup-window border bg-base-300">
      <div className="flex justify-center px-4 py-16 bg-base-200">
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
          <div className="h-8 bg-primary rounded"></div>
          <div className="h-8 bg-secondary rounded"></div>
          <div className="h-8 bg-accent rounded"></div>
          <div className="h-12 bg-primary/20 rounded col-span-2"></div>
          <div className="h-12 bg-secondary/20 rounded"></div>
          <div className="h-16 bg-accent/20 rounded col-span-3"></div>
        </div>
      </div>
    </div>
  );

  const featureIllustration = (
    <div className="grid grid-cols-2 gap-4 max-w-md">
      <div className="h-32 bg-gradient-to-br from-primary to-primary/20 rounded-lg flex items-center justify-center">
        <span className="text-3xl">🚀</span>
      </div>
      <div className="h-32 bg-gradient-to-br from-secondary to-secondary/20 rounded-lg flex items-center justify-center">
        <span className="text-3xl">⚡</span>
      </div>
      <div className="h-32 bg-gradient-to-br from-accent to-accent/20 rounded-lg flex items-center justify-center">
        <span className="text-3xl">🎯</span>
      </div>
      <div className="h-32 bg-gradient-to-br from-success to-success/20 rounded-lg flex items-center justify-center">
        <span className="text-3xl">✨</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="text-center p-8 bg-base-200">
        <h1 className="text-4xl font-bold mb-4">Hero Component</h1>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
          Eye-catching hero sections for landing pages, product showcases, and marketing websites.
          Create impactful first impressions with flexible layouts and compelling call-to-actions.
        </p>
      </div>

      {/* Default Hero */}
      <section>
        <Hero
          title="Welcome to Our Platform"
          subtitle="The ultimate solution for modern businesses. Streamline your workflow, boost productivity, and achieve your goals with our comprehensive suite of tools."
          primaryCTA={{
            text: "Get Started Free",
            href: "#",
          }}
          secondaryCTA={{
            text: "Watch Demo",
            href: "#",
          }}
          content={sampleImage}
          size="lg"
        />
      </section>

      {/* Centered Minimal Hero */}
      <section>
        <Hero
          title="Simple. Powerful. Effective."
          subtitle="Focus on what matters most with our minimalist approach to productivity."
          primaryCTA={{
            text: "Try It Now",
            href: "#",
          }}
          variant="minimal"
          background="gradient"
          size="md"
        />
      </section>

      {/* Split Layout Hero */}
      <section className="bg-base-200">
        <Hero
          title="Revolutionary Dashboard Experience"
          subtitle="Visualize your data like never before. Our intuitive dashboard provides real-time insights and powerful analytics to drive your business forward."
          primaryCTA={{
            text: "Start Free Trial",
            href: "#",
          }}
          secondaryCTA={{
            text: "View Features",
            href: "#",
          }}
          content={dashboardPreview}
          variant="split"
          contentPosition="right"
          background="default"
          size="lg"
        />
      </section>

      {/* Overlay Hero with Background */}
      <section>
        <Hero
          title="Build the Future"
          subtitle="Join thousands of innovators who trust our platform to bring their ideas to life."
          primaryCTA={{
            text: "Join the Community",
            href: "#",
          }}
          variant="overlay"
          background="gradient"
          size="full"
          align="center"
        />
      </section>

      {/* Feature-focused Hero */}
      <section className="bg-base-100">
        <Hero
          title="Everything You Need to Succeed"
          subtitle="Comprehensive tools, seamless integrations, and expert support - all in one place."
          primaryCTA={{
            text: "Explore Features",
            href: "#",
          }}
          secondaryCTA={{
            text: "Contact Sales",
            href: "#",
          }}
          content={featureIllustration}
          variant="split"
          contentPosition="left"
          size="lg"
        />
      </section>

      {/* Demo Sections */}
      <div className="max-w-6xl mx-auto p-8 space-y-16">
        {/* SaaS Product Hero */}
        <section className="card bg-base-200 shadow-xl">
          <div className="card-body p-0">
            <h2 className="card-title text-2xl p-6 pb-0">SaaS Product Landing</h2>
            <Hero
              title="Scale Your Business with AI"
              subtitle="Automate complex workflows, gain intelligent insights, and accelerate growth with our AI-powered platform."
              primaryCTA={{
                text: "Start 14-Day Trial",
                href: "#",
              }}
              secondaryCTA={{
                text: "Schedule Demo",
                href: "#",
              }}
              content={
                <div className="stats shadow">
                  <div className="stat">
                    <div className="stat-figure text-primary">
                      <div className="text-3xl">📈</div>
                    </div>
                    <div className="stat-title">Revenue Growth</div>
                    <div className="stat-value text-primary">40%</div>
                  </div>
                  <div className="stat">
                    <div className="stat-figure text-secondary">
                      <div className="text-3xl">⚡</div>
                    </div>
                    <div className="stat-title">Efficiency</div>
                    <div className="stat-value text-secondary">3x</div>
                  </div>
                </div>
              }
              variant="split"
              size="md"
            />
          </div>
        </section>

        {/* E-commerce Hero */}
        <section className="card bg-base-200 shadow-xl">
          <div className="card-body p-0">
            <h2 className="card-title text-2xl p-6 pb-0">E-commerce Store</h2>
            <Hero
              title="Premium Quality, Affordable Prices"
              subtitle="Discover our curated collection of products designed for modern living. Free shipping on orders over $75."
              primaryCTA={{
                text: "Shop Now",
                href: "#",
              }}
              secondaryCTA={{
                text: "View Catalog",
                href: "#",
              }}
              content={
                <div className="carousel w-64 rounded-box">
                  <div className="carousel-item w-full">
                    <div className="w-full h-48 bg-gradient-to-br from-primary to-primary/20 rounded-lg flex items-center justify-center">
                      <span className="text-4xl">👕</span>
                    </div>
                  </div>
                  <div className="carousel-item w-full">
                    <div className="w-full h-48 bg-gradient-to-br from-secondary to-secondary/20 rounded-lg flex items-center justify-center">
                      <span className="text-4xl">👟</span>
                    </div>
                  </div>
                </div>
              }
              variant="split"
              contentPosition="right"
              size="md"
            />
          </div>
        </section>

        {/* Agency Portfolio Hero */}
        <section className="card bg-base-200 shadow-xl">
          <div className="card-body p-0">
            <h2 className="card-title text-2xl p-6 pb-0">Creative Agency</h2>
            <Hero
              title="Creative Solutions for Bold Brands"
              subtitle="We craft exceptional digital experiences that connect brands with their audiences through innovative design and strategic thinking."
              primaryCTA={{
                text: "View Our Work",
                href: "#",
              }}
              secondaryCTA={{
                text: "Start a Project",
                href: "#",
              }}
              content={
                <div className="grid grid-cols-2 gap-2 max-w-xs">
                  <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                  </div>
                </div>
              }
              variant="split"
              contentPosition="left"
              size="md"
            />
          </div>
        </section>

        {/* App Download Hero */}
        <section className="card bg-base-200 shadow-xl">
          <div className="card-body p-0">
            <h2 className="card-title text-2xl p-6 pb-0">Mobile App Promotion</h2>
            <Hero
              title="Your Life, Organized"
              subtitle="The all-in-one productivity app that adapts to your workflow. Available on iOS and Android."
              primaryCTA={{
                text: "Download for iOS",
                href: "#",
              }}
              secondaryCTA={{
                text: "Get on Android",
                href: "#",
              }}
              content={
                <div className="flex gap-4">
                  <div className="mockup-phone scale-75">
                    <div className="camera"></div>
                    <div className="display">
                      <div className="artboard artboard-demo phone-1 bg-gradient-to-br from-primary to-secondary">
                        <div className="text-white p-4">
                          <div className="text-center mb-4">📱 App UI</div>
                          <div className="space-y-2">
                            <div className="h-3 bg-white/30 rounded"></div>
                            <div className="h-3 bg-white/20 rounded w-3/4"></div>
                            <div className="h-3 bg-white/30 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
              variant="split"
              size="md"
            />
          </div>
        </section>

        {/* Event Landing Hero */}
        <section className="card bg-base-200 shadow-xl">
          <div className="card-body p-0">
            <h2 className="card-title text-2xl p-6 pb-0">Event Landing Page</h2>
            <Hero
              title="Tech Conference 2024"
              subtitle="Join industry leaders, innovators, and visionaries for three days of cutting-edge technology insights. San Francisco, October 15-17."
              primaryCTA={{
                text: "Register Now",
                href: "#",
              }}
              secondaryCTA={{
                text: "View Speakers",
                href: "#",
              }}
              content={
                <div className="text-center">
                  <div className="countdown font-mono text-4xl mb-4">
                    <span style={{ "--value": 15 } as any}></span>:
                    <span style={{ "--value": 10 } as any}></span>:
                    <span style={{ "--value": 24 } as any}></span>
                  </div>
                  <div className="text-sm opacity-70">Days : Hours : Minutes</div>
                </div>
              }
              variant="centered"
              background="gradient"
              size="md"
            />
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6">Interactive Hero Demo</h2>
            <div className="space-y-6">
              <div className="alert alert-info">
                <span>🎯 Click the buttons below to see interactive behaviors in action!</span>
              </div>

              <Hero
                title="Interactive Hero Section"
                subtitle="This hero section demonstrates interactive callbacks and enhanced functionality."
                primaryCTA={{
                  text: "Primary Action",
                  href: "#",
                }}
                secondaryCTA={{
                  text: "Secondary Action",
                  href: "#",
                }}
                onPrimaryCTAClick={() => alert("Primary CTA clicked!")}
                onSecondaryCTAClick={() => alert("Secondary CTA clicked!")}
                variant="centered"
                size="sm"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
