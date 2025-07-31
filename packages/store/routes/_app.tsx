import { type PageProps } from "fresh";
import Sidebar from "../islands/Sidebar.tsx";

export default function App({ Component, route }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Suppers Store - Application Marketplace</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <div className="drawer lg:drawer-open">
          <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />
          
          {/* Sidebar */}
          <Sidebar currentPath={route} />
          
          {/* Main Content */}
          <div className="drawer-content flex flex-col">
            {/* Mobile menu button */}
            <div className="navbar lg:hidden bg-base-100 shadow-sm">
              <div className="navbar-start">
                <label htmlFor="drawer-toggle" className="btn btn-square btn-ghost">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </label>
              </div>
              <div className="navbar-center">
                <span className="text-xl font-bold">Suppers Store</span>
              </div>
            </div>
            
            {/* Page Content */}
            <main className="flex-1 p-4 lg:p-6">
              <Component />
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
