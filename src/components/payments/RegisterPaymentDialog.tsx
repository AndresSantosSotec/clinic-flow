import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DollarSign, User, CreditCard, Banknote, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { PaymentMethod } from '@/types';

const paymentSchema = z.object({
  appointment_id: z.string().min(1, 'Selecciona una cita'),
  amount: z.string().min(1, 'El monto es requerido').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'El monto debe ser mayor a 0'
  ),
  payment_method: z.enum(['cash', 'card', 'transfer'], {
    required_error: 'Selecciona un método de pago',
  }),
  reference: z.string().optional(),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface RegisterPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockAppointments = [
  { id: '1', patient: 'María García López', doctor: 'Dr. Juan Pérez', date: '2024-01-26', time: '10:00' },
  { id: '2', patient: 'Carlos Rodríguez', doctor: 'Dra. Ana Martínez', date: '2024-01-26', time: '11:00' },
  { id: '3', patient: 'Laura Hernández', doctor: 'Dr. Carlos López', date: '2024-01-26', time: '12:00' },
];

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { value: 'cash', label: 'Efectivo', icon: Banknote },
  { value: 'card', label: 'Tarjeta', icon: CreditCard },
  { value: 'transfer', label: 'Transferencia', icon: ArrowRightLeft },
];

export function RegisterPaymentDialog({ open, onOpenChange }: RegisterPaymentDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      appointment_id: '',
      amount: '',
      payment_method: undefined,
      reference: '',
      notes: '',
    },
  });

  const selectedMethod = form.watch('payment_method');

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Pago registrado',
      description: `Se registró un pago de $${Number(data.amount).toLocaleString('es-MX')} MXN`,
    });
    
    setIsSubmitting(false);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Registrar pago
          </DialogTitle>
          <DialogDescription>
            Registra el pago de una consulta completada
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Appointment */}
            <FormField
              control={form.control}
              name="appointment_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    Cita / Paciente
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la cita" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockAppointments.map((apt) => (
                        <SelectItem key={apt.id} value={apt.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{apt.patient}</span>
                            <span className="text-xs text-muted-foreground">
                              {apt.doctor} • {apt.date} {apt.time}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto (MXN)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input 
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-7"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Method */}
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
                          className="flex flex-col gap-1 h-auto py-3"
                          onClick={() => field.onChange(method.value)}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs">{method.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reference (for card/transfer) */}
            {(selectedMethod === 'card' || selectedMethod === 'transfer') && (
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedMethod === 'card' ? 'Referencia de terminal' : 'Referencia de transferencia'}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={
                          selectedMethod === 'card' 
                            ? 'Ej: REF-123456' 
                            : 'Ej: TRANS-789012'
                        }
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionales sobre el pago..."
                      className="resize-none"
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <DollarSign className="h-4 w-4" />
                {isSubmitting ? 'Registrando...' : 'Registrar pago'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
