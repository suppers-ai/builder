<script lang="ts">
	import { Shield, Share2, Zap, Cloud, Lock, Users, Sparkles, ArrowRight, CheckCircle } from 'lucide-svelte';
	import Card from '$lib/components/common/Card.svelte';
	import Button from '$lib/components/common/Button.svelte';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { authConfig } from '$lib/config/auth';
	
	let visible = false;
	
	// If user is authenticated, redirect to files page
	onMount(() => {
		// Check current path to avoid redirect loops
		const currentPath = window.location.pathname;
		if (currentPath === '/false' || currentPath === '/true' || currentPath === '/null') {
			// Fix invalid URLs
			goto('/');
			return;
		}
		
		if ($auth.user) {
			goto('/files');
		}
		visible = true;
	});
</script>

<!-- Public Landing Page with Login-style Background -->
<div class="landing-page">
	<!-- Header with Login/Signup buttons -->
	<header class="landing-header">
		<div class="flex items-center gap-3">
			<img src="/logos/long_light.svg" alt="SortedStorage" class="h-10 w-auto" />
		</div>
		<div class="flex gap-3">
			<Button href={authConfig.loginUrl()} variant="ghost" size="sm" class="nav-login-btn">
				Sign In
			</Button>
			<Button href={authConfig.registerUrl()} size="sm" class="nav-signup-btn">
				<Sparkles class="w-4 h-4" />
				Get Started Free
			</Button>
		</div>
	</header>
	
	<!-- Main Content -->
	<div class="landing-content">
		{#if visible}
			<!-- Hero Card -->
			<div class="hero-card" in:fade={{ duration: 500 }}>
				<!-- Logo and Title -->
				<div class="hero-logo" in:scale={{ duration: 600, delay: 200 }}>
					<img src="/logos/long_light.svg" alt="SortedStorage" class="logo-main" />
					<p class="hero-subtitle">
						Open source cloud storage redefining how we view our data.
					</p>
				</div>

				<!-- Character Image -->
				<div class="character-hero" in:scale={{ duration: 700, delay: 300 }}>
					<img src="/images/character/cool.png" alt="Welcome" class="character-image" />
				</div>

				<!-- CTA Buttons -->
				<div class="hero-actions">
					<Button href={authConfig.loginUrl()} size="lg" class="hero-cta-button">
						<Sparkles class="w-5 h-5" />
						Get Started Now
						<ArrowRight class="w-5 h-5" />
					</Button>
					<Button href={authConfig.loginUrl()} variant="ghost" size="lg" class="hero-secondary-button">
						Sign In
					</Button>
				</div>

				<!-- Quick Stats -->
				<div class="quick-stats">
					<div class="stat">
						<CheckCircle class="w-5 h-5 text-green-500" />
						<span>Free Plan</span>
					</div>
					<div class="stat">
						<CheckCircle class="w-5 h-5 text-green-500" />
						<span>Secure Storage</span>
					</div>
					<div class="stat">
						<CheckCircle class="w-5 h-5 text-green-500" />
						<span>Coolness</span>
					</div>
				</div>
			</div>

			<!-- Features Cards Section -->
			<div class="features-section">
				<h2 class="section-title">Key Features</h2>
				
				<div class="features-grid">
					<!-- Cloud Storage Card -->
					<div class="feature-card" in:fly={{ y: 30, duration: 500, delay: 400 }}>
						<img src="/images/character/cloud.png" alt="Cloud Storage" class="feature-image" />
						<h3 class="feature-title">
							<Cloud class="w-5 h-5" />
							Cloud Storage
						</h3>
						<p class="feature-description">
							Access your files from anywhere. Automatic sync across all devices.
						</p>
					</div>

					<!-- Privacy Card -->
					<div class="feature-card" in:fly={{ y: 30, duration: 500, delay: 500 }}>
						<img src="/images/character/privacy.png" alt="Privacy" class="feature-image" />
						<h3 class="feature-title">
							<Lock class="w-5 h-5" />
							Privacy First
						</h3>
						<p class="feature-description">
							End-to-end encryption. Your files remain private and secure.
						</p>
					</div>

					<!-- Sharing Card -->
					<div class="feature-card" in:fly={{ y: 30, duration: 500, delay: 600 }}>
						<img src="/images/character/sharing.png" alt="Sharing" class="feature-image" />
						<h3 class="feature-title">
							<Users class="w-5 h-5" />
							Easy Sharing
						</h3>
						<p class="feature-description">
							Share with secure links. Control permissions and expiration.
						</p>
					</div>

					<!-- Free Plan Card -->
					<div class="feature-card" in:fly={{ y: 30, duration: 500, delay: 700 }}>
						<img src="/images/character/free.png" alt="Free" class="feature-image" />
						<h3 class="feature-title">
							<Sparkles class="w-5 h-5" />
							Free Forever
						</h3>
						<p class="feature-description">
							Start with 5GB free. No credit card required to begin.
						</p>
					</div>
				</div>
			</div>

			<!-- Bottom CTA Card -->
			<div class="cta-card" in:fade={{ duration: 500, delay: 800 }}>
				<img src="/images/character/thanks.png" alt="Get Started" class="cta-image" />
				<h2 class="cta-title">Ready to Get Started?</h2>
				<p class="cta-description">
					Join thousands of users who trust SortedStorage
				</p>
				<Button href={authConfig.registerUrl()} size="lg" class="btn-cta">
					<ArrowRight class="w-5 h-5 mr-2" />
					Create Your Free Account
				</Button>
				<p class="cta-note">No credit card required • 5GB free forever</p>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Login-style background and layout */
	.landing-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		position: relative;
	}

	.landing-header {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.landing-content {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Hero Card */
	.hero-card {
		background: white;
		border-radius: 16px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
		padding: 3rem;
		margin-bottom: 2rem;
		text-align: center;
		position: relative;
		overflow: hidden;
	}

	.hero-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #3b82f6, #8b5cf6);
	}

	.hero-logo {
		margin-bottom: 2rem;
	}

	.logo-main {
		height: 80px;
		width: auto;
		margin: 0 auto 1rem;
		display: block;
	}

	.hero-title {
		font-size: 3rem;
		font-weight: 800;
		background: linear-gradient(135deg, #3b82f6, #8b5cf6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 0.5rem;
	}

	.hero-subtitle {
		color: #6b7280;
		font-size: 1.25rem;
		margin-bottom: 2rem;
	}

	.character-hero {
		margin: 2rem 0;
	}

	.character-image {
		width: 120px;
		height: 120px;
		object-fit: contain;
		margin: 0 auto;
	}

	.hero-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
		margin: 2rem 0;
	}

	.quick-stats {
		display: flex;
		justify-content: center;
		gap: 2rem;
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid #e5e7eb;
		flex-wrap: wrap;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #4b5563;
		font-size: 0.875rem;
	}

	/* Features Section */
	.features-section {
		margin: 3rem 0;
	}

	.section-title {
		text-align: center;
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 2rem;
		color: #1f2937;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.feature-card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		transition: transform 0.3s, box-shadow 0.3s;
	}

	.feature-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
	}

	.feature-image {
		width: 80px;
		height: 80px;
		object-fit: contain;
		margin: 0 auto 1rem;
	}

	.feature-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		color: #1f2937;
	}

	.feature-description {
		color: #6b7280;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	/* CTA Card */
	.cta-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 16px;
		padding: 3rem;
		text-align: center;
		color: white;
		margin-top: 3rem;
		box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
	}

	.cta-image {
		width: 100px;
		height: 100px;
		object-fit: contain;
		margin: 0 auto 1.5rem;
		filter: brightness(0) invert(1);
	}

	.cta-title {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.cta-description {
		font-size: 1.125rem;
		margin-bottom: 2rem;
		opacity: 0.95;
	}

	.cta-note {
		margin-top: 1rem;
		font-size: 0.875rem;
		opacity: 0.9;
	}

	:global(.btn-primary-gradient) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-weight: 600;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
	}

	:global(.btn-primary-gradient:hover) {
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
		transform: translateY(-2px);
	}

	:global(.btn-cta) {
		background: white;
		color: #764ba2;
		font-weight: 600;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
	}

	:global(.btn-cta:hover) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
	}

	/* Navbar Button Styles */
	:global(.nav-login-btn) {
		background: transparent;
		color: #4b5563;
		font-weight: 500;
		border: 1px solid transparent;
		transition: all 0.2s;
	}

	:global(.nav-login-btn:hover) {
		background: rgba(59, 130, 246, 0.08);
		color: #3b82f6;
		border-color: rgba(59, 130, 246, 0.2);
	}

	:global(.nav-signup-btn) {
		background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
		color: white;
		font-weight: 600;
		border: none;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
		transition: all 0.3s;
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	:global(.nav-signup-btn:hover) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
		background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
	}

	/* Hero CTA Button Styles */
	:global(.hero-cta-button) {
		background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
		color: white;
		font-weight: 600;
		font-size: 1.125rem;
		padding: 1rem 2rem;
		box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
		transition: all 0.3s;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		position: relative;
		overflow: hidden;
	}

	:global(.hero-cta-button::before) {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
		opacity: 0;
		transition: opacity 0.3s;
	}

	:global(.hero-cta-button:hover) {
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 6px 30px rgba(59, 130, 246, 0.4);
	}

	:global(.hero-cta-button:hover::before) {
		opacity: 1;
	}

	:global(.hero-secondary-button) {
		background: rgba(255, 255, 255, 0.9);
		color: #4b5563;
		font-weight: 500;
		font-size: 1.125rem;
		padding: 1rem 2rem;
		border: 1px solid rgba(203, 213, 225, 0.5);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		transition: all 0.2s;
	}

	:global(.hero-secondary-button:hover) {
		background: white;
		color: #3b82f6;
		border-color: rgba(59, 130, 246, 0.3);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		transform: translateY(-1px);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.hero-card {
			padding: 2rem;
		}

		.features-grid {
			grid-template-columns: 1fr;
		}

		.quick-stats {
			flex-direction: column;
			gap: 1rem;
		}
	}

	/* Dark mode support */
	:global(.dark .landing-page) {
		background: linear-gradient(135deg, #1a1b26 0%, #24283b 100%);
	}

	:global(.dark .landing-header) {
		background: rgba(26, 27, 38, 0.9);
		border-bottom-color: rgba(255, 255, 255, 0.1);
	}

	:global(.dark .hero-card),
	:global(.dark .feature-card) {
		background: #24283b;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}

	:global(.dark .hero-title) {
		background: linear-gradient(135deg, #7aa2f7, #bb9af7);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	:global(.dark .hero-subtitle),
	:global(.dark .feature-description) {
		color: #a9b1d6;
	}

	:global(.dark .section-title),
	:global(.dark .feature-title) {
		color: #c0caf5;
	}

	:global(.dark .stat) {
		color: #a9b1d6;
	}

	:global(.dark .quick-stats) {
		border-top-color: #414868;
	}
</style>