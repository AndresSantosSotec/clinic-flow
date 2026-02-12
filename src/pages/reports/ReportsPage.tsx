import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart3,
    Users,
    Calendar,
    Activity,
    UserPlus,
    TrendingUp,
    Loader2,
    FileSpreadsheet,
    FileText,
    Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ReportsPage() {
    const [period, setPeriod] = useState('month');
    const [downloading, setDownloading] = useState<string | null>(null);
    const { toast } = useToast();

    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['reports', 'dashboard', period],
        queryFn: async () => {
            const response = await api.get('/reports/dashboard');
            return response.data;
        },
    });

    const { data: topDoctors } = useQuery({
        queryKey: ['reports', 'doctors'],
        queryFn: async () => {
            const response = await api.get('/reports/doctors');
            return response.data;
        },
    });

    const handleDownload = async (format: 'excel' | 'pdf') => {
        try {
            setDownloading(format);
            const response = await api.get(`/reports/export/${format}`, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = format === 'excel' ? 'reporte_citas.xlsx' : 'reporte_citas.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: 'Descarga completada',
                description: `El reporte en ${format === 'excel' ? 'Excel' : 'PDF'} se ha descargado.`,
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo descargar el reporte.',
            });
        } finally {
            setDownloading(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const stats = dashboardData || { total_new_patients: 0, total_appointments: 0, appointments_by_status: [] };
    const statusDist = stats.appointments_by_status || [];

    const statusLabels: Record<string, string> = {
        scheduled: 'Programadas',
        confirmed: 'Confirmadas',
        completed: 'Completadas',
        cancelled: 'Canceladas',
    };

    const statusColors: Record<string, string> = {
        scheduled: 'bg-blue-500',
        confirmed: 'bg-green-500',
        completed: 'bg-primary',
        cancelled: 'bg-red-500',
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="page-header mb-0">
                    <h1 className="page-title">Reportes y Estadísticas</h1>
                    <p className="page-description">
                        Resumen de actividad de la clínica
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={downloading === 'excel'}
                        onClick={() => handleDownload('excel')}
                    >
                        {downloading === 'excel' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <FileSpreadsheet className="h-4 w-4" />
                        )}
                        Excel
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={downloading === 'pdf'}
                        onClick={() => handleDownload('pdf')}
                    >
                        {downloading === 'pdf' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <FileText className="h-4 w-4" />
                        )}
                        PDF
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Resumen General</TabsTrigger>
                    <TabsTrigger value="doctors">Rendimiento Médico</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Citas Totales
                                </CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_appointments}</div>
                                <p className="text-xs text-muted-foreground">
                                    En el periodo seleccionado
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Nuevos Pacientes
                                </CardTitle>
                                <UserPlus className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_new_patients}</div>
                                <p className="text-xs text-muted-foreground">
                                    Pacientes registrados
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Cancelaciones</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statusDist.find((s: any) => s.status === 'cancelled')?.total || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Citas canceladas
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Completadas
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statusDist.find((s: any) => s.status === 'completed')?.total || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Atenciones finalizadas
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Estado de Citas</CardTitle>
                                <CardDescription>
                                    Distribución de citas por estado en el periodo
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="space-y-4 mt-2">
                                    {statusDist.map((item: any) => (
                                        <div key={item.status} className="flex items-center gap-3">
                                            <div className="w-28 font-medium capitalize text-sm">
                                                {statusLabels[item.status] || item.status}
                                            </div>
                                            <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${statusColors[item.status] || 'bg-primary'}`}
                                                    style={{ width: `${stats.total_appointments > 0 ? (item.total / stats.total_appointments) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <div className="w-12 text-right text-sm font-semibold">{item.total}</div>
                                        </div>
                                    ))}
                                    {statusDist.length === 0 && <span className="text-muted-foreground text-sm pl-4">No hay datos suficientes</span>}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Top Médicos</CardTitle>
                                <CardDescription>
                                    Con más atenciones completadas
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {topDoctors?.length > 0 ? topDoctors.map((doctor: any) => (
                                        <div key={doctor.id} className="flex items-center">
                                            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-muted">
                                                <Users className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{doctor.first_name} {doctor.last_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {doctor.specialty}
                                                </p>
                                            </div>
                                            <div className="ml-auto font-medium">
                                                {doctor.appointments_count}
                                            </div>
                                        </div>
                                    )) : (
                                        <span className="text-muted-foreground text-sm">Sin datos aún</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="doctors" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Desempeño por Médico</CardTitle>
                            <CardDescription>Listado detallado de atenciones</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Médico</TableHead>
                                        <TableHead>Especialidad</TableHead>
                                        <TableHead>Citas Atendidas</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topDoctors?.map((doctor: any) => (
                                        <TableRow key={doctor.id}>
                                            <TableCell className="font-medium">{doctor.first_name} {doctor.last_name}</TableCell>
                                            <TableCell>{doctor.specialty}</TableCell>
                                            <TableCell>{doctor.appointments_count}</TableCell>
                                        </TableRow>
                                    ))}
                                    {(!topDoctors || topDoctors.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                                No hay datos de médicos en este periodo
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
