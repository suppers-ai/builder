export async function registerServiceWorker() {
	if ('serviceWorker' in navigator && !import.meta.env.DEV) {
		try {
			const registration = await navigator.serviceWorker.register('/sw.js', {
				scope: '/'
			});
			
			console.log('ServiceWorker registered:', registration);
			
			// Check for updates
			registration.addEventListener('updatefound', () => {
				const newWorker = registration.installing;
				
				if (newWorker) {
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							// New service worker available
							showUpdateNotification();
						}
					});
				}
			});
			
			// Handle controller change
			navigator.serviceWorker.addEventListener('controllerchange', () => {
				window.location.reload();
			});
			
			return registration;
		} catch (error) {
			console.error('ServiceWorker registration failed:', error);
		}
	}
}

export async function unregisterServiceWorker() {
	if ('serviceWorker' in navigator) {
		const registrations = await navigator.serviceWorker.getRegistrations();
		
		for (const registration of registrations) {
			await registration.unregister();
		}
	}
}

export async function checkForUpdates() {
	if ('serviceWorker' in navigator) {
		const registration = await navigator.serviceWorker.getRegistration();
		
		if (registration) {
			await registration.update();
		}
	}
}

function showUpdateNotification() {
	// This would be integrated with your notification system
	const shouldUpdate = confirm('A new version of SortedStorage is available. Reload to update?');
	
	if (shouldUpdate) {
		window.location.reload();
	}
}

// Install prompt handling
let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function setupInstallPrompt() {
	window.addEventListener('beforeinstallprompt', (e: Event) => {
		// Prevent the mini-infobar from appearing on mobile
		e.preventDefault();
		
		// Stash the event so it can be triggered later
		deferredPrompt = e as BeforeInstallPromptEvent;
		
		// Show install button
		showInstallButton();
	});
	
	window.addEventListener('appinstalled', () => {
		console.log('PWA installed');
		deferredPrompt = null;
		hideInstallButton();
	});
}

export async function promptInstall() {
	if (!deferredPrompt) {
		return false;
	}
	
	// Show the install prompt
	deferredPrompt.prompt();
	
	// Wait for the user to respond to the prompt
	const { outcome } = await deferredPrompt.userChoice;
	
	console.log(`User response to install prompt: ${outcome}`);
	
	// Clear the deferred prompt
	deferredPrompt = null;
	
	return outcome === 'accepted';
}

function showInstallButton() {
	// Dispatch custom event that components can listen to
	window.dispatchEvent(new CustomEvent('pwa:installable'));
}

function hideInstallButton() {
	window.dispatchEvent(new CustomEvent('pwa:installed'));
}

// Network status handling
export function setupNetworkHandling() {
	window.addEventListener('online', () => {
		window.dispatchEvent(new CustomEvent('network:online'));
	});
	
	window.addEventListener('offline', () => {
		window.dispatchEvent(new CustomEvent('network:offline'));
	});
}

export function isOnline(): boolean {
	return navigator.onLine;
}

// Background sync
export async function registerBackgroundSync(tag: string) {
	if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
		const registration = await navigator.serviceWorker.ready;
		
		try {
			await (registration as any).sync.register(tag);
			console.log(`Background sync registered: ${tag}`);
		} catch (error) {
			console.error('Background sync registration failed:', error);
		}
	}
}

// Push notifications
export async function requestNotificationPermission() {
	if (!('Notification' in window)) {
		return false;
	}
	
	if (Notification.permission === 'granted') {
		return true;
	}
	
	if (Notification.permission !== 'denied') {
		const permission = await Notification.requestPermission();
		return permission === 'granted';
	}
	
	return false;
}

export async function subscribeToPushNotifications() {
	if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
		return null;
	}
	
	const registration = await navigator.serviceWorker.ready;
	
	// Check if already subscribed
	let subscription = await registration.pushManager.getSubscription();
	
	if (!subscription) {
		// Subscribe
		const vapidPublicKey = import.meta.env.PUBLIC_VAPID_KEY;
		
		if (!vapidPublicKey) {
			console.warn('VAPID public key not configured');
			return null;
		}
		
		subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
		});
	}
	
	return subscription;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
		.replace(/-/g, '+')
		.replace(/_/g, '/');
	
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	
	return outputArray;
}

// TypeScript interface for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}