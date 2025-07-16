// @ts-nocheck - This is a template file with placeholders
import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export default function About(props: PageProps) {
  return (
    <>
      <Head>
        <title>{{app.name}} - About</title>
        <meta name="description" content="Learn more about {{app.name}} and the JSON App Compiler" />
      </Head>
      
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">About {{app.name}}</h1>
          <p class="text-xl text-gray-600">
            Built with the JSON App Compiler and Fresh 2.0 Alpha
          </p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-2xl font-semibold mb-4">JSON App Compiler</h2>
            <p class="text-gray-600 mb-4">
              This application was generated using the JSON App Compiler, a powerful tool 
              that transforms JSON configuration files into fully functional Fresh applications.
            </p>
            <p class="text-gray-600">
              The compiler provides a declarative approach to building web applications, 
              allowing developers to focus on configuration rather than boilerplate code.
            </p>
          </div>
          
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-2xl font-semibold mb-4">Fresh 2.0 Alpha</h2>
            <p class="text-gray-600 mb-4">
              Built on Fresh 2.0 Alpha, this application leverages the latest improvements 
              in server-side rendering, island architecture, and developer experience.
            </p>
            <p class="text-gray-600">
              Fresh 2.0 brings enhanced performance, better TypeScript integration, 
              and improved build optimizations.
            </p>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-8 mb-8">
          <h2 class="text-2xl font-semibold mb-6">Key Features</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-medium mb-2 flex items-center">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Enhanced Island Architecture
              </h3>
              <p class="text-gray-600 text-sm">
                Fresh 2.0's improved island system for optimal client-side interactivity
              </p>
            </div>
            <div>
              <h3 class="text-lg font-medium mb-2 flex items-center">
                <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                TypeScript Support
              </h3>
              <p class="text-gray-600 text-sm">
                Full TypeScript integration for type safety and better developer experience
              </p>
            </div>
            <div>
              <h3 class="text-lg font-medium mb-2 flex items-center">
                <span class="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Component-Based Architecture
              </h3>
              <p class="text-gray-600 text-sm">
                Modular components that can be easily configured and reused
              </p>
            </div>
            <div>
              <h3 class="text-lg font-medium mb-2 flex items-center">
                <span class="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Server-Side Rendering
              </h3>
              <p class="text-gray-600 text-sm">
                Fast initial page loads with client-side hydration for interactivity
              </p>
            </div>
            <div>
              <h3 class="text-lg font-medium mb-2 flex items-center">
                <span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Tailwind CSS Integration
              </h3>
              <p class="text-gray-600 text-sm">
                Utility-first CSS framework for rapid UI development
              </p>
            </div>
            <div>
              <h3 class="text-lg font-medium mb-2 flex items-center">
                <span class="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                Error Boundaries
              </h3>
              <p class="text-gray-600 text-sm">
                Robust error handling with graceful degradation
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-8">
          <h2 class="text-2xl font-semibold mb-4">Technology Stack</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="w-12 h-12 bg-black rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span class="text-white font-bold text-sm">Deno</span>
              </div>
              <p class="text-sm font-medium">Runtime</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 bg-yellow-400 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span class="text-black font-bold text-sm">Fresh</span>
              </div>
              <p class="text-sm font-medium">Framework</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span class="text-white font-bold text-sm">TS</span>
              </div>
              <p class="text-sm font-medium">Language</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 bg-cyan-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span class="text-white font-bold text-sm">CSS</span>
              </div>
              <p class="text-sm font-medium">Styling</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}