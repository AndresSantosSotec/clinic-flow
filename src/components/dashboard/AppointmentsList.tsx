import { Clock, User, MoreVertical, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types';

interface AppointmentListItem {
  id: number;
  patient?: { full_name?: string };
  doctor?: { name?: string };
  time_start?: string;
  time_end?: string;
  status?: AppointmentStatus;
}

interface AppointmentsListProps {
  appointments: AppointmentListItem[];
  title?: string;
}

const statusConfig: Record<AppointmentStatus, { label: string; variant: string; icon: React.ElementType }> = {
  scheduled: { label: 'Programada', variant: 'status-scheduled', icon: Clock },
  confirmed: { label: 'Confirmada', variant: 'status-confirmed', icon: CheckCircle2 },
  completed: { label: 'Completada', variant: 'status-completed', icon: CheckCircle2 },
  cancelled: { label: 'Cancelada', variant: 'status-cancelled', icon: XCircle },
  no_show: { label: 'No asistió', variant: 'status-no_show', icon: AlertCircle },
};

export function AppointmentsList({ appointments, title = 'Citas de hoy' }: AppointmentsListProps) {
  return (
    <div className="rounded-xl border bg-card shadow-soft">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h3 className="font-semibold">{title}</h3>
        <Button variant="ghost" size="sm">
          Ver todas
        </Button>
      </div>
      <div className="divide-y">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 font-medium">No hay citas programadas</p>
            <p className="text-sm text-muted-foreground">Las citas aparecerán aquí</p>
          </div>
        ) : (
          appointments.map((apt) => {
            const status = statusConfig[apt.status || 'scheduled'];
            const StatusIcon = status.icon;
            const patientInitials = apt.patient?.full_name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'PA';

            return (
              <div
                key={apt.id}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {patientInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{apt.patient?.full_name}</p>
                    <Badge variant="outline" className={cn('shrink-0', status.variant)}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {apt.time_start} - {apt.time_end}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {apt.doctor?.name}
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                    <DropdownMenuItem>Confirmar</DropdownMenuItem>
                    <DropdownMenuItem>Reprogramar</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Cancelar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
