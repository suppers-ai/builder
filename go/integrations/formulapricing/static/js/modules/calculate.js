import { api } from './api.js';

class CalculateManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('calculateForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleCalculate(e));
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }
    }

    async handleCalculate(e) {
        e.preventDefault();
        
        const inputs = {};
        const formData = new FormData(e.target);
        
        for (const [key, value] of formData.entries()) {
            if (key !== 'pricing_name') {
                inputs[key] = parseFloat(value) || 0;
            }
        }

        const pricingName = formData.get('pricing_name');
        
        try {
            const result = await api.calculate({
                pricing_name: pricingName,
                inputs: inputs
            });
            
            this.displayResult(result);
        } catch (error) {
            console.error('Failed to calculate:', error);
            alert('Failed to calculate: ' + error.message);
        }
    }

    displayResult(result) {
        const container = document.getElementById('calculationResult');
        if (!container) return;

        let html = `
            <div class="result-card">
                <h3>Calculation Result</h3>
                <div class="result-details">
                    <div class="result-item">
                        <span class="label">Base Price:</span>
                        <span class="value">$${result.base_price.toFixed(2)}</span>
                    </div>
        `;

        if (result.conditions && result.conditions.length > 0) {
            html += '<div class="conditions-section"><h4>Applied Conditions:</h4>';
            result.conditions.forEach(condition => {
                html += `
                    <div class="condition-item">
                        <span class="name">${condition.name}:</span>
                        <span class="multiplier">×${condition.multiplier}</span>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += `
                    <div class="result-item final">
                        <span class="label">Final Price:</span>
                        <span class="value">$${result.final_price.toFixed(2)}</span>
                    </div>
                </div>
        `;

        if (result.final_price > 0) {
            html += `
                <button id="checkoutBtn" class="btn btn-primary" data-price="${result.final_price}">
                    Proceed to Checkout
                </button>
            `;
        }

        html += '</div>';
        
        container.innerHTML = html;
        container.style.display = 'block';
        
        // Re-attach checkout event listener
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }
    }

    async handleCheckout() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (!checkoutBtn) return;
        
        const price = parseFloat(checkoutBtn.dataset.price);
        
        try {
            const response = await api.checkout({
                amount: price,
                description: 'Formula Pricing Calculation'
            });
            
            if (response.checkout_url) {
                window.location.href = response.checkout_url;
            } else {
                alert('Failed to create checkout session');
            }
        } catch (error) {
            console.error('Failed to create checkout:', error);
            alert('Failed to create checkout: ' + error.message);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CalculateManager());
} else {
    new CalculateManager();
}

export default CalculateManager;