# {{app.name}}

{{app.description}}

This application was generated using the JSON App Compiler, a powerful tool that transforms JSON configuration files into fully functional Fresh 2.0 Alpha applications with modern development practices and robust architecture.

## 🚀 Features

### Framework & Runtime
- **Fresh 2.0 Alpha** - Latest framework with enhanced island architecture
- **Deno Runtime** - Modern JavaScript/TypeScript runtime with native package management
- **TypeScript** - Full type safety throughout the application
- **Server-Side Rendering** - Fast initial page loads with client-side hydration

### Styling & UI
- **Tailwind CSS 3.4** - Utility-first CSS framework with custom configuration
- **Responsive Design** - Mobile-first approach with responsive components
- **Custom CSS Variables** - Theming support with CSS custom properties
- **Animation System** - Smooth transitions and micro-interactions

### Components & Architecture
- **Island Architecture** - Optimized client-side interactivity with Fresh 2.0 improvements
- **Error Boundaries** - Robust error handling with graceful degradation
- **Component Library** - Reusable UI components with consistent styling
- **Accessibility** - WCAG compliant components with proper focus management

## 🛠 Getting Started

### Prerequisites
- [Deno](https://deno.land/) 1.40.0 or later

### Development

Start the development server with hot reloading:

```bash
deno task dev
# or
deno task start
```

This will start the Fresh 2.0 development server at `http://localhost:8000` with:
- Hot module reloading
- TypeScript compilation
- Tailwind CSS processing
- Island hydration

### Building for Production

Build the optimized application:

```bash
deno task build
```

Preview the production build:

```bash
deno task preview
```

### Available Scripts

- `deno task dev` - Start development server with hot reloading (recommended)
- `deno task start` - Alternative development server command
- `deno task build` - Build the application for production with optimizations
- `deno task preview` - Preview the production build locally
- `deno task update` - Update Fresh framework to the latest version

## 📁 Project Structure

```
{{app.name}}/
├── routes/                 # File-based routing with Fresh 2.0
│   ├── _layout.tsx        # Global layout component with navigation
│   ├── _404.tsx          # Custom 404 error page
│   ├── _500.tsx          # Custom 500 error page
│   ├── index.tsx         # Home page with feature showcase
│   └── about.tsx         # About page with technology information
├── islands/               # Client-side interactive components
│   ├── Counter.tsx       # Enhanced counter with Preact signals
│   └── ErrorBoundary.tsx # Comprehensive error boundary component
├── static/               # Static assets served directly
│   ├── styles.css        # Global styles with utility classes
│   └── favicon.ico       # Application favicon
├── main.ts               # Application entry point with Fresh 2.0 config
├── dev.ts                # Development server with build configuration
├── deno.json             # Deno configuration with Fresh 2.0 alpha dependencies
├── tailwind.config.ts    # Tailwind CSS configuration with custom theme
└── README.md             # This comprehensive documentation
```

## 🎨 Customization

### Template Variables

This template uses placeholder variables replaced during compilation:

- `{{app.name}}` - Application name (used in titles, headers, navigation)
- `{{app.version}}` - Application version (displayed in UI)
- `{{app.description}}` - Application description (used in meta tags and content)

### Styling System

The template includes a comprehensive styling system with:

#### Utility Classes
```css
/* Button variants */
.btn, .btn-primary, .btn-secondary, .btn-success, .btn-danger

/* Card components */
.card, .card-body, .card-header, .card-footer

/* Form elements */
.form-input, .form-label, .form-error, .form-help

/* Alert components */
.alert, .alert-info, .alert-success, .alert-warning, .alert-error
```

#### Component Examples
```tsx
// Enhanced Counter with props
<Counter 
  start={0}        // Initial value
  step={1}         // Increment/decrement step
  min={-10}        // Minimum value
  max={100}        // Maximum value
/>

// Error Boundary with custom handling
<ErrorBoundary 
  showDetails={true}
  onError={(error, info) => console.log('Custom error handler')}
>
  <YourComponent />
</ErrorBoundary>
```

## 🏗 Technology Stack

- **Runtime**: Deno (Modern JavaScript/TypeScript runtime)
- **Framework**: Fresh 2.0 Alpha (Enhanced SSR and islands)
- **UI Library**: Preact (Lightweight React alternative)
- **Styling**: Tailwind CSS 3.4 (Utility-first CSS framework)
- **Language**: TypeScript (Full type safety)
- **Build System**: Fresh 2.0 native build system with optimizations

## 🚀 Performance Features

- **Server-Side Rendering** - Fast initial page loads
- **Island Architecture** - Minimal client-side JavaScript with Fresh 2.0 improvements
- **Code Splitting** - Automatic code splitting by routes and islands
- **Asset Optimization** - Optimized CSS and JavaScript bundles
- **Caching** - Proper caching headers for static assets
- **Tree Shaking** - Unused code elimination in production builds

## ♿ Accessibility

The template includes accessibility best practices:

- Semantic HTML structure with proper landmarks
- ARIA labels and roles for interactive elements
- Keyboard navigation support throughout
- Focus management and visible focus indicators
- Screen reader compatibility
- Color contrast compliance (WCAG AA)

## 🐛 Error Handling

Comprehensive error handling system:

- **Error Boundaries** - Catch and handle component errors gracefully
- **Custom Error Pages** - Styled 404 and 500 error pages
- **Graceful Degradation** - Fallback UI for failed components
- **Error Reporting** - Detailed error information for debugging
- **Recovery Mechanisms** - Retry functionality for transient errors

## 🔧 Configuration Files

### deno.json
- Fresh 2.0 Alpha dependencies
- TypeScript compiler options optimized for Fresh
- Task definitions for development and production
- Import maps for clean dependency management

### tailwind.config.ts
- Custom color palette with semantic naming
- Extended animations and keyframes
- Custom spacing and typography scales
- Responsive breakpoints
- Future CSS features enabled

## 📱 Responsive Design

Mobile-first responsive design with breakpoints:

- **Mobile**: Base styles (default, 0px+)
- **Tablet**: `md:` prefix (768px+)
- **Desktop**: `lg:` prefix (1024px+)
- **Large Desktop**: `xl:` prefix (1280px+)
- **Extra Large**: `2xl:` prefix (1536px+)

## 🔄 Development Workflow

1. **Start Development**: `deno task dev`
2. **Make Changes**: Edit files with hot reloading
3. **Test Features**: Use built-in error boundaries and debugging
4. **Build Production**: `deno task build`
5. **Preview**: `deno task preview`
6. **Deploy**: Deploy the built application

## 📚 Learn More

- [Fresh 2.0 Documentation](https://fresh.deno.dev/)
- [Deno Manual](https://deno.land/manual)
- [Preact Guide](https://preactjs.com/guide/v10/getting-started)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

This template is part of the JSON App Compiler project. To contribute:

1. Update your JSON configuration
2. Re-run the JSON App Compiler
3. Test the generated application
4. Submit feedback or improvements

## 📄 License

Generated by JSON App Compiler. License depends on your project configuration.

---

**Powered by Fresh 2.0 Alpha & Deno** | **Generated by JSON App Compiler**