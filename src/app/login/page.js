'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import LoginButton from '@/components/auth/LoginButton';
import EmailLoginButton from '@/components/auth/EmailLoginButton';

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
                        Piru Metrics
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isAuthEnabled 
                            ? 'Inicia sesión para acceder a tus métricas'
                            : 'El sistema de autenticación está deshabilitado'
                        }
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    {isAuthEnabled && (
                        <>
                            <EmailLoginButton />
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">
                                        O
                                    </span>
                                </div>
                            </div>
                            <LoginButton />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}