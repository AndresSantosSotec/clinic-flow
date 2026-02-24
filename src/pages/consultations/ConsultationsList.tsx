import { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Plus,
    Calendar,
    User,
    MoreHorizontal,
    Loader2,
    Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Can } from '@/components/auth/Can';
import { AddConsultationDialog } from '@/components/consultations/AddConsultationDialog';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ConsultationsList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('new') === 'true') {
            setAddDialogOpen(true);
            params.delete('new');
            const search = params.toString();
            navigate({
                pathname: location.pathname,
                search: search ? `?${search}` : '',
            }, { replace: true });
        }
    }, [location, navigate]);

    const { data: consultationsResponse, isLoading, error } = useQuery({
        queryKey: ['consultations', page],
        queryFn: async () => {
            const response = await api.get('/consultations', { params: { page } });
            return response.data;
        },
    });

    const consultations = consultationsResponse?.data || [];
    const totalPages = consultationsResponse?.last_page || 1;

    const filteredConsultations = consultations.filter(
        (c: any) =>
            c.patient?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.patient?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                Error al cargar las consultas.
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="page-header mb-0">
                    <h1 className="page-title">Consultas Médicas</h1>
                    <p className="page-description">
                        Historial clínico y registro de atenciones
                    </p>
                </div>
                <Can permission="create-appointments">
                    {/* Using create-appointments as proxy since create-consultations perm doesn't exist yet but doctors have it */}
                    <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Nueva Consulta
                    </Button>
                </Can>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por paciente, diagnóstico..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Paciente</TableHead>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Diagnóstico</TableHead>
                            <TableHead>Motivo</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredConsultations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No se encontraron consultas registradas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredConsultations.map((consultation: any) => (
                                <TableRow key={consultation.id} className="group">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            {new Date(consultation.created_at).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">
                                            {consultation.patient?.first_name} {consultation.patient?.last_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Stethoscope className="h-4 w-4 text-primary" />
                                            Dr. {consultation.doctor?.last_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[200px] truncate" title={consultation.diagnosis}>
                                            {consultation.diagnosis}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[150px] truncate text-muted-foreground">
                                            {consultation.reason || '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Ver detalles completos</DropdownMenuItem>
                                                <DropdownMenuItem>Imprimir receta</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <PaginationItem key={p}>
                                <PaginationLink
                                    isActive={page === p}
                                    onClick={() => setPage(p)}
                                    className="cursor-pointer"
                                >
                                    {p}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            <AddConsultationDialog
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
            />
        </div>
    );
}
