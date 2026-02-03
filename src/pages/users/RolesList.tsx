import { useState } from "react";
import { Plus, Search, Edit, Trash2, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import RoleForm from "./RoleForm";

export default function RolesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rolesResponse, isLoading, error } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.get('/roles');
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: "Éxito",
        description: "Rol eliminado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo eliminar el rol",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number, slug: string) => {
    if (slug === 'admin') {
      toast({
        title: "Protegido",
        description: "El rol de administrador no se puede eliminar.",
        variant: "destructive"
      });
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      deleteMutation.mutate(id);
    }
  };

  const openEditDialog = (role: any) => {
    setRoleToEdit(role);
    setFormOpen(true);
  };

  const openCreateDialog = () => {
    setRoleToEdit(null);
    setFormOpen(true);
  };

  const roles = Array.isArray(rolesResponse) ? rolesResponse : rolesResponse?.data || [];

  const filteredRoles = roles.filter((role: any) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error al cargar los roles.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Roles</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los roles y permisos del sistema
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Rol
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Roles</CardTitle>
          <CardDescription>
            Administra roles y sus permisos asociados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Search className="text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rol</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>F. Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No se encontraron roles
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((role: any) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {role.name}
                          <Badge variant="outline" className="text-xs">
                            {role.slug}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {role.description || 'Sin descripción'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(role.permissions || []).slice(0, 3).map((permission: any) => (
                            <Badge
                              key={permission.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {permission.name}
                            </Badge>
                          ))}
                          {role.permissions?.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{role.permissions.length - 3} más
                            </Badge>
                          )}
                          {!role.permissions?.length && (
                            <span className="text-xs text-muted-foreground">Sin permisos</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(role.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(role)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={role.slug === "admin"}
                            onClick={() => handleDelete(role.id, role.slug)}
                            className={role.slug === "admin" ? "" : "text-destructive"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {formOpen && (
        <RoleForm
          open={formOpen}
          onOpenChange={setFormOpen}
          role={roleToEdit}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['roles'] })}
        />
      )}
    </div>
  );
}
