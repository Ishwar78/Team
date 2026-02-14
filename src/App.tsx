import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlatformProvider } from "@/contexts/PlatformContext";
import { SuperAdminAuthGuard, CompanyAdminAuthGuard } from "@/components/AuthGuards";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import CompanyAdminLogin from "./pages/CompanyAdminLogin";
import Download from "./pages/Download";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Screenshots from "./pages/Screenshots";
import TimeLogs from "./pages/TimeLogs";
import AppUsage from "./pages/AppUsage";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import InviteMembers from "./pages/InviteMembers";
import TeamManagement from "./pages/TeamManagement";
import SettingsPage from "./pages/SettingsPage";
import SuperAdmin from "./pages/SuperAdmin";
import ActivityDashboard from "./pages/ActivityDashboard";
import ApiSpecification from "./pages/ApiSpecification";
import NotificationsPage from "./pages/NotificationsPage";
import Onboarding from "./pages/Onboarding";
import AppRestrictions from "./pages/AppRestrictions";
import IdleJustification from "./pages/IdleJustification";
import Attendance from "./pages/Attendance";
import AcceptInvite from "./pages/AcceptInvite";
import NotFound from "./pages/NotFound";
import TimeTracker from "./pages/features/TimeTracker";
import TeamManagementFeature from "./pages/features/TeamManagementFeature";
import ScreenshotMonitoring from "./pages/features/ScreenshotMonitoring";
import UrlTracking from "./pages/features/UrlTracking";
import WorkforceAnalytics from "./pages/solutions/WorkforceAnalytics";
import ProductivityAnalytics from "./pages/solutions/ProductivityAnalytics";
import EmployeeMonitoring from "./pages/solutions/EmployeeMonitoring";
import TimeReporting from "./pages/solutions/TimeReporting";
import AgentPanel from "./pages/AgentPanel";
import SessionTimeline from "./pages/SessionTimeline";

import UserDetails from "./pages/UserDetails";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
          <AuthProvider>
      <PlatformProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<CompanyAdminLogin />} />
            <Route path="/super/admin/login" element={<SuperAdminLogin />} />
            <Route path="/invite/:token" element={<AcceptInvite />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/download" element={<Download />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/features/time-tracker" element={<TimeTracker />} />
            <Route path="/features/team-management" element={<TeamManagementFeature />} />
            <Route path="/features/screenshot-monitoring" element={<ScreenshotMonitoring />} />
            <Route path="/features/url-tracking" element={<UrlTracking />} />
            <Route path="/solutions/workforce-analytics" element={<WorkforceAnalytics />} />
            <Route path="/solutions/productivity-analytics" element={<ProductivityAnalytics />} />
            <Route path="/solutions/employee-monitoring" element={<EmployeeMonitoring />} />
            <Route path="/solutions/time-reporting" element={<TimeReporting />} />
            <Route path="/agent" element={<AgentPanel />} />



            <Route path="/team/:id" element={<UserDetails />} />



            {/* Company Dashboard */}
            <Route path="/dashboard" element={<CompanyAdminAuthGuard><Dashboard /></CompanyAdminAuthGuard>} />
            <Route path="/dashboard/*" element={<CompanyAdminAuthGuard><Dashboard /></CompanyAdminAuthGuard>} />

            {/* Super Admin */}
            <Route path="/super-admin" element={<SuperAdminAuthGuard><SuperAdmin /></SuperAdminAuthGuard>} />
            <Route path="/super-admin/*" element={<SuperAdminAuthGuard><SuperAdmin /></SuperAdminAuthGuard>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PlatformProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
