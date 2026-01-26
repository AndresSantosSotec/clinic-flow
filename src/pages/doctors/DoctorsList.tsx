import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Stethoscope,
  Mail,
  Phone,
  Building2,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data
const mockDoctors = [
  {
    id: 1,
    name: 'Dr. Juan Carlos Pérez González',
    email: 'dr.perez@clinica.com',
    phone: '+52 55 1234 5678',
    specialty: 'Cardiología',
    license_number: 'CONACEM-12345',
    is_active: true,
    branches: [{ id: 1, name: 'Clínica Centro' }, { id: 2, name: 'Clínica Sur' }],
    appointments_today: 8,
  },
  {
    id: 2,
    name: 'Dra. Ana María Martínez',
    email: 'dra.martinez@clinica.com',
    phone: '+52 55 9876 5432',
    specialty: 'Pediatría',
    license_number: 'CONACEM-23456',
    is_active: true,
    branches: [{ id: 1, name: 'Clínica Centro' }],
    appointments_today: 12,
  },
  {
    id: 3,
    name: 'Dr. Carlos López Hernández',
    email: 'dr.lopez@clinica.com',
    phone: '+52 55 5555 4444',
    specialty: 'Medicina General',
    license_number: 'SSA-34567',
    is_active: true,
    branches: [{ id: 2, name: 'Clínica Sur' }],
    appointments_today: 6,
  },
  {
    id: 4,
    name: 'Dra. Patricia Sánchez',
    email: 'dra.sanchez@clinica.com',
    phone: '+52 55 3333 2222',
    specialty: 'Dermatología',
    license_number: 'CONACEM-45678',
    is_active: false,
    branches: [{ id: 1, name: 'Clínica Centro' }],
    appointments_today: 0,
  },
];

export default function DoctorsList() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDoctors = mockDoctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Médicos</h1>
        <p className="page-description">
          {mockDoctors.filter(d => d.is_active).length} médicos activos
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, especialidad..."
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

      {/* Doctors Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDoctors.map((doctor) => {
          const initials = doctor.name
            .split(' ')
            .filter((_, i) => i === 0 || i === 2)
            .map(n => n[0])
            .join('')
            .toUpperCase();

          return (
            <Card key={doctor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 mb-3">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex items-center gap-2 mb-1">
                    <Link 
                      to={`/doctors/${doctor.id}`}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {doctor.name}
                    </Link>
                    <Badge variant={doctor.is_active ? 'default' : 'secondary'} className="text-xs">
                      {doctor.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-primary font-medium mb-3">
                    <Stethoscope className="h-4 w-4" />
                    {doctor.specialty}
                  </div>

                  <div className="w-full space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{doctor.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      {doctor.phone}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3 justify-center">
                    {doctor.branches.map((branch) => (
                      <Badge key={branch.id} variant="outline" className="text-xs">
                        <Building2 className="mr-1 h-3 w-3" />
                        {branch.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t w-full flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{doctor.appointments_today}</span>
                      <span className="text-muted-foreground">citas hoy</span>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/doctors/${doctor.id}`}>Ver perfil</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Ver agenda</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
