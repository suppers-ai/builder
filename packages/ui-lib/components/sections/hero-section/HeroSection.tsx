import {
  ArrowRight,
  Code2,
  Download,
  Github,
  Layout,
  Palette,
  Palmtree,
  Star,
  Zap,
} from "lucide-preact";
import { Button } from "../../action/button/Button.tsx";

export function HeroSection() {
  return (
    <section class="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 overflow-hidden">
      {/* Video Background */}
      <video
        autoplay
        muted
        playsInline
        preload="metadata"
        class="absolute inset-0 w-full h-full object-cover z-0"
        onError={() => console.warn("Hero video failed to load")}
      >
        <source src="/hero.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Subtle overlay for text readability */}
      <div class="absolute inset-0 bg-black/20 z-10"></div>

      {/* Background decoration */}
      <div class="absolute inset-0 bg-grid-pattern opacity-5 z-20"></div>
      <div class="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-48 translate-x-48 z-20">
      </div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl translate-y-48 -translate-x-48 z-20">
      </div>

      <div class="relative px-4 lg:px-6 py-20 lg:py-32 z-30">
        <div class="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div class="inline-flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-8 shadow-lg text-white">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Built for Fresh 2.0
          </div>

          {/* Main heading */}
          <h1 class="text-4xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Build Beautiful{" "}
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              User Interfaces
            </span>{" "}
            with Fresh
          </h1>

          {/* CTA Buttons */}
          <div class="flex flex-col gap-4 justify-center mb-12">
            {/* Primary Actions */}
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as="a"
                href="/components"
                color="primary"
                size="md"
                class="group"
              >
                Browse Components
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Social proof */}
          <div class="flex flex-wrap justify-center items-center gap-6 text-sm text-white/80">
            <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
              <Star size={16} className="text-yellow-400 fill-current" />
              <span>Trusted by developers</span>
            </div>
            <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
              <Zap size={16} className="text-blue-400" />
              <span>Lightning fast</span>
            </div>
            <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
              <Palette size={16} className="text-purple-400" />
              <span>Themeable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div class="absolute -bottom-px left-0 right-0 z-30">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="w-full h-auto block"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="currentColor"
            class="text-base-100"
          />
        </svg>
      </div>
    </section>
  );
}
