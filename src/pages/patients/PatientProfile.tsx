import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    Edit,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Clock,
    History,
    FileText,
    User,
    Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';

export default function PatientProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: patient, isLoading, error } = useQuery({
        queryKey: ['patients', id],
        queryFn: async () => {
            const response = await api.get(`/patients/${id}`);
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="p-8 text-center text-destructive">
                Error al cargar el perfil del paciente.
            </div>
        );
    }

    const initials = `${patient.first_name[0]}${patient.last_name[0]}`;
    const birthDate = new Date(patient.date_of_birth);
    const age = new Date().getFullYear() - birthDate.getFullYear();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Navigation */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">Resumen del Paciente</h1>
                </div>
                <div className="flex gap-2">
                    <Button asChild className="gap-2">
                        <Link to={`/appointments/new?patient=${id}`}>
                            <Calendar className="h-4 w-4" />
                            Agendar cita
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="gap-2">
                        <Link to={`/patients/${id}/edit`}>
                            <Edit className="h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Card */}
                <Card className="lg:col-span-1 border-primary/10">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <Avatar className="h-24 w-24 ring-4 ring-primary/5">
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                    {initials.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-xl">{patient.first_name} {patient.last_name}</CardTitle>
                                <p className="text-muted-foreground">{patient.gender} • {age} años</p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                                {patient.blood_type && (
                                    <Badge variant="secondary" className="gap-1">
                                        <Heart className="h-3 w-3 text-destructive fill-destructive" />
                                        {patient.blood_type}
                                    </Badge>
                                )}
                                {patient.allergies && (
                                    <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                                        Alergias
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 space-y-4 border-t pt-6">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium">{patient.phone}</p>
                                    <p className="text-xs text-muted-foreground">Teléfono</p>
                                </div>
                            </div>

                            {patient.email && (
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-medium truncate">{patient.email}</p>
                                        <p className="text-xs text-muted-foreground">Correo electrónico</p>
                                    </div>
                                </div>
                            )}

                            {patient.address && (
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{patient.address}</p>
                                        <p className="text-xs text-muted-foreground">Dirección</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 text-sm">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium">{birthDate.toLocaleDateString('es-MX', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}</p>
                                    <p className="text-xs text-muted-foreground">Nacimiento</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details & History */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="appointments" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="appointments" className="gap-2">
                                <Clock className="h-4 w-4" />
                                Citas
                            </TabsTrigger>
                            <TabsTrigger value="history" className="gap-2">
                                <History className="h-4 w-4" />
                                Historial
                            </TabsTrigger>
                            <TabsTrigger value="medical" className="gap-2">
                                <FileText className="h-4 w-4" />
                                Médico
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="appointments" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Próximas Citas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {patient.appointments?.length > 0 ? (
                                        <div className="space-y-4">
                                            {patient.appointments.map((appt: any) => (
                                                <div key={appt.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                            {new Date(appt.appointment_date).getDate()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">Dr. {appt.doctor?.first_name} {appt.doctor?.last_name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(appt.appointment_date).toLocaleDateString('es-MX', {
                                                                    weekday: 'long',
                                                                    day: 'numeric',
                                                                    month: 'short'
                                                                })} • {new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            appt.status === 'completed' ? 'default' :
                                                                appt.status === 'confirmed' ? 'secondary' :
                                                                    appt.status === 'cancelled' ? 'destructive' : 'outline'
                                                        }
                                                    >
                                                        {appt.status === 'scheduled' ? 'Agendada' :
                                                            appt.status === 'confirmed' ? 'Confirmada' :
                                                                appt.status === 'completed' ? 'Completada' :
                                                                    appt.status === 'cancelled' ? 'Cancelada' : appt.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                            <p>No hay citas programadas</p>
                                            <Button asChild variant="link" className="mt-2">
                                                <Link to={`/appointments/new?patient=${id}`}>Agendar nueva cita</Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Historial de Consultas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8 text-muted-foreground">
                                        <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p>No se encontraron registros anteriores</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="medical">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Información Clínica</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="font-medium mb-2 flex items-center gap-2">
                                            <Badge variant="destructive" className="h-2 w-2 rounded-full p-0" />
                                            Alergias
                                        </h3>
                                        <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md min-h-[60px]">
                                            {patient.allergies || 'Ninguna registrada'}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-medium mb-2 flex items-center gap-2 text-primary">
                                            <FileText className="h-4 w-4" />
                                            Antecedentes / Notas
                                        </h3>
                                        <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md min-h-[100px] whitespace-pre-wrap">
                                            {patient.medical_history || 'Sin antecedentes registrados'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
