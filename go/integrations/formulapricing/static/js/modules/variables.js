// Variables Module
import { API } from './api.js';
import { Modal, confirm, alert } from './modal.js';

class VariablesManager {
    constructor() {
        this.modal = new Modal('variableModal');
        this.form = document.getElementById('variableForm');
        this.currentEditId = null;
        
        this.init();
    }
    
    init() {
        // Setup form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        // Setup type change handler
        const typeSelect = document.getElementById('valueType');
        if (typeSelect) {
            typeSelect.addEventListener('change', () => this.updateConstraintsUI());
        }
        
        // Expose functions to window for onclick handlers
        window.showAddVariableModal = () => this.showAddModal();
        window.editVariable = (id) => this.showEditModal(id);
        window.deleteVariable = (id, name) => this.deleteVariable(id, name);
        window.closeModal = () => this.modal.close();
    }
    
    showAddModal() {
        this.currentEditId = null;
        this.modal.setTitle('Add Variable');
        this.form.reset();
        this.modal.open();
    }
    
    async showEditModal(id) {
        try {
            this.currentEditId = id;
            this.modal.setTitle('Edit Variable');
            
            const variable = await API.variables.get(id);
            this.populateForm(variable);
            this.modal.open();
        } catch (error) {
            alert(`Error loading variable: ${error.message}`, 'error');
        }
    }
    
    populateForm(variable) {
        document.getElementById('variableId').value = variable.id || '';
        document.getElementById('variableName').value = variable.variable_name || '';
        document.getElementById('displayName').value = variable.display_name || '';
        document.getElementById('valueType').value = variable.value_type || 'string';
        document.getElementById('defaultValue').value = variable.default_value || '';
        document.getElementById('description').value = variable.description || '';
        document.getElementById('isUnique').checked = variable.is_unique || false;
        
        this.updateConstraintsUI(variable.constraints);
    }
    
    updateConstraintsUI(constraints = {}) {
        const valueType = document.getElementById('valueType').value;
        const constraintsContainer = document.getElementById('constraintsContainer');
        
        if (!constraintsContainer) {
            // Create constraints container if it doesn't exist
            const container = document.createElement('div');
            container.id = 'constraintsContainer';
            container.className = 'form-group';
            this.form.insertBefore(container, this.form.querySelector('.form-actions'));
        }
        
        // Clear existing constraints UI
        constraintsContainer.innerHTML = '';
        
        // Add type-specific constraint fields
        switch (valueType) {
            case 'number':
                constraintsContainer.innerHTML = `
                    <h4>Number Constraints</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="minValue">Minimum Value</label>
                            <input type="number" id="minValue" step="any" 
                                   value="${constraints.min || ''}">
                        </div>
                        <div class="form-group">
                            <label for="maxValue">Maximum Value</label>
                            <input type="number" id="maxValue" step="any"
                                   value="${constraints.max || ''}">
                        </div>
                    </div>
                `;
                break;
                
            case 'string':
                constraintsContainer.innerHTML = `
                    <h4>String Constraints</h4>
                    <div class="form-group">
                        <label for="pattern">Pattern (regex)</label>
                        <input type="text" id="pattern" 
                               value="${constraints.pattern || ''}"
                               placeholder="e.g., ^[A-Z]{3}$">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="minLength">Min Length</label>
                            <input type="number" id="minLength" min="0"
                                   value="${constraints.minLength || ''}">
                        </div>
                        <div class="form-group">
                            <label for="maxLength">Max Length</label>
                            <input type="number" id="maxLength" min="0"
                                   value="${constraints.maxLength || ''}">
                        </div>
                    </div>
                `;
                break;
                
            case 'boolean':
                // No specific constraints for boolean
                break;
                
            case 'date':
                constraintsContainer.innerHTML = `
                    <h4>Date Constraints</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="minDate">Earliest Date</label>
                            <input type="date" id="minDate"
                                   value="${constraints.minDate || ''}">
                        </div>
                        <div class="form-group">
                            <label for="maxDate">Latest Date</label>
                            <input type="date" id="maxDate"
                                   value="${constraints.maxDate || ''}">
                        </div>
                    </div>
                `;
                break;
        }
    }
    
    getConstraints() {
        const valueType = document.getElementById('valueType').value;
        const constraints = {};
        
        switch (valueType) {
            case 'number':
                const min = document.getElementById('minValue')?.value;
                const max = document.getElementById('maxValue')?.value;
                if (min) constraints.min = parseFloat(min);
                if (max) constraints.max = parseFloat(max);
                break;
                
            case 'string':
                const pattern = document.getElementById('pattern')?.value;
                const minLength = document.getElementById('minLength')?.value;
                const maxLength = document.getElementById('maxLength')?.value;
                if (pattern) constraints.pattern = pattern;
                if (minLength) constraints.minLength = parseInt(minLength);
                if (maxLength) constraints.maxLength = parseInt(maxLength);
                break;
                
            case 'date':
                const minDate = document.getElementById('minDate')?.value;
                const maxDate = document.getElementById('maxDate')?.value;
                if (minDate) constraints.minDate = minDate;
                if (maxDate) constraints.maxDate = maxDate;
                break;
        }
        
        return Object.keys(constraints).length > 0 ? constraints : null;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const data = {
            variable_name: document.getElementById('variableName').value,
            display_name: document.getElementById('displayName').value,
            value_type: document.getElementById('valueType').value,
            default_value: document.getElementById('defaultValue').value || null,
            description: document.getElementById('description').value || null,
            is_unique: document.getElementById('isUnique').checked,
            constraints: this.getConstraints()
        };
        
        try {
            if (this.currentEditId) {
                await API.variables.update(this.currentEditId, data);
                alert('Variable updated successfully', 'success');
            } else {
                await API.variables.create(data);
                alert('Variable created successfully', 'success');
            }
            
            this.modal.close();
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            alert(`Error saving variable: ${error.message}`, 'error');
        }
    }
    
    async deleteVariable(id, name) {
        confirm(
            `Are you sure you want to delete the variable "${name}"?`,
            async () => {
                try {
                    await API.variables.delete(id);
                    alert('Variable deleted successfully', 'success');
                    setTimeout(() => window.location.reload(), 1000);
                } catch (error) {
                    alert(`Error deleting variable: ${error.message}`, 'error');
                }
            }
        );
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new VariablesManager());
} else {
    new VariablesManager();
}