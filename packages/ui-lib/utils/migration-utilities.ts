/**
 * Migration Utility Functions
 * Functions for class detection, mapping, and replacement during DaisyUI 5 and Tailwind 4 migration
 */

export interface ClassMapping {
  from: string;
  to: string;
  type: 'daisyui' | 'tailwind';
  breaking: boolean;
  notes?: string;
}

export interface MigrationOptions {
  dryRun?: boolean;
  verbose?: boolean;
  skipBackup?: boolean;
}

export interface BatchMigrationResult {
  totalFiles: number;
  processedFiles: number;
  errors: Array<{ file: string; error: string }>;
  changes: Array<{ file: string; changes: number }>;
}

// DaisyUI 4 to 5 class mappings
export const DAISYUI_CLASS_MIGRATIONS: ClassMapping[] = [
  // Loading classes - DaisyUI 5 requires explicit spinner type
  {
    from: 'loading',
    to: 'loading loading-spinner',
    type: 'daisyui',
    breaking: false,
    notes: 'DaisyUI 5 requires explicit spinner type'
  },
  {
    from: 'loading-dots',
    to: 'loading loading-dots',
    type: 'daisyui',
    breaking: false,
    notes: 'DaisyUI 5 loading pattern update'
  },
  {
    from: 'loading-ring',
    to: 'loading loading-ring',
    type: 'daisyui',
    breaking: false,
    notes: 'DaisyUI 5 loading pattern update'
  },
  {
    from: 'loading-ball',
    to: 'loading loading-ball',
    type: 'daisyui',
    breaking: false,
    notes: 'DaisyUI 5 loading pattern update'
  },
  
  // Button classes - enhanced with new DaisyUI 5 patterns
  {
    from: 'btn-ghost',
    to: 'btn-ghost',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify ghost styling in DaisyUI 5'
  },
  {
    from: 'btn-outline',
    to: 'btn-outline',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify outline styling in DaisyUI 5'
  },
  {
    from: 'btn-link',
    to: 'btn-link',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify link button styling in DaisyUI 5'
  },
  {
    from: 'btn-wide',
    to: 'btn-wide',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify wide button styling in DaisyUI 5'
  },
  {
    from: 'btn-block',
    to: 'btn-block',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify block button styling in DaisyUI 5'
  },
  {
    from: 'btn-circle',
    to: 'btn-circle',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify circle button styling in DaisyUI 5'
  },
  {
    from: 'btn-square',
    to: 'btn-square',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify square button styling in DaisyUI 5'
  },
  
  // Input classes - comprehensive input variants
  {
    from: 'input-bordered',
    to: 'input-bordered',
    type: 'daisyui',
    breaking: false,
    notes: 'Check if bordered is still default in DaisyUI 5'
  },
  {
    from: 'input-ghost',
    to: 'input-ghost',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify ghost input styling in DaisyUI 5'
  },
  {
    from: 'input-primary',
    to: 'input-primary',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify primary input color in DaisyUI 5'
  },
  {
    from: 'input-secondary',
    to: 'input-secondary',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify secondary input color in DaisyUI 5'
  },
  {
    from: 'input-accent',
    to: 'input-accent',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify accent input color in DaisyUI 5'
  },
  {
    from: 'input-info',
    to: 'input-info',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify info input color in DaisyUI 5'
  },
  {
    from: 'input-success',
    to: 'input-success',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify success input color in DaisyUI 5'
  },
  {
    from: 'input-warning',
    to: 'input-warning',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify warning input color in DaisyUI 5'
  },
  {
    from: 'input-error',
    to: 'input-error',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify error input color in DaisyUI 5'
  },
  
  // Card classes - enhanced card variants
  {
    from: 'card-compact',
    to: 'card-compact',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify compact card spacing in DaisyUI 5'
  },
  {
    from: 'card-side',
    to: 'card-side',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify side card layout in DaisyUI 5'
  },
  {
    from: 'card-bordered',
    to: 'card-bordered',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify bordered card styling in DaisyUI 5'
  },
  {
    from: 'card-body',
    to: 'card-body',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify card body styling in DaisyUI 5'
  },
  {
    from: 'card-title',
    to: 'card-title',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify card title styling in DaisyUI 5'
  },
  {
    from: 'card-actions',
    to: 'card-actions',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify card actions styling in DaisyUI 5'
  },
  
  // Modal classes - enhanced modal system
  {
    from: 'modal-open',
    to: 'modal-open',
    type: 'daisyui',
    breaking: false,
    notes: 'Check modal state management in DaisyUI 5'
  },
  {
    from: 'modal-box',
    to: 'modal-box',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify modal box styling in DaisyUI 5'
  },
  {
    from: 'modal-backdrop',
    to: 'modal-backdrop',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify modal backdrop in DaisyUI 5'
  },
  {
    from: 'modal-action',
    to: 'modal-action',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify modal action styling in DaisyUI 5'
  },
  
  // Navbar classes - comprehensive navbar system
  {
    from: 'navbar-start',
    to: 'navbar-start',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify navbar layout in DaisyUI 5'
  },
  {
    from: 'navbar-center',
    to: 'navbar-center',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify navbar layout in DaisyUI 5'
  },
  {
    from: 'navbar-end',
    to: 'navbar-end',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify navbar layout in DaisyUI 5'
  },
  
  // Alert classes
  {
    from: 'alert-info',
    to: 'alert-info',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify alert info styling in DaisyUI 5'
  },
  {
    from: 'alert-success',
    to: 'alert-success',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify alert success styling in DaisyUI 5'
  },
  {
    from: 'alert-warning',
    to: 'alert-warning',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify alert warning styling in DaisyUI 5'
  },
  {
    from: 'alert-error',
    to: 'alert-error',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify alert error styling in DaisyUI 5'
  },
  
  // Badge classes
  {
    from: 'badge-outline',
    to: 'badge-outline',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify badge outline styling in DaisyUI 5'
  },
  {
    from: 'badge-primary',
    to: 'badge-primary',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify badge primary color in DaisyUI 5'
  },
  {
    from: 'badge-secondary',
    to: 'badge-secondary',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify badge secondary color in DaisyUI 5'
  },
  {
    from: 'badge-accent',
    to: 'badge-accent',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify badge accent color in DaisyUI 5'
  },
  
  // Progress classes
  {
    from: 'progress-primary',
    to: 'progress-primary',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify progress primary color in DaisyUI 5'
  },
  {
    from: 'progress-secondary',
    to: 'progress-secondary',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify progress secondary color in DaisyUI 5'
  },
  {
    from: 'progress-accent',
    to: 'progress-accent',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify progress accent color in DaisyUI 5'
  },
  
  // Menu classes
  {
    from: 'menu-title',
    to: 'menu-title',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify menu title styling in DaisyUI 5'
  },
  {
    from: 'menu-dropdown',
    to: 'menu-dropdown',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify menu dropdown styling in DaisyUI 5'
  },
  {
    from: 'menu-dropdown-toggle',
    to: 'menu-dropdown-toggle',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify menu dropdown toggle in DaisyUI 5'
  },
  
  // Table classes
  {
    from: 'table-zebra',
    to: 'table-zebra',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify table zebra styling in DaisyUI 5'
  },
  {
    from: 'table-compact',
    to: 'table-compact',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify table compact styling in DaisyUI 5'
  },
  {
    from: 'table-normal',
    to: 'table-normal',
    type: 'daisyui',
    breaking: false,
    notes: 'Verify table normal styling in DaisyUI 5'
  },
];

// Tailwind 3 to 4 class mappings
export const TAILWIND_CLASS_MIGRATIONS: ClassMapping[] = [
  // Color updates - Tailwind 4 enhanced color palette
  {
    from: 'text-gray-50',
    to: 'text-slate-50',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'text-gray-100',
    to: 'text-slate-100',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'text-gray-200',
    to: 'text-slate-200',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'text-gray-300',
    to: 'text-slate-300',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'text-gray-400',
    to: 'text-slate-400',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'text-gray-500',
    to: 'text-slate-500',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'text-gray-600',
    to: 'text-slate-600',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'text-gray-700',
    to: 'text-slate-700',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'text-gray-800',
    to: 'text-slate-800',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'text-gray-900',
    to: 'text-slate-900',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  
  // Background color updates
  {
    from: 'bg-gray-50',
    to: 'bg-slate-50',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'bg-gray-100',
    to: 'bg-slate-100',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'bg-gray-200',
    to: 'bg-slate-200',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'bg-gray-300',
    to: 'bg-slate-300',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'bg-gray-400',
    to: 'bg-slate-400',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'bg-gray-500',
    to: 'bg-slate-500',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'bg-gray-600',
    to: 'bg-slate-600',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'bg-gray-700',
    to: 'bg-slate-700',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'bg-gray-800',
    to: 'bg-slate-800',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'bg-gray-900',
    to: 'bg-slate-900',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  
  // Border color updates
  {
    from: 'border-gray-50',
    to: 'border-slate-50',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'border-gray-100',
    to: 'border-slate-100',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'border-gray-200',
    to: 'border-slate-200',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'border-gray-300',
    to: 'border-slate-300',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'border-gray-400',
    to: 'border-slate-400',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'border-gray-500',
    to: 'border-slate-500',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'border-gray-600',
    to: 'border-slate-600',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'border-gray-700',
    to: 'border-slate-700',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'border-gray-800',
    to: 'border-slate-800',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'border-gray-900',
    to: 'border-slate-900',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  
  // Ring color updates
  {
    from: 'ring-gray-100',
    to: 'ring-slate-100',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'ring-gray-200',
    to: 'ring-slate-200',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'ring-gray-300',
    to: 'ring-slate-300',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'ring-gray-400',
    to: 'ring-slate-400',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'ring-gray-500',
    to: 'ring-slate-500',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  
  // Divide color updates
  {
    from: 'divide-gray-100',
    to: 'divide-slate-100',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'divide-gray-200',
    to: 'divide-slate-200',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'divide-gray-300',
    to: 'divide-slate-300',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  
  // Placeholder color updates
  {
    from: 'placeholder-gray-300',
    to: 'placeholder-slate-300',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'placeholder-gray-400',
    to: 'placeholder-slate-400',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  {
    from: 'placeholder-gray-500',
    to: 'placeholder-slate-500',
    type: 'tailwind',
    breaking: false,
    notes: 'Tailwind 4 prefers slate over gray for neutral colors'
  },
  
  // Typography - verify compatibility
  {
    from: 'text-xs',
    to: 'text-xs',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify typography scale in Tailwind 4'
  },
  {
    from: 'text-sm',
    to: 'text-sm',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify typography scale in Tailwind 4'
  },
  {
    from: 'text-base',
    to: 'text-base',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify typography scale in Tailwind 4'
  },
  {
    from: 'text-lg',
    to: 'text-lg',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify typography scale in Tailwind 4'
  },
  {
    from: 'text-xl',
    to: 'text-xl',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify typography scale in Tailwind 4'
  },
  {
    from: 'text-2xl',
    to: 'text-2xl',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify typography scale in Tailwind 4'
  },
  {
    from: 'text-3xl',
    to: 'text-3xl',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify typography scale in Tailwind 4'
  },
  {
    from: 'text-4xl',
    to: 'text-4xl',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify typography scale in Tailwind 4'
  },
  
  // Spacing - verify compatibility
  {
    from: 'p-1',
    to: 'p-1',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify spacing scale in Tailwind 4'
  },
  {
    from: 'p-2',
    to: 'p-2',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify spacing scale in Tailwind 4'
  },
  {
    from: 'p-3',
    to: 'p-3',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify spacing scale in Tailwind 4'
  },
  {
    from: 'p-4',
    to: 'p-4',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify spacing scale in Tailwind 4'
  },
  {
    from: 'p-6',
    to: 'p-6',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify spacing scale in Tailwind 4'
  },
  {
    from: 'p-8',
    to: 'p-8',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify spacing scale in Tailwind 4'
  },
  
  // Margin spacing
  {
    from: 'm-1',
    to: 'm-1',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify spacing scale in Tailwind 4'
  },
  {
    from: 'm-2',
    to: 'm-2',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify spacing scale in Tailwind 4'
  },
  {
    from: 'm-4',
    to: 'm-4',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify spacing scale in Tailwind 4'
  },
  {
    from: 'm-8',
    to: 'm-8',
    type: 'tailwind',
    breaking: false,
    notes: 'Verify spacing scale in Tailwind 4'
  },
  
  // Layout - should remain compatible
  {
    from: 'flex',
    to: 'flex',
    type: 'tailwind',
    breaking: false,
    notes: 'Flexbox classes should be compatible'
  },
  {
    from: 'grid',
    to: 'grid',
    type: 'tailwind',
    breaking: false,
    notes: 'Grid classes should be compatible'
  },
  {
    from: 'block',
    to: 'block',
    type: 'tailwind',
    breaking: false,
    notes: 'Display classes should be compatible'
  },
  {
    from: 'inline',
    to: 'inline',
    type: 'tailwind',
    breaking: false,
    notes: 'Display classes should be compatible'
  },
  {
    from: 'inline-block',
    to: 'inline-block',
    type: 'tailwind',
    breaking: false,
    notes: 'Display classes should be compatible'
  },
  {
    from: 'hidden',
    to: 'hidden',
    type: 'tailwind',
    breaking: false,
    notes: 'Display classes should be compatible'
  },
  
  // Flexbox utilities
  {
    from: 'justify-center',
    to: 'justify-center',
    type: 'tailwind',
    breaking: false,
    notes: 'Flexbox utilities should be compatible'
  },
  {
    from: 'justify-between',
    to: 'justify-between',
    type: 'tailwind',
    breaking: false,
    notes: 'Flexbox utilities should be compatible'
  },
  {
    from: 'items-center',
    to: 'items-center',
    type: 'tailwind',
    breaking: false,
    notes: 'Flexbox utilities should be compatible'
  },
  {
    from: 'items-start',
    to: 'items-start',
    type: 'tailwind',
    breaking: false,
    notes: 'Flexbox utilities should be compatible'
  },
  {
    from: 'items-end',
    to: 'items-end',
    type: 'tailwind',
    breaking: false,
    notes: 'Flexbox utilities should be compatible'
  },
  
  // Responsive design - should remain compatible
  {
    from: 'sm:block',
    to: 'sm:block',
    type: 'tailwind',
    breaking: false,
    notes: 'Responsive utilities should be compatible'
  },
  {
    from: 'md:flex',
    to: 'md:flex',
    type: 'tailwind',
    breaking: false,
    notes: 'Responsive utilities should be compatible'
  },
  {
    from: 'lg:grid',
    to: 'lg:grid',
    type: 'tailwind',
    breaking: false,
    notes: 'Responsive utilities should be compatible'
  },
  {
    from: 'xl:hidden',
    to: 'xl:hidden',
    type: 'tailwind',
    breaking: false,
    notes: 'Responsive utilities should be compatible'
  },
];

/**
 * Create a mapping lookup for faster class replacement
 */
function createMappingLookup(mappings: ClassMapping[]): Map<string, ClassMapping> {
  const lookup = new Map<string, ClassMapping>();
  mappings.forEach(mapping => {
    lookup.set(mapping.from, mapping);
  });
  return lookup;
}

const daisyuiLookup = createMappingLookup(DAISYUI_CLASS_MIGRATIONS);
const tailwindLookup = createMappingLookup(TAILWIND_CLASS_MIGRATIONS);

/**
 * Replace classes in a string based on migration mappings
 */
export function replaceClasses(
  content: string,
  mappings: ClassMapping[],
  options: MigrationOptions = {}
): { content: string; changes: string[]; warnings: string[] } {
  let updatedContent = content;
  const changes: string[] = [];
  const warnings: string[] = [];
  const lookup = createMappingLookup(mappings);
  
  // Find all class attributes
  const classRegex = /class(?:Name)?=["'`]([^"'`]+)["'`]/g;
  
  updatedContent = updatedContent.replace(classRegex, (match, classString) => {
    const classes = classString.split(/\s+/).filter(Boolean);
    const updatedClasses: string[] = [];
    
    classes.forEach((className: string) => {
      const mapping = lookup.get(className);
      if (mapping) {
        updatedClasses.push(mapping.to);
        changes.push(`${mapping.from} → ${mapping.to}`);
        
        if (mapping.breaking) {
          warnings.push(`Breaking change: ${mapping.from} → ${mapping.to}${mapping.notes ? ` (${mapping.notes})` : ''}`);
        }
        
        if (options.verbose && mapping.notes) {
          console.log(`  Note: ${mapping.notes}`);
        }
      } else {
        updatedClasses.push(className);
      }
    });
    
    const newClassString = updatedClasses.join(' ');
    return match.replace(classString, newClassString);
  });
  
  return { content: updatedContent, changes, warnings };
}

/**
 * Apply DaisyUI migrations to content
 */
export function applyDaisyUIMigrations(
  content: string,
  options: MigrationOptions = {}
): { content: string; changes: string[]; warnings: string[] } {
  return replaceClasses(content, DAISYUI_CLASS_MIGRATIONS, options);
}

/**
 * Apply Tailwind migrations to content
 */
export function applyTailwindMigrations(
  content: string,
  options: MigrationOptions = {}
): { content: string; changes: string[]; warnings: string[] } {
  return replaceClasses(content, TAILWIND_CLASS_MIGRATIONS, options);
}

/**
 * Apply all migrations to content
 */
export function applyAllMigrations(
  content: string,
  options: MigrationOptions = {}
): { content: string; changes: string[]; warnings: string[] } {
  let updatedContent = content;
  const allChanges: string[] = [];
  const allWarnings: string[] = [];
  
  // Apply DaisyUI migrations first
  const daisyuiResult = applyDaisyUIMigrations(updatedContent, options);
  updatedContent = daisyuiResult.content;
  allChanges.push(...daisyuiResult.changes);
  allWarnings.push(...daisyuiResult.warnings);
  
  // Then apply Tailwind migrations
  const tailwindResult = applyTailwindMigrations(updatedContent, options);
  updatedContent = tailwindResult.content;
  allChanges.push(...tailwindResult.changes);
  allWarnings.push(...tailwindResult.warnings);
  
  return { content: updatedContent, changes: allChanges, warnings: allWarnings };
}

/**
 * Migrate a single file
 */
export async function migrateFile(
  filePath: string,
  options: MigrationOptions = {}
): Promise<{ changes: string[]; warnings: string[] }> {
  try {
    const originalContent = await Deno.readTextFile(filePath);
    
    // Create backup if not skipped
    if (!options.skipBackup) {
      await Deno.writeTextFile(`${filePath}.backup`, originalContent);
    }
    
    const result = applyAllMigrations(originalContent, options);
    
    if (!options.dryRun && result.changes.length > 0) {
      await Deno.writeTextFile(filePath, result.content);
    }
    
    if (options.verbose) {
      console.log(`Migrated ${filePath}: ${result.changes.length} changes`);
      result.changes.forEach(change => console.log(`  ${change}`));
      result.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
    }
    
    return { changes: result.changes, warnings: result.warnings };
  } catch (error) {
    throw new Error(`Failed to migrate file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Migrate multiple files in batch
 */
export async function migrateFiles(
  filePaths: string[],
  options: MigrationOptions = {}
): Promise<BatchMigrationResult> {
  const result: BatchMigrationResult = {
    totalFiles: filePaths.length,
    processedFiles: 0,
    errors: [],
    changes: []
  };
  
  for (const filePath of filePaths) {
    try {
      const migrationResult = await migrateFile(filePath, options);
      result.processedFiles++;
      
      if (migrationResult.changes.length > 0) {
        result.changes.push({
          file: filePath,
          changes: migrationResult.changes.length
        });
      }
    } catch (error) {
      result.errors.push({
        file: filePath,
        error: (error as Error).message
      });
    }
  }
  
  return result;
}

/**
 * Find all component files in a directory
 */
export async function findComponentFiles(
  directory: string,
  extensions: string[] = ['.tsx', '.jsx', '.ts', '.js']
): Promise<string[]> {
  const files: string[] = [];
  
  async function walkDirectory(dir: string) {
    try {
      for await (const entry of Deno.readDir(dir)) {
        const fullPath = `${dir}/${entry.name}`;
        
        if (entry.isDirectory) {
          await walkDirectory(fullPath);
        } else if (entry.isFile) {
          const hasValidExtension = extensions.some(ext => entry.name.endsWith(ext));
          if (hasValidExtension) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dir}: ${(error as Error).message}`);
    }
  }
  
  await walkDirectory(directory);
  return files;
}

/**
 * Validate that a class mapping is safe to apply
 */
export function validateMapping(mapping: ClassMapping): boolean {
  // Ensure both from and to are valid class names (including responsive prefixes with colons)
  const classNameRegex = /^[a-zA-Z0-9_:-]+$/;
  const fromValid = mapping.from.split(' ').every(cls => classNameRegex.test(cls));
  const toValid = mapping.to.split(' ').every(cls => classNameRegex.test(cls));
  
  return fromValid && toValid;
}

/**
 * Get all valid mappings (filtered for safety)
 */
export function getValidMappings(): ClassMapping[] {
  const allMappings = [...DAISYUI_CLASS_MIGRATIONS, ...TAILWIND_CLASS_MIGRATIONS];
  return allMappings.filter(validateMapping);
}

/**
 * Enhanced batch migration with progress tracking and parallel processing
 */
export async function migrateDirectory(
  directory: string,
  options: MigrationOptions & { 
    maxConcurrency?: number;
    extensions?: string[];
    excludePatterns?: string[];
    onProgress?: (current: number, total: number, file: string) => void;
  } = {}
): Promise<BatchMigrationResult & { summary: string }> {
  const {
    maxConcurrency = 5,
    extensions = ['.tsx', '.jsx', '.ts', '.js'],
    excludePatterns = ['node_modules', '.git', 'dist', 'build'],
    onProgress,
    ...migrationOptions
  } = options;

  // Find all component files
  const allFiles = await findComponentFiles(directory, extensions);
  
  // Filter out excluded patterns
  const filteredFiles = allFiles.filter(file => {
    return !excludePatterns.some(pattern => file.includes(pattern));
  });

  const result: BatchMigrationResult = {
    totalFiles: filteredFiles.length,
    processedFiles: 0,
    errors: [],
    changes: []
  };

  // Process files in batches to avoid overwhelming the system
  const batches: string[][] = [];
  for (let i = 0; i < filteredFiles.length; i += maxConcurrency) {
    batches.push(filteredFiles.slice(i, i + maxConcurrency));
  }

  for (const batch of batches) {
    const batchPromises = batch.map(async (filePath) => {
      try {
        const migrationResult = await migrateFile(filePath, migrationOptions);
        result.processedFiles++;
        
        if (migrationResult.changes.length > 0) {
          result.changes.push({
            file: filePath,
            changes: migrationResult.changes.length
          });
        }

        if (onProgress) {
          onProgress(result.processedFiles, result.totalFiles, filePath);
        }

        return { success: true, file: filePath };
      } catch (error) {
        result.errors.push({
          file: filePath,
          error: (error as Error).message
        });
        return { success: false, file: filePath, error: (error as Error).message };
      }
    });

    await Promise.all(batchPromises);
  }

  const totalChanges = result.changes.reduce((sum, change) => sum + change.changes, 0);
  const summary = `Migration complete: ${result.processedFiles}/${result.totalFiles} files processed, ${totalChanges} total changes, ${result.errors.length} errors`;

  return { ...result, summary };
}

/**
 * Create a detailed migration report
 */
export function generateMigrationReport(
  results: BatchMigrationResult,
  options: { includeFileDetails?: boolean; groupByType?: boolean } = {}
): string {
  const { includeFileDetails = true, groupByType = true } = options;
  
  let report = `# Migration Report\n\n`;
  report += `## Summary\n`;
  report += `- Total files: ${results.totalFiles}\n`;
  report += `- Processed files: ${results.processedFiles}\n`;
  report += `- Files with changes: ${results.changes.length}\n`;
  report += `- Errors: ${results.errors.length}\n`;
  
  const totalChanges = results.changes.reduce((sum, change) => sum + change.changes, 0);
  report += `- Total changes: ${totalChanges}\n\n`;

  if (results.errors.length > 0) {
    report += `## Errors\n`;
    results.errors.forEach(error => {
      report += `- **${error.file}**: ${error.error}\n`;
    });
    report += `\n`;
  }

  if (includeFileDetails && results.changes.length > 0) {
    report += `## Files with Changes\n`;
    
    if (groupByType) {
      const changesByType = results.changes.reduce((acc, change) => {
        const ext = change.file.split('.').pop() || 'unknown';
        if (!acc[ext]) acc[ext] = [];
        acc[ext].push(change);
        return acc;
      }, {} as Record<string, typeof results.changes>);

      Object.entries(changesByType).forEach(([ext, changes]) => {
        report += `\n### ${ext.toUpperCase()} Files\n`;
        changes.forEach(change => {
          report += `- **${change.file}**: ${change.changes} changes\n`;
        });
      });
    } else {
      results.changes.forEach(change => {
        report += `- **${change.file}**: ${change.changes} changes\n`;
      });
    }
  }

  return report;
}

/**
 * Validate migration mappings for consistency and safety
 */
export function validateAllMappings(): { 
  valid: ClassMapping[]; 
  invalid: Array<{ mapping: ClassMapping; reason: string }>;
  duplicates: Array<{ from: string; mappings: ClassMapping[] }>;
} {
  const allMappings = [...DAISYUI_CLASS_MIGRATIONS, ...TAILWIND_CLASS_MIGRATIONS];
  const valid: ClassMapping[] = [];
  const invalid: Array<{ mapping: ClassMapping; reason: string }> = [];
  const fromCounts = new Map<string, ClassMapping[]>();

  // Check for duplicates and validation
  allMappings.forEach(mapping => {
    // Track duplicates
    if (!fromCounts.has(mapping.from)) {
      fromCounts.set(mapping.from, []);
    }
    fromCounts.get(mapping.from)!.push(mapping);

    // Validate mapping
    if (!validateMapping(mapping)) {
      invalid.push({ 
        mapping, 
        reason: 'Invalid class name format' 
      });
    } else if (mapping.from === mapping.to && mapping.type === 'daisyui') {
      // This is okay for verification mappings
      valid.push(mapping);
    } else if (mapping.from === mapping.to && mapping.type === 'tailwind') {
      // This is okay for verification mappings
      valid.push(mapping);
    } else {
      valid.push(mapping);
    }
  });

  // Find duplicates
  const duplicates = Array.from(fromCounts.entries())
    .filter(([_, mappings]) => mappings.length > 1)
    .map(([from, mappings]) => ({ from, mappings }));

  return { valid, invalid, duplicates };
}

/**
 * Preview migration changes without applying them
 */
export async function previewMigration(
  filePath: string,
  options: MigrationOptions = {}
): Promise<{
  originalContent: string;
  migratedContent: string;
  changes: string[];
  warnings: string[];
  diff: Array<{ type: 'add' | 'remove' | 'unchanged'; line: string }>;
}> {
  const originalContent = await Deno.readTextFile(filePath);
  const result = applyAllMigrations(originalContent, { ...options, dryRun: true });
  
  // Create a simple diff
  const originalLines = originalContent.split('\n');
  const migratedLines = result.content.split('\n');
  const diff: Array<{ type: 'add' | 'remove' | 'unchanged'; line: string }> = [];
  
  const maxLines = Math.max(originalLines.length, migratedLines.length);
  for (let i = 0; i < maxLines; i++) {
    const originalLine = originalLines[i] || '';
    const migratedLine = migratedLines[i] || '';
    
    if (originalLine === migratedLine) {
      diff.push({ type: 'unchanged', line: originalLine });
    } else if (originalLine && !migratedLine) {
      diff.push({ type: 'remove', line: originalLine });
    } else if (!originalLine && migratedLine) {
      diff.push({ type: 'add', line: migratedLine });
    } else {
      diff.push({ type: 'remove', line: originalLine });
      diff.push({ type: 'add', line: migratedLine });
    }
  }
  
  return {
    originalContent,
    migratedContent: result.content,
    changes: result.changes,
    warnings: result.warnings,
    diff
  };
}

/**
 * Rollback migrations by restoring from backup files
 */
export async function rollbackMigrations(
  directory: string,
  options: { extensions?: string[]; removeBackups?: boolean } = {}
): Promise<{ restoredFiles: string[]; errors: Array<{ file: string; error: string }> }> {
  const { extensions = ['.tsx', '.jsx', '.ts', '.js'], removeBackups = false } = options;
  
  const restoredFiles: string[] = [];
  const errors: Array<{ file: string; error: string }> = [];
  
  const allFiles = await findComponentFiles(directory, extensions);
  
  for (const filePath of allFiles) {
    const backupPath = `${filePath}.backup`;
    
    try {
      // Check if backup exists
      const backupStat = await Deno.stat(backupPath);
      if (backupStat.isFile) {
        // Restore from backup
        const backupContent = await Deno.readTextFile(backupPath);
        await Deno.writeTextFile(filePath, backupContent);
        restoredFiles.push(filePath);
        
        // Remove backup if requested
        if (removeBackups) {
          await Deno.remove(backupPath);
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'NotFound') {
        errors.push({
          file: filePath,
          error: (error as Error).message
        });
      }
    }
  }
  
  return { restoredFiles, errors };
}

/**
 * Get migration statistics for a directory
 */
export async function getMigrationStats(
  directory: string,
  options: { extensions?: string[] } = {}
): Promise<{
  totalFiles: number;
  filesWithDaisyUIClasses: number;
  filesWithTailwindClasses: number;
  filesWithBothFrameworks: number;
  mostCommonClasses: Array<{ className: string; count: number; type: 'daisyui' | 'tailwind' | 'unknown' }>;
  estimatedChanges: number;
}> {
  const { extensions = ['.tsx', '.jsx', '.ts', '.js'] } = options;
  
  const allFiles = await findComponentFiles(directory, extensions);
  const classUsage = new Map<string, { count: number; type: 'daisyui' | 'tailwind' | 'unknown' }>();
  
  let filesWithDaisyUIClasses = 0;
  let filesWithTailwindClasses = 0;
  let filesWithBothFrameworks = 0;
  let estimatedChanges = 0;
  
  const daisyuiClassNames = new Set(DAISYUI_CLASS_MIGRATIONS.map(m => m.from));
  const tailwindClassNames = new Set(TAILWIND_CLASS_MIGRATIONS.map(m => m.from));
  
  for (const filePath of allFiles) {
    try {
      const content = await Deno.readTextFile(filePath);
      const classRegex = /class(?:Name)?=["'`]([^"'`]+)["'`]/g;
      
      let hasDaisyUI = false;
      let hasTailwind = false;
      let match;
      
      while ((match = classRegex.exec(content)) !== null) {
        const classes = match[1].split(/\s+/).filter(Boolean);
        
        classes.forEach(className => {
          let type: 'daisyui' | 'tailwind' | 'unknown' = 'unknown';
          
          if (daisyuiClassNames.has(className)) {
            type = 'daisyui';
            hasDaisyUI = true;
            estimatedChanges++;
          } else if (tailwindClassNames.has(className)) {
            type = 'tailwind';
            hasTailwind = true;
            estimatedChanges++;
          } else if (className.startsWith('btn-') || className.startsWith('input-') || 
                     className.startsWith('card-') || className.startsWith('modal-') ||
                     className.startsWith('navbar-') || className.startsWith('alert-') ||
                     className.startsWith('badge-') || className.startsWith('progress-') ||
                     className.startsWith('menu-') || className.startsWith('table-')) {
            type = 'daisyui';
            hasDaisyUI = true;
          } else if (className.startsWith('text-') || className.startsWith('bg-') ||
                     className.startsWith('border-') || className.startsWith('p-') ||
                     className.startsWith('m-') || className.startsWith('flex') ||
                     className.startsWith('grid') || className.includes(':')) {
            type = 'tailwind';
            hasTailwind = true;
          }
          
          const existing = classUsage.get(className) || { count: 0, type };
          classUsage.set(className, { count: existing.count + 1, type });
        });
      }
      
      if (hasDaisyUI) filesWithDaisyUIClasses++;
      if (hasTailwind) filesWithTailwindClasses++;
      if (hasDaisyUI && hasTailwind) filesWithBothFrameworks++;
      
    } catch (error) {
      console.warn(`Warning: Could not analyze file ${filePath}: ${(error as Error).message}`);
    }
  }
  
  const mostCommonClasses = Array.from(classUsage.entries())
    .map(([className, data]) => ({ className, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  
  return {
    totalFiles: allFiles.length,
    filesWithDaisyUIClasses,
    filesWithTailwindClasses,
    filesWithBothFrameworks,
    mostCommonClasses,
    estimatedChanges
  };
}