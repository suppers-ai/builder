import { type PageProps } from "fresh";
import { Button } from "@suppers/ui-lib";
import SimpleNavbar from "../islands/SimpleNavbar.tsx";

export default function Home(props: PageProps) {
  return (
    <>
      <SimpleNavbar currentPath={props.url.pathname} />
      <div class="px-4">
      <div
        class="relative w-full h-[calc(100vh-80px)] overflow-hidden rounded-3xl"
        id="hero-container"
      >
        {/* Background Image - Initial */}
        <div
          class="absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-in-out"
          style="background-image: url('/static/backgrounds/hero-gradient.webp');"
          id="hero-image"
        >
        </div>

        {/* Background Video - Loads after image */}
        <video
          class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-in-out"
          id="hero-video"
          autoplay
          muted
          playsInline
          onLoadedData="document.getElementById('hero-video').style.opacity = '1'; document.getElementById('hero-image').style.opacity = '0';"
        >
          <source src="/static/videos/hero-gradient.mp4" type="video/mp4" />
        </video>

        {/* Main Content - Centered */}
        <div class="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          {/* Logo/Brand */}
          <div class="mb-8">
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-black text-white max-w-4xl leading-tight">
              Build, Monetize, Scale. Faster.
            </h1>
          </div>
        </div>

        {/* Browse Applications Button - Bottom Left */}
        <div class="absolute bottom-6 left-6 z-10">
          <Button as="a" href="/applications?return=/" color="primary" class="rounded-full shadow-lg">
            Browse Applications
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
