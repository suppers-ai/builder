import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import NotificationContainer from './NotificationContainer.svelte';
import { notifications } from '$lib/stores/notifications';
import type { NotificationType } from '$lib/stores/notifications';

describe('NotificationContainer Component', () => {
	beforeEach(() => {
		// Clear notifications before each test
		notifications.clear();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('renders without notifications', () => {
		const { container } = render(NotificationContainer);
		const notificationElements = container.querySelectorAll('[role="alert"]');
		expect(notificationElements).toHaveLength(0);
	});

	it('displays success notification', async () => {
		const { container } = render(NotificationContainer);
		
		notifications.success('Success', 'Operation completed successfully');
		
		await waitFor(() => {
			const alert = container.querySelector('[role="alert"]');
			expect(alert).toBeInTheDocument();
			expect(alert?.textContent).toContain('Success');
			expect(alert?.textContent).toContain('Operation completed successfully');
		});

		// Check for success styling
		const alert = container.querySelector('[role="alert"]');
		expect(alert).toHaveClass('alert-success');
	});

	it('displays error notification', async () => {
		const { container } = render(NotificationContainer);
		
		notifications.error('Error', 'Something went wrong');
		
		await waitFor(() => {
			const alert = container.querySelector('[role="alert"]');
			expect(alert).toBeInTheDocument();
			expect(alert?.textContent).toContain('Error');
			expect(alert?.textContent).toContain('Something went wrong');
		});

		// Check for error styling
		const alert = container.querySelector('[role="alert"]');
		expect(alert).toHaveClass('alert-error');
	});

	it('displays warning notification', async () => {
		const { container } = render(NotificationContainer);
		
		notifications.warning('Warning', 'Please be careful');
		
		await waitFor(() => {
			const alert = container.querySelector('[role="alert"]');
			expect(alert).toBeInTheDocument();
			expect(alert?.textContent).toContain('Warning');
			expect(alert?.textContent).toContain('Please be careful');
		});

		// Check for warning styling
		const alert = container.querySelector('[role="alert"]');
		expect(alert).toHaveClass('alert-warning');
	});

	it('displays info notification', async () => {
		const { container } = render(NotificationContainer);
		
		notifications.info('Info', 'Here is some information');
		
		await waitFor(() => {
			const alert = container.querySelector('[role="alert"]');
			expect(alert).toBeInTheDocument();
			expect(alert?.textContent).toContain('Info');
			expect(alert?.textContent).toContain('Here is some information');
		});

		// Check for info styling
		const alert = container.querySelector('[role="alert"]');
		expect(alert).toHaveClass('alert-info');
	});

	it('displays multiple notifications', async () => {
		const { container } = render(NotificationContainer);
		
		notifications.success('First', 'First message');
		notifications.error('Second', 'Second message');
		notifications.info('Third', 'Third message');
		
		await waitFor(() => {
			const alerts = container.querySelectorAll('[role="alert"]');
			expect(alerts).toHaveLength(3);
		});
	});

	it('removes notification after timeout', async () => {
		const { container } = render(NotificationContainer);
		
		notifications.add({
			type: 'success',
			title: 'Test',
			message: 'This will disappear',
			duration: 3000
		});
		
		await waitFor(() => {
			const alert = container.querySelector('[role="alert"]');
			expect(alert).toBeInTheDocument();
		});

		// Fast-forward time
		vi.advanceTimersByTime(3500);
		
		await waitFor(() => {
			const alert = container.querySelector('[role="alert"]');
			expect(alert).not.toBeInTheDocument();
		});
	});

	it('keeps notification with duration 0', async () => {
		const { container } = render(NotificationContainer);
		
		notifications.add({
			type: 'info',
			title: 'Persistent',
			message: 'This stays',
			duration: 0
		});
		
		await waitFor(() => {
			const alert = container.querySelector('[role="alert"]');
			expect(alert).toBeInTheDocument();
		});

		// Fast-forward time significantly
		vi.advanceTimersByTime(10000);
		
		await waitFor(() => {
			const alert = container.querySelector('[role="alert"]');
			expect(alert).toBeInTheDocument();
		});
	});

	it('displays progress notification', async () => {
		const { container } = render(NotificationContainer);
		
		const id = notifications.progress('Uploading', 0, 100);
		
		await waitFor(() => {
			const alert = container.querySelector('[role="alert"]');
			expect(alert).toBeInTheDocument();
			expect(alert?.textContent).toContain('Uploading');
		});

		// Check for progress bar
		const progressBar = container.querySelector('progress');
		expect(progressBar).toBeInTheDocument();
		expect(progressBar?.getAttribute('value')).toBe('0');
		expect(progressBar?.getAttribute('max')).toBe('100');
	});

	it('updates progress notification', async () => {
		const { container } = render(NotificationContainer);
		
		const id = notifications.progress('Uploading', 0, 100);
		
		await waitFor(() => {
			const progressBar = container.querySelector('progress');
			expect(progressBar).toBeInTheDocument();
		});

		// Update progress
		notifications.updateProgress(id, 50);
		
		await waitFor(() => {
			const progressBar = container.querySelector('progress');
			expect(progressBar?.getAttribute('value')).toBe('50');
		});

		// Complete progress
		notifications.updateProgress(id, 100);
		
		await waitFor(() => {
			const progressBar = container.querySelector('progress');
			expect(progressBar?.getAttribute('value')).toBe('100');
		});
	});

	it('removes notification when dismissed', async () => {
		const { container } = render(NotificationContainer);
		
		const id = notifications.add({
			type: 'info',
			title: 'Dismissable',
			message: 'Click to dismiss',
			duration: 0
		});
		
		await waitFor(() => {
			const alert = container.querySelector('[role="alert"]');
			expect(alert).toBeInTheDocument();
		});

		// Remove notification
		notifications.remove(id);
		
		await waitFor(() => {
			const alert = container.querySelector('[role="alert"]');
			expect(alert).not.toBeInTheDocument();
		});
	});

	it('clears all notifications', async () => {
		const { container } = render(NotificationContainer);
		
		notifications.success('First', 'Message 1');
		notifications.error('Second', 'Message 2');
		notifications.info('Third', 'Message 3');
		
		await waitFor(() => {
			const alerts = container.querySelectorAll('[role="alert"]');
			expect(alerts).toHaveLength(3);
		});

		// Clear all
		notifications.clear();
		
		await waitFor(() => {
			const alerts = container.querySelectorAll('[role="alert"]');
			expect(alerts).toHaveLength(0);
		});
	});

	it('applies correct icons for notification types', async () => {
		const { container } = render(NotificationContainer);
		
		notifications.success('Success', 'Test');
		
		await waitFor(() => {
			const icon = container.querySelector('svg');
			expect(icon).toBeInTheDocument();
			// Success should have check icon
			expect(icon?.querySelector('polyline')).toBeInTheDocument();
		});

		notifications.clear();
		notifications.error('Error', 'Test');
		
		await waitFor(() => {
			const icon = container.querySelector('svg');
			expect(icon).toBeInTheDocument();
			// Error should have X icon
			expect(icon?.querySelector('line')).toBeInTheDocument();
		});
	});

	it('handles notification with action button', async () => {
		const { container } = render(NotificationContainer);
		const actionHandler = vi.fn();
		
		notifications.add({
			type: 'info',
			title: 'Action Required',
			message: 'Click the button',
			duration: 0,
			action: {
				label: 'Click Me',
				handler: actionHandler
			}
		});
		
		await waitFor(() => {
			const button = container.querySelector('button');
			expect(button).toBeInTheDocument();
			expect(button?.textContent).toContain('Click Me');
		});

		// Click action button
		const button = container.querySelector('button');
		button?.click();
		
		expect(actionHandler).toHaveBeenCalledTimes(1);
	});

	it('stacks notifications vertically', async () => {
		const { container } = render(NotificationContainer);
		
		notifications.success('First', 'Top notification');
		notifications.error('Second', 'Middle notification');
		notifications.info('Third', 'Bottom notification');
		
		await waitFor(() => {
			const alerts = container.querySelectorAll('[role="alert"]');
			expect(alerts).toHaveLength(3);
			
			// Check that notifications are in a flex column
			const notificationContainer = alerts[0]?.parentElement;
			expect(notificationContainer).toHaveClass('flex-col');
		});
	});

	it('limits maximum number of notifications', async () => {
		const { container } = render(NotificationContainer);
		
		// Add many notifications
		for (let i = 0; i < 10; i++) {
			notifications.info(`Notification ${i}`, `Message ${i}`);
		}
		
		await waitFor(() => {
			const alerts = container.querySelectorAll('[role="alert"]');
			// Should limit to 5 notifications (or whatever the limit is)
			expect(alerts.length).toBeLessThanOrEqual(5);
		});
	});
});