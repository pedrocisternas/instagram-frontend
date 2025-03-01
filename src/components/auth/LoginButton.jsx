'use client'

import { useAuthStore } from '@/store/auth';

export default function LoginButton() {
    const { loginWithFacebook, isAuthEnabled, authState } = useAuthStore();

    if (!isAuthEnabled) {
        return null;
    }

    return (
        <button
            onClick={loginWithFacebook}
            disabled={authState === 'loading'}
            className={`
                w-full flex justify-center py-2 px-4 border border-transparent rounded-md
                shadow-sm text-sm font-medium text-white
                ${authState === 'loading'
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }
            `}
        >
            {authState === 'loading' ? (
                <span>Cargando...</span>
            ) : (
                <span>Iniciar sesión con Facebook</span>
            )}
        </button>
    );
}