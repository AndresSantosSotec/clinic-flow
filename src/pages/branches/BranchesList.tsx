import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Building2, 
  Clock, 
  Phone, 
  Mail,
  MoreHorizontal,
  MapPin,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data
const mockBranches = [
  {
    id: 1,
    code: 'CTR',
    name: 'Clínica Centro',
    address: 'Av. Reforma 123, Col. Centro, CDMX',
    phone: '+52 55 1234 5678',
    email: 'centro@clinica.com',
    opens_at: '08:00',
    closes_at: '20:00',
    is_active: true,
    doctors_count: 5,
    appointments_today: 24,
  },
  {
    id: 2,
    code: 'SUR',
    name: 'Clínica Sur',
    address: 'Av. Insurgentes Sur 456, Col. Del Valle, CDMX',
    phone: '+52 55 9876 5432',
    email: 'sur@clinica.com',
    opens_at: '09:00',
    closes_at: '19:00',
    is_active: true,
    doctors_count: 3,
    appointments_today: 18,
  },
  {
    id: 3,
    code: 'NTE',
    name: 'Clínica Norte',
    address: 'Blvd. Avila Camacho 789, Col. Polanco, CDMX',
    phone: '+52 55 5555 4444',
    email: 'norte@clinica.com',
    opens_at: '08:00',
    closes_at: '18:00',
    is_active: false,
    doctors_count: 2,
    appointments_today: 0,
  },
];

export default function BranchesList() {
  const [branches, setBranches] = useState(mockBranches);

  const toggleBranchStatus = (id: number) => {
    setBranches(branches.map(branch => 
      branch.id === id ? { ...branch, is_active: !branch.is_active } : branch
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Sedes</h1>
          <p className="page-description">
            Administra las sucursales de la clínica
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/branches/new">
            <Plus className="h-4 w-4" />
            Nueva sede
          </Link>
        </Button>
      </div>

      {/* Branches grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {branches.map((branch) => (
          <Card key={branch.id} className={!branch.is_active ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{branch.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {branch.code}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                    <DropdownMenuItem>Ver horarios</DropdownMenuItem>
                    <DropdownMenuItem>Ver usuarios</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {branch.is_active ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">
                    {branch.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <Switch 
                  checked={branch.is_active}
                  onCheckedChange={() => toggleBranchStatus(branch.id)}
                />
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{branch.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {branch.opens_at} - {branch.closes_at}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{branch.phone}</span>
                </div>
                {branch.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{branch.email}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-4 pt-2 border-t">
                <div>
                  <p className="text-2xl font-bold">{branch.doctors_count}</p>
                  <p className="text-xs text-muted-foreground">Médicos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{branch.appointments_today}</p>
                  <p className="text-xs text-muted-foreground">Citas hoy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
