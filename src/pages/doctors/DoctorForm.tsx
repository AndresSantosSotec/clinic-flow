import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const SPECIALTIES = [
    'Medicina General',
    'Pediatría',
    'Cardiología',
    'Dermatología',
    'Ginecología',
    'Oftalmología',
    'Traumatología',
    'Neurología',
    'Psiquiatría',
    'Urología',
    'Endocrinología',
    'Gastroenterología',
    'Neumología',
    'Otorrinolaringología',
    'Oncología',
    'Cirugía General',
    'Medicina Interna',
    'Anestesiología',
    'Radiología',
    'Odontología',
];

const doctorSchema = z.object({
    first_name: z.string().min(1, 'El nombre es requerido'),
    last_name: z.string().min(1, 'Los apellidos son requeridos'),
    specialty: z.string().min(1, 'La especialidad es requerida'),
    license_number: z.string().min(1, 'El número de colegiado es requerido'),
    phone: z.string().nullable().optional(),
    email: z.string().email('Correo electrónico inválido'),
    branch_id: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

export default function DoctorForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const isEditing = !!id;

    const { data: doctor, isLoading: isLoadingDoctor } = useQuery({
        queryKey: ['doctors', id],
        queryFn: async () => {
            const response = await api.get(`/doctors/${id}`);
            return response.data;
        },
        enabled: isEditing,
    });

    const { data: branchesData } = useQuery({
        queryKey: ['branches'],
        queryFn: async () => {
            const response = await api.get('/branches');
            return response.data;
        },
    });

    const branches = branchesData?.data || [];

    const form = useForm<DoctorFormValues>({
        resolver: zodResolver(doctorSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            specialty: '',
            license_number: '',
            phone: '',
            email: '',
            branch_id: '',
            is_active: true,
        },
        values: doctor ? {
            first_name: doctor.first_name,
            last_name: doctor.last_name,
            specialty: doctor.specialty,
            license_number: doctor.license_number,
            phone: doctor.phone || '',
            email: doctor.email,
            branch_id: doctor.branch_id?.toString() || '',
            is_active: doctor.is_active,
        } : undefined,
    });

    const mutation = useMutation({
        mutationFn: async (values: DoctorFormValues) => {
            const payload = {
                ...values,
                branch_id: (!values.branch_id || values.branch_id === 'none') ? null : parseInt(values.branch_id as string),
            };
            if (isEditing) {
                return api.put(`/doctors/${id}`, payload);
            }
            return api.post('/doctors', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            toast({
                title: isEditing ? 'Médico actualizado' : 'Médico registrado',
                description: isEditing
                    ? 'La información ha sido guardada correctamente.'
                    : 'El médico ha sido creado junto con su cuenta de usuario.',
            });
            navigate('/doctors');
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.response?.data?.message || 'Ocurrió un error al guardar.',
            });
        },
    });

    const onSubmit = (data: DoctorFormValues) => {
        mutation.mutate(data);
    };

    if (isEditing && isLoadingDoctor) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/doctors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="page-header mb-0">
                    <h1 className="page-title">{isEditing ? 'Editar médico' : 'Nuevo médico'}</h1>
                    <p className="page-description">
                        {isEditing ? 'Actualiza los datos del profesional' : 'Registra un nuevo profesional en el sistema'}
                    </p>
                </div>
            </div>

            {/* User account info when editing */}
            {isEditing && doctor && (
                <Card className={doctor.user ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30' : 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30'}>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                            {doctor.user ? (
                                <>
                                    <UserCheck className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium">Cuenta de usuario vinculada</p>
                                        <p className="text-xs text-muted-foreground">
                                            Usuario: {doctor.user.email} — Puede iniciar sesión en el sistema
                                        </p>
                                    </div>
                                    <div className="ml-auto">
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                            Activo
                                        </Badge>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <UserX className="h-5 w-5 text-amber-600" />
                                    <div>
                                        <p className="text-sm font-medium">Sin cuenta de usuario</p>
                                        <p className="text-xs text-muted-foreground">
                                            Este médico no tiene acceso al sistema
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {!isEditing && (
                <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                            <UserCheck className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium">Cuenta de usuario automática</p>
                                <p className="text-xs text-muted-foreground">
                                    Al crear el médico, se generará automáticamente una cuenta de usuario con el correo proporcionado
                                    y la contraseña temporal <code className="bg-muted px-1 py-0.5 rounded text-xs">password123</code>.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Información personal y profesional</CardTitle>
                            <CardDescription>Datos básicos del médico y su especialidad</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre(s) *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Carlos" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="last_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Apellidos *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ramírez" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="specialty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Especialidad *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar especialidad" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {SPECIALTIES.map((spec) => (
                                                        <SelectItem key={spec} value={spec}>
                                                            {spec}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="license_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de Colegiado / Licencia *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="MED-12345" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Contacto y asignación</CardTitle>
                            <CardDescription>Información de contacto y ubicación del médico</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Correo electrónico *</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="doctor@medicapp.com" {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                {!isEditing && 'Se usará para crear la cuenta de usuario del médico.'}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Teléfono</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+502 5544-3322" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="branch_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sede asignada</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar sede" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">Sin sede (flotante)</SelectItem>
                                                    {branches.map((branch: any) => (
                                                        <SelectItem key={branch.id} value={branch.id.toString()}>
                                                            {branch.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Estado activo</FormLabel>
                                                <FormDescription className="text-xs">
                                                    Permitir que este médico reciba citas
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" type="button" asChild disabled={mutation.isPending}>
                            <Link to="/doctors">Cancelar</Link>
                        </Button>
                        <Button type="submit" className="gap-2" disabled={mutation.isPending}>
                            {mutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isEditing ? 'Guardar cambios' : 'Registrar médico'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
