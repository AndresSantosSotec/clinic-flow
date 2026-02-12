import React from 'react';
import { useAuth } from '@/hooks/use-auth';

interface CanProps {
    permission?: string;
    role?: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Componente para controlar la visibilidad de elementos basado en permisos o roles.
 * 
 * Ejemplo:
 * <Can permission="create-users">
 *   <Button>Nuevo Usuario</Button>
 * </Can>
 */
export const Can: React.FC<CanProps> = ({ permission, role, children, fallback = null }) => {
    const { hasPermission, hasRole } = useAuth();

    let allowed = true;

    if (permission) {
        allowed = hasPermission(permission);
    } else if (role) {
        allowed = hasRole(role);
    }

    if (!allowed) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
