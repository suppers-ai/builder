// @ts-nocheck - This is a template file with placeholders
import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import Counter from "../islands/Counter.tsx";
import ErrorBoundary from "../islands/ErrorBoundary.tsx";

export default function Home(props: PageProps) {
  return (
    <>
      <Head>
        <title>{{ app.name }} - Home</title>
        <meta name="description" content="{{app.description}}" />
      </Head>

      <div class="space-y-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Welcome to {{ app.name }}
          </h1>
          <p class="text-lg text-gray-600 mb-8">
            {{ app.description }}
          </p>
          <div class="flex justify-center space-x-2">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Fresh 2.0 Alpha
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Deno Runtime
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              TypeScript
            </span>
          </div>
        </div>

        <ErrorBoundary>
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-2xl font-semibold mb-4">Interactive Counter Island</h2>
            <p class="text-gray-600 mb-4">
              This counter demonstrates Fresh 2.0's enhanced island architecture with client-side interactivity.
            </p>
            <Counter start={0} />
          </div>
        </ErrorBoundary>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center mb-3">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold">Fresh 2.0 Features</h3>
            </div>
            <ul class="list-disc list-inside space-y-1 text-gray-600">
              <li>Enhanced island architecture</li>
              <li>Improved server-side rendering</li>
              <li>Better TypeScript support</li>
              <li>Optimized build process</li>
              <li>Advanced routing capabilities</li>
            </ul>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center mb-3">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold">JSON App Compiler</h3>
            </div>
            <p class="text-gray-600">
              This application was generated from a JSON configuration using the
              JSON App Compiler. Modify your configuration to customize components,
              routes, and functionality.
            </p>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center mb-3">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold">Development Ready</h3>
            </div>
            <p class="text-gray-600">
              Built with modern development practices including error boundaries,
              TypeScript support, Tailwind CSS, and hot module reloading.
            </p>
          </div>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h3 class="text-xl font-semibold mb-3">Quick Start</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Development</h4>
              <code class="bg-gray-100 px-2 py-1 rounded text-sm">deno task dev</code>
            </div>
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Production Build</h4>
              <code class="bg-gray-100 px-2 py-1 rounded text-sm">deno task build</code>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}