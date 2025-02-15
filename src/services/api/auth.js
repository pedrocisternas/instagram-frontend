import { APP_CONFIG } from '@/config/app';
import { AUTH_CONFIG } from '@/config/auth';

export const authService = {
    // Verificar estado de autenticación
    checkAuthStatus: async () => {
        console.log('Checking auth status...');
        try {
            const response = await fetch(`${APP_CONFIG.API_URL}${AUTH_CONFIG.AUTH_STATUS_URL}`, {
                credentials: 'include' // Importante para enviar cookies
            });
            
            console.log('Auth status response:', response.status);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            console.log('Auth status data:', data);
            return data;
        } catch (error) {
            console.error('Error checking auth status:', error);
            return { authenticated: false, authSystem: 'enabled' };
        }
    },

    // Iniciar sesión (redirige a Facebook)
    login: () => {
        window.location.href = `${APP_CONFIG.API_URL}${AUTH_CONFIG.LOGIN_URL}`;
    },

    // Cerrar sesión
    logout: async () => {
        try {
            const response = await fetch(`${APP_CONFIG.API_URL}${AUTH_CONFIG.LOGOUT_URL}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Logout failed');
            }

            window.location.href = AUTH_CONFIG.LOGIN_PAGE;
        } catch (error) {
            console.error('Error during logout:', error);
            throw error;
        }
    }
};