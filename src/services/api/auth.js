import { APP_CONFIG } from '@/config/app';
import { AUTH_CONFIG } from '@/config/auth';
import apiClient from './clientApi';

// Función auxiliar para verificar si estamos en el cliente
const isClient = typeof window !== 'undefined';

export const authService = {
    // Verificar estado de autenticación
    checkAuthStatus: async () => {
        console.log('Checking auth status...');
        
        // Si no estamos en el cliente, devolvemos un estado por defecto
        if (!isClient) {
            console.log('Not in client environment, returning default auth state');
            return { authenticated: false, authSystem: 'enabled', user: null };
        }
        
        try {
            const data = await apiClient.get(AUTH_CONFIG.AUTH_STATUS_URL);
            console.log('Auth status data:', data);
            return data;
        } catch (error) {
            console.error('Error checking auth status:', error);
            return { authenticated: false, authSystem: 'enabled', user: null };
        }
    },

    // Iniciar sesión con Facebook (redirige a Facebook)
    loginWithFacebook: () => {
        if (!isClient) return;
        window.location.href = `${APP_CONFIG.API_URL}${AUTH_CONFIG.LOGIN_URL}`;
    },

    // Iniciar sesión con email (redirige como Facebook)
    loginWithEmail: async (email, password) => {
        if (!isClient) {
            console.error('Cannot login with email on server side');
            throw new Error('Cannot login on server side');
        }
        
        try {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `${APP_CONFIG.API_URL}${AUTH_CONFIG.EMAIL_LOGIN_URL}`;

            const emailInput = document.createElement('input');
            emailInput.type = 'hidden';
            emailInput.name = 'email';
            emailInput.value = email;

            const passwordInput = document.createElement('input');
            passwordInput.type = 'hidden';
            passwordInput.name = 'password';
            passwordInput.value = password;

            form.appendChild(emailInput);
            form.appendChild(passwordInput);
            document.body.appendChild(form);

            form.submit();
        } catch (error) {
            console.error('Error during email login:', error);
            throw error;
        }
    },

    // Cerrar sesión
    logout: async () => {
        if (!isClient) {
            console.error('Cannot logout on server side');
            return;
        }
        
        try {
            await apiClient.get(AUTH_CONFIG.LOGOUT_URL);
            window.location.href = AUTH_CONFIG.LOGIN_PAGE;
        } catch (error) {
            console.error('Error during logout:', error);
            throw error;
        }
    }
};