import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Users,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { AppointmentsList } from '@/components/dashboard/AppointmentsList';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error al cargar los datos del dashboard.
      </div>
    );
  }

  const { stats, next_appointments, revenue_chart } = data;

  // Adapt appointments for the AppointmentsList component
  const dashboardAppointments = next_appointments.map((apt: any) => {
    const startDate = new Date(apt.appointment_date);
    const endDate = new Date(startDate.getTime() + (apt.duration || 30) * 60000);

    return {
      id: apt.id,
      patient: {
        full_name: `${apt.patient.first_name} ${apt.patient.last_name}`
      },
      doctor: {
        name: `Dr. ${apt.doctor.first_name} ${apt.doctor.last_name}`
      },
      time_start: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      time_end: endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: apt.status,
    };
  });

  const currencyFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Resumen del día • Todas las sedes • {new Date().toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Citas hoy"
          value={stats.appointments_today}
          subtitle={`${stats.pending_today} pendientes de inicio`}
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Confirmadas"
          value={stats.confirmed_today}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Completadas"
          value={stats.completed_today}
          icon={Clock}
          variant="default"
        />
        <StatCard
          title="No asistieron"
          value={stats.no_show_today}
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      {/* Revenue stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Ingresos hoy"
          value={currencyFormatter.format(stats.revenue_today)}
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Ingresos del mes"
          value={currencyFormatter.format(stats.revenue_month)}
          icon={TrendingUp}
          variant="primary"
          trend={{
            value: Math.abs(stats.revenue_trend),
            label: stats.revenue_trend >= 0 ? 'arriba del mes anterior' : 'debajo del mes anterior'
          }}
        />
        <StatCard
          title="Nuevos pacientes (mes)"
          value={stats.new_patients_month}
          icon={Users}
          variant="default"
          trend={{
            value: Math.abs(stats.patients_trend),
            label: stats.patients_trend >= 0 ? 'más que el mes pasado' : 'menos que el mes pasado'
          }}
        />
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Appointments list */}
        <div className="lg:col-span-2">
          <AppointmentsList appointments={dashboardAppointments} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>

      {/* Revenue chart */}
      <RevenueChart data={revenue_chart} />
    </div>
  );
}

