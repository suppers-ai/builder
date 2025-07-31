import { Navbar } from "@suppers/ui-lib";
import { Button } from "@suppers/ui-lib";
import SimpleAuthButton from "./SimpleAuthButton.tsx";

interface SimpleNavbarProps {
  currentPath?: string;
}

export default function SimpleNavbar({ currentPath = "/" }: SimpleNavbarProps) {
  const handleDocsClick = () => {
    // Open docs in new tab - you can update this URL to your actual docs
    window.open("https://docs.suppers.ai", "_blank");
  };

  return (
    <div class="navbar bg-base-100">
      {/* Logo - Left */}
      <div class="navbar-start">
        <a href="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img 
            src="/logos/long_light.png" 
            alt="Suppers Store Logo"
            class="h-8 w-auto object-contain dark:hidden"
          />
          <img 
            src="/logos/long_dark.png" 
            alt="Suppers Store Logo"
            class="h-8 w-auto object-contain hidden dark:block"
          />
        </a>
      </div>

      {/* Navigation - Center */}
      <div class="navbar-center">
        <ul class="menu menu-horizontal px-1 gap-4 hidden md:flex">
          <li>
            <a
              href="/applications"
              class={`font-medium ${
                currentPath === "/applications" || currentPath.startsWith("/applications")
                  ? "text-primary"
                  : "text-base-content hover:text-primary"
              }`}
            >
              Applications
            </a>
          </li>
          <li>
            <a
              href="/create"
              class={`font-medium ${
                currentPath === "/create"
                  ? "text-primary"
                  : "text-base-content hover:text-primary"
              }`}
            >
              Create
            </a>
          </li>
          <li>
            <button
              onClick={handleDocsClick}
              class="font-medium text-base-content hover:text-primary"
            >
              Docs
            </button>
          </li>
        </ul>
      </div>

      {/* Auth and Mobile Menu - Right */}
      <div class="navbar-end">
        {/* Auth Button - Always visible */}
        <div class="mr-4">
          <SimpleAuthButton />
        </div>

        {/* Mobile menu - dropdown */}
        <div class="md:hidden">
          <div class="dropdown dropdown-end">
            <div tabIndex={0} role="button" class="btn btn-ghost">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <ul tabIndex={0} class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
              <li>
                <a
                  href="/applications"
                  class={currentPath === "/applications" || currentPath.startsWith("/applications") ? "active" : ""}
                >
                  Applications
                </a>
              </li>
              <li>
                <a
                  href="/create"
                  class={currentPath === "/create" ? "active" : ""}
                >
                  Create
                </a>
              </li>
              <li>
                <button onClick={handleDocsClick}>
                  Docs
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}