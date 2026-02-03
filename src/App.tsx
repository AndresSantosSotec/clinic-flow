import { Toaster } from "@/components/ui/toaster";
import { Toaster as ToasterSonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import LoginPage from "@/pages/auth/LoginPage";
import Dashboard from "@/pages/Dashboard";
import BranchesList from "@/pages/branches/BranchesList";
import BranchForm from "@/pages/branches/BranchForm";
import PatientsList from "@/pages/patients/PatientsList";
import PatientForm from "@/pages/patients/PatientForm";
import PatientProfile from "@/pages/patients/PatientProfile";
import AppointmentsList from "@/pages/appointments/AppointmentsList";
import AppointmentForm from "@/pages/appointments/AppointmentForm";
import DoctorsList from "@/pages/doctors/DoctorsList";
import DoctorForm from "@/pages/doctors/DoctorForm";
import DoctorProfile from "@/pages/doctors/DoctorProfile";
import PaymentsList from "@/pages/payments/PaymentsList";
import RemindersList from "@/pages/reminders/RemindersList";
import UsersList from "@/pages/users/UsersList";
import RolesList from "@/pages/users/RolesList";
import PermissionsList from "@/pages/users/PermissionsList";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <ToasterSonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Protected routes with layout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Branches */}
            <Route path="/branches" element={<BranchesList />} />
            <Route path="/branches/new" element={<BranchForm />} />
            <Route path="/branches/:id" element={<BranchForm />} />

            {/* Patients */}
            <Route path="/patients" element={<PatientsList />} />
            <Route path="/patients/new" element={<PatientForm />} />
            <Route path="/patients/:id" element={<PatientProfile />} />
            <Route path="/patients/:id/edit" element={<PatientForm />} />

            {/* Appointments */}
            <Route path="/appointments" element={<AppointmentsList />} />
            <Route path="/appointments/new" element={<AppointmentForm />} />

            {/* Doctors */}
            <Route path="/doctors" element={<DoctorsList />} />
            <Route path="/doctors/new" element={<DoctorForm />} />
            <Route path="/doctors/:id" element={<DoctorProfile />} />
            <Route path="/doctors/:id/edit" element={<DoctorForm />} />

            {/* Payments */}
            <Route path="/payments" element={<PaymentsList />} />

            {/* Reminders */}
            <Route path="/reminders" element={<RemindersList />} />

            {/* Users, Roles & Permissions */}
            <Route path="/users" element={<UsersList />} />
            <Route path="/roles" element={<RolesList />} />
            <Route path="/permissions" element={<PermissionsList />} />

            {/* Placeholder routes */}
            <Route path="/encounters" element={<div className="page-header"><h1 className="page-title">Consultas</h1><p className="text-muted-foreground">Próximamente...</p></div>} />
            <Route path="/reports" element={<div className="page-header"><h1 className="page-title">Reportes</h1><p className="text-muted-foreground">Próximamente...</p></div>} />
            <Route path="/settings" element={<div className="page-header"><h1 className="page-title">Configuración</h1><p className="text-muted-foreground">Próximamente...</p></div>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
