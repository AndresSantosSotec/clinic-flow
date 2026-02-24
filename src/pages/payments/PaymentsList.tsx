import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Receipt,
  Loader2
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { RegisterPaymentDialog } from '@/components/payments/RegisterPaymentDialog';
import { Can } from '@/components/auth/Can';

const paymentMethodIcons: Record<string, React.ElementType> = {
  cash: Banknote,
  card: CreditCard,
  credit_card: CreditCard,
  debit_card: CreditCard,
  transfer: ArrowRightLeft,
  insurance: Receipt
};

const paymentMethodLabels: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  credit_card: 'Tarjeta de Crédito',
  debit_card: 'Tarjeta de Débito',
  transfer: 'Transferencia',
  insurance: 'Seguro'
};


import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function PaymentsList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [voidReason, setVoidReason] = useState('');

  // Open register dialog if action=new query param is present
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setRegisterDialogOpen(true);
      // Remove the query param after opening the dialog
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { data: paymentsResponse, isLoading, error } = useQuery({
    queryKey: ['payments', page],
    queryFn: async () => {
      const response = await api.get('/payments', { params: { page } });
      return response.data;
    },
  });

  const voidMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number, notes: string }) => {
      return api.put(`/payments/${id}`, { status: 'cancelled', notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Pago anulado',
        description: 'La transacción ha sido cancelada correctamente.',
      });
      setVoidDialogOpen(false);
      setSelectedPayment(null);
      setVoidReason('');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo anular el pago.',
      });
    }
  });

  const payments = paymentsResponse?.data || [];
  const totalPages = paymentsResponse?.last_page || 1;

  const filteredPayments = payments.filter(
    (payment: any) =>
      payment.patient?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.patient?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  const handleVoidPayment = () => {
    if (!selectedPayment || !voidReason.trim()) return;
    voidMutation.mutate({ id: selectedPayment.id, notes: voidReason });
  };

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
        Error al cargar los pagos.
      </div>
    );
  }

  // Calculate totals - note: this only calculates for current page unless we implement a backend endpoint for totals
  // For now we'll format what we have, but ideally backend should provide these stats
  const totals = {
    today: payments.filter((p: any) => p.payment_date?.startsWith(new Date().toISOString().split('T')[0])).reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0),
    count: paymentsResponse?.total || payments.length,
    cancelled: payments.filter((p: any) => p.status === 'cancelled').length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Cobros</h1>
          <p className="page-description">
            Gestión de pagos y transacciones del sistema
          </p>
        </div>
        <Can permission="create-payments">
          <Button className="gap-2" onClick={() => setRegisterDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Registrar pago
          </Button>
        </Can>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{formatCurrency(totals.today)}</p>
                <p className="text-xs text-muted-foreground">Ingresos del día (Página actual)</p>
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
                <p className="text-xl font-bold">{totals.count}</p>
                <p className="text-xs text-muted-foreground">Total transacciones</p>
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
                <p className="text-xl font-bold">{totals.cancelled}</p>
                <p className="text-xs text-muted-foreground">Anuladas / Canceladas (Página actual)</p>
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
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron pagos registrados.
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment: any) => {
                const MethodIcon = paymentMethodIcons[payment.payment_method] || Banknote;
                return (
                  <TableRow key={payment.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {payment.patient?.first_name} {payment.patient?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {payment.transaction_id || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(parseFloat(payment.amount))}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <MethodIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{paymentMethodLabels[payment.payment_method] || payment.payment_method}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={payment.status === 'completed' ? 'default' : payment.status === 'pending' ? 'outline' : 'destructive'}
                        className="gap-1"
                      >
                        {payment.status === 'completed' ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : payment.status === 'cancelled' ? (
                          <XCircle className="h-3 w-3" />
                        ) : (
                          <Calendar className="h-3 w-3" />
                        )}
                        {payment.status === 'completed' ? 'Pagado' : payment.status === 'pending' ? 'Pendiente' : 'Anulado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver detalles de cita</DropdownMenuItem>
                          {payment.status !== 'cancelled' && (
                            <>
                              <DropdownMenuSeparator />
                              <Can permission="delete-payments">
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setVoidDialogOpen(true);
                                  }}
                                >
                                  Anular pago
                                </DropdownMenuItem>
                              </Can>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
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

      <RegisterPaymentDialog
        open={registerDialogOpen}
        onOpenChange={setRegisterDialogOpen}
      />

      <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Anular pago
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas anular esta transacción?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo de anulación</label>
              <Textarea
                placeholder="Indique la razón..."
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVoidDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleVoidPayment}
              disabled={voidMutation.isPending || !voidReason.trim()}
            >
              Confirmar anulación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
