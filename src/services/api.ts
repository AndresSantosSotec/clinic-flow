import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ============================================
// Authentication
// ============================================

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post("/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
    }
    return response.data;
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    const response = await api.post("/register", data);
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
    }
    return response.data;
  },

  async logout() {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("auth_token");
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem("auth_token");
  },
};

// ============================================
// Users
// ============================================

export interface User {
  id: number;
  name: string;
  email: string;
  roles?: Role[];
  created_at?: string;
  updated_at?: string;
}

export const userService = {
  async getAll() {
    const response = await api.get("/users");
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async create(data: { name: string; email: string; password: string }) {
    const response = await api.post("/users", data);
    return response.data;
  },

  async update(
    id: number,
    data: { name: string; email: string; password?: string }
  ) {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async assignRole(userId: number, roleId: number) {
    const response = await api.post(`/users/${userId}/roles`, { role_id: roleId });
    return response.data;
  },

  async removeRole(userId: number, roleId: number) {
    const response = await api.delete(`/users/${userId}/roles/${roleId}`);
    return response.data;
  },
};

// ============================================
// Roles
// ============================================

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  permissions?: Permission[];
  users_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const roleService = {
  async getAll() {
    const response = await api.get("/roles");
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  async create(data: { name: string; description?: string }) {
    const response = await api.post("/roles", data);
    return response.data;
  },

  async update(id: number, data: { name: string; description?: string }) {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },

  async assignPermission(roleId: number, permissionId: number) {
    const response = await api.post(`/roles/${roleId}/permissions`, {
      permission_id: permissionId,
    });
    return response.data;
  },

  async removePermission(roleId: number, permissionId: number) {
    const response = await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
    return response.data;
  },
};

// ============================================
// Permissions
// ============================================

export interface Permission {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const permissionService = {
  async getAll() {
    const response = await api.get("/permissions");
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/permissions/${id}`);
    return response.data;
  },

  async create(data: { name: string; description?: string }) {
    const response = await api.post("/permissions", data);
    return response.data;
  },

  async update(id: number, data: { name: string; description?: string }) {
    const response = await api.put(`/permissions/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/permissions/${id}`);
    return response.data;
  },
};

// ============================================
// Branches
// ============================================

export interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  opens_at: string;
  closes_at: string;
  created_at?: string;
  updated_at?: string;
}

export const branchService = {
  async getAll() {
    const response = await api.get("/branches");
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/branches/${id}`);
    return response.data;
  },

  async create(data: Omit<Branch, "id" | "created_at" | "updated_at">) {
    const response = await api.post("/branches", data);
    return response.data;
  },

  async update(
    id: number,
    data: Partial<Omit<Branch, "id" | "created_at" | "updated_at">>
  ) {
    const response = await api.put(`/branches/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/branches/${id}`);
    return response.data;
  },
};

// ============================================
// Doctors
// ============================================

export interface Doctor {
  id: number;
  user_id: number;
  branch_id: number;
  specialty: string;
  license_number: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
  user?: User;
  branch?: Branch;
}

export const doctorService = {
  async getAll() {
    const response = await api.get("/doctors");
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  async create(data: Omit<Doctor, "id" | "created_at" | "updated_at" | "user" | "branch">) {
    const response = await api.post("/doctors", data);
    return response.data;
  },

  async update(
    id: number,
    data: Partial<Omit<Doctor, "id" | "created_at" | "updated_at" | "user" | "branch">>
  ) {
    const response = await api.put(`/doctors/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
  },
};

// ============================================
// Patients
// ============================================

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: "male" | "female" | "other";
  phone: string;
  email: string;
  address: string;
  medical_history?: string;
  created_at?: string;
  updated_at?: string;
}

export const patientService = {
  async getAll() {
    const response = await api.get("/patients");
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  async create(data: Omit<Patient, "id" | "created_at" | "updated_at">) {
    const response = await api.post("/patients", data);
    return response.data;
  },

  async update(
    id: number,
    data: Partial<Omit<Patient, "id" | "created_at" | "updated_at">>
  ) {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },
};

// ============================================
// Appointments
// ============================================

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  branch_id: number;
  appointment_date: string;
  appointment_time: string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  created_at?: string;
  updated_at?: string;
  patient?: Patient;
  doctor?: Doctor;
  branch?: Branch;
}

export const appointmentService = {
  async getAll() {
    const response = await api.get("/appointments");
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  async create(
    data: Omit<Appointment, "id" | "created_at" | "updated_at" | "patient" | "doctor" | "branch">
  ) {
    const response = await api.post("/appointments", data);
    return response.data;
  },

  async update(
    id: number,
    data: Partial<
      Omit<Appointment, "id" | "created_at" | "updated_at" | "patient" | "doctor" | "branch">
    >
  ) {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
};

// ============================================
// Payments
// ============================================

export interface Payment {
  id: number;
  appointment_id: number;
  amount: number;
  payment_method: "cash" | "card" | "transfer";
  payment_date: string;
  status: "pending" | "completed" | "cancelled";
  notes?: string;
  created_at?: string;
  updated_at?: string;
  appointment?: Appointment;
}

export const paymentService = {
  async getAll() {
    const response = await api.get("/payments");
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  async create(
    data: Omit<Payment, "id" | "created_at" | "updated_at" | "appointment">
  ) {
    const response = await api.post("/payments", data);
    return response.data;
  },

  async update(
    id: number,
    data: Partial<Omit<Payment, "id" | "created_at" | "updated_at" | "appointment">>
  ) {
    const response = await api.put(`/payments/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },
};

// ============================================
// Reminders
// ============================================

export interface Reminder {
  id: number;
  appointment_id: number;
  reminder_date: string;
  reminder_time: string;
  message: string;
  status: "pending" | "sent" | "failed";
  sent_at?: string;
  created_at?: string;
  updated_at?: string;
  appointment?: Appointment;
}

export const reminderService = {
  async getAll() {
    const response = await api.get("/reminders");
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/reminders/${id}`);
    return response.data;
  },

  async create(
    data: Omit<Reminder, "id" | "created_at" | "updated_at" | "appointment" | "sent_at">
  ) {
    const response = await api.post("/reminders", data);
    return response.data;
  },

  async update(
    id: number,
    data: Partial<
      Omit<Reminder, "id" | "created_at" | "updated_at" | "appointment" | "sent_at">
    >
  ) {
    const response = await api.put(`/reminders/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/reminders/${id}`);
    return response.data;
  },
};

export default api;
