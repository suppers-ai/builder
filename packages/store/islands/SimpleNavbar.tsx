import SimpleAuthButton from "./SimpleAuthButton.tsx";
import { Button, Logo } from "@suppers/ui-lib";

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
        <Logo
          href="/"
          alt="Suppers Store Logo"
          variant="long"
          size="lg"
        />
      </div>

      {/* Navigation - Center */}
      <div class="navbar-center">
        <ul class="menu menu-horizontal px-1 gap-4 hidden md:flex">
          <li>
            <Button
              onClick={() => window.location.href = "/applications"}
              class={`font-medium ${
                currentPath === "/applications" || currentPath.startsWith("/applications")
                  ? "text-primary"
                  : "text-base-content hover:text-primary"
              } bg-transparent border-none`}
              variant="ghost"
            >
              Applications
            </Button>
          </li>
          <li>
            <Button
              onClick={() => window.location.href = "/create"}
              class={`font-medium ${
                currentPath === "/create" ? "text-primary" : "text-base-content hover:text-primary"
              } bg-transparent border-none`}
              variant="ghost"
            >
              Create
            </Button>
          </li>
          <li>
            <Button
              onClick={handleDocsClick}
              class="font-medium text-base-content hover:text-primary bg-transparent border-none"
              variant="ghost"
            >
              Docs
            </Button>
          </li>
        </ul>
      </div>

      {/* Auth and Mobile Menu - Right */}
      <div class="navbar-end">
        {/* Auth Button - Always visible */}
        <div class="">
          <SimpleAuthButton />
        </div>

        {/* Mobile menu - dropdown */}
        <div class="md:hidden">
          <div class="dropdown dropdown-end">
            <div tabIndex={0} role="button" class="btn btn-ghost">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li>
                <a
                  href="/applications"
                  class={currentPath === "/applications" || currentPath.startsWith("/applications")
                    ? "active"
                    : ""}
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
                <Button
                  onClick={handleDocsClick}
                  class="bg-transparent border-none"
                  variant="ghost"
                >
                  Docs
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
