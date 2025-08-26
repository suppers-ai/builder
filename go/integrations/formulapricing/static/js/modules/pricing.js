import { api } from './api.js';
import { modal } from './modal.js';

class PricingManager {
    constructor() {
        this.currentPricing = null;
        this.variables = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPricing();
        this.loadVariables();
    }

    setupEventListeners() {
        // Add button
        const addBtn = document.getElementById('addPricingBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }

        // Form submission
        const form = document.getElementById('pricingForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Add variable button
        const addVarBtn = document.getElementById('addVariableBtn');
        if (addVarBtn) {
            addVarBtn.addEventListener('click', () => this.addVariableRow());
        }

        // Edit and delete buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-pricing')) {
                const id = e.target.dataset.id;
                this.showEditModal(id);
            } else if (e.target.classList.contains('delete-pricing')) {
                const id = e.target.dataset.id;
                this.deletePricing(id);
            } else if (e.target.classList.contains('remove-variable')) {
                e.target.closest('.variable-row').remove();
            }
        });
    }

    async loadPricing() {
        try {
            const pricings = await api.pricing.getAll();
            this.renderTable(pricings);
        } catch (error) {
            console.error('Failed to load pricing:', error);
        }
    }

    async loadVariables() {
        try {
            this.variables = await api.variables.getAll();
        } catch (error) {
            console.error('Failed to load variables:', error);
        }
    }

    renderTable(pricings) {
        const tbody = document.querySelector('#pricingTable tbody');
        if (!tbody) return;

        tbody.innerHTML = pricings.map(pricing => `
            <tr>
                <td>${pricing.name}</td>
                <td>${pricing.description || ''}</td>
                <td>${pricing.calculation_id || 'None'}</td>
                <td>${pricing.variables ? Object.keys(pricing.variables).length : 0}</td>
                <td>${new Date(pricing.updated_at).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm edit-pricing" data-id="${pricing.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-pricing" data-id="${pricing.id}">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    showAddModal() {
        this.currentPricing = null;
        document.getElementById('pricingForm').reset();
        document.getElementById('variablesContainer').innerHTML = '';
        document.getElementById('modalTitle').textContent = 'Add Pricing';
        modal.open('pricingModal');
    }

    async showEditModal(id) {
        try {
            const pricing = await api.pricing.getById(id);
            this.currentPricing = pricing;
            
            document.getElementById('pricingName').value = pricing.name;
            document.getElementById('pricingDescription').value = pricing.description || '';
            document.getElementById('pricingCalculation').value = pricing.calculation_id || '';
            
            // Load variables
            const container = document.getElementById('variablesContainer');
            container.innerHTML = '';
            
            if (pricing.variables) {
                Object.entries(pricing.variables).forEach(([varId, value]) => {
                    this.addVariableRow(varId, value);
                });
            }
            
            document.getElementById('modalTitle').textContent = 'Edit Pricing';
            modal.open('pricingModal');
        } catch (error) {
            console.error('Failed to load pricing:', error);
        }
    }

    addVariableRow(selectedId = '', value = '') {
        const container = document.getElementById('variablesContainer');
        const row = document.createElement('div');
        row.className = 'variable-row';
        
        row.innerHTML = `
            <select class="variable-select">
                <option value="">Select Variable</option>
                ${this.variables.map(v => `
                    <option value="${v.id}" ${v.id === selectedId ? 'selected' : ''}>
                        ${v.name}
                    </option>
                `).join('')}
            </select>
            <input type="number" class="variable-value" value="${value}" placeholder="Value" step="any">
            <button type="button" class="btn btn-sm btn-danger remove-variable">Remove</button>
        `;
        
        container.appendChild(row);
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        // Collect variables
        const variables = {};
        document.querySelectorAll('.variable-row').forEach(row => {
            const select = row.querySelector('.variable-select');
            const input = row.querySelector('.variable-value');
            if (select.value && input.value) {
                variables[select.value] = parseFloat(input.value);
            }
        });
        
        const formData = {
            name: document.getElementById('pricingName').value,
            description: document.getElementById('pricingDescription').value,
            calculation_id: document.getElementById('pricingCalculation').value || null,
            variables: variables
        };

        try {
            if (this.currentPricing) {
                await api.pricing.update(this.currentPricing.id, formData);
            } else {
                await api.pricing.create(formData);
            }
            
            modal.close('pricingModal');
            this.loadPricing();
        } catch (error) {
            console.error('Failed to save pricing:', error);
            alert('Failed to save pricing: ' + error.message);
        }
    }

    async deletePricing(id) {
        if (!confirm('Are you sure you want to delete this pricing?')) {
            return;
        }

        try {
            await api.pricing.delete(id);
            this.loadPricing();
        } catch (error) {
            console.error('Failed to delete pricing:', error);
            alert('Failed to delete pricing: ' + error.message);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new PricingManager());
} else {
    new PricingManager();
}

export default PricingManager;