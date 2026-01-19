import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { AppointmentsList } from '@/components/dashboard/AppointmentsList';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { QuickActions } from '@/components/dashboard/QuickActions';

// Mock data - en producción vendría de la API
const mockAppointments = [
  {
    id: 1,
    patient: { full_name: 'María García López' },
    doctor: { name: 'Dr. Juan Pérez' },
    time_start: '09:00',
    time_end: '09:30',
    status: 'confirmed' as const,
  },
  {
    id: 2,
    patient: { full_name: 'Carlos Rodríguez' },
    doctor: { name: 'Dra. Ana Martínez' },
    time_start: '10:00',
    time_end: '10:45',
    status: 'scheduled' as const,
  },
  {
    id: 3,
    patient: { full_name: 'Laura Hernández' },
    doctor: { name: 'Dr. Juan Pérez' },
    time_start: '11:00',
    time_end: '11:30',
    status: 'completed' as const,
  },
  {
    id: 4,
    patient: { full_name: 'Roberto Sánchez' },
    doctor: { name: 'Dra. Ana Martínez' },
    time_start: '12:00',
    time_end: '12:30',
    status: 'no_show' as const,
  },
];

const mockRevenueData = [
  { date: 'Lun', revenue: 4500 },
  { date: 'Mar', revenue: 6200 },
  { date: 'Mié', revenue: 5800 },
  { date: 'Jue', revenue: 7100 },
  { date: 'Vie', revenue: 8500 },
  { date: 'Sáb', revenue: 3200 },
  { date: 'Dom', revenue: 0 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Resumen del día • Clínica Centro • {new Date().toLocaleDateString('es-MX', { 
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
          value={12}
          subtitle="4 pendientes de confirmar"
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Confirmadas"
          value={8}
          icon={CheckCircle2}
          variant="success"
          trend={{ value: 12, label: 'vs ayer' }}
        />
        <StatCard
          title="Completadas"
          value={5}
          icon={Clock}
          variant="default"
        />
        <StatCard
          title="No asistieron"
          value={1}
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      {/* Revenue stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Ingresos hoy"
          value="$4,500"
          icon={DollarSign}
          variant="success"
          trend={{ value: 8, label: 'vs ayer' }}
        />
        <StatCard
          title="Ingresos del mes"
          value="$128,450"
          icon={TrendingUp}
          variant="primary"
          trend={{ value: 15, label: 'vs mes anterior' }}
        />
        <StatCard
          title="Nuevos pacientes (mes)"
          value={24}
          icon={Users}
          variant="default"
          trend={{ value: 6, label: 'vs mes anterior' }}
        />
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Appointments list */}
        <div className="lg:col-span-2">
          <AppointmentsList appointments={mockAppointments} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>

      {/* Revenue chart */}
      <RevenueChart data={mockRevenueData} />
    </div>
  );
}
