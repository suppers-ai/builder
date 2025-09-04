<script lang="ts">
	import { X, User, Bell, Shield, Palette, CreditCard, Activity, Clock, FileText, Check, Upload, FolderPlus, Share2, Trash2, Download, Edit3, Eye, Copy } from 'lucide-svelte';
	import Modal from '../common/Modal.svelte';
	import Button from '../common/Button.svelte';
	import { createEventDispatcher } from 'svelte';
	
	export let open: boolean = false;
	export let user: any = null;
	
	const dispatch = createEventDispatcher();
	
	let activeTab = 'profile';
	
	const tabs = [
		{ id: 'profile', label: 'Profile', icon: User },
		{ id: 'notifications', label: 'Notifications', icon: Bell },
		{ id: 'security', label: 'Security', icon: Shield },
		{ id: 'appearance', label: 'Appearance', icon: Palette },
		{ id: 'billing', label: 'Billing', icon: CreditCard },
		{ id: 'activity', label: 'Activity', icon: Activity }
	];
	
	function handleClose() {
		open = false;
	}
	
	function openUpgradeModal() {
		dispatch('openUpgrade');
		handleClose();
	}
	
	// Professional activity data with Lucide icons
	const recentActivity = [
		{ action: 'Uploaded', file: 'report.pdf', time: '2 hours ago', icon: Upload, color: 'text-blue-600', bg: 'bg-blue-50' },
		{ action: 'Created folder', file: 'Q4 Reports', time: '5 hours ago', icon: FolderPlus, color: 'text-green-600', bg: 'bg-green-50' },
		{ action: 'Shared', file: 'presentation.pptx', time: '1 day ago', icon: Share2, color: 'text-purple-600', bg: 'bg-purple-50' },
		{ action: 'Deleted', file: 'old-data.csv', time: '2 days ago', icon: Trash2, color: 'text-red-600', bg: 'bg-red-50' },
		{ action: 'Downloaded', file: 'invoice.pdf', time: '3 days ago', icon: Download, color: 'text-indigo-600', bg: 'bg-indigo-50' },
		{ action: 'Modified', file: 'budget.xlsx', time: '4 days ago', icon: Edit3, color: 'text-amber-600', bg: 'bg-amber-50' },
		{ action: 'Viewed', file: 'contract.docx', time: '5 days ago', icon: Eye, color: 'text-gray-600', bg: 'bg-gray-50' },
		{ action: 'Duplicated', file: 'template.psd', time: '1 week ago', icon: Copy, color: 'text-teal-600', bg: 'bg-teal-50' }
	];
</script>

<Modal bind:open on:close={handleClose} size="lg" title="Settings">
	<div class="settings-modal">
		<div class="settings-content">
			<!-- Tabs -->
			<div class="settings-tabs">
				{#each tabs as tab}
					<button 
						class="tab-button {activeTab === tab.id ? 'active' : ''}"
						on:click={() => activeTab = tab.id}
					>
						<svelte:component this={tab.icon} size={18} />
						<span>{tab.label}</span>
					</button>
				{/each}
			</div>
			
			<!-- Tab Content -->
			<div class="tab-content">
				{#if activeTab === 'profile'}
					<div class="settings-section">
						<h3>Profile Information</h3>
						<div class="form-group">
							<label>Email</label>
							<input type="email" value={user?.email || ''} disabled class="form-input" />
						</div>
						<div class="form-group">
							<label>Display Name</label>
							<input type="text" placeholder="Enter your name" class="form-input" />
						</div>
						<div class="form-group">
							<label>Bio</label>
							<textarea placeholder="Tell us about yourself" class="form-input" rows="3"></textarea>
						</div>
						<Button variant="primary" class="save-button">
							<Check size={16} />
							Save Changes
						</Button>
					</div>
				{:else if activeTab === 'notifications'}
					<div class="settings-section">
						<h3>Notification Preferences</h3>
						<div class="setting-item">
							<div class="setting-info">
								<label>Email Notifications</label>
								<p class="setting-description">Receive email updates about your account</p>
							</div>
							<input type="checkbox" class="toggle" checked />
						</div>
						<div class="setting-item">
							<div class="setting-info">
								<label>Share Notifications</label>
								<p class="setting-description">Get notified when someone shares files with you</p>
							</div>
							<input type="checkbox" class="toggle" checked />
						</div>
						<div class="setting-item">
							<div class="setting-info">
								<label>Storage Alerts</label>
								<p class="setting-description">Alert when storage is nearly full</p>
							</div>
							<input type="checkbox" class="toggle" />
						</div>
					</div>
				{:else if activeTab === 'security'}
					<div class="settings-section">
						<h3>Security Settings</h3>
						<div class="form-group">
							<label>Change Password</label>
							<input type="password" placeholder="Current password" class="form-input" />
						</div>
						<div class="form-group">
							<input type="password" placeholder="New password" class="form-input" />
						</div>
						<div class="form-group">
							<input type="password" placeholder="Confirm new password" class="form-input" />
						</div>
						<Button variant="primary" class="save-button">Update Password</Button>
						
						<div class="security-section">
							<h4>Two-Factor Authentication</h4>
							<p class="setting-description">Add an extra layer of security to your account</p>
							<Button variant="secondary" size="sm">Enable 2FA</Button>
						</div>
					</div>
				{:else if activeTab === 'appearance'}
					<div class="settings-section">
						<h3>Appearance Settings</h3>
						<div class="setting-item">
							<div class="setting-info">
								<label>Dark Mode</label>
								<p class="setting-description">Use dark theme across the application</p>
							</div>
							<input type="checkbox" class="toggle" />
						</div>
						<div class="setting-item">
							<div class="setting-info">
								<label>Compact View</label>
								<p class="setting-description">Show more items in file listings</p>
							</div>
							<input type="checkbox" class="toggle" />
						</div>
						<div class="form-group">
							<label>Theme Color</label>
							<div class="color-options">
								<button class="color-option" style="background: #3b82f6"></button>
								<button class="color-option" style="background: #8b5cf6"></button>
								<button class="color-option" style="background: #10b981"></button>
								<button class="color-option" style="background: #f59e0b"></button>
								<button class="color-option" style="background: #ef4444"></button>
							</div>
						</div>
					</div>
				{:else if activeTab === 'billing'}
					<div class="settings-section">
						<h3>Billing & Plan</h3>
						<div class="plan-card">
							<div class="plan-header">
								<h4>Current Plan: Free</h4>
								<span class="storage-usage">2.3 GB / 5 GB used</span>
							</div>
							<div class="plan-features">
								<div class="feature">✓ 5 GB Storage</div>
								<div class="feature">✓ Basic sharing</div>
								<div class="feature">✓ Mobile access</div>
							</div>
							<Button variant="primary" on:click={openUpgradeModal}>
								Upgrade Plan
							</Button>
						</div>
						
						<div class="billing-section">
							<h4>Payment Method</h4>
							<p class="setting-description">No payment method on file</p>
							<Button variant="secondary" size="sm">Add Payment Method</Button>
						</div>
					</div>
				{:else if activeTab === 'activity'}
					<div class="settings-section">
						<div class="activity-header">
							<h3>Recent Activity</h3>
							<button class="activity-filter">
								<Clock size={16} />
								<span>Last 7 days</span>
							</button>
						</div>
						<div class="activity-list">
							{#each recentActivity as activity}
								<div class="activity-item">
									<div class="activity-icon-wrapper {activity.bg}">
										<svelte:component this={activity.icon} size={16} class={activity.color} />
									</div>
									<div class="activity-info">
										<div class="activity-main">
											<span class="activity-action">{activity.action}</span>
											<span class="activity-file">{activity.file}</span>
										</div>
										<div class="activity-time">{activity.time}</div>
									</div>
								</div>
							{/each}
						</div>
						<div class="activity-footer">
							<Button variant="ghost" size="sm" class="view-all-btn">
								<FileText size={16} />
								View Full History
							</Button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</Modal>

<style>
	.settings-modal {
		padding: 0;
		height: 600px;
		display: flex;
		flex-direction: column;
		position: relative;
	}
	
	.settings-content {
		display: flex;
		height: 100%;
		overflow: hidden;
		background: white;
		border-radius: 0.5rem;
	}
	
	.settings-tabs {
		width: 200px;
		min-width: 200px;
		background: #fafbfc;
		border-right: 1px solid #e5e7eb;
		padding: 0.75rem;
		overflow-y: auto;
		border-top-left-radius: 0.5rem;
		border-bottom-left-radius: 0.5rem;
	}
	
	.tab-button {
		width: 100%;
		padding: 0.625rem 0.875rem;
		background: transparent;
		border: none;
		border-radius: 0.375rem;
		display: flex;
		align-items: center;
		gap: 0.625rem;
		color: #6b7280;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
		margin-bottom: 0.125rem;
		text-align: left;
	}
	
	.tab-button:hover {
		background: rgba(255, 255, 255, 0.7);
		color: #374151;
	}
	
	.tab-button.active {
		background: #3b82f6;
		color: white;
		font-weight: 600;
		box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
	}
	
	.tab-button.active :global(svg) {
		color: white;
	}
	
	.tab-content {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
		background: white;
	}
	
	.settings-section {
		max-width: 500px;
	}
	
	.settings-section h3 {
		font-size: 1.125rem;
		font-weight: 700;
		margin-bottom: 1.25rem;
		color: #111827;
		letter-spacing: -0.025em;
	}
	
	.settings-section h4 {
		font-size: 1rem;
		font-weight: 600;
		margin: 1.5rem 0 0.75rem;
		color: #374151;
	}
	
	.form-group {
		margin-bottom: 1.5rem;
	}
	
	.form-group label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
	}
	
	.form-input {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		transition: all 0.15s;
		background: white;
	}
	
	.form-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.05), 0 1px 2px rgba(0, 0, 0, 0.05);
	}
	
	.form-input:disabled {
		background: #f9fafb;
		color: #9ca3af;
		cursor: not-allowed;
	}
	
	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.875rem 0;
		border-bottom: 1px solid #f3f4f6;
	}
	
	.setting-info label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}
	
	.setting-description {
		font-size: 0.75rem;
		color: #6b7280;
		margin-top: 0.25rem;
	}
	
	.toggle {
		width: 42px;
		height: 24px;
		-webkit-appearance: none;
		appearance: none;
		background: #e5e7eb;
		border-radius: 24px;
		position: relative;
		cursor: pointer;
		transition: background 0.2s;
	}
	
	.toggle:checked {
		background: #3b82f6;
	}
	
	.toggle::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 3px;
		width: 18px;
		height: 18px;
		background: white;
		border-radius: 50%;
		transition: transform 0.2s;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}
	
	.toggle:checked::after {
		transform: translateX(18px);
	}
	
	.color-options {
		display: flex;
		gap: 0.75rem;
	}
	
	.color-option {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 3px solid transparent;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		position: relative;
	}
	
	.color-option:hover {
		transform: scale(1.1);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}
	
	.color-option:hover::after {
		content: '';
		position: absolute;
		inset: -3px;
		border: 2px solid currentColor;
		border-radius: 50%;
		opacity: 0.5;
	}
	
	.plan-card {
		background: linear-gradient(to bottom, #fafbfc, #f9fafb);
		border: 1px solid #e5e7eb;
		padding: 1.5rem;
		border-radius: 0.625rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}
	
	.plan-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}
	
	.plan-header h4 {
		margin: 0;
		font-size: 1.125rem;
	}
	
	.storage-usage {
		font-size: 0.875rem;
		color: #6b7280;
	}
	
	.plan-features {
		margin-bottom: 1.5rem;
	}
	
	.feature {
		font-size: 0.875rem;
		color: #4b5563;
		margin-bottom: 0.5rem;
	}
	
	.billing-section {
		margin-top: 2rem;
	}
	
	.security-section {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}
	
	.activity-list {
		margin-bottom: 1.5rem;
	}
	
	.activity-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}
	
	.activity-filter {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.875rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.15s;
	}
	
	.activity-filter:hover {
		background: #f9fafb;
		border-color: #d1d5db;
	}
	
	.activity-item {
		display: flex;
		gap: 0.75rem;
		padding: 0.75rem 0;
		border-bottom: 1px solid #f3f4f6;
		transition: all 0.15s;
	}
	
	.activity-item:last-child {
		border-bottom: none;
	}
	
	.activity-item:hover {
		background: #fafbfc;
		margin: 0 -0.75rem;
		padding: 0.75rem;
		border-radius: 0.375rem;
	}
	
	.activity-icon-wrapper {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		flex-shrink: 0;
	}
	
	.activity-info {
		flex: 1;
		min-width: 0;
	}
	
	.activity-main {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-bottom: 0.25rem;
	}
	
	.activity-action {
		font-size: 0.875rem;
		font-weight: 500;
		color: #111827;
	}
	
	.activity-file {
		font-size: 0.875rem;
		color: #6b7280;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.activity-time {
		font-size: 0.75rem;
		color: #9ca3af;
	}
	
	.activity-footer {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #f3f4f6;
	}
	
	:global(.view-all-btn) {
		width: 100%;
		justify-content: center;
	}
	
	/* Button styling improvements */
	:global(.save-button) {
		background: linear-gradient(135deg, #3b82f6, #2563eb);
		color: white;
		font-weight: 600;
		padding: 0.625rem 1.25rem;
		border-radius: 0.5rem;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
		transition: all 0.2s;
	}
	
	:global(.save-button:hover) {
		background: linear-gradient(135deg, #2563eb, #1d4ed8);
		box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
		transform: translateY(-1px);
	}
	
	.tab-content::-webkit-scrollbar {
		width: 6px;
	}
	
	.tab-content::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.tab-content::-webkit-scrollbar-thumb {
		background: #d1d5db;
		border-radius: 3px;
	}
	
	.tab-content::-webkit-scrollbar-thumb:hover {
		background: #9ca3af;
	}
	
	/* Responsive */
	@media (max-width: 768px) {
		.settings-content {
			flex-direction: column;
		}
		
		.settings-tabs {
			width: 100%;
			display: flex;
			overflow-x: auto;
			padding: 0.5rem;
			border-right: none;
			border-bottom: 1px solid #e5e7eb;
		}
		
		.tab-button {
			white-space: nowrap;
			margin-bottom: 0;
			margin-right: 0.25rem;
		}
	}
</style>