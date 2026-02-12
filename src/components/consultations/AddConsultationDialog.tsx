import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

const consultationSchema = z.object({
    appointment_id: z.string().min(1, 'Selecciona una cita'),
    diagnosis: z.string().min(1, 'El diagnóstico es requerido'),
    reason: z.string().optional(),
    notes: z.string().optional(),
});

type ConsultationFormValues = z.infer<typeof consultationSchema>;

interface AddConsultationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddConsultationDialog({ open, onOpenChange }: AddConsultationDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: appointmentsResponse } = useQuery({
        queryKey: ['appointments', 'pending_consultation'],
        queryFn: async () => {
            const response = await api.get('/appointments', {
                params: {
                    status: 'confirmed', // Only confirmed appointments can be started
                    per_page: 100
                }
            });
            return response.data;
        },
        enabled: open,
    });

    const appointments = appointmentsResponse?.data || [];

    const form = useForm<ConsultationFormValues>({
        resolver: zodResolver(consultationSchema),
        defaultValues: {
            appointment_id: '',
            diagnosis: '',
            reason: '',
            notes: '',
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: ConsultationFormValues) => {
            const payload = {
                ...values,
                appointment_id: parseInt(values.appointment_id),
            };
            return api.post('/consultations', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consultations'] });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            toast({
                title: 'Consulta registrada',
                description: 'La consulta médica ha sido guardada exitosamente.',
            });
            onOpenChange(false);
            form.reset();
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.response?.data?.message || 'No se pudo registrar la consulta.',
            });
        }
    });

    function onSubmit(data: ConsultationFormValues) {
        mutation.mutate(data);
    }

    // Auto-fill reason/notes if appointment is selected (optional enhancement)
    const handleAppointmentChange = (value: string) => {
        form.setValue('appointment_id', value);
        const apt = appointments.find((a: any) => a.id.toString() === value);
        if (apt) {
            if (apt.reason) form.setValue('reason', apt.reason);
            if (apt.notes) form.setValue('notes', apt.notes);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Nueva Consulta Médica
                    </DialogTitle>
                    <DialogDescription>
                        Registra los detalles clínicos de la consulta.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="appointment_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cita Confirmada</FormLabel>
                                    <Select onValueChange={handleAppointmentChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona la cita del paciente" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {appointments.length === 0 ? (
                                                <SelectItem value="none" disabled>No hay citas confirmadas disponibles</SelectItem>
                                            ) : (
                                                appointments.map((apt: any) => (
                                                    <SelectItem key={apt.id} value={apt.id.toString()}>
                                                        <div className="flex flex-col text-left">
                                                            <span className="font-medium">{apt.patient?.first_name} {apt.patient?.last_name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(apt.appointment_date).toLocaleString()} — Dr. {apt.doctor?.last_name}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="diagnosis"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Diagnóstico *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Diagnóstico principal y secundario..."
                                            className="resize-none min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Motivo de Consulta</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Dolor, fiebre, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notas Adicionales</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Observaciones..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Consulta
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
