// Main application entry point

(function() {
    'use strict';

    // Get current page from URL path
    const path = window.location.pathname;
    
    // Module mapping
    const moduleMap = {
        '/collections': './modules/collections.js',
        '/dashboard': './modules/dashboard.js'
    };

    // Check for collection detail pages
    if (path.startsWith('/collections/') && path.split('/').length > 2) {
        // Load collection detail module
        import('./modules/collection-detail.js')
            .then(module => {
                console.log('Loaded collection detail module');
            })
            .catch(error => {
                console.error('Failed to load collection detail module:', error);
            });
    } else if (moduleMap[path]) {
        // Load page-specific module
        import(moduleMap[path])
            .then(module => {
                console.log(`Loaded module for ${path}`);
            })
            .catch(error => {
                console.error(`Failed to load module for ${path}:`, error);
            });
    }

    // Global functionality

    // Handle logout
    const logoutLinks = document.querySelectorAll('a[href="/auth/logout"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = '/auth/logout';
            }
        });
    });

    // Flash messages
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(msg => {
        setTimeout(() => {
            msg.style.transition = 'opacity 0.5s';
            msg.style.opacity = '0';
            setTimeout(() => msg.remove(), 500);
        }, 5000);
    });

    // Form validation
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('error');
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                alert('Please fill in all required fields');
            }
        });
    });

    // Table sorting
    const sortableHeaders = document.querySelectorAll('th[data-sortable]');
    sortableHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            const table = header.closest('table');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const columnIndex = Array.from(header.parentElement.children).indexOf(header);
            const isAscending = header.classList.contains('sort-asc');
            
            rows.sort((a, b) => {
                const aText = a.children[columnIndex].textContent.trim();
                const bText = b.children[columnIndex].textContent.trim();
                
                // Try to parse as number
                const aNum = parseFloat(aText);
                const bNum = parseFloat(bText);
                
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return isAscending ? bNum - aNum : aNum - bNum;
                }
                
                // Sort as string
                return isAscending 
                    ? bText.localeCompare(aText)
                    : aText.localeCompare(bText);
            });
            
            // Update classes
            sortableHeaders.forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
            });
            header.classList.add(isAscending ? 'sort-desc' : 'sort-asc');
            
            // Re-append sorted rows
            rows.forEach(row => tbody.appendChild(row));
        });
    });

    // Handle API health check
    if (window.location.pathname === '/dashboard') {
        fetch('/api/health')
            .then(response => response.json())
            .then(data => {
                console.log('API Health:', data);
            })
            .catch(error => {
                console.error('API Health check failed:', error);
            });
    }

})();