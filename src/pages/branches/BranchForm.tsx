import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const branchSchema = z.object({
    code: z.string().min(2, 'El código debe tener al menos 2 caracteres').max(10),
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    address: z.string().min(5, 'La dirección es requerida'),
    phone: z.string().optional(),
    email: z.string().email('Ingresa un correo válido').optional().or(z.literal('')),
    opens_at: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:mm'),
    closes_at: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:mm'),
    is_active: z.boolean().default(true),
});

type BranchFormValues = z.infer<typeof branchSchema>;

export default function BranchForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const isEditing = !!id;

    const { data: branch, isLoading: isLoadingBranch } = useQuery({
        queryKey: ['branches', id],
        queryFn: async () => {
            const response = await api.get(`/branches/${id}`);
            return response.data;
        },
        enabled: isEditing,
    });

    const form = useForm<BranchFormValues>({
        resolver: zodResolver(branchSchema),
        defaultValues: {
            code: '',
            name: '',
            address: '',
            phone: '',
            email: '',
            opens_at: '08:00',
            closes_at: '20:00',
            is_active: true,
        },
        values: branch ? {
            code: branch.code,
            name: branch.name,
            address: branch.address,
            phone: branch.phone || '',
            email: branch.email || '',
            opens_at: branch.opens_at?.substring(0, 5) || '08:00',
            closes_at: branch.closes_at?.substring(0, 5) || '20:00',
            is_active: branch.is_active,
        } : undefined,
    });

    const mutation = useMutation({
        mutationFn: async (values: BranchFormValues) => {
            if (isEditing) {
                return api.put(`/branches/${id}`, values);
            }
            return api.post('/branches', values);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            toast({
                title: isEditing ? 'Sede actualizada' : 'Sede creada',
                description: `La sede ha sido ${isEditing ? 'actualizada' : 'creada'} correctamente.`,
            });
            navigate('/branches');
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.response?.data?.message || 'Ocurrió un error al procesar la solicitud.',
            });
        },
    });

    const onSubmit = (data: BranchFormValues) => {
        mutation.mutate(data);
    };

    if (isEditing && isLoadingBranch) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/branches')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{isEditing ? 'Editar Sede' : 'Nueva Sede'}</h1>
                    <p className="text-muted-foreground">
                        {isEditing ? 'Actualiza la información de la sucursal' : 'Ingresa los datos para la nueva sucursal'}
                    </p>
                </div>
            </div>

            <div className="max-w-2xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre de la sede</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Sucursal Centro" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Código / Siglas</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. CTR" {...field} />
                                        </FormControl>
                                        <FormDescription>Identificador corto único</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Dirección completa</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Calle, zona, ciudad..." {...field} />
                                        </FormControl>
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
                                            <Input placeholder="Ej. 2200-0000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo electrónico</FormLabel>
                                        <FormControl>
                                            <Input placeholder="sucursal@clinica.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="opens_at"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hora de apertura</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="closes_at"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hora de cierre</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 md:col-span-2">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Estado de la sede</FormLabel>
                                            <FormDescription>
                                                Las sedes inactivas no aparecerán en la agenda ni en los selectores.
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

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/branches')}
                                disabled={mutation.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" className="gap-2" disabled={mutation.isPending}>
                                {mutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {isEditing ? 'Guardar cambios' : 'Crear sede'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
