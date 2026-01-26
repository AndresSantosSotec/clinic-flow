import { useState } from 'react';
import { 
  Search, 
  Filter,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Mail,
  User,
  Calendar,
  AlertTriangle,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ReminderStatus, ReminderType } from '@/types';

// Mock data
const mockReminders = [
  {
    id: 1,
    appointment: { 
      id: 1, 
      patient: 'María García López', 
      patient_email: 'maria@email.com',
      doctor: 'Dr. Juan Pérez',
      date: '2024-01-27',
      time: '10:00'
    },
    type: '24h' as ReminderType,
    recipient_type: 'patient' as const,
    scheduled_at: '2024-01-26T10:00:00',
    status: 'pending' as ReminderStatus,
    attempts: 0,
  },
  {
    id: 2,
    appointment: { 
      id: 1, 
      patient: 'María García López', 
      patient_email: 'maria@email.com',
      doctor: 'Dr. Juan Pérez',
      date: '2024-01-27',
      time: '10:00'
    },
    type: '2h' as ReminderType,
    recipient_type: 'patient' as const,
    scheduled_at: '2024-01-27T08:00:00',
    status: 'pending' as ReminderStatus,
    attempts: 0,
  },
  {
    id: 3,
    appointment: { 
      id: 2, 
      patient: 'Carlos Rodríguez', 
      patient_email: 'carlos@email.com',
      doctor: 'Dra. Ana Martínez',
      date: '2024-01-26',
      time: '14:00'
    },
    type: '24h' as ReminderType,
    recipient_type: 'patient' as const,
    scheduled_at: '2024-01-25T14:00:00',
    status: 'sent' as ReminderStatus,
    sent_at: '2024-01-25T14:01:23',
    attempts: 1,
  },
  {
    id: 4,
    appointment: { 
      id: 2, 
      patient: 'Carlos Rodríguez', 
      patient_email: 'carlos@email.com',
      doctor: 'Dra. Ana Martínez',
      date: '2024-01-26',
      time: '14:00'
    },
    type: '2h' as ReminderType,
    recipient_type: 'patient' as const,
    scheduled_at: '2024-01-26T12:00:00',
    status: 'sent' as ReminderStatus,
    sent_at: '2024-01-26T12:00:45',
    attempts: 1,
  },
  {
    id: 5,
    appointment: { 
      id: 3, 
      patient: 'Laura Hernández', 
      patient_email: 'laura@email.com',
      doctor: 'Dr. Carlos López',
      date: '2024-01-26',
      time: '09:00'
    },
    type: '24h' as ReminderType,
    recipient_type: 'patient' as const,
    scheduled_at: '2024-01-25T09:00:00',
    status: 'failed' as ReminderStatus,
    attempts: 3,
    last_error: 'Email address not found',
  },
];

const statusConfig: Record<ReminderStatus, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: 'Pendiente', icon: Clock, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  sent: { label: 'Enviado', icon: CheckCircle, className: 'bg-green-100 text-green-800 border-green-200' },
  failed: { label: 'Fallido', icon: XCircle, className: 'bg-red-100 text-red-800 border-red-200' },
};

const typeLabels: Record<ReminderType, string> = {
  '24h': '24 horas antes',
  '2h': '2 horas antes',
};

export default function RemindersList() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRetrying, setIsRetrying] = useState<number | null>(null);

  const filteredReminders = mockReminders.filter((reminder) => {
    const matchesSearch = 
      reminder.appointment.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reminder.appointment.patient_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reminder.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: mockReminders.filter(r => r.status === 'pending').length,
    sent: mockReminders.filter(r => r.status === 'sent').length,
    failed: mockReminders.filter(r => r.status === 'failed').length,
  };

  const handleRetry = async (reminderId: number) => {
    setIsRetrying(reminderId);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Reintento programado',
      description: 'El recordatorio se enviará en breve.',
    });
    
    setIsRetrying(null);
  };

  const handleSendNow = async (reminderId: number) => {
    setIsRetrying(reminderId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Recordatorio enviado',
      description: 'El recordatorio se ha enviado correctamente.',
    });
    
    setIsRetrying(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Recordatorios</h1>
        <p className="page-description">
          Gestión de recordatorios de citas por correo
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">{stats.sent}</p>
                <p className="text-xs text-muted-foreground">Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">{stats.failed}</p>
                <p className="text-xs text-muted-foreground">Fallidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="sent">Enviados</SelectItem>
            <SelectItem value="failed">Fallidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="data-table-container overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead className="hidden md:table-cell">Cita</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden lg:table-cell">Programado</TableHead>
              <TableHead className="w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReminders.map((reminder) => {
              const StatusIcon = statusConfig[reminder.status].icon;
              return (
                <TableRow key={reminder.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{reminder.appointment.patient}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {reminder.appointment.patient_email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm">
                      <p className="font-medium">{reminder.appointment.doctor}</p>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {reminder.appointment.date} {reminder.appointment.time}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      <Bell className="h-3 w-3" />
                      {typeLabels[reminder.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`gap-1 ${statusConfig[reminder.status].className}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[reminder.status].label}
                    </Badge>
                    {reminder.status === 'failed' && reminder.last_error && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {reminder.last_error}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(reminder.scheduled_at).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {reminder.sent_at && (
                      <p className="text-xs text-green-600 mt-0.5">
                        Enviado: {new Date(reminder.sent_at).toLocaleTimeString('es-MX', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {reminder.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleSendNow(reminder.id)}
                          disabled={isRetrying === reminder.id}
                        >
                          <Send className="h-3 w-3" />
                          <span className="hidden sm:inline">Enviar</span>
                        </Button>
                      )}
                      {reminder.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleRetry(reminder.id)}
                          disabled={isRetrying === reminder.id}
                        >
                          <RefreshCw className={`h-3 w-3 ${isRetrying === reminder.id ? 'animate-spin' : ''}`} />
                          <span className="hidden sm:inline">Reintentar</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredReminders.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No hay recordatorios</h3>
          <p className="text-muted-foreground">
            No se encontraron recordatorios con los filtros seleccionados.
          </p>
        </div>
      )}
    </div>
  );
}
