import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Building2,
  Clock,
  Phone,
  Mail,
  MoreHorizontal,
  MapPin,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function BranchesList() {
  const queryClient = useQueryClient();

  const { data: branchesResponse, isLoading, error } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await api.get('/branches');
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const response = await api.put(`/branches/${id}`, { is_active });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: 'Estado actualizado',
        description: 'La sede ha cambiado su estado correctamente.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar el estado.',
      });
    },
  });

  const branches = branchesResponse?.data || [];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error al cargar las sedes. Por favor, intenta de nuevo.
      </div>
    );
  }

  const toggleBranchStatus = (id: number, currentStatus: boolean) => {
    updateStatusMutation.mutate({ id, is_active: !currentStatus });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Sedes</h1>
          <p className="page-description">
            Administra las sucursales de la clínica
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/branches/new">
            <Plus className="h-4 w-4" />
            Nueva sede
          </Link>
        </Button>
      </div>

      {/* Branches grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {branches.map((branch) => (
          <Card key={branch.id} className={!branch.is_active ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{branch.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {branch.code}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/branches/${branch.id}`}>Editar</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Ver horarios</DropdownMenuItem>
                    <DropdownMenuItem>Ver usuarios</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {branch.is_active ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">
                    {branch.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <Switch
                  checked={branch.is_active}
                  onCheckedChange={() => toggleBranchStatus(branch.id, branch.is_active)}
                />
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{branch.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {branch.opens_at?.substring(0, 5)} - {branch.closes_at?.substring(0, 5)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{branch.phone}</span>
                </div>
                {branch.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{branch.email}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-4 pt-2 border-t">
                <div>
                  <p className="text-2xl font-bold">{branch.doctors_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Médicos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{branch.appointments_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Citas (Histórico)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
