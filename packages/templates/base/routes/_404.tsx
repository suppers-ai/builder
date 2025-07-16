// @ts-nocheck - This is a template file with placeholders
import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export default function Error404(props: PageProps) {
  return (
    <>
      <Head>
        <title>{{app.name}} - Page Not Found</title>
        <meta name="description" content="The page you're looking for could not be found." />
      </Head>
      
      <div class="text-center">
        <div class="max-w-lg mx-auto">
          <div class="mb-8">
            <div class="text-8xl font-bold text-gray-200 mb-4">404</div>
            <div class="w-24 h-1 bg-blue-500 mx-auto mb-6"></div>
            <h1 class="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
            <p class="text-lg text-gray-600 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div class="space-y-4">
            <a 
              href="/" 
              class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </a>
            
            <div class="text-sm text-gray-500">
              <p>Or try one of these pages:</p>
              <div class="flex justify-center space-x-4 mt-2">
                <a href="/" class="text-blue-600 hover:text-blue-800">Home</a>
                <a href="/about" class="text-blue-600 hover:text-blue-800">About</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}