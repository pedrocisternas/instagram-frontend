'use client'

import { useAuthStore } from '@/store/auth';
import { Button } from "@heroui/react";

export default function LoginButton() {
    const { loginWithFacebook, isAuthEnabled, authState } = useAuthStore();

    if (!isAuthEnabled) {
        return null;
    }

    return (
        <Button
            onClick={loginWithFacebook}
            isDisabled={authState === 'loading'}
            className="w-full"
            color="primary"
        >
            {authState === 'loading' ? 'Cargando...' : 'Iniciar sesión con Facebook'}
        </Button>
    );
}