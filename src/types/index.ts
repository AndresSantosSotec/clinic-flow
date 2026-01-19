// ============ ENUMS ============

export type UserRole = 'admin' | 'reception' | 'doctor' | 'accounting';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export type PaymentStatus = 'paid' | 'void';

export type EncounterStatus = 'draft' | 'final';

export type PaymentMethod = 'cash' | 'card' | 'transfer';

export type Gender = 'M' | 'F' | 'O';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type ReminderStatus = 'pending' | 'sent' | 'failed';

export type ReminderType = '24h' | '2h';

// ============ ENTITIES ============

export interface Branch {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  opens_at: string;
  closes_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  specialty?: string;
  license_number?: string;
  is_active: boolean;
  branches: Branch[];
  permissions: string[];
  created_at: string;
}

export interface PatientTag {
  id: number;
  name: string;
  color: string;
}

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  birth_date: string;
  age: number;
  gender: Gender;
  email?: string;
  phone: string;
  address?: string;
  allergies?: string;
  blood_type?: BloodType;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
  tags: PatientTag[];
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: number;
  branch: Branch;
  patient: Patient;
  doctor: User;
  date: string;
  time_start: string;
  time_end: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
}

export interface Vitals {
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
}

export interface Diagnosis {
  id: number;
  icd_code?: string;
  description: string;
  type: 'primary' | 'secondary';
}

export interface PrescriptionItem {
  id: number;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface EncounterFile {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  created_at: string;
}

export interface ClinicalEncounter {
  id: number;
  appointment: Appointment;
  patient: Patient;
  doctor: User;
  status: EncounterStatus;
  chief_complaint: string;
  present_illness?: string;
  physical_exam?: string;
  vitals?: Vitals;
  diagnoses: Diagnosis[];
  prescription_items: PrescriptionItem[];
  files: EncounterFile[];
  plan?: string;
  follow_up_days?: number;
  finalized_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  appointment: Appointment;
  branch: Branch;
  amount: number;
  payment_method: PaymentMethod;
  reference?: string;
  status: PaymentStatus;
  notes?: string;
  voided_at?: string;
  void_reason?: string;
  created_by: User;
  created_at: string;
}

export interface AppointmentReminder {
  id: number;
  appointment: Appointment;
  type: ReminderType;
  recipient_type: 'patient' | 'doctor';
  scheduled_at: string;
  status: ReminderStatus;
  sent_at?: string;
  attempts: number;
  last_error?: string;
}

export interface AuditLog {
  id: number;
  user?: User;
  branch?: Branch;
  action: string;
  entity_type: string;
  entity_id: number;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

// ============ STATS ============

export interface DashboardStats {
  today_appointments: number;
  pending_confirmations: number;
  completed_today: number;
  no_shows_today: number;
  revenue_today: number;
  revenue_month: number;
  patients_new_month: number;
  appointments_week: { date: string; count: number }[];
}

// ============ FORMS ============

export interface LoginForm {
  email: string;
  password: string;
}

export interface BranchForm {
  name: string;
  code: string;
  address: string;
  phone: string;
  email?: string;
  opens_at: string;
  closes_at: string;
  is_active: boolean;
}

export interface UserForm {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role: UserRole;
  branch_ids: number[];
  specialty?: string;
  license_number?: string;
  is_active: boolean;
}

export interface PatientForm {
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: Gender;
  email?: string;
  phone: string;
  address?: string;
  allergies?: string;
  blood_type?: BloodType;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
  tag_ids: number[];
}

export interface AppointmentForm {
  patient_id: number;
  branch_id: number;
  doctor_id: number;
  date: string;
  time: string;
  duration: number;
  reason: string;
  notes?: string;
}

export interface EncounterForm {
  appointment_id: number;
  chief_complaint: string;
  present_illness?: string;
  physical_exam?: string;
  vitals?: Vitals;
  diagnoses: Omit<Diagnosis, 'id'>[];
  prescription_items: Omit<PrescriptionItem, 'id'>[];
  plan?: string;
  follow_up_days?: number;
}

export interface PaymentForm {
  appointment_id: number;
  amount: number;
  payment_method: PaymentMethod;
  reference?: string;
  notes?: string;
}
