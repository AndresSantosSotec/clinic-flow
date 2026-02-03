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

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: any | null;
  onSuccess: () => void;
}

export default function UserForm({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const { toast } = useToast();

  const { data: rolesResponse } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.get('/roles');
      return response.data;
    },
    enabled: open,
  });

  const roles = rolesResponse?.data || [];

  useEffect(() => {
    if (open && user) {
      setName(user.name);
      setEmail(user.email);
      setPassword("");
      setConfirmPassword("");
      setSelectedRoles(user.roles?.map((r: any) => r.id) || []);
    } else if (open && !user) {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setSelectedRoles([]);
    }
  }, [open, user]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      if (user) {
        return api.put(`/users/${user.id}`, values);
      }
      return api.post('/users', values);
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: `Usuario ${user ? "actualizado" : "creado"} correctamente`,
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

  const toggleRole = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user && password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    const payload: any = {
      name,
      email,
      role_ids: selectedRoles,
    };

    if (password) {
      payload.password = password;
    }

    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {user ? "Editar Usuario" : "Nuevo Usuario"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Actualiza la información del usuario"
              : "Completa el formulario para crear un nuevo usuario"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Juan Pérez"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="juan@medicapp.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {user ? "Nueva Contraseña (dejar vacío para no cambiar)" : "Contraseña"}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!user}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repite la contraseña"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Roles</Label>
            <div className="border rounded-md p-4 space-y-2 max-h-40 overflow-y-auto">
              {roles.map((role: any) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={() => toggleRole(role.id)}
                  />
                  <label
                    htmlFor={`role-${role.id}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {role.name}
                    {role.description && (
                      <span className="text-xs text-muted-foreground ml-2">
                        - {role.description}
                      </span>
                    )}
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
              {mutation.isPending ? "Guardando..." : user ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
