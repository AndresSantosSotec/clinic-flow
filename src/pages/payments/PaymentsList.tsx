import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  DollarSign,
  Calendar,
  User,
  Building2,
  MoreHorizontal,
  XCircle,
  CheckCircle,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PaymentStatus, PaymentMethod } from '@/types';
import { RegisterPaymentDialog } from '@/components/payments/RegisterPaymentDialog';

// Mock data
const mockPayments = [
  {
    id: 1,
    appointment: { id: 1, patient: 'María García López', doctor: 'Dr. Juan Pérez', date: '2024-01-26' },
    branch: { id: 1, name: 'Clínica Centro' },
    amount: 1500,
    payment_method: 'card' as PaymentMethod,
    reference: 'REF-001234',
    status: 'paid' as PaymentStatus,
    created_by: 'Ana Recepción',
    created_at: '2024-01-26T10:30:00',
  },
  {
    id: 2,
    appointment: { id: 2, patient: 'Carlos Rodríguez', doctor: 'Dra. Ana Martínez', date: '2024-01-26' },
    branch: { id: 1, name: 'Clínica Centro' },
    amount: 2500,
    payment_method: 'cash' as PaymentMethod,
    reference: null,
    status: 'paid' as PaymentStatus,
    created_by: 'Ana Recepción',
    created_at: '2024-01-26T11:00:00',
  },
  {
    id: 3,
    appointment: { id: 3, patient: 'Laura Hernández', doctor: 'Dr. Carlos López', date: '2024-01-25' },
    branch: { id: 2, name: 'Clínica Sur' },
    amount: 800,
    payment_method: 'transfer' as PaymentMethod,
    reference: 'TRANS-5678',
    status: 'void' as PaymentStatus,
    void_reason: 'Cobro duplicado',
    voided_at: '2024-01-25T16:00:00',
    created_by: 'María Recepción',
    created_at: '2024-01-25T14:30:00',
  },
  {
    id: 4,
    appointment: { id: 4, patient: 'Roberto Sánchez', doctor: 'Dr. Juan Pérez', date: '2024-01-25' },
    branch: { id: 1, name: 'Clínica Centro' },
    amount: 3200,
    payment_method: 'card' as PaymentMethod,
    reference: 'REF-001235',
    status: 'paid' as PaymentStatus,
    created_by: 'Ana Recepción',
    created_at: '2024-01-25T09:15:00',
  },
];

const paymentMethodIcons: Record<PaymentMethod, React.ElementType> = {
  cash: Banknote,
  card: CreditCard,
  transfer: ArrowRightLeft,
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
};

export default function PaymentsList() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<typeof mockPayments[0] | null>(null);
  const [voidReason, setVoidReason] = useState('');

  const filteredPayments = mockPayments.filter(
    (payment) =>
      payment.appointment.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total_today: mockPayments
      .filter(p => p.status === 'paid' && p.created_at.startsWith('2024-01-26'))
      .reduce((sum, p) => sum + p.amount, 0),
    count_today: mockPayments.filter(p => p.status === 'paid' && p.created_at.startsWith('2024-01-26')).length,
    total_month: mockPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    voided_count: mockPayments.filter(p => p.status === 'void').length,
  };

  const handleVoidPayment = () => {
    if (!selectedPayment || !voidReason.trim()) return;

    toast({
      title: 'Pago anulado',
      description: `El pago #${selectedPayment.id} ha sido anulado correctamente.`,
    });

    setVoidDialogOpen(false);
    setSelectedPayment(null);
    setVoidReason('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN' 
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Cobros</h1>
          <p className="page-description">
            Gestión de pagos y transacciones
          </p>
        </div>
        <Button className="gap-2" onClick={() => setRegisterDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Registrar pago</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg md:text-xl font-bold">{formatCurrency(stats.total_today)}</p>
                <p className="text-xs text-muted-foreground">Ingresos hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-lg md:text-xl font-bold">{stats.count_today}</p>
                <p className="text-xs text-muted-foreground">Pagos hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg md:text-xl font-bold">{formatCurrency(stats.total_month)}</p>
                <p className="text-xs text-muted-foreground">Total mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-lg md:text-xl font-bold">{stats.voided_count}</p>
                <p className="text-xs text-muted-foreground">Anulados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente o referencia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Table */}
      <div className="data-table-container overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead className="hidden md:table-cell">Sede</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead className="hidden sm:table-cell">Método</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden lg:table-cell">Fecha</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => {
              const MethodIcon = paymentMethodIcons[payment.payment_method];
              return (
                <TableRow key={payment.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.appointment.patient}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.appointment.doctor}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      {payment.branch.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(payment.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <MethodIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{paymentMethodLabels[payment.payment_method]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={payment.status === 'paid' ? 'default' : 'destructive'}
                      className="gap-1"
                    >
                      {payment.status === 'paid' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {payment.status === 'paid' ? 'Pagado' : 'Anulado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(payment.created_at).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver detalle</DropdownMenuItem>
                        <DropdownMenuItem>Imprimir recibo</DropdownMenuItem>
                        {payment.status === 'paid' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setVoidDialogOpen(true);
                              }}
                            >
                              Anular pago
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Register Payment Dialog */}
      <RegisterPaymentDialog 
        open={registerDialogOpen} 
        onOpenChange={setRegisterDialogOpen} 
      />

      {/* Void Payment Dialog */}
      <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Anular pago
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El pago quedará marcado como anulado.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Pago a anular:</p>
                <p className="font-medium">{selectedPayment.appointment.patient}</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(selectedPayment.amount)}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Motivo de anulación <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="Escribe el motivo de la anulación..."
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setVoidDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleVoidPayment}
              disabled={!voidReason.trim()}
            >
              Confirmar anulación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
