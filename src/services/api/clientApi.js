import { APP_CONFIG } from '@/config/app';

const apiClient = {
    // Método base para todas las peticiones
    fetch: async (endpoint, options = {}) => {
        const url = `${APP_CONFIG.API_URL}${endpoint}`;
        
        const defaultOptions = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const response = await fetch(url, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.details || error.error || 'API request failed');
        }

        return response.json();
    },

    // Métodos de conveniencia
    get: (endpoint) => apiClient.fetch(endpoint),
    
    post: (endpoint, data) => apiClient.fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    put: (endpoint, data) => apiClient.fetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (endpoint) => apiClient.fetch(endpoint, {
        method: 'DELETE'
    })
};

export default apiClient;