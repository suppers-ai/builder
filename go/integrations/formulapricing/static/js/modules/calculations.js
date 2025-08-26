import { api } from './api.js';
import { modal } from './modal.js';

class CalculationsManager {
    constructor() {
        this.currentCalculation = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCalculations();
    }

    setupEventListeners() {
        // Add button
        const addBtn = document.getElementById('addCalculationBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }

        // Form submission
        const form = document.getElementById('calculationForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Edit and delete buttons are added dynamically
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-calculation')) {
                const id = e.target.dataset.id;
                this.showEditModal(id);
            } else if (e.target.classList.contains('delete-calculation')) {
                const id = e.target.dataset.id;
                this.deleteCalculation(id);
            }
        });
    }

    async loadCalculations() {
        try {
            const calculations = await api.calculations.getAll();
            this.renderTable(calculations);
        } catch (error) {
            console.error('Failed to load calculations:', error);
        }
    }

    renderTable(calculations) {
        const tbody = document.querySelector('#calculationsTable tbody');
        if (!tbody) return;

        tbody.innerHTML = calculations.map(calc => `
            <tr>
                <td>${calc.name}</td>
                <td>${calc.description || ''}</td>
                <td><pre class="formula-display">${calc.formula}</pre></td>
                <td>${new Date(calc.updated_at).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm edit-calculation" data-id="${calc.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-calculation" data-id="${calc.id}">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    showAddModal() {
        this.currentCalculation = null;
        document.getElementById('calculationForm').reset();
        document.getElementById('modalTitle').textContent = 'Add Calculation';
        modal.open('calculationModal');
    }

    async showEditModal(id) {
        try {
            const calculation = await api.calculations.getById(id);
            this.currentCalculation = calculation;
            
            document.getElementById('calculationName').value = calculation.name;
            document.getElementById('calculationDescription').value = calculation.description || '';
            document.getElementById('calculationFormula').value = calculation.formula;
            document.getElementById('modalTitle').textContent = 'Edit Calculation';
            
            modal.open('calculationModal');
        } catch (error) {
            console.error('Failed to load calculation:', error);
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('calculationName').value,
            description: document.getElementById('calculationDescription').value,
            formula: document.getElementById('calculationFormula').value
        };

        try {
            if (this.currentCalculation) {
                await api.calculations.update(this.currentCalculation.id, formData);
            } else {
                await api.calculations.create(formData);
            }
            
            modal.close('calculationModal');
            this.loadCalculations();
        } catch (error) {
            console.error('Failed to save calculation:', error);
            alert('Failed to save calculation: ' + error.message);
        }
    }

    async deleteCalculation(id) {
        if (!confirm('Are you sure you want to delete this calculation?')) {
            return;
        }

        try {
            await api.calculations.delete(id);
            this.loadCalculations();
        } catch (error) {
            console.error('Failed to delete calculation:', error);
            alert('Failed to delete calculation: ' + error.message);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CalculationsManager());
} else {
    new CalculationsManager();
}

export default CalculationsManager;