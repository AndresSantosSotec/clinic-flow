import { Toaster } from "@/components/ui/toaster";
import { Toaster as ToasterSonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeProvider";

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
import ConsultationsList from "@/pages/consultations/ConsultationsList";
import ReportsPage from "@/pages/reports/ReportsPage";
import UsersList from "@/pages/users/UsersList";
import RolesList from "@/pages/users/RolesList";
import PermissionsList from "@/pages/users/PermissionsList";
import ProfilePage from "@/pages/users/ProfilePage";
import SettingsPage from "@/pages/settings/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

import { useAuth } from "@/hooks/use-auth";

const ProtectedRoute = ({ children, permission }: { children: React.ReactNode, permission?: string }) => {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
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
    <ThemeProvider>
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
              <Route path="/branches" element={<ProtectedRoute permission="view-branches"><BranchesList /></ProtectedRoute>} />
              <Route path="/branches/new" element={<ProtectedRoute permission="create-branches"><BranchForm /></ProtectedRoute>} />
              <Route path="/branches/:id" element={<ProtectedRoute permission="edit-branches"><BranchForm /></ProtectedRoute>} />

              {/* Patients */}
              <Route path="/patients" element={<ProtectedRoute permission="view-patients"><PatientsList /></ProtectedRoute>} />
              <Route path="/patients/new" element={<ProtectedRoute permission="create-patients"><PatientForm /></ProtectedRoute>} />
              <Route path="/patients/:id" element={<ProtectedRoute permission="view-patients"><PatientProfile /></ProtectedRoute>} />
              <Route path="/patients/:id/edit" element={<ProtectedRoute permission="edit-patients"><PatientForm /></ProtectedRoute>} />

              {/* Appointments */}
              <Route path="/appointments" element={<ProtectedRoute permission="view-appointments"><AppointmentsList /></ProtectedRoute>} />
              <Route path="/appointments/new" element={<ProtectedRoute permission="create-appointments"><AppointmentForm /></ProtectedRoute>} />

              {/* Doctors */}
              <Route path="/doctors" element={<ProtectedRoute permission="view-doctors"><DoctorsList /></ProtectedRoute>} />
              <Route path="/doctors/new" element={<ProtectedRoute permission="create-doctors"><DoctorForm /></ProtectedRoute>} />
              <Route path="/doctors/:id" element={<ProtectedRoute permission="view-doctors"><DoctorProfile /></ProtectedRoute>} />
              <Route path="/doctors/:id/edit" element={<ProtectedRoute permission="edit-doctors"><DoctorForm /></ProtectedRoute>} />

              {/* Payments */}
              <Route path="/payments" element={<ProtectedRoute permission="view-payments"><PaymentsList /></ProtectedRoute>} />

              {/* Consultations */}
              <Route path="/consultations" element={<ProtectedRoute permission="view-appointments"><ConsultationsList /></ProtectedRoute>} />

              {/* Reports */}
              <Route path="/reports" element={<ProtectedRoute permission="view-payments"><ReportsPage /></ProtectedRoute>} />

              {/* Reminders */}
              <Route path="/reminders" element={<RemindersList />} />

              {/* Users, Roles & Permissions */}
              <Route path="/users" element={<ProtectedRoute permission="view-users"><UsersList /></ProtectedRoute>} />
              <Route path="/roles" element={<ProtectedRoute permission="view-roles"><RolesList /></ProtectedRoute>} />
              <Route path="/permissions" element={<ProtectedRoute permission="view-roles"><PermissionsList /></ProtectedRoute>} />

              {/* User Account */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />

            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);


export default App;
