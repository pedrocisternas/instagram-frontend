'use client'

import { useAuthStore } from '@/store/auth';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function AuthStatus() {
    const { user, authState, logout, isAuthEnabled } = useAuthStore();

    if (!isAuthEnabled || authState === 'loading') {
        return null;
    }

    return (
        <div className="flex flex-col items-center space-y-2">
            {authState === 'authenticated' ? (
                <button
                    onClick={logout}
                    className="w-14 h-14 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Cerrar sesión"
                >
                    <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
            ) : null}
        </div>
    );
}