import { create } from 'zustand';
import { AUTH_CONFIG } from '@/config/auth';
import { authService } from '@/services/api/auth';

export const useAuthStore = create((set) => ({
    // Estado inicial
    authState: AUTH_CONFIG.AUTH_STATES.LOADING,
    user: null,
    isAuthEnabled: true,

    // Acciones
    initialize: async () => {
        console.log('Initializing auth store...');
        try {
            const status = await authService.checkAuthStatus();
            console.log('Auth status received:', status);
            
            // Validar que el usuario tenga todos los campos necesarios
            if (status.user && !status.user.id) {
                console.error('User data missing required id field:', status.user);
            }
            
            set({
                authState: status.authenticated 
                    ? AUTH_CONFIG.AUTH_STATES.AUTHENTICATED 
                    : AUTH_CONFIG.AUTH_STATES.UNAUTHENTICATED,
                isAuthEnabled: status.authSystem === 'enabled',
                user: status.user
            });
            console.log('Auth store updated with user:', status.user?.id);
        } catch (error) {
            console.error('Error initializing auth:', error);
            set({ 
                authState: AUTH_CONFIG.AUTH_STATES.UNAUTHENTICATED,
                isAuthEnabled: true,
                user: null
            });
        }
    },

    login: () => {
        authService.login();
    },

    logout: async () => {
        try {
            await authService.logout();
            set({ 
                authState: AUTH_CONFIG.AUTH_STATES.UNAUTHENTICATED,
                user: null,
                isAuthEnabled: true
            });
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }
}));