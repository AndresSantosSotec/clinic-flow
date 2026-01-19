import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data
const mockPatients = [
  {
    id: 1,
    first_name: 'María',
    last_name: 'García López',
    full_name: 'María García López',
    birth_date: '1985-03-15',
    age: 39,
    gender: 'F',
    email: 'maria.garcia@email.com',
    phone: '+52 55 1234 5678',
    tags: [{ id: 1, name: 'VIP', color: '#EAB308' }, { id: 2, name: 'Diabetes', color: '#EF4444' }],
    last_visit: '2024-01-15',
  },
  {
    id: 2,
    first_name: 'Carlos',
    last_name: 'Rodríguez Mendoza',
    full_name: 'Carlos Rodríguez Mendoza',
    birth_date: '1978-08-22',
    age: 45,
    gender: 'M',
    email: 'carlos.rodriguez@email.com',
    phone: '+52 55 9876 5432',
    tags: [{ id: 3, name: 'Hipertensión', color: '#3B82F6' }],
    last_visit: '2024-01-20',
  },
  {
    id: 3,
    first_name: 'Laura',
    last_name: 'Hernández Vega',
    full_name: 'Laura Hernández Vega',
    birth_date: '1992-11-08',
    age: 31,
    gender: 'F',
    email: 'laura.hernandez@email.com',
    phone: '+52 55 5555 4444',
    tags: [],
    last_visit: '2024-01-10',
  },
  {
    id: 4,
    first_name: 'Roberto',
    last_name: 'Sánchez Flores',
    full_name: 'Roberto Sánchez Flores',
    birth_date: '1965-05-30',
    age: 58,
    gender: 'M',
    email: null,
    phone: '+52 55 3333 2222',
    tags: [{ id: 1, name: 'VIP', color: '#EAB308' }],
    last_visit: '2024-01-18',
  },
];

export default function PatientsList() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery) ||
      patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Pacientes</h1>
          <p className="page-description">
            {mockPatients.length} pacientes registrados
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/patients/new">
            <Plus className="h-4 w-4" />
            Nuevo paciente
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, teléfono o email..."
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
      <div className="data-table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Etiquetas</TableHead>
              <TableHead>Última visita</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => {
              const initials = `${patient.first_name[0]}${patient.last_name[0]}`;
              return (
                <TableRow key={patient.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link 
                          to={`/patients/${patient.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {patient.full_name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {patient.gender === 'M' ? 'Masculino' : 'Femenino'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {patient.phone}
                      </div>
                      {patient.email && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {patient.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{patient.age}</span>
                    <span className="text-muted-foreground"> años</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {patient.tags.length > 0 ? (
                        patient.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            style={{ 
                              backgroundColor: `${tag.color}15`,
                              borderColor: `${tag.color}30`,
                              color: tag.color 
                            }}
                          >
                            <Tag className="mr-1 h-3 w-3" />
                            {tag.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {new Date(patient.last_visit).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Agendar cita</DropdownMenuItem>
                        <DropdownMenuItem>Ver historial</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
