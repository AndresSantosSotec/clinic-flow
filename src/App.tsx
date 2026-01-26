import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import LoginPage from "@/pages/auth/LoginPage";
import Dashboard from "@/pages/Dashboard";
import BranchesList from "@/pages/branches/BranchesList";
import PatientsList from "@/pages/patients/PatientsList";
import PatientForm from "@/pages/patients/PatientForm";
import AppointmentsList from "@/pages/appointments/AppointmentsList";
import AppointmentForm from "@/pages/appointments/AppointmentForm";
import DoctorsList from "@/pages/doctors/DoctorsList";
import DoctorProfile from "@/pages/doctors/DoctorProfile";
import PaymentsList from "@/pages/payments/PaymentsList";
import RemindersList from "@/pages/reminders/RemindersList";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes with layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Branches */}
            <Route path="/branches" element={<BranchesList />} />
            
            {/* Patients */}
            <Route path="/patients" element={<PatientsList />} />
            <Route path="/patients/new" element={<PatientForm />} />
            
            {/* Appointments */}
            <Route path="/appointments" element={<AppointmentsList />} />
            <Route path="/appointments/new" element={<AppointmentForm />} />
            
            {/* Doctors */}
            <Route path="/doctors" element={<DoctorsList />} />
            <Route path="/doctors/:id" element={<DoctorProfile />} />
            
            {/* Payments */}
            <Route path="/payments" element={<PaymentsList />} />
            
            {/* Reminders */}
            <Route path="/reminders" element={<RemindersList />} />
            
            {/* Placeholder routes */}
            <Route path="/users" element={<DoctorsList />} />
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
