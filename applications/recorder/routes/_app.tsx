import { type PageProps } from "fresh";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Screen Recorder - Suppers AI</title>
        <meta name="description" content="Record, save, and share your screen recordings with ease" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        
        {/* Tailwind CSS + DaisyUI */}
        <link href="https://cdn.jsdelivr.net/npm/daisyui@4.6.0/dist/full.min.css" rel="stylesheet" type="text/css" />
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Theme management */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Apply theme immediately to prevent flash
            const theme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', theme);
          `
        }} />
      </head>
      
      <body class="min-h-screen bg-base-100">
        <Component />
        
        {/* Theme persistence script */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Listen for theme changes and persist them
            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                  const theme = document.documentElement.getAttribute('data-theme');
                  if (theme) {
                    localStorage.setItem('theme', theme);
                  }
                }
              });
            });
            
            observer.observe(document.documentElement, {
              attributes: true,
              attributeFilter: ['data-theme']
            });
          `
        }} />
      </body>
    </html>
  );
}