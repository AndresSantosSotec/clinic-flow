import { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, CheckSquare, Square, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

interface RoleFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role?: any | null;
    onSuccess: () => void;
}

export default function RoleForm({
    open,
    onOpenChange,
    role,
    onSuccess,
}: RoleFormProps) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [permSearch, setPermSearch] = useState("");
    const { toast } = useToast();

    const { data: permissionsResponse, isLoading: loadingPerms } = useQuery({
        queryKey: ['permissions'],
        queryFn: async () => {
            const response = await api.get('/permissions');
            return response.data;
        },
        enabled: open,
    });

    // Handle both array and paginated response formats
    const permissions = useMemo(() => {
        if (Array.isArray(permissionsResponse)) return permissionsResponse;
        if (permissionsResponse?.data && Array.isArray(permissionsResponse.data)) return permissionsResponse.data;
        return [];
    }, [permissionsResponse]);

    // Group permissions by category (prefix before the dash)
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, any[]> = {};
        permissions.forEach((perm: any) => {
            const parts = perm.slug.split('-');
            const category = parts.length > 1 ? parts.slice(1).join('-') : 'otros';
            const categoryLabels: Record<string, string> = {
                'users': 'Usuarios',
                'roles': 'Roles',
                'branches': 'Sucursales',
                'doctors': 'Doctores',
                'patients': 'Pacientes',
                'appointments': 'Citas',
                'payments': 'Pagos',
            };
            const label = categoryLabels[category] || category;
            if (!groups[label]) groups[label] = [];
            groups[label].push(perm);
        });
        return groups;
    }, [permissions]);

    useEffect(() => {
        if (open && role) {
            setName(role.name);
            setSlug(role.slug);
            setDescription(role.description || "");
            setSelectedPermissions(role.permissions?.map((p: any) => p.id) || []);
            setPermSearch("");
        } else if (open && !role) {
            setName("");
            setSlug("");
            setDescription("");
            setSelectedPermissions([]);
            setPermSearch("");
        }
    }, [open, role]);

    // Auto-generate slug when creating
    useEffect(() => {
        if (!role && name) {
            setSlug(name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
        }
    }, [name, role]);

    const mutation = useMutation({
        mutationFn: async (values: any) => {
            if (role) {
                return api.put(`/roles/${role.id}`, values);
            }
            return api.post('/roles', values);
        },
        onSuccess: () => {
            toast({
                title: "Éxito",
                description: `Rol ${role ? "actualizado" : "creado"} correctamente`,
            });
            onSuccess();
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Ocurrió un error al guardar.",
                variant: "destructive",
            });
        },
    });

    const togglePermission = (id: number) => {
        setSelectedPermissions((prev) =>
            prev.includes(id)
                ? prev.filter((pId) => pId !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedPermissions(permissions.map((p: any) => p.id));
    };

    const deselectAll = () => {
        setSelectedPermissions([]);
    };

    const selectGroup = (groupPerms: any[]) => {
        const ids = groupPerms.map((p: any) => p.id);
        setSelectedPermissions((prev) => {
            const allSelected = ids.every((id) => prev.includes(id));
            if (allSelected) {
                return prev.filter((id) => !ids.includes(id));
            }
            return [...new Set([...prev, ...ids])];
        });
    };

    const filteredGroups = useMemo(() => {
        if (!permSearch) return groupedPermissions;
        const filtered: Record<string, any[]> = {};
        Object.entries(groupedPermissions).forEach(([group, perms]) => {
            const matchedPerms = perms.filter((p: any) =>
                p.name.toLowerCase().includes(permSearch.toLowerCase()) ||
                p.slug.toLowerCase().includes(permSearch.toLowerCase())
            );
            if (matchedPerms.length > 0) filtered[group] = matchedPerms;
        });
        return filtered;
    }, [groupedPermissions, permSearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" });
            return;
        }
        mutation.mutate({
            name,
            slug,
            description,
            permission_ids: selectedPermissions
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>{role ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
                    <DialogDescription>
                        Configura el nombre y los permisos asociados a este rol.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1 overflow-hidden">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Nombre del rol"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug (Identificador)</Label>
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                required
                                placeholder="nombre-del-rol"
                                disabled={role?.slug === 'admin'}
                                className="font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descripción de lo que permite este rol"
                        />
                    </div>

                    <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between">
                            <Label>Permisos</Label>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                    {selectedPermissions.length} / {permissions.length} seleccionados
                                </Badge>
                                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={selectAll}>
                                    <CheckSquare className="h-3 w-3" />
                                    Todos
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={deselectAll}>
                                    <Square className="h-3 w-3" />
                                    Ninguno
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar permisos..."
                                value={permSearch}
                                onChange={(e) => setPermSearch(e.target.value)}
                                className="pl-9 h-8 text-sm"
                            />
                        </div>

                        {loadingPerms ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <ScrollArea className="flex-1 border rounded-md">
                                <div className="p-3 space-y-4">
                                    {Object.entries(filteredGroups).map(([group, perms]) => {
                                        const allSelected = perms.every((p: any) => selectedPermissions.includes(p.id));
                                        const someSelected = perms.some((p: any) => selectedPermissions.includes(p.id));

                                        return (
                                            <div key={group}>
                                                <div
                                                    className="flex items-center gap-2 mb-2 cursor-pointer hover:text-primary transition-colors"
                                                    onClick={() => selectGroup(perms)}
                                                >
                                                    <Checkbox
                                                        checked={allSelected ? true : someSelected ? "indeterminate" : false}
                                                        className="pointer-events-none"
                                                    />
                                                    <span className="text-sm font-semibold">{group}</span>
                                                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                                                        {perms.filter((p: any) => selectedPermissions.includes(p.id)).length}/{perms.length}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pl-6">
                                                    {perms.map((permission: any) => (
                                                        <div key={permission.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`perm-${permission.id}`}
                                                                checked={selectedPermissions.includes(permission.id)}
                                                                onCheckedChange={() => togglePermission(permission.id)}
                                                            />
                                                            <label
                                                                htmlFor={`perm-${permission.id}`}
                                                                className="text-sm leading-none cursor-pointer truncate"
                                                                title={permission.description || permission.slug}
                                                            >
                                                                {permission.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Separator className="mt-3" />
                                            </div>
                                        );
                                    })}
                                    {Object.keys(filteredGroups).length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No se encontraron permisos
                                        </p>
                                    )}
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={mutation.isPending}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Guardando..." : role ? "Actualizar" : "Crear"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
