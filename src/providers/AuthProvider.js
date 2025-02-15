'use client'

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

export function AuthProvider({ children }) {
    const initialize = useAuthStore(state => state.initialize);

    useEffect(() => {
        console.log('AuthProvider mounted');
        initialize();
        
        return () => {
            console.log('AuthProvider unmounted');
        };
    }, [initialize]);

    return children;
}