import { APP_CONFIG } from '@/config/app';
import { AUTH_CONFIG } from '@/config/auth';
import apiClient from './clientApi';

export const authService = {
    // Verificar estado de autenticación
    checkAuthStatus: async () => {
        console.log('Checking auth status...');
        try {
            const data = await apiClient.get(AUTH_CONFIG.AUTH_STATUS_URL);
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
            await apiClient.get(AUTH_CONFIG.LOGOUT_URL);
            window.location.href = AUTH_CONFIG.LOGIN_PAGE;
        } catch (error) {
            console.error('Error during logout:', error);
            throw error;
        }
    }
};