import SimpleAuthButton from "./SimpleAuthButton.tsx";
import { Logo } from "@suppers/ui-lib";
import { Palette, Images } from "lucide-preact";

export default function SimpleNavbar() {
  return (
    <div class="navbar bg-base-100 border-b border-base-200 px-4">
      <div class="navbar-start">
        <Logo
          href="/"
          alt="Suppers Logo"
          variant="long"
          size="lg"
        />
      </div>
      
      <div class="navbar-center">
        <div class="flex gap-2">
          <a href="/" class="btn btn-ghost btn-sm">
            <Palette class="w-4 h-4 mr-1" />
            Paint
          </a>
          <a href="/gallery" class="btn btn-ghost btn-sm">
            <Images class="w-4 h-4 mr-1" />
            Gallery
          </a>
        </div>
      </div>
      
      <div class="navbar-end">
        <SimpleAuthButton />
      </div>
    </div>
  );
}