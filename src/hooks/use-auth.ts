import { useCallback } from 'react';

export interface Doctor {
    id: number;
    first_name: string;
    last_name: string;
    specialty: string;
    license_number: string;
    phone: string;
    email: string;
    branch_id: number | null;
    is_active: boolean;
}

export interface User {
    id: number;
    name: string;
    email: string;
    doctor?: Doctor | null;
    roles?: Array<{
        id: number;
        name: string;
        slug: string;
        permissions?: Array<{
            id: number;
            name: string;
            slug: string;
        }>;
    }>;
}

export const useAuth = () => {
    const getUser = (): User | null => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    };

    const user = getUser();

    const hasPermission = useCallback((permissionSlug: string): boolean => {
        if (!user) return false;

        // Si es admin, tiene todos los permisos
        if (user.roles?.some(role => role.slug === 'admin')) return true;

        // Buscar en todos los roles del usuario sus permisos
        return user.roles?.some(role =>
            role.permissions?.some(permission => permission.slug === permissionSlug)
        ) || false;
    }, [user]);

    const hasRole = useCallback((roleSlug: string): boolean => {
        if (!user) return false;
        return user.roles?.some(role => role.slug === roleSlug) || false;
    }, [user]);

    const isAdmin = user?.roles?.some(role => role.slug === 'admin') || false;
    const isDoctor = user?.roles?.some(role => role.slug === 'doctor') || false;
    const isReceptionist = user?.roles?.some(role => role.slug === 'receptionist') || false;
    const doctorId = user?.doctor?.id || null;
    const doctorInfo = user?.doctor || null;

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return {
        user,
        hasPermission,
        hasRole,
        isAdmin,
        isDoctor,
        isReceptionist,
        doctorId,
        doctorInfo,
        logout,
        isAuthenticated: !!localStorage.getItem('token'),
    };
};
