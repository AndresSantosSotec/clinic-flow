import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DollarSign, User, CreditCard, Banknote, ArrowRightLeft, Loader2 } from 'lucide-react';
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

const paymentSchema = z.object({
  appointment_id: z.string().min(1, 'Selecciona una cita'),
  amount: z.string().min(1, 'El monto es requerido').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'El monto debe ser mayor a 0'
  ),
  payment_method: z.enum(['cash', 'credit_card', 'debit_card', 'transfer', 'insurance'], {
    required_error: 'Selecciona un método de pago',
  }),
  transaction_id: z.string().optional(),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface RegisterPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const paymentMethods = [
  { value: 'cash', label: 'Efectivo', icon: Banknote },
  { value: 'credit_card', label: 'T. Crédito', icon: CreditCard },
  { value: 'transfer', label: 'Transf.', icon: ArrowRightLeft },
];

export function RegisterPaymentDialog({ open, onOpenChange }: RegisterPaymentDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointmentsResponse } = useQuery({
    queryKey: ['appointments', 'pending_payment'],
    queryFn: async () => {
      // Filtrar citas sin pago y obtener un número razonable para el select
      const response = await api.get('/appointments', {
        params: {
          unpaid_only: true,
          per_page: 100,
          status: 'completed' // Asumimos que solo se pagan citas completadas, o quitar si se permite prepago
        }
      });
      return response.data;
    },
    enabled: open,
  });

  const appointments = appointmentsResponse?.data || [];

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      appointment_id: '',
      amount: '',
      payment_method: undefined,
      transaction_id: '',
      notes: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: PaymentFormData) => {
      const selectedApt = appointments.find((a: any) => a.id.toString() === values.appointment_id);

      const payload = {
        appointment_id: parseInt(values.appointment_id),
        patient_id: selectedApt?.patient_id,
        amount: parseFloat(values.amount),
        payment_method: values.payment_method,
        transaction_id: values.transaction_id,
        notes: values.notes,
        payment_date: new Date().toISOString().split('T')[0],
        status: 'completed'
      };

      return api.post('/payments', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Pago registrado',
        description: 'La transacción se ha guardado correctamente.',
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo registrar el pago.',
      });
    }
  });

  const onSubmit = (data: PaymentFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Registrar pago
          </DialogTitle>
          <DialogDescription>
            Registra el pago de una consulta médica
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="appointment_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cita / Paciente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la cita pendiente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {appointments.length === 0 ? (
                        <SelectItem value="none" disabled>No hay citas pendientes de pago</SelectItem>
                      ) : (
                        appointments.map((apt: any) => (
                          <SelectItem key={apt.id} value={apt.id.toString()}>
                            <div className="flex flex-col text-left">
                              <span className="font-medium">{apt.patient?.first_name} {apt.patient?.last_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(apt.appointment_date).toLocaleDateString()} — {apt.doctor?.first_name}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto (GTQ)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="number" step="0.01" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de pago</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      const isSelected = field.value === method.value;
                      return (
                        <Button
                          key={method.value}
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          className="flex flex-col gap-1 h-auto py-2"
                          onClick={() => field.onChange(method.value)}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-[10px]">{method.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transaction_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID de Transacción / Referencia</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. REF123456" {...field} />
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
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Finalizar Cobro
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
