import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
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
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const patientSchema = z.object({
  first_name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'Máximo 100 caracteres'),
  last_name: z
    .string()
    .min(1, 'Los apellidos son requeridos')
    .max(100, 'Máximo 100 caracteres'),
  date_of_birth: z.string().min(1, 'La fecha de nacimiento es requerida'),
  gender: z.string().min(1, 'Selecciona el sexo'),
  email: z
    .string()
    .email('Correo electrónico inválido')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .max(20, 'Máximo 20 caracteres'),
  address: z.string().max(500, 'Máximo 500 caracteres').optional(),
  allergies: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  blood_type: z.string().optional(),
  medical_history: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function PatientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ['patients', id],
    queryFn: async () => {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    },
    enabled: isEditing,
  });

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      email: '',
      phone: '',
      address: '',
      allergies: '',
      blood_type: '',
      medical_history: '',
    },
    values: patient ? {
      first_name: patient.first_name,
      last_name: patient.last_name,
      date_of_birth: patient.date_of_birth?.split('T')[0] || '',
      gender: patient.gender,
      email: patient.email || '',
      phone: patient.phone,
      address: patient.address || '',
      allergies: patient.allergies || '',
      blood_type: patient.blood_type || '',
      medical_history: patient.medical_history || '',
    } : undefined,
  });

  const mutation = useMutation({
    mutationFn: async (values: PatientFormValues) => {
      if (isEditing) {
        return api.put(`/patients/${id}`, values);
      }
      return api.post('/patients', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: isEditing ? 'Paciente actualizado' : 'Paciente registrado',
        description: `La información ha sido guardada correctamente.`,
      });
      navigate('/patients');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Ocurrió un error al guardar.',
      });
    },
  });

  const onSubmit = (data: PatientFormValues) => {
    mutation.mutate(data);
  };

  if (isEditing && isLoadingPatient) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/patients">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="page-header mb-0">
          <h1 className="page-title">{isEditing ? 'Editar paciente' : 'Nuevo paciente'}</h1>
          <p className="page-description">
            {isEditing ? 'Actualiza los datos del paciente' : 'Registra la información del paciente'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información personal */}
          <div className="form-section">
            <h2 className="form-section-title">Información personal</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre(s) *</FormLabel>
                    <FormControl>
                      <Input placeholder="María" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos *</FormLabel>
                    <FormControl>
                      <Input placeholder="García López" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de nacimiento *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="blood_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de sangre</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="form-section">
            <h2 className="form-section-title">Información de contacto</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono *</FormLabel>
                    <FormControl>
                      <Input placeholder="2200-1100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="paciente@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Calle, número, colonia, ciudad..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Información médica */}
          <div className="form-section">
            <h2 className="form-section-title">Información médica</h2>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alergias conocidas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Lista de alergias a medicamentos, alimentos, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Separa las alergias con comas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medical_history"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Antecedentes médicos / Notas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Información adicional relevante..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" type="button" asChild disabled={mutation.isPending}>
              <Link to="/patients">Cancelar</Link>
            </Button>
            <Button type="submit" className="gap-2" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEditing ? 'Guardar cambios' : 'Registrar paciente'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
