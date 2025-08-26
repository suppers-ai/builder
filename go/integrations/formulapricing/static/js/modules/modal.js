// Modal Module - Reusable modal functionality
export class Modal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        if (!this.modal) {
            console.error(`Modal with id "${modalId}" not found`);
            return;
        }
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Close on backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Close on close button click
        const closeBtn = this.modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }
    
    open() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.onClose && this.onClose();
    }
    
    isOpen() {
        return this.modal.classList.contains('active');
    }
    
    setContent(content) {
        const contentArea = this.modal.querySelector('.modal-body');
        if (contentArea) {
            if (typeof content === 'string') {
                contentArea.innerHTML = content;
            } else {
                contentArea.innerHTML = '';
                contentArea.appendChild(content);
            }
        }
    }
    
    setTitle(title) {
        const titleElement = this.modal.querySelector('.modal-title, h2');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
}

// Confirm dialog helper
export function confirm(message, onConfirm, onCancel) {
    const confirmed = window.confirm(message);
    if (confirmed) {
        onConfirm && onConfirm();
    } else {
        onCancel && onCancel();
    }
    return confirmed;
}

// Alert helper with better styling
export function alert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible`;
    alertDiv.innerHTML = `
        ${message}
        <button class="alert-close">&times;</button>
    `;
    
    // Add to page
    const container = document.querySelector('.content') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
    
    // Manual dismiss
    alertDiv.querySelector('.alert-close')?.addEventListener('click', () => {
        alertDiv.remove();
    });
}