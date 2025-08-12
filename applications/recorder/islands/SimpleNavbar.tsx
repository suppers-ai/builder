import SimpleAuthButton from "./SimpleAuthButton.tsx";
import { Logo } from "@suppers-ai/ui-lib";

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
      
      <div class="navbar-end">
        <SimpleAuthButton />
      </div>
    </div>
  );
}