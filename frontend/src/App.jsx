import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import CategoriesManagement from './pages/admin/CategoriesManagement';
import DonationsMonitoring from './pages/admin/DonationsMonitoring';
import ReportsPanel from './pages/admin/ReportsPanel';

// Donor Pages
import DonorDashboard from './pages/donor/DonorDashboard';
import CreateDonation from './pages/donor/CreateDonation';

// NGO Pages
import NgoDashboard from './pages/ngo/NgoDashboard';
import BrowseAvailableFood from './pages/ngo/BrowseAvailableFood';
import NgoRequests from './pages/ngo/NgoRequests';

// Volunteer Pages
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import VolunteerDeliveries from './pages/volunteer/VolunteerDeliveries';
import VolunteerMap from './pages/volunteer/VolunteerMap';

// Protected Layout Wrapper
const DashboardLayout = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)', padding: '40px' }}>Loading application session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ padding: '24px 0', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Landing Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Admin Portal */}
            <Route 
              path="/admin" 
              element={
                <DashboardLayout allowedRoles={['Admin']}>
                  <AdminDashboard />
                </DashboardLayout>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <DashboardLayout allowedRoles={['Admin']}>
                  <UsersManagement />
                </DashboardLayout>
              } 
            />
            <Route 
              path="/admin/categories" 
              element={
                <DashboardLayout allowedRoles={['Admin']}>
                  <CategoriesManagement />
                </DashboardLayout>
              } 
            />
            <Route 
              path="/admin/donations" 
              element={
                <DashboardLayout allowedRoles={['Admin']}>
                  <DonationsMonitoring />
                </DashboardLayout>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <DashboardLayout allowedRoles={['Admin']}>
                  <ReportsPanel />
                </DashboardLayout>
              } 
            />

            {/* Donor Portal */}
            <Route 
              path="/donor" 
              element={
                <DashboardLayout allowedRoles={['Donor']}>
                  <DonorDashboard />
                </DashboardLayout>
              } 
            />
            <Route 
              path="/donor/create" 
              element={
                <DashboardLayout allowedRoles={['Donor']}>
                  <CreateDonation />
                </DashboardLayout>
              } 
            />
            <Route 
              path="/donor/history" 
              element={
                <DashboardLayout allowedRoles={['Donor']}>
                  <DonorDashboard />
                </DashboardLayout>
              } 
            />

            {/* NGO Portal */}
            <Route 
              path="/ngo" 
              element={
                <DashboardLayout allowedRoles={['NGO']}>
                  <NgoDashboard />
                </DashboardLayout>
              } 
            />
            <Route 
              path="/ngo/browse" 
              element={
                <DashboardLayout allowedRoles={['NGO']}>
                  <BrowseAvailableFood />
                </DashboardLayout>
              } 
            />
            <Route 
              path="/ngo/requests" 
              element={
                <DashboardLayout allowedRoles={['NGO']}>
                  <NgoRequests />
                </DashboardLayout>
              } 
            />

            {/* Volunteer Portal */}
            <Route 
              path="/volunteer" 
              element={
                <DashboardLayout allowedRoles={['Volunteer']}>
                  <VolunteerDashboard />
                </DashboardLayout>
              } 
            />
            <Route 
              path="/volunteer/deliveries" 
              element={
                <DashboardLayout allowedRoles={['Volunteer']}>
                  <VolunteerDeliveries />
                </DashboardLayout>
              } 
            />
            <Route 
              path="/volunteer/map" 
              element={
                <DashboardLayout allowedRoles={['Volunteer']}>
                  <VolunteerMap />
                </DashboardLayout>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
