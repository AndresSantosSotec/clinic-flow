import { Bell, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Branch, User } from '@/types';

interface HeaderProps {
  user?: User;
  currentBranch?: Branch;
  branches?: Branch[];
  onBranchChange?: (branchId: number) => void;
}

export function Header({ 
  user = { 
    id: 1, 
    name: 'Dr. Admin', 
    email: 'admin@clinica.com', 
    role: 'admin',
    is_active: true,
    branches: [],
    permissions: [],
    created_at: ''
  },
  currentBranch = { id: 1, code: 'CTR', name: 'Clínica Centro', address: '', phone: '', opens_at: '08:00', closes_at: '20:00', is_active: true, created_at: '', updated_at: '' },
  branches = [
    { id: 1, code: 'CTR', name: 'Clínica Centro', address: '', phone: '', opens_at: '08:00', closes_at: '20:00', is_active: true, created_at: '', updated_at: '' },
    { id: 2, code: 'SUR', name: 'Clínica Sur', address: '', phone: '', opens_at: '08:00', closes_at: '20:00', is_active: true, created_at: '', updated_at: '' },
  ],
  onBranchChange 
}: HeaderProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    reception: 'Recepción',
    doctor: 'Médico',
    accounting: 'Contabilidad',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-6">
      {/* Left: Search */}
      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar pacientes, citas..." 
            className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Right: Branch selector, notifications, user */}
      <div className="flex items-center gap-3">
        {/* Branch selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">
                {currentBranch.code.slice(0, 2)}
              </div>
              <span className="hidden sm:inline">{currentBranch.name}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Cambiar sede</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {branches.map((branch) => (
              <DropdownMenuItem 
                key={branch.id}
                onClick={() => onBranchChange?.(branch.id)}
                className="gap-2"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">
                  {branch.code.slice(0, 2)}
                </div>
                {branch.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            3
          </span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start sm:flex">
                <span className="text-sm font-medium">{user.name}</span>
                <Badge variant="secondary" className="h-4 text-[10px] px-1.5">
                  {roleLabels[user.role] || user.role}
                </Badge>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Preferencias</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
