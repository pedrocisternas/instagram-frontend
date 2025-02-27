'use client'

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function AuthStatus() {
    const { user, authState, logout, isAuthEnabled } = useAuthStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    if (!isAuthEnabled || authState === 'loading') {
        return null;
    }

    const handleLogout = async () => {
        if (isLoggingOut) return; // Prevenir múltiples clics
        
        try {
            setIsLoggingOut(true);
            await logout();
            // No necesitamos hacer nada más aquí, ya que el logout
            // redirigirá al usuario a la página de login
        } catch (error) {
            console.error('Error during logout:', error);
            setIsLoggingOut(false);
        }
    };

    const isAuthenticated = authState === 'authenticated';

    return (
        <div className="flex flex-col items-center space-y-2">
            <button
                onClick={handleLogout}
                disabled={!isAuthenticated || isLoggingOut}
                className={`w-14 h-14 flex items-center justify-center rounded-lg transition-colors ${
                    isAuthenticated 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-gray-400 cursor-not-allowed'
                }`}
                title={isAuthenticated ? "Cerrar sesión" : "No hay sesión activa"}
            >
                {isLoggingOut ? (
                    <svg className="animate-spin h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <ArrowRightOnRectangleIcon className="h-6 w-6" />
                )}
            </button>
        </div>
    );
}