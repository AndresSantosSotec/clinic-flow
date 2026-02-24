import { Link } from 'react-router-dom';
import { 
  UserPlus, 
  CalendarPlus, 
  ClipboardPlus, 
  CreditCard,
  ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

const actions: QuickAction[] = [
  {
    label: 'Nuevo paciente',
    description: 'Registrar un nuevo paciente',
    icon: UserPlus,
    href: '/patients/new',
    color: 'bg-primary/10 text-primary',
  },
  {
    label: 'Nueva cita',
    description: 'Agendar una cita médica',
    icon: CalendarPlus,
    href: '/appointments/new',
    color: 'bg-success/10 text-success',
  },
  {
    label: 'Nueva consulta',
    description: 'Iniciar consulta médica',
    icon: ClipboardPlus,
    href: '/consultations?new=true',
    color: 'bg-info/10 text-info',
  },
  {
    label: 'Registrar pago',
    description: 'Registrar un cobro',
    icon: CreditCard,
    href: '/payments?action=new',
    color: 'bg-warning/10 text-warning',
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border bg-card shadow-soft">
      <div className="border-b px-6 py-4">
        <h3 className="font-semibold">Acciones rápidas</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="group flex items-center gap-3 rounded-lg border p-4 transition-all hover:border-primary/50 hover:shadow-soft"
          >
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', action.color)}>
              <action.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{action.label}</p>
              <p className="text-xs text-muted-foreground truncate">{action.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </div>
  );
}
