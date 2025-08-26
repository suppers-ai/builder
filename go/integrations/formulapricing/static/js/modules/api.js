// API Module - Centralized API calls
export const API = {
    // Base fetch wrapper with error handling
    async fetch(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Request failed' }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }
            
            return response.json();
        } catch (error) {
            console.error(`API Error [${options.method || 'GET'} ${url}]:`, error);
            throw error;
        }
    },
    
    // Variables API
    variables: {
        getAll: () => API.fetch('/api/variables'),
        get: (id) => API.fetch(`/api/variables/${id}`),
        create: (data) => API.fetch('/api/variables', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => API.fetch(`/api/variables/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => API.fetch(`/api/variables/${id}`, {
            method: 'DELETE'
        })
    },
    
    // Calculations API
    calculations: {
        getAll: () => API.fetch('/api/calculations'),
        get: (id) => API.fetch(`/api/calculations/${id}`),
        create: (data) => API.fetch('/api/calculations', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => API.fetch(`/api/calculations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => API.fetch(`/api/calculations/${id}`, {
            method: 'DELETE'
        })
    },
    
    // Conditions API
    conditions: {
        getAll: () => API.fetch('/api/conditions'),
        get: (id) => API.fetch(`/api/conditions/${id}`),
        create: (data) => API.fetch('/api/conditions', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => API.fetch(`/api/conditions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => API.fetch(`/api/conditions/${id}`, {
            method: 'DELETE'
        })
    },
    
    // Pricing API
    pricing: {
        getAll: () => API.fetch('/api/pricing'),
        get: (id) => API.fetch(`/api/pricing/${id}`),
        getByName: (name) => API.fetch(`/api/pricing/${name}`),
        getWithVariables: (name) => API.fetch(`/api/pricing/${name}/variables`),
        create: (data) => API.fetch('/api/pricing', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => API.fetch(`/api/pricing/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => API.fetch(`/api/pricing/${id}`, {
            method: 'DELETE'
        })
    },
    
    // Calculate API
    calculate: (pricingName, variables) => API.fetch('/api/calculate', {
        method: 'POST',
        body: JSON.stringify({
            pricing_name: pricingName,
            variables: variables
        })
    }),
    
    // Users API
    users: {
        getAll: () => API.fetch('/api/users'),
        get: (id) => API.fetch(`/api/users/${id}`),
        create: (data) => API.fetch('/api/users', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        updatePassword: (id, password) => API.fetch(`/api/users/${id}/password`, {
            method: 'PUT',
            body: JSON.stringify({ password })
        }),
        updateRole: (id, role) => API.fetch(`/api/users/${id}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        }),
        delete: (id) => API.fetch(`/api/users/${id}`, {
            method: 'DELETE'
        })
    },
    
    // Purchases API
    purchases: {
        getAll: () => API.fetch('/api/purchases'),
        getUserPurchases: (userId) => API.fetch(`/api/purchases?user_id=${userId}`),
        simulate: (data) => API.fetch('/api/purchases/simulate', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    }
};