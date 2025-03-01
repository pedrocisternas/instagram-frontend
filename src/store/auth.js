import { create } from 'zustand';
import { AUTH_CONFIG } from '@/config/auth';
import { authService } from '@/services/api/auth';

export const useAuthStore = create((set) => ({
    // Estado inicial
    authState: AUTH_CONFIG.AUTH_STATES.LOADING,
    user: null,
    isAuthEnabled: true,
    authError: null,

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
                user: status.user,
                authError: null
            });
            console.log('Auth store updated with user:', status.user?.id);
        } catch (error) {
            console.error('Error initializing auth:', error);
            set({ 
                authState: AUTH_CONFIG.AUTH_STATES.UNAUTHENTICATED,
                isAuthEnabled: true,
                user: null,
                authError: 'Error initializing authentication'
            });
        }
    },

    loginWithFacebook: () => {
        authService.loginWithFacebook();
    },

    loginWithEmail: async (email, password) => {
        try {
            set({ authError: null });
            await authService.loginWithEmail(email, password);
            // La redirección la manejará el servidor
            // No necesitamos devolver nada aquí
        } catch (error) {
            console.error('Login error:', error);
            set({ 
                authError: error.message || 'Error during login'
            });
        }
    },

    logout: async () => {
        try {
            await authService.logout();
            set({ 
                authState: AUTH_CONFIG.AUTH_STATES.UNAUTHENTICATED,
                user: null,
                isAuthEnabled: true,
                authError: null
            });
        } catch (error) {
            console.error('Error during logout:', error);
            set({ 
                authError: 'Error during logout'
            });
        }
    },

    clearError: () => set({ authError: null })
}));