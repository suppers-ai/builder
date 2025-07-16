// @ts-nocheck - This is a template file with placeholders
import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export default function Layout({ Component, state, url }: PageProps) {
  const isActive = (path: string) => url.pathname === path;
  
  return (
    <html lang="en">
      <Head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="{{app.description}}" />
        <title>{{app.name}}</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <div class="min-h-screen bg-gray-50">
          <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-4">
                  <h1 class="text-xl font-semibold text-gray-900">{{app.name}}</h1>
                  <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Fresh 2.0
                  </span>
                </div>
                <nav class="flex space-x-4">
                  <a 
                    href="/" 
                    class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive("/") 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Home
                  </a>
                  <a 
                    href="/about" 
                    class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive("/about") 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    About
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Component />
          </main>
          <footer class="bg-white border-t mt-auto">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div class="text-center text-sm text-gray-500">
                Generated with JSON App Compiler • Powered by Fresh 2.0 & Deno
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}