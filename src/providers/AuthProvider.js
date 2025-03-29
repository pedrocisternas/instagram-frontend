'use client'

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';

export function AuthProvider({ children }) {
    const initialize = useAuthStore(state => state.initialize);
    const [isClient, setIsClient] = useState(false);

    // Este efecto se ejecuta una sola vez cuando el componente se monta en el cliente
    useEffect(() => {
        console.log('AuthProvider mounted - client side rendered');
        setIsClient(true);
    }, []);

    // Este efecto se ejecuta después de confirmar que estamos en el cliente
    useEffect(() => {
        if (isClient) {
            console.log('Initializing auth on client side');
            initialize();
        }
    }, [isClient, initialize]);

    return children;
}