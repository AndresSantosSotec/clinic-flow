import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Stethoscope,
  Mail,
  Phone,
  Building2,
  Calendar,
  MoreHorizontal,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function DoctorsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const response = await api.get('/doctors');
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/doctors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast({
        title: 'Médico eliminado',
        description: 'El profesional ha sido retirado del sistema.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo eliminar el médico.',
      });
    },
  });

  const handleDeleteDoctor = (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar a este médico? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(id);
    }
  };

  const doctors = data?.data || [];

  const filteredDoctors = doctors.filter(
    (doctor: any) =>
      `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        Error al cargar los médicos.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Médicos</h1>
          <p className="page-description">
            {doctors.filter((d: any) => d.is_active).length} médicos activos
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/doctors/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo médico</span>
            <span className="sm:hidden">Nuevo</span>
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, especialidad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Doctors Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDoctors.map((doctor: any) => {
          const initials = `${doctor.first_name[0]}${doctor.last_name[0]}`.toUpperCase();

          return (
            <Card key={doctor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 mb-3">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      to={`/doctors/${doctor.id}`}
                      className="font-semibold hover:text-primary transition-colors line-clamp-1"
                    >
                      {doctor.first_name} {doctor.last_name}
                    </Link>
                    <Badge variant={doctor.is_active ? 'secondary' : 'outline'} className="text-[10px] h-5">
                      {doctor.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-primary font-medium mb-3">
                    <Stethoscope className="h-4 w-4" />
                    {doctor.specialty}
                  </div>

                  <div className="w-full space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{doctor.email}</span>
                    </div>
                    {doctor.phone && (
                      <div className="flex items-center justify-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {doctor.phone}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3 justify-center">
                    {doctor.branch ? (
                      <Badge variant="outline" className="text-xs">
                        <Building2 className="mr-1 h-3 w-3" />
                        {doctor.branch.name}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Sin sede asignada</span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t w-full flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{doctor.appointments?.length || 0}</span>
                      <span className="text-muted-foreground">citas</span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/doctors/${doctor.id}`}>Ver perfil</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/doctors/${doctor.id}/edit`}>Editar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/appointments/new">Agendar cita</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteDoctor(doctor.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
