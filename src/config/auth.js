export const AUTH_CONFIG = {
    // Endpoints
    AUTH_STATUS_URL: '/auth/status',
    LOGIN_URL: '/auth/facebook',
    LOGOUT_URL: '/auth/logout',
    
    // Rutas de la aplicación
    LOGIN_PAGE: '/login',
    DASHBOARD_PAGE: '/dashboard',
    HOME_PAGE: '/',
    
    // Estados de autenticación
    AUTH_STATES: {
        LOADING: 'loading',
        AUTHENTICATED: 'authenticated',
        UNAUTHENTICATED: 'unauthenticated'
    }
};