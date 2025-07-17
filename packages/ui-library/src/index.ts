// UI Library components and registry
export * from './registry.ts';
export * from './types.ts';
export * from './validation.ts';

// Export components
export { default as Button } from './components/Button.tsx';
export { default as Input } from './components/Input.tsx';
export { default as Card } from './components/Card.tsx';
export { default as Layout } from './components/Layout.tsx';

// Export component prop types
export type { ButtonProps } from './components/Button.tsx';
export type { InputProps } from './components/Input.tsx';
export type { CardProps } from './components/Card.tsx';
export type { LayoutProps } from './components/Layout.tsx';

// Re-export commonly used types and functions
export type {
  IComponentRegistry,
  ComponentRegistryEntry,
  ComponentMetadata,
  ValidationResult,
  ComponentPropSchema
} from './types.ts';

export {
  ComponentRegistry,
  createRegistry,
  defaultRegistry,
  registerComponent,
  getComponent,
  validateComponentProps
} from './registry.ts';
