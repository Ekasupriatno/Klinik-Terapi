import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { DoctorsPage } from './pages/DoctorsPage';
import { BookingPage } from './pages/BookingPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RegisterDoctor } from './pages/auth/RegisterDoctor';
import { RegisterDoctorSuccess } from './pages/auth/RegisterDoctorSuccess';
import { ServicesPage } from './pages/ServicesPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ParentPortalPage } from './pages/ParentPortalPage';
import { TherapistPortalPage } from './pages/TherapistPortalPage';

const AppLayout = () => {
  const location = useLocation();
  const isTherapistPortal = location.pathname.startsWith('/therapist');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {!isTherapistPortal && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/doctor" element={<RegisterDoctor />} />
          <Route path="/register/doctor/success" element={<RegisterDoctorSuccess />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Patient / Parent Routes */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/*"
            element={
              <ProtectedRoute requireParent={true}>
                <ParentPortalPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Therapist Routes */}
          <Route
            path="/therapist/*"
            element={
              <ProtectedRoute requireTherapist={true} allowedRoles={['doctor', 'therapist']}>
                <TherapistPortalPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isTherapistPortal && <Footer />}
    </div>
  );
};

export function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
