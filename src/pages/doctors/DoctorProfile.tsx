import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  Award,
  Stethoscope,
  Edit,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const dayLabels: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const statusConfig: Record<string, { label: string; variant: string }> = {
  scheduled: { label: 'Agendada', variant: 'scheduled' },
  confirmed: { label: 'Confirmada', variant: 'confirmed' },
  completed: { label: 'Completada', variant: 'completed' },
  cancelled: { label: 'Cancelada', variant: 'cancelled' },
  no_show: { label: 'No asistió', variant: 'noshow' },
};

export default function DoctorProfile() {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: doctor, isLoading, error } = useQuery({
    queryKey: ['doctors', id],
    queryFn: async () => {
      const response = await api.get(`/doctors/${id}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="p-8 text-center text-destructive">
        Error al cargar el perfil del médico.
      </div>
    );
  }

  const initials = `${doctor.first_name[0]}${doctor.last_name[0]}`.toUpperCase();

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const dailyAppointments = (doctor.appointments || []).filter((apt: any) => {
    return apt.appointment_date.split('T')[0] === selectedDateStr;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Button variant="ghost" asChild className="gap-2 -ml-2">
        <Link to="/doctors">
          <ArrowLeft className="h-4 w-4" />
          Volver a médicos
        </Link>
      </Button>

      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and basic info */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Avatar className="h-20 w-20 md:h-24 md:w-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold">{doctor.first_name} {doctor.last_name}</h1>
                  <Badge variant={doctor.is_active ? 'secondary' : 'outline'}>
                    {doctor.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Stethoscope className="h-4 w-4" />
                  <span className="font-medium text-foreground">{doctor.specialty}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {doctor.email}
                  </div>
                  {doctor.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />
                      {doctor.phone}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-sm">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>Cédula/Licencia: {doctor.license_number}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="md:ml-auto flex gap-2">
              <Button variant="outline" className="gap-2" asChild>
                <Link to={`/doctors/${doctor.id}/edit`}>
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/appointments/new">Agendar cita</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Exportar información</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{(doctor.appointments || []).length}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Citas totales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {(doctor.appointments || []).filter((a: any) => a.appointment_date.split('T')[0] === new Date().toISOString().split('T')[0]).length}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Citas hoy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {(doctor.appointments || []).filter((a: any) => a.status === 'completed').length}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Completadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {(doctor.appointments || []).filter((a: any) => a.status === 'scheduled' || a.status === 'confirmed').length}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="schedule">Agenda del día</TabsTrigger>
          <TabsTrigger value="info">Información</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          {/* Date Navigation */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Citas programadas</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[140px] text-center">
                    {selectedDate.toLocaleDateString('es-MX', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                  <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyAppointments.map((apt: any) => {
                  const startDate = new Date(apt.appointment_date);
                  const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={apt.id}
                      className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0 text-center w-16">
                        <p className="font-semibold text-primary">{timeStr}</p>
                        <p className="text-xs text-muted-foreground">{apt.duration} min</p>
                      </div>
                      <Separator orientation="vertical" className="h-10" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{apt.patient.first_name} {apt.patient.last_name}</p>
                        <p className="text-sm text-muted-foreground truncate">{apt.reason || 'Sin motivo'}</p>
                      </div>
                      <Badge className={`status-badge status-${statusConfig[apt.status]?.variant || 'scheduled'}`}>
                        {statusConfig[apt.status]?.label || apt.status}
                      </Badge>
                    </div>
                  );
                })}
                {dailyAppointments.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    No hay citas programadas para este día.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Perfil profesional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Especialidad</p>
                  <p>{doctor.specialty}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Número de colegiado</p>
                  <p>{doctor.license_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Correo electrónico</p>
                  <p>{doctor.email}</p>
                </div>
                {doctor.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                    <p>{doctor.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Sede asignada
                </CardTitle>
              </CardHeader>
              <CardContent>
                {doctor.branch ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {doctor.branch.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{doctor.branch.name}</p>
                      <p className="text-sm text-muted-foreground">{doctor.branch.address || 'Sin dirección'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Sin sede asignada permanentemente.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
