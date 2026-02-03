import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  Tag,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScheduleAppointmentDialog } from '@/components/patients/ScheduleAppointmentDialog';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function PatientsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patientsResponse, isLoading, error } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await api.get('/patients');
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/patients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: 'Paciente eliminado',
        description: 'El expediente del paciente ha sido retirado.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo eliminar el paciente.',
      });
    },
  });

  const handleDeletePatient = (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar a este paciente? Esta acción no se puede deshacer y eliminará su historial.')) {
      deleteMutation.mutate(id);
    }
  };

  const patients = patientsResponse?.data || [];

  const filteredPatients = patients.filter(
    (patient: any) =>
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery) ||
      patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScheduleAppointment = (patient: any) => {
    setSelectedPatient(patient);
    setScheduleDialogOpen(true);
  };

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
        Error al cargar los pacientes. Por favor, intenta de nuevo.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Pacientes</h1>
          <p className="page-description">
            {patients.length} pacientes registrados
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/patients/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo paciente</span>
            <span className="sm:hidden">Nuevo</span>
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, teléfono o email..."
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

      {/* Table - Desktop */}
      <div className="data-table-container hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Historial</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient: any) => {
              const initials = `${patient.first_name[0]}${patient.last_name[0]}`;
              const birthDate = new Date(patient.date_of_birth);
              const age = new Date().getFullYear() - birthDate.getFullYear();

              return (
                <TableRow key={patient.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {initials.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          to={`/patients/${patient.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {patient.first_name} {patient.last_name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {patient.gender}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {patient.phone}
                      </div>
                      {patient.email && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {patient.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{age}</span>
                    <span className="text-muted-foreground"> años</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 text-sm text-muted-foreground">
                      {patient.blood_type && (
                        <Badge variant="outline" className="text-xs">
                          Tipo: {patient.blood_type}
                        </Badge>
                      )}
                      {patient.allergies ? (
                        <span className="text-xs text-destructive truncate max-w-[150px]" title={patient.allergies}>
                          Alergias: {patient.allergies}
                        </span>
                      ) : (
                        <span className="text-xs">Sin alergias</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {new Date(patient.created_at).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/patients/${patient.id}`}>Ver perfil</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/patients/${patient.id}/edit`}>Editar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleScheduleAppointment(patient)}>
                          Agendar cita
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeletePatient(patient.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredPatients.map((patient: any) => {
          const initials = `${patient.first_name[0]}${patient.last_name[0]}`;
          const birthDate = new Date(patient.date_of_birth);
          const age = new Date().getFullYear() - birthDate.getFullYear();

          return (
            <div
              key={patient.id}
              className="p-4 rounded-lg border bg-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initials.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {age} años • {patient.gender}
                    </p>
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
                      <Link to={`/patients/${patient.id}`}>Ver perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/patients/${patient.id}/edit`}>Editar</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleScheduleAppointment(patient)}>
                      Agendar cita
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeletePatient(patient.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {patient.phone}
                </div>
                {patient.email && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {patient.blood_type && (
                  <Badge variant="outline" className="text-xs">
                    {patient.blood_type}
                  </Badge>
                )}
                {patient.allergies && (
                  <Badge variant="outline" className="text-xs text-destructive border-destructive/30 bg-destructive/5">
                    Alergias
                  </Badge>
                )}
              </div>

              <div className="mt-3 pt-3 border-t flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Registrado: {new Date(patient.created_at).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleScheduleAppointment(patient)}
                >
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Agendar
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Appointment Dialog */}
      {selectedPatient && (
        <ScheduleAppointmentDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          patient={selectedPatient}
        />
      )}
    </div>
  );
}
