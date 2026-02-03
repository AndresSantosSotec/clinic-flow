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
  Send,
  Loader2
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
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: 'Pendiente', icon: Clock, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  sent: { label: 'Enviado', icon: CheckCircle, className: 'bg-green-100 text-green-800 border-green-200' },
  failed: { label: 'Fallido', icon: XCircle, className: 'bg-red-100 text-red-800 border-red-200' },
};

export default function RemindersList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: remindersResponse, isLoading, error } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const response = await api.get('/reminders');
      return response.data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.post(`/reminders/${id}/send`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast({
        title: 'Acción realizada',
        description: 'El recordatorio se ha procesado correctamente.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo enviar el recordatorio.',
      });
    }
  });

  const reminders = remindersResponse?.data || [];

  const filteredReminders = reminders.filter((reminder: any) => {
    const matchesSearch =
      reminder.appointment?.patient?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reminder.appointment?.patient?.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reminder.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error al cargar los recordatorios.
      </div>
    );
  }

  const stats = {
    pending: reminders.filter((r: any) => r.status === 'pending').length,
    sent: reminders.filter((r: any) => r.status === 'sent').length,
    failed: reminders.filter((r: any) => r.status === 'failed').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Recordatorios</h1>
        <p className="page-description">
          Gestión de recordatorios automáticos y manuales para pacientes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.pending}</p>
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
                <p className="text-xl font-bold">{stats.sent}</p>
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
                <p className="text-xl font-bold">{stats.failed}</p>
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
            placeholder="Buscar por paciente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="sent">Enviados</SelectItem>
            <SelectItem value="failed">Fallidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Cita</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Programado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReminders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No se encontraron recordatorios.
                </TableCell>
              </TableRow>
            ) : (
              filteredReminders.map((reminder: any) => {
                const config = statusConfig[reminder.status] || statusConfig.pending;
                const StatusIcon = config.icon;
                return (
                  <TableRow key={reminder.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {reminder.appointment?.patient?.first_name} {reminder.appointment?.patient?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {reminder.appointment?.patient?.email || 'Sin correo'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">Dr. {reminder.appointment?.doctor?.first_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(reminder.appointment?.appointment_date).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`gap-1 ${config.className}`}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(reminder.scheduled_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendMutation.mutate(reminder.id)}
                        disabled={sendMutation.isPending || reminder.status === 'sent'}
                      >
                        {sendMutation.isPending && sendMutation.variables === reminder.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Send className="h-3 w-3 mr-1" />
                        )}
                        Reenviar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
