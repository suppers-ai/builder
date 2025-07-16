// @ts-nocheck - This is a template file with placeholders
import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export default function Error500(props: PageProps) {
  return (
    <>
      <Head>
        <title>{{app.name}} - Server Error</title>
        <meta name="description" content="A server error occurred. Please try again later." />
      </Head>
      
      <div class="text-center">
        <div class="max-w-lg mx-auto">
          <div class="mb-8">
            <div class="text-8xl font-bold text-red-200 mb-4">500</div>
            <div class="w-24 h-1 bg-red-500 mx-auto mb-6"></div>
            <h1 class="text-3xl font-bold text-gray-900 mb-4">Server Error</h1>
            <p class="text-lg text-gray-600 mb-8">
              Something went wrong on our end. Please try again later.
            </p>
          </div>
          
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p class="text-sm text-red-700">
                If this problem persists, please contact support.
              </p>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onclick="window.location.reload()" 
                class="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
              <a 
                href="/" 
                class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Home
              </a>
            </div>
            
            <div class="text-sm text-gray-500">
              <p>Error ID: {crypto.randomUUID().slice(0, 8)}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}