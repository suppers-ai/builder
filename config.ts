interface Config {
    profileUrl: string;
    profilePort: number;
    docsUrl: string;
    docsPort: number;
    storeUrl: string;
    storePort: number;
    cdnUrl: string;
    cdnPort: number;
    apiUrl: string;
    supabaseUrl: string;
    supabaseAnonKey: string;
}

// TODO: Read from environment variables to set up production and development environments
const config: Config = {
    profileUrl: "http://localhost:8001",
    profilePort: 8001,
    docsUrl: "http://localhost:8002",
    docsPort: 8002,
    storeUrl: "http://localhost:8000",
    storePort: 8000,
    cdnUrl: "http://localhost:8003",
    cdnPort: 8003,
    apiUrl: "http://127.0.0.1:54321/functions/v1",
    supabaseUrl: "http://localhost:54321",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
}

export default config;

// Maybe in _app.tsx like set dangerouslySetInnerHTML

// This should be called on the server side to inject environment variables
// export function injectEnvironmentVariables(): string {
//     const envVars = {
//       SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
//       SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY'),
//     };
  
//     return `
//       <script>
//         // Inject environment variables into globalThis for client-side access
//         globalThis.SUPABASE_URL = ${JSON.stringify(envVars.SUPABASE_URL)};
//         globalThis.SUPABASE_ANON_KEY = ${JSON.stringify(envVars.SUPABASE_ANON_KEY)};
//       </script>
//     `;
//   }
  
//   // Utility to get environment variables in a cross-platform way
//   export function getEnvVar(name: string, defaultValue?: string): string {
//     // Server-side (Deno)
//     if (typeof Deno !== 'undefined') {
//       return Deno.env.get(name) || defaultValue || '';
//     }
    
//     // Client-side (browser)
//     return (globalThis as any)[name] || defaultValue || '';
//   }