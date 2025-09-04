<script lang="ts">
	import { X, Check, TrendingUp, Crown, Building2 } from 'lucide-svelte';
	import Modal from '../common/Modal.svelte';
	import Button from '../common/Button.svelte';
	
	export let open: boolean = false;
	
	let selectedPlan = 'pro';
	let billingCycle = 'monthly';
	
	const plans = [
		{
			id: 'free',
			name: 'Starter',
			icon: TrendingUp,
			price: { monthly: 0, yearly: 0 },
			storage: '5 GB',
			features: [
				'5 GB Storage',
				'Basic sharing',
				'2FA authentication',
				'Mobile apps'
			],
			current: true
		},
		{
			id: 'pro',
			name: 'Professional',
			icon: Crown,
			price: { monthly: 12, yearly: 120 },
			storage: '100 GB',
			features: [
				'100 GB Storage',
				'Priority support',
				'Version history',
				'Advanced sharing',
				'Team folders',
				'API access'
			],
			popular: true
		},
		{
			id: 'business',
			name: 'Business',
			icon: Building2,
			price: { monthly: 25, yearly: 250 },
			storage: '1 TB',
			features: [
				'1 TB Storage',
				'Dedicated support',
				'SSO integration',
				'Custom branding',
				'Advanced security',
				'Admin dashboard',
				'SLA guarantee',
				'Unlimited API calls'
			]
		}
	];
	
	function handleClose() {
		open = false;
	}
	
	function handleUpgrade() {
		// Handle upgrade logic
		console.log('Upgrading to:', selectedPlan, 'with', billingCycle, 'billing');
		handleClose();
	}
</script>

<Modal bind:open on:close={handleClose} size="lg" title="Choose Your Plan">
	<div class="upgrade-modal">
		
		<!-- Billing Toggle -->
		<div class="billing-section">
			<div class="billing-toggle">
				<button 
					class="toggle-option {billingCycle === 'monthly' ? 'active' : ''}"
					on:click={() => billingCycle = 'monthly'}
				>
					Monthly
				</button>
				<button 
					class="toggle-option {billingCycle === 'yearly' ? 'active' : ''}"
					on:click={() => billingCycle = 'yearly'}
				>
					Annual
					<span class="save-badge">-20%</span>
				</button>
			</div>
		</div>
		
		<!-- Plans Grid -->
		<div class="plans-grid">
			{#each plans as plan}
				<div 
					class="plan-card {selectedPlan === plan.id ? 'selected' : ''} {plan.current ? 'current' : ''}"
					on:click={() => !plan.current && (selectedPlan = plan.id)}
					role="button"
					tabindex="0"
				>
					{#if plan.popular}
						<div class="popular-badge">Most Popular</div>
					{/if}
					
					<div class="plan-header">
						<div class="plan-icon-wrapper">
							<svelte:component this={plan.icon} size={20} />
						</div>
						<h3 class="plan-name">{plan.name}</h3>
						{#if plan.current}
							<span class="current-tag">Current</span>
						{/if}
					</div>
					
					<div class="plan-price">
						{#if plan.price[billingCycle] === 0}
							<span class="price-amount">Free</span>
						{:else}
							<span class="price-currency">$</span>
							<span class="price-amount">{plan.price[billingCycle]}</span>
							<span class="price-period">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
						{/if}
					</div>
					
					<div class="plan-storage">
						<span class="storage-amount">{plan.storage}</span>
						<span class="storage-label">Storage</span>
					</div>
					
					<div class="plan-features">
						{#each plan.features as feature}
							<div class="feature-item">
								<Check size={14} class="feature-check" />
								<span>{feature}</span>
							</div>
						{/each}
					</div>
					
				</div>
			{/each}
		</div>
		
		<!-- Footer Actions -->
		<div class="modal-footer">
			<div class="footer-summary">
				{#if selectedPlan !== 'free'}
					<div class="price-summary">
						<span class="price-label">Total</span>
						<span class="price-value">
							${plans.find(p => p.id === selectedPlan)?.price[billingCycle]}
							<span class="price-period">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
						</span>
					</div>
				{/if}
				<Button 
					variant="primary" 
					on:click={handleUpgrade}
					disabled={selectedPlan === 'free'}
					class="upgrade-btn"
				>
					{selectedPlan === 'free' ? 'Current Plan' : 'Continue with ' + plans.find(p => p.id === selectedPlan)?.name}
				</Button>
			</div>
			<p class="footer-note">Secure payment • Cancel anytime • Instant activation</p>
		</div>
	</div>
</Modal>

<style>
	.upgrade-modal {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.billing-section {
		display: flex;
		justify-content: center;
	}
	
	.billing-toggle {
		display: inline-flex;
		background: #f9fafb;
		padding: 0.25rem;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
	}
	
	.toggle-option {
		padding: 0.375rem 1rem;
		background: transparent;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.15s;
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}
	
	.toggle-option.active {
		background: white;
		color: #111827;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}
	
	.save-badge {
		background: linear-gradient(135deg, #10b981, #059669);
		color: white;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.625rem;
		font-weight: 700;
	}
	
	.plans-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}
	
	.plan-card {
		background: white;
		border: 1.5px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1.25rem;
		position: relative;
		transition: all 0.2s;
		cursor: pointer;
	}
	
	.plan-card:hover:not(.current) {
		border-color: #d1d5db;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}
	
	.plan-card.selected {
		border-color: #3b82f6;
		background: linear-gradient(to bottom, #eff6ff, #ffffff);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.plan-card.current {
		background: #fafbfc;
		border-color: #d1d5db;
		cursor: default;
		opacity: 0.7;
	}
	
	.popular-badge {
		position: absolute;
		top: -10px;
		left: 50%;
		transform: translateX(-50%);
		background: linear-gradient(135deg, #3b82f6, #2563eb);
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.025em;
		text-transform: uppercase;
	}
	
	.plan-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}
	
	.plan-icon-wrapper {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f3f4f6;
		border-radius: 0.5rem;
		color: #6b7280;
	}
	
	.plan-card.selected .plan-icon-wrapper {
		background: #dbeafe;
		color: #3b82f6;
	}
	
	.plan-name {
		font-size: 1rem;
		font-weight: 600;
		color: #111827;
		flex: 1;
	}
	
	.current-tag {
		font-size: 0.625rem;
		font-weight: 600;
		color: #6b7280;
		background: #f3f4f6;
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}
	
	.plan-price {
		margin-bottom: 1rem;
	}
	
	.price-currency {
		font-size: 1rem;
		color: #6b7280;
		vertical-align: top;
	}
	
	.price-amount {
		font-size: 2rem;
		font-weight: 700;
		color: #111827;
		line-height: 1;
	}
	
	.price-period {
		font-size: 0.875rem;
		color: #9ca3af;
		font-weight: 500;
	}
	
	.plan-storage {
		display: flex;
		flex-direction: column;
		padding: 0.75rem;
		background: #fafbfc;
		border: 1px solid #f3f4f6;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}
	
	.storage-amount {
		font-size: 1.125rem;
		font-weight: 700;
		color: #111827;
	}
	
	.storage-label {
		font-size: 0.75rem;
		color: #9ca3af;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		margin-top: 0.125rem;
	}
	
	.plan-features {
		space-y: 0.5rem;
	}
	
	.feature-item {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		font-size: 0.8125rem;
		color: #6b7280;
		line-height: 1.4;
	}
	
	:global(.feature-check) {
		color: #10b981;
		flex-shrink: 0;
		margin-top: 0.125rem;
	}
	
	
	.modal-footer {
		margin-top: 0.5rem;
	}
	
	.footer-summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: #fafbfc;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		margin-bottom: 0.75rem;
	}
	
	.price-summary {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
	}
	
	.price-label {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}
	
	.price-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: #111827;
	}
	
	.price-period {
		font-size: 0.875rem;
		color: #9ca3af;
		font-weight: 400;
	}
	
	:global(.upgrade-btn) {
		padding: 0.625rem 1.5rem;
		font-weight: 600;
	}
	
	.footer-note {
		text-align: center;
		font-size: 0.75rem;
		color: #9ca3af;
	}
	
	/* Responsive */
	@media (max-width: 900px) {
		.plans-grid {
			grid-template-columns: 1fr;
			max-width: 380px;
			margin: 0 auto;
		}
		
		.plan-card {
			display: grid;
			grid-template-columns: 1fr auto;
			gap: 1rem;
		}
		
		.plan-header {
			grid-column: 1 / -1;
		}
		
		.plan-storage {
			grid-column: 1 / -1;
		}
		
		.plan-features {
			grid-column: 1 / -1;
		}
	}
	
	@media (max-width: 640px) {
		.modal-header {
			padding: 1.5rem 1.5rem 1rem;
		}
		
		.plans-grid {
			padding: 1rem;
		}
		
		.modal-footer {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}
		
		.footer-actions {
			justify-content: stretch;
		}
		
		.footer-actions > :global(*) {
			flex: 1;
		}
	}
</style>