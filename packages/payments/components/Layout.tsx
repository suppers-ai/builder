import { ComponentChildren } from "preact";

interface LayoutProps {
  title?: string;
  children: ComponentChildren;
}

export default function Layout({ title = "Payments Service", children }: LayoutProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <div class="min-h-screen bg-base-200">
          <div class="navbar bg-base-100">
            <div class="navbar-start">
              <div class="dropdown">
                <div tabIndex={0} role="button" class="btn btn-ghost lg:hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 6h16M4 12h8m-8 6h16"
                    />
                  </svg>
                </div>
                <ul
                  tabIndex={0}
                  class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <a href="/">Dashboard</a>
                  </li>
                  <li>
                    <a href="/places">My Places</a>
                  </li>
                  <li>
                    <a href="/dashboard">Products</a>
                  </li>
                  <li>
                    <a href="/admin">Admin</a>
                  </li>
                </ul>
              </div>
              <a class="btn btn-ghost text-xl" href="/">Payments Service</a>
            </div>
            <div class="navbar-center hidden lg:flex">
              <ul class="menu menu-horizontal px-1">
                <li>
                  <a href="/">Dashboard</a>
                </li>
                <li>
                  <a href="/places">My Places</a>
                </li>
                <li>
                  <a href="/dashboard">Products</a>
                </li>
                <li>
                  <a href="/admin">Admin</a>
                </li>
              </ul>
            </div>
            <div class="navbar-end">
              <a class="btn">Login</a>
            </div>
          </div>
          <main class="container mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
