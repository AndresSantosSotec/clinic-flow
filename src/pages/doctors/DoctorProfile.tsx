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
  ChevronRight
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
import { AppointmentStatus } from '@/types';

// Mock doctor data
const mockDoctor = {
  id: 1,
  name: 'Dr. Juan Carlos Pérez González',
  email: 'dr.perez@clinica.com',
  phone: '+52 55 1234 5678',
  role: 'doctor',
  specialty: 'Cardiología',
  license_number: 'CONACEM-12345',
  is_active: true,
  bio: 'Cardiólogo certificado con más de 15 años de experiencia en diagnóstico y tratamiento de enfermedades cardiovasculares.',
  education: [
    { degree: 'Médico Cirujano', institution: 'UNAM', year: '2005' },
    { degree: 'Especialidad en Cardiología', institution: 'Instituto Nacional de Cardiología', year: '2009' },
  ],
  branches: [
    { id: 1, code: 'CTR', name: 'Clínica Centro' },
    { id: 2, code: 'SUR', name: 'Clínica Sur' },
  ],
  schedule: {
    monday: { start: '09:00', end: '17:00' },
    tuesday: { start: '09:00', end: '17:00' },
    wednesday: { start: '09:00', end: '14:00' },
    thursday: { start: '09:00', end: '17:00' },
    friday: { start: '09:00', end: '15:00' },
  },
  stats: {
    total_patients: 342,
    appointments_today: 8,
    appointments_week: 32,
    completed_month: 98,
  },
  created_at: '2022-03-15',
};

const mockAppointments = [
  { 
    id: 1, 
    patient: 'María García López', 
    time: '09:00', 
    duration: 30,
    reason: 'Control de presión arterial',
    status: 'confirmed' as AppointmentStatus,
  },
  { 
    id: 2, 
    patient: 'Carlos Rodríguez', 
    time: '09:30', 
    duration: 45,
    reason: 'Ecocardiograma',
    status: 'scheduled' as AppointmentStatus,
  },
  { 
    id: 3, 
    patient: 'Ana Martínez', 
    time: '10:30', 
    duration: 30,
    reason: 'Primera consulta',
    status: 'confirmed' as AppointmentStatus,
  },
  { 
    id: 4, 
    patient: 'Roberto Sánchez', 
    time: '11:00', 
    duration: 30,
    reason: 'Seguimiento post-operatorio',
    status: 'completed' as AppointmentStatus,
  },
];

const dayLabels: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const statusConfig: Record<AppointmentStatus, { label: string; variant: string }> = {
  scheduled: { label: 'Agendada', variant: 'scheduled' },
  confirmed: { label: 'Confirmada', variant: 'confirmed' },
  completed: { label: 'Completada', variant: 'completed' },
  cancelled: { label: 'Cancelada', variant: 'cancelled' },
  no_show: { label: 'No asistió', variant: 'noshow' },
};

export default function DoctorProfile() {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const doctor = mockDoctor;
  const initials = doctor.name
    .split(' ')
    .filter((_, i) => i === 0 || i === 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Button variant="ghost" asChild className="gap-2 -ml-2">
        <Link to="/users">
          <ArrowLeft className="h-4 w-4" />
          Volver a usuarios
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
                  <h1 className="text-xl md:text-2xl font-bold">{doctor.name}</h1>
                  <Badge variant={doctor.is_active ? 'default' : 'secondary'}>
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
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {doctor.phone}
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-sm">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>Cédula: {doctor.license_number}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="md:ml-auto flex gap-2">
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Ver historial de citas</DropdownMenuItem>
                  <DropdownMenuItem>Exportar información</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Desactivar cuenta</DropdownMenuItem>
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
              <p className="text-2xl md:text-3xl font-bold text-primary">{doctor.stats.total_patients}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Pacientes totales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{doctor.stats.appointments_today}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Citas hoy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{doctor.stats.appointments_week}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Citas semana</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{doctor.stats.completed_month}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Completadas mes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="schedule">Agenda del día</TabsTrigger>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="hours">Horarios</TabsTrigger>
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
                {mockAppointments.map((apt) => (
                  <div 
                    key={apt.id}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 text-center w-16">
                      <p className="font-semibold text-primary">{apt.time}</p>
                      <p className="text-xs text-muted-foreground">{apt.duration} min</p>
                    </div>
                    <Separator orientation="vertical" className="h-10" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{apt.patient}</p>
                      <p className="text-sm text-muted-foreground truncate">{apt.reason}</p>
                    </div>
                    <Badge className={`status-badge status-${statusConfig[apt.status].variant}`}>
                      {statusConfig[apt.status].label}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Biografía
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{doctor.bio}</p>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Formación académica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {doctor.education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-primary pl-3">
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-sm text-muted-foreground">{edu.institution} • {edu.year}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Branches */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Sedes asignadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {doctor.branches.map((branch) => (
                    <Badge key={branch.id} variant="outline" className="px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {branch.code}
                        </div>
                        {branch.name}
                      </div>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horario de consulta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {Object.entries(doctor.schedule).map(([day, hours]) => (
                  <div 
                    key={day}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <span className="font-medium">{dayLabels[day]}</span>
                    <span className="text-muted-foreground">
                      {hours.start} - {hours.end}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="font-medium text-muted-foreground">Sábado</span>
                  <span className="text-muted-foreground">No disponible</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="font-medium text-muted-foreground">Domingo</span>
                  <span className="text-muted-foreground">No disponible</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
