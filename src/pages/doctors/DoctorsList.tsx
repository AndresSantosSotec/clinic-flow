import { useState, useMemo } from 'react';
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
  Trash2,
  UserCheck,
  Edit,
  Eye,
  Shield,
  X
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Can } from '@/components/auth/Can';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function DoctorsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
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

  // Extract unique specialties for filter
  const specialties = useMemo(() => {
    const specs = [...new Set(doctors.map((d: any) => d.specialty))].filter(Boolean).sort();
    return specs as string[];
  }, [doctors]);

  const filteredDoctors = doctors.filter(
    (doctor: any) => {
      const matchesSearch =
        `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty = specialtyFilter === 'all' || doctor.specialty === specialtyFilter;

      return matchesSearch && matchesSpecialty;
    }
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
            {doctors.filter((d: any) => d.is_active).length} médicos activos · {specialties.length} especialidades
          </p>
        </div>
        <Can permission="create-doctors">
          <Button asChild className="gap-2">
            <Link to="/doctors/new">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo médico</span>
              <span className="sm:hidden">Nuevo</span>
            </Link>
          </Button>
        </Can>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, especialidad, correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="w-[220px]">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filtrar especialidad" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las especialidades</SelectItem>
              {specialties.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {specialtyFilter !== 'all' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSpecialtyFilter('all')}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      {(searchQuery || specialtyFilter !== 'all') && (
        <p className="text-sm text-muted-foreground">
          {filteredDoctors.length} resultado{filteredDoctors.length !== 1 ? 's' : ''} encontrado{filteredDoctors.length !== 1 ? 's' : ''}
          {specialtyFilter !== 'all' && <span> en <Badge variant="secondary" className="ml-1">{specialtyFilter}</Badge></span>}
        </p>
      )}

      {/* Doctors Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDoctors.map((doctor: any) => {
          const initials = `${doctor.first_name[0]}${doctor.last_name[0]}`.toUpperCase();

          return (
            <Card key={doctor.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <Avatar className="h-16 w-16 mb-3">
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {doctor.user && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5" title="Cuenta de usuario vinculada">
                        <UserCheck className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>

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
                          <Link to={`/doctors/${doctor.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver perfil
                          </Link>
                        </DropdownMenuItem>
                        <Can permission="edit-doctors">
                          <DropdownMenuItem asChild>
                            <Link to={`/doctors/${doctor.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                        </Can>
                        <Can permission="create-appointments">
                          <DropdownMenuItem asChild>
                            <Link to="/appointments/new">
                              <Calendar className="mr-2 h-4 w-4" />
                              Agendar cita
                            </Link>
                          </DropdownMenuItem>
                        </Can>
                        {doctor.user && (
                          <>
                            <DropdownMenuSeparator />
                            <Can permission="view-users">
                              <DropdownMenuItem asChild>
                                <Link to={`/users?search=${doctor.email}`}>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Gestionar acceso
                                </Link>
                              </DropdownMenuItem>
                            </Can>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <Can permission="delete-doctors">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteDoctor(doctor.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </Can>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="py-12 text-center">
          <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">No se encontraron médicos</h3>
          <p className="text-muted-foreground">
            {searchQuery || specialtyFilter !== 'all'
              ? 'Intenta cambiar los filtros de búsqueda.'
              : 'Registra tu primer médico para comenzar.'}
          </p>
        </div>
      )}
    </div>
  );
}
