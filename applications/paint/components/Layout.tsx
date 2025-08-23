import { ComponentChildren } from "preact";
import SimpleNavbar from "../islands/SimpleNavbar.tsx";

interface LayoutProps {
  children: ComponentChildren;
  title?: string;
}

export default function Layout({ children, title: _title = "Paint App" }: LayoutProps) {
  return (
    <div class="min-h-screen bg-base-100">
      {/* Top Navigation */}
      <SimpleNavbar />

      {/* Main Content */}
      <main class="w-full">
        <div class="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
