<script lang="ts">
	import { Check, X, Zap, Rocket, Building2 } from 'lucide-svelte';
	import Button from '$lib/components/common/Button.svelte';
	import Card from '$lib/components/common/Card.svelte';
	import { toasts } from '$lib/stores/notifications';
	
	let selectedPlan = 'pro';
	let billingCycle: 'monthly' | 'yearly' = 'monthly';
	
	const plans = [
		{
			id: 'free',
			name: 'Free',
			icon: Zap,
			price: { monthly: 0, yearly: 0 },
			storage: '5 GB',
			bandwidth: '10 GB/month',
			features: [
				'5 GB Storage',
				'10 GB Monthly Bandwidth',
				'Basic File Sharing',
				'Email Support',
				'2 Shared Folders'
			],
			notIncluded: [
				'Priority Support',
				'Advanced Analytics',
				'Custom Branding',
				'API Access',
				'Team Collaboration'
			]
		},
		{
			id: 'pro',
			name: 'Pro',
			icon: Rocket,
			price: { monthly: 9.99, yearly: 99.99 },
			storage: '100 GB',
			bandwidth: '500 GB/month',
			popular: true,
			features: [
				'100 GB Storage',
				'500 GB Monthly Bandwidth',
				'Advanced File Sharing',
				'Priority Email Support',
				'Unlimited Shared Folders',
				'Password Protected Links',
				'Link Expiration Control',
				'Advanced Analytics'
			],
			notIncluded: [
				'Custom Branding',
				'API Access',
				'Team Collaboration'
			]
		},
		{
			id: 'business',
			name: 'Business',
			icon: Building2,
			price: { monthly: 24.99, yearly: 249.99 },
			storage: '1 TB',
			bandwidth: 'Unlimited',
			features: [
				'1 TB Storage',
				'Unlimited Bandwidth',
				'Everything in Pro',
				'24/7 Phone Support',
				'Custom Branding',
				'API Access',
				'Team Collaboration',
				'Advanced Security',
				'Audit Logs',
				'SSO Integration'
			],
			notIncluded: []
		}
	];
	
	async function handleUpgrade(planId: string) {
		if (planId === 'free') {
			toasts.info('You are already on the Free plan');
			return;
		}
		
		selectedPlan = planId;
		const plan = plans.find(p => p.id === planId);
		const price = billingCycle === 'yearly' ? plan?.price.yearly : plan?.price.monthly;
		
		toasts.info(`Redirecting to checkout for ${plan?.name} plan ($${price}/${billingCycle === 'yearly' ? 'year' : 'month'})...`);
		
		// Here you would integrate with Solobase products extension
		// to create a checkout session
	}
	
	$: yearlyDiscount = Math.round((1 - (99.99 / (9.99 * 12))) * 100);
</script>

<div class="max-w-7xl mx-auto">
	<!-- Header -->
	<div class="text-center mb-8">
		<h1 class="text-3xl font-bold mb-2">Choose Your Plan</h1>
		<p class="text-gray-600 dark:text-gray-400">Upgrade to unlock more storage and features</p>
		
		<!-- Billing Toggle -->
		<div class="flex items-center justify-center gap-4 mt-6">
			<span class="text-sm {billingCycle === 'monthly' ? 'font-bold' : ''}">Monthly</span>
			<button
				on:click={() => billingCycle = billingCycle === 'monthly' ? 'yearly' : 'monthly'}
				class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors
					{billingCycle === 'yearly' ? 'bg-primary-600' : ''}"
			>
				<span
					class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform
						{billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'}"
				/>
			</button>
			<span class="text-sm {billingCycle === 'yearly' ? 'font-bold' : ''}">
				Yearly
				<span class="text-green-600 dark:text-green-400 text-xs ml-1">Save {yearlyDiscount}%</span>
			</span>
		</div>
	</div>
	
	<!-- Plans Grid -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		{#each plans as plan}
			<div class="relative">
				{#if plan.popular}
					<div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
						<span class="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
							MOST POPULAR
						</span>
					</div>
				{/if}
				
				<Card 
					glass={!plan.popular}
					class="{plan.popular ? 'ring-2 ring-primary-500' : ''} h-full"
				>
					<div class="text-center">
						<!-- Icon & Name -->
						<div class="flex justify-center mb-4">
							<div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
								<svelte:component this={plan.icon} class="w-8 h-8 text-primary-600" />
							</div>
						</div>
						
						<h2 class="text-2xl font-bold mb-2">{plan.name}</h2>
						
						<!-- Price -->
						<div class="mb-4">
							{#if plan.price[billingCycle] === 0}
								<span class="text-4xl font-bold">Free</span>
							{:else}
								<span class="text-4xl font-bold">
									${plan.price[billingCycle]}
								</span>
								<span class="text-gray-500">
									/{billingCycle === 'yearly' ? 'year' : 'month'}
								</span>
							{/if}
						</div>
						
						<!-- Storage & Bandwidth -->
						<div class="flex justify-center gap-4 mb-6 text-sm">
							<span class="text-gray-600 dark:text-gray-400">
								<strong>{plan.storage}</strong> Storage
							</span>
							<span class="text-gray-600 dark:text-gray-400">
								<strong>{plan.bandwidth}</strong> Bandwidth
							</span>
						</div>
						
						<!-- CTA Button -->
						<Button
							on:click={() => handleUpgrade(plan.id)}
							variant={plan.popular ? 'primary' : 'secondary'}
							class="w-full mb-6"
						>
							{plan.id === 'free' ? 'Current Plan' : 'Upgrade Now'}
						</Button>
						
						<!-- Features -->
						<div class="text-left space-y-3">
							{#each plan.features as feature}
								<div class="flex items-start gap-2">
									<Check class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
									<span class="text-sm">{feature}</span>
								</div>
							{/each}
							
							{#each plan.notIncluded as feature}
								<div class="flex items-start gap-2 opacity-50">
									<X class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
									<span class="text-sm line-through">{feature}</span>
								</div>
							{/each}
						</div>
					</div>
				</Card>
			</div>
		{/each}
	</div>
	
	<!-- FAQ Section -->
	<div class="mt-12">
		<h2 class="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
		
		<div class="max-w-3xl mx-auto space-y-4">
			<Card>
				<details class="group">
					<summary class="cursor-pointer list-none flex justify-between items-center font-medium">
						Can I change my plan anytime?
						<span class="transition-transform group-open:rotate-180">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</span>
					</summary>
					<p class="text-gray-600 dark:text-gray-400 mt-3">
						Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
						and we'll prorate any charges or credits.
					</p>
				</details>
			</Card>
			
			<Card>
				<details class="group">
					<summary class="cursor-pointer list-none flex justify-between items-center font-medium">
						What payment methods do you accept?
						<span class="transition-transform group-open:rotate-180">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</span>
					</summary>
					<p class="text-gray-600 dark:text-gray-400 mt-3">
						We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. 
						All payments are processed securely through Stripe.
					</p>
				</details>
			</Card>
			
			<Card>
				<details class="group">
					<summary class="cursor-pointer list-none flex justify-between items-center font-medium">
						Is there a free trial?
						<span class="transition-transform group-open:rotate-180">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</span>
					</summary>
					<p class="text-gray-600 dark:text-gray-400 mt-3">
						New users get 14 days free trial of the Pro plan. No credit card required. 
						After the trial, you can choose to continue with Pro or switch to the Free plan.
					</p>
				</details>
			</Card>
		</div>
	</div>
</div>