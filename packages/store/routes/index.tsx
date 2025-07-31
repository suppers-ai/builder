import { type PageProps } from "fresh";

export default function Home(_props: PageProps) {
  return (
    <div class="px-4">
      <div class="relative w-full h-[calc(100vh-80px)] overflow-hidden rounded-3xl" style="background-image: url('/hero-gradient.webp'); background-size: cover; background-position: center;">
        {/* Main Content - Centered */}
        <div class="flex flex-col items-center justify-center h-full text-center px-4">
          {/* Logo/Brand */}
          <div class="mb-8">
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-black text-white max-w-4xl leading-tight">
              Build, Monetize, Scale. Faster.
            </h1>
          </div>
        </div>

        {/* Browse Applications Button - Bottom Left */}
        <div class="absolute bottom-6 left-6">
          <a href="/applications" class="btn btn-primary rounded-full shadow-lg">
            Browse Applications
          </a>
        </div>
      </div>
    </div>
  );
}
