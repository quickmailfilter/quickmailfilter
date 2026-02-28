import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Toaster } from './components/ui/sonner';
import { useEffect, useState } from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Layouts
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardSidebar } from './components/DashboardSidebar';
import { ScrollToTop } from './components/ScrollToTop';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { DocsPage } from './pages/DocsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { GDPRPage } from './pages/GDPRPage';

// User Dashboard Pages
import { UserDashboard } from './pages/UserDashboard';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { BulkUploadPage } from './pages/BulkUploadPage';
import { BulkProcessPage } from './pages/BulkProcessPage';
import { BulkResultsPage } from './pages/BulkResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { UserSettingsPage } from './pages/UserSettingsPage';

// Admin Pages
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminLogsPage } from './pages/AdminLogsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { AdminFileManagerPage } from './pages/AdminFileManagerPage';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="w-12 h-12 rounded-full border-4 border-[#E5E7EB] border-t-[#2563EB] animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Initializing...</p>
    </div>
  </div>
);

// Protected Route Components
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, loading } = useApp();

  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, loading } = useApp();

  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

// Layout Wrappers
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="h-20 sm:h-24"></div>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Desktop: fixed, Mobile: drawer */}
      <div className={`
        fixed inset-0 z-50 lg:relative lg:z-0
        ${sidebarOpen ? 'block' : 'hidden lg:block'}
      `}>
        {/* Mobile Overlay */}
        <div 
          className="absolute inset-0 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Sidebar Content */}
        <div className="relative h-full transition-transform duration-300 transform">
          <DashboardSidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Dashboard Top Header (Mobile only) */}
        <header className="lg:hidden bg-white border-b border-[#E5E7EB] h-16 flex items-center px-4 shrink-0 sticky top-0 z-40">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="ml-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[#1E3A8A]">VerifyMail</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function AppContent() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
        <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />
        <Route path="/docs" element={<PublicLayout><DocsPage /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
        <Route path="/terms" element={<PublicLayout><TermsOfServicePage /></PublicLayout>} />
        <Route path="/cookies" element={<PublicLayout><CookiePolicyPage /></PublicLayout>} />
        <Route path="/gdpr" element={<PublicLayout><GDPRPage /></PublicLayout>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* User Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <UserDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/verify"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <VerifyEmailPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/bulk"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BulkUploadPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/bulk/process/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BulkProcessPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/bulk/results/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BulkResultsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/history"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <HistoryPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <UserSettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <DashboardLayout>
                <AdminUsersPage />
              </DashboardLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/logs"
          element={
            <AdminRoute>
              <DashboardLayout>
                <AdminLogsPage />
              </DashboardLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <DashboardLayout>
                <AdminSettingsPage />
              </DashboardLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/files"
          element={
            <AdminRoute>
              <DashboardLayout>
                <AdminFileManagerPage />
              </DashboardLayout>
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="bottom-right" richColors closeButton />
    </Router>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
