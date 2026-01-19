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
  Grid3X3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { AppointmentStatus } from '@/types';

const statusConfig: Record<AppointmentStatus, { label: string; class: string }> = {
  scheduled: { label: 'Programada', class: 'status-scheduled' },
  confirmed: { label: 'Confirmada', class: 'status-confirmed' },
  completed: { label: 'Completada', class: 'status-completed' },
  cancelled: { label: 'Cancelada', class: 'status-cancelled' },
  no_show: { label: 'No asistió', class: 'status-no_show' },
};

// Mock data
const mockAppointments = [
  {
    id: 1,
    patient: { full_name: 'María García López' },
    doctor: { name: 'Dr. Juan Pérez', specialty: 'Medicina General' },
    branch: { name: 'Clínica Centro' },
    date: '2024-01-22',
    time_start: '09:00',
    time_end: '09:30',
    status: 'confirmed' as const,
    reason: 'Consulta general - revisión anual',
  },
  {
    id: 2,
    patient: { full_name: 'Carlos Rodríguez' },
    doctor: { name: 'Dra. Ana Martínez', specialty: 'Cardiología' },
    branch: { name: 'Clínica Centro' },
    date: '2024-01-22',
    time_start: '09:30',
    time_end: '10:15',
    status: 'scheduled' as const,
    reason: 'Seguimiento hipertensión',
  },
  {
    id: 3,
    patient: { full_name: 'Laura Hernández' },
    doctor: { name: 'Dr. Juan Pérez', specialty: 'Medicina General' },
    branch: { name: 'Clínica Centro' },
    date: '2024-01-22',
    time_start: '10:00',
    time_end: '10:30',
    status: 'completed' as const,
    reason: 'Control prenatal',
  },
  {
    id: 4,
    patient: { full_name: 'Roberto Sánchez' },
    doctor: { name: 'Dr. Juan Pérez', specialty: 'Medicina General' },
    branch: { name: 'Clínica Centro' },
    date: '2024-01-22',
    time_start: '11:00',
    time_end: '11:30',
    status: 'scheduled' as const,
    reason: 'Dolor de espalda',
  },
  {
    id: 5,
    patient: { full_name: 'Ana López' },
    doctor: { name: 'Dra. Ana Martínez', specialty: 'Cardiología' },
    branch: { name: 'Clínica Centro' },
    date: '2024-01-22',
    time_start: '12:00',
    time_end: '12:45',
    status: 'no_show' as const,
    reason: 'Electrocardiograma',
  },
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
];

export default function AppointmentsList() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'list' | 'grid'>('list');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const prevDay = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
  };

  const nextDay = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Agenda</h1>
          <p className="page-description">
            {mockAppointments.length} citas programadas
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
            {mockAppointments.map((apt) => {
              const status = statusConfig[apt.status];
              const patientInitials = apt.patient.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={apt.id}
                  className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/50"
                >
                  {/* Time */}
                  <div className="w-20 shrink-0 text-center">
                    <p className="font-semibold">{apt.time_start}</p>
                    <p className="text-sm text-muted-foreground">{apt.time_end}</p>
                  </div>

                  {/* Vertical line */}
                  <div className="relative">
                    <div className={cn(
                      'h-full w-1 rounded-full',
                      apt.status === 'confirmed' && 'bg-primary',
                      apt.status === 'scheduled' && 'bg-info',
                      apt.status === 'completed' && 'bg-success',
                      (apt.status as string) === 'cancelled' && 'bg-muted',
                      apt.status === 'no_show' && 'bg-destructive',
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
                          <p className="font-medium">{apt.patient.full_name}</p>
                          <p className="text-sm text-muted-foreground">{apt.reason}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn('shrink-0', status.class)}>
                        {status.label}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {apt.doctor.name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {apt.branch.name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {parseInt(apt.time_end.split(':')[0]) * 60 + parseInt(apt.time_end.split(':')[1]) - 
                         parseInt(apt.time_start.split(':')[0]) * 60 - parseInt(apt.time_start.split(':')[1])} min
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid/Timeline view */}
      {view === 'grid' && (
        <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
          <div className="grid grid-cols-[80px_1fr] divide-x">
            {/* Time column */}
            <div className="divide-y">
              {timeSlots.map((time) => (
                <div key={time} className="h-16 px-3 py-2 text-sm text-muted-foreground">
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
                    index % 2 === 0 ? 'bg-muted/20' : ''
                  )} 
                />
              ))}

              {/* Appointment cards positioned absolutely */}
              {mockAppointments.map((apt) => {
                const startMinutes = parseInt(apt.time_start.split(':')[0]) * 60 + parseInt(apt.time_start.split(':')[1]);
                const endMinutes = parseInt(apt.time_end.split(':')[0]) * 60 + parseInt(apt.time_end.split(':')[1]);
                const startOffset = (startMinutes - 8 * 60) / 30; // 8:00 is first slot
                const duration = (endMinutes - startMinutes) / 30;

                return (
                  <div
                    key={apt.id}
                    className={cn(
                      'absolute left-2 right-2 rounded-lg border p-2 text-sm',
                      apt.status === 'confirmed' && 'bg-primary/10 border-primary/30',
                      apt.status === 'scheduled' && 'bg-info/10 border-info/30',
                      apt.status === 'completed' && 'bg-success/10 border-success/30',
                      (apt.status as string) === 'cancelled' && 'bg-muted border-muted-foreground/20',
                      apt.status === 'no_show' && 'bg-destructive/10 border-destructive/30',
                    )}
                    style={{
                      top: `${startOffset * 64}px`,
                      height: `${duration * 64 - 4}px`,
                    }}
                  >
                    <p className="font-medium truncate">{apt.patient.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{apt.doctor.name}</p>
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
