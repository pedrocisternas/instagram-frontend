'use client'

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Button } from "@heroui/react";

export default function EmailLoginButton() {
    const { loginWithEmail, authError, clearError } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        clearError();

        try {
            await loginWithEmail(email, password);
            // La redirección la manejará el servidor
        } catch (error) {
            console.error('Login error:', error);
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
                <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="sr-only">Contraseña</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
            </div>

            {authError && (
                <div className="text-red-500 text-sm text-center">
                    {authError}
                </div>
            )}

            <div>
                <Button
                    type="submit"
                    color="primary"
                    isDisabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión con email'}
                </Button>
            </div>
        </form>
    );
}