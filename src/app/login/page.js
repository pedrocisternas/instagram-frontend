'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import LoginButton from '@/components/auth/LoginButton';

export default function LoginPage() {
    const router = useRouter();
    const { authState, isAuthEnabled } = useAuthStore();

    useEffect(() => {
        // Redirigir si ya está autenticado
        if (authState === 'authenticated') {
            router.push('/dashboard');
        }
    }, [authState, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Instagram Analytics
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isAuthEnabled 
                            ? 'Inicia sesión para acceder a tus métricas'
                            : 'El sistema de autenticación está deshabilitado'
                        }
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <LoginButton />
                </div>
            </div>
        </div>
    );
}