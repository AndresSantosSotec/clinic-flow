import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Building2,
  Calendar as CalendarIcon,
  List,
  Grid3X3,
  MoreHorizontal,
  Trash2,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { AppointmentStatus } from '@/types';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const statusConfig: Record<string, { label: string; class: string }> = {
  scheduled: { label: 'Programada', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  confirmed: { label: 'Confirmada', class: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  completed: { label: 'Completada', class: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: 'Cancelada', class: 'bg-red-100 text-red-700 border-red-200' },
  no_show: { label: 'No asistió', class: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
];

export default function AppointmentsList() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'list' | 'grid'>('list');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['appointments', currentDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const response = await api.get('/appointments');
      return response.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return api.put(`/appointments/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Estado actualizado',
        description: 'La cita ha sido actualizada correctamente.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Cita eliminada',
        description: 'La cita ha sido removida de la agenda.',
      });
    },
  });

  const handleStatusUpdate = (id: number, status: string) => {
    statusMutation.mutate({ id, status });
  };

  const handleDeleteAppointment = (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      deleteMutation.mutate(id);
    }
  };

  const appointments = data?.data || [];

  // Filter appointments for the selected date
  const selectedDateStr = currentDate.toISOString().split('T')[0];
  const filteredAppointments = appointments.filter((apt: any) => {
    const aptDate = apt.appointment_date.split('T')[0];
    return aptDate === selectedDateStr;
  });

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
        Error al cargar la agenda.
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const prevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const nextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Agenda</h1>
          <p className="page-description">
            {filteredAppointments.length} citas para este día
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/appointments/new">
            <Plus className="h-4 w-4" />
            Nueva cita
          </Link>
        </Button>
      </div>

      {/* Date navigation & View toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="min-w-[280px] justify-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {formatDate(currentDate)}
          </Button>
          <Button variant="outline" size="icon" onClick={nextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            Hoy
          </Button>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'grid')}>
          <TabsList>
            <TabsTrigger value="list" className="gap-1.5">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="grid" className="gap-1.5">
              <Grid3X3 className="h-4 w-4" />
              Horario
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Appointments list view */}
      {view === 'list' && (
        <div className="rounded-xl border bg-card shadow-soft">
          <div className="divide-y">
            {filteredAppointments.map((apt: any) => {
              const status = statusConfig[apt.status] || { label: apt.status, class: '' };
              const patientName = `${apt.patient.first_name} ${apt.patient.last_name}`;
              const patientInitials = `${apt.patient.first_name[0]}${apt.patient.last_name[0]}`.toUpperCase();

              const startDate = new Date(apt.appointment_date);
              const timeStart = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const endDate = new Date(startDate.getTime() + (apt.duration || 30) * 60000);
              const timeEnd = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={apt.id}
                  className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/50"
                >
                  {/* Time */}
                  <div className="w-20 shrink-0 text-center">
                    <p className="font-semibold">{timeStart}</p>
                    <p className="text-sm text-muted-foreground">{timeEnd}</p>
                  </div>

                  {/* Vertical line */}
                  <div className="relative">
                    <div className={cn(
                      'h-full w-1 rounded-full bg-muted',
                      apt.status === 'confirmed' && 'bg-primary',
                      apt.status === 'scheduled' && 'bg-info',
                      apt.status === 'completed' && 'bg-success',
                      apt.status === 'cancelled' && 'bg-destructive',
                    )} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {patientInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{patientName}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{apt.reason || 'Sin motivo especificado'}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn('shrink-0', status.class)}>
                        {status.label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusUpdate(apt.id, 'confirmed')}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Confirmar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(apt.id, 'completed')}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            Completar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(apt.id, 'cancelled')}>
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                            Cancelar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteAppointment(apt.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        Dr. {apt.doctor.first_name} {apt.doctor.last_name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {apt.branch?.name || 'Sede no asignada'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {apt.duration} min
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredAppointments.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                No hay citas programadas para este día.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid/Timeline view */}
      {view === 'grid' && (
        <div className="rounded-xl border bg-card shadow-soft overflow-hidden overflow-x-auto">
          <div className="min-w-[800px] grid grid-cols-[80px_1fr] divide-x">
            {/* Time column */}
            <div className="divide-y bg-muted/5">
              {timeSlots.map((time) => (
                <div key={time} className="h-16 px-3 py-2 text-xs font-medium text-muted-foreground flex items-start justify-end">
                  {time}
                </div>
              ))}
            </div>

            {/* Appointments column */}
            <div className="relative">
              {timeSlots.map((time, index) => (
                <div
                  key={time}
                  className={cn(
                    'h-16 border-b',
                    index % 2 === 0 ? 'bg-muted/10' : ''
                  )}
                />
              ))}

              {/* Appointment cards positioned absolutely */}
              {filteredAppointments.map((apt: any) => {
                const startDate = new Date(apt.appointment_date);
                const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
                const startOffset = (startMinutes - 8 * 60) / 30; // 8:00 is first slot
                const duration = (apt.duration || 30) / 30;

                if (startOffset < 0 || startOffset > timeSlots.length) return null;

                return (
                  <div
                    key={apt.id}
                    className={cn(
                      'absolute left-2 right-2 rounded-lg border p-2 text-sm z-10 shadow-sm overflow-hidden',
                      apt.status === 'confirmed' && 'bg-primary/10 border-primary/30 text-primary-foreground dark:text-primary',
                      apt.status === 'scheduled' && 'bg-info/10 border-info/30 text-info font-medium',
                      apt.status === 'completed' && 'bg-success/10 border-success/30 text-success font-medium',
                      apt.status === 'cancelled' && 'bg-destructive/10 border-destructive/30 text-destructive font-medium',
                    )}
                    style={{
                      top: `${startOffset * 64 + 2}px`,
                      height: `${duration * 64 - 4}px`,
                    }}
                  >
                    <p className="font-bold truncate">{apt.patient.first_name} {apt.patient.last_name}</p>
                    <p className="text-[10px] opacity-80 truncate">Dr. {apt.doctor.last_name}</p>
                    {duration > 1 && (
                      <p className="text-[10px] mt-1 italic truncate">{apt.reason}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
