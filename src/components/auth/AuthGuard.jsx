'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { AUTH_CONFIG } from '@/config/auth';

export function AuthGuard({ children }) {
    const router = useRouter();
    const { authState, isAuthEnabled } = useAuthStore();

    useEffect(() => {
        console.log('AuthGuard - Current state:', { authState, isAuthEnabled });

        if (authState === AUTH_CONFIG.AUTH_STATES.UNAUTHENTICATED) {
            console.log('User is not authenticated, redirecting to:', AUTH_CONFIG.LOGIN_PAGE);
            router.replace(AUTH_CONFIG.LOGIN_PAGE);
        }
    }, [authState, isAuthEnabled, router]);

    // Solo mostramos loading mientras se verifica la autenticación
    if (authState === AUTH_CONFIG.AUTH_STATES.LOADING) {
        return <div>Cargando...</div>;
    }

    return children;
}