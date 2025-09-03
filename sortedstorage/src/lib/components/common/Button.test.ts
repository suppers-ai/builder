import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Button from './Button.svelte';
import { Upload } from 'lucide-svelte';

describe('Button Component', () => {
	it('renders with default props', () => {
		const { getByRole } = render(Button);
		const button = getByRole('button');
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('btn-primary');
	});

	it('renders with custom text', () => {
		const { getByText } = render(Button, {
			props: {
				$$slots: {
					default: 'Click me'
				}
			}
		});
		expect(getByText('Click me')).toBeInTheDocument();
	});

	it('applies variant classes correctly', () => {
		const { getByRole } = render(Button, {
			props: {
				variant: 'secondary'
			}
		});
		const button = getByRole('button');
		expect(button).toHaveClass('btn-secondary');
	});

	it('applies size classes correctly', () => {
		const { getByRole } = render(Button, {
			props: {
				size: 'sm'
			}
		});
		const button = getByRole('button');
		expect(button).toHaveClass('btn-sm');
	});

	it('renders with icon', () => {
		const { container } = render(Button, {
			props: {
				icon: Upload
			}
		});
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('shows loading state', () => {
		const { getByRole, container } = render(Button, {
			props: {
				loading: true
			}
		});
		const button = getByRole('button');
		expect(button).toBeDisabled();
		expect(button).toHaveClass('loading');
		
		// Check for spinner
		const spinner = container.querySelector('.animate-spin');
		expect(spinner).toBeInTheDocument();
	});

	it('handles click event', async () => {
		const handleClick = vi.fn();
		const { getByRole } = render(Button, {
			props: {
				$$slots: {
					default: 'Click me'
				}
			}
		});
		
		const button = getByRole('button');
		button.addEventListener('click', handleClick);
		
		await fireEvent.click(button);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('is disabled when disabled prop is true', () => {
		const { getByRole } = render(Button, {
			props: {
				disabled: true
			}
		});
		const button = getByRole('button');
		expect(button).toBeDisabled();
	});

	it('applies custom className', () => {
		const { getByRole } = render(Button, {
			props: {
				className: 'custom-class'
			}
		});
		const button = getByRole('button');
		expect(button).toHaveClass('custom-class');
	});

	it('renders as full width when fullWidth is true', () => {
		const { getByRole } = render(Button, {
			props: {
				fullWidth: true
			}
		});
		const button = getByRole('button');
		expect(button).toHaveClass('w-full');
	});

	it('applies multiple variant classes for outline', () => {
		const { getByRole } = render(Button, {
			props: {
				variant: 'outline'
			}
		});
		const button = getByRole('button');
		expect(button).toHaveClass('btn-outline');
	});

	it('does not trigger click when disabled', async () => {
		const handleClick = vi.fn();
		const { getByRole } = render(Button, {
			props: {
				disabled: true
			}
		});
		
		const button = getByRole('button');
		button.addEventListener('click', handleClick);
		
		await fireEvent.click(button);
		expect(handleClick).not.toHaveBeenCalled();
	});
});