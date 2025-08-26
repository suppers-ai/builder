import { api } from './api.js';
import { modal } from './modal.js';

class ConditionsManager {
    constructor() {
        this.currentCondition = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadConditions();
    }

    setupEventListeners() {
        // Add button
        const addBtn = document.getElementById('addConditionBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }

        // Form submission
        const form = document.getElementById('conditionForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Edit and delete buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-condition')) {
                const id = e.target.dataset.id;
                this.showEditModal(id);
            } else if (e.target.classList.contains('delete-condition')) {
                const id = e.target.dataset.id;
                this.deleteCondition(id);
            }
        });
    }

    async loadConditions() {
        try {
            const conditions = await api.conditions.getAll();
            this.renderTable(conditions);
        } catch (error) {
            console.error('Failed to load conditions:', error);
        }
    }

    renderTable(conditions) {
        const tbody = document.querySelector('#conditionsTable tbody');
        if (!tbody) return;

        tbody.innerHTML = conditions.map(cond => `
            <tr>
                <td>${cond.name}</td>
                <td>${cond.description || ''}</td>
                <td><pre class="formula-display">${cond.condition}</pre></td>
                <td>${cond.multiplier}</td>
                <td>${new Date(cond.updated_at).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm edit-condition" data-id="${cond.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-condition" data-id="${cond.id}">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    showAddModal() {
        this.currentCondition = null;
        document.getElementById('conditionForm').reset();
        document.getElementById('modalTitle').textContent = 'Add Condition';
        modal.open('conditionModal');
    }

    async showEditModal(id) {
        try {
            const condition = await api.conditions.getById(id);
            this.currentCondition = condition;
            
            document.getElementById('conditionName').value = condition.name;
            document.getElementById('conditionDescription').value = condition.description || '';
            document.getElementById('conditionFormula').value = condition.condition;
            document.getElementById('conditionMultiplier').value = condition.multiplier;
            document.getElementById('modalTitle').textContent = 'Edit Condition';
            
            modal.open('conditionModal');
        } catch (error) {
            console.error('Failed to load condition:', error);
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('conditionName').value,
            description: document.getElementById('conditionDescription').value,
            condition: document.getElementById('conditionFormula').value,
            multiplier: parseFloat(document.getElementById('conditionMultiplier').value)
        };

        try {
            if (this.currentCondition) {
                await api.conditions.update(this.currentCondition.id, formData);
            } else {
                await api.conditions.create(formData);
            }
            
            modal.close('conditionModal');
            this.loadConditions();
        } catch (error) {
            console.error('Failed to save condition:', error);
            alert('Failed to save condition: ' + error.message);
        }
    }

    async deleteCondition(id) {
        if (!confirm('Are you sure you want to delete this condition?')) {
            return;
        }

        try {
            await api.conditions.delete(id);
            this.loadConditions();
        } catch (error) {
            console.error('Failed to delete condition:', error);
            alert('Failed to delete condition: ' + error.message);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ConditionsManager());
} else {
    new ConditionsManager();
}

export default ConditionsManager;