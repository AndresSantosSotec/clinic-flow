import { useState, useEffect } from "react";
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
    const { toast } = useToast();

    const { data: permissionsResponse } = useQuery({
        queryKey: ['permissions'],
        queryFn: async () => {
            const response = await api.get('/permissions');
            return response.data;
        },
        enabled: open,
    });

    const permissions = permissionsResponse?.data || [];

    useEffect(() => {
        if (open && role) {
            setName(role.name);
            setSlug(role.slug);
            setDescription(role.description || "");
            setSelectedPermissions(role.permissions?.map((p: any) => p.id) || []);
        } else if (open && !role) {
            setName("");
            setSlug("");
            setDescription("");
            setSelectedPermissions([]);
        }
    }, [open, role]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            name,
            slug,
            description,
            permission_ids: selectedPermissions
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{role ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
                    <DialogDescription>
                        Configura el nombre y los permisos asociados a este rol.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
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
                                placeholder="receptionist"
                                disabled={role?.slug === 'admin'}
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

                    <div className="space-y-2">
                        <Label>Permisos</Label>
                        <div className="border rounded-md p-4 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                            {permissions.map((permission: any) => (
                                <div key={permission.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`perm-${permission.id}`}
                                        checked={selectedPermissions.includes(permission.id)}
                                        onCheckedChange={() => togglePermission(permission.id)}
                                    />
                                    <label
                                        htmlFor={`perm-${permission.id}`}
                                        className="text-sm font-medium leading-none cursor-pointer truncate"
                                        title={permission.description}
                                    >
                                        {permission.name}
                                    </label>
                                </div>
                            ))}
                        </div>
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
