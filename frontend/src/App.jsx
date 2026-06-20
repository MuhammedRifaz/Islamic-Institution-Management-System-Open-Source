import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicLayout from './components/layouts/PublicLayout';
import PortalLayout from './components/layouts/PortalLayout';

// Public Pages (Keep synchronous for fast initial paint)
import Home from './pages/public/Home';
import Courses from './pages/public/Courses';
import Register from './pages/public/Register';
import About from './pages/public/About';

import Gallery from './pages/public/Gallery';
import Contact from './pages/public/Contact';

// Portal Pages (Lazy loaded to reduce bundle size)
const Login = lazy(() => import('./pages/portal/Login'));
const SignUp = lazy(() => import('./pages/portal/SignUp'));
const Dashboard = lazy(() => import('./pages/portal/Dashboard'));
const CensusForm = lazy(() => import('./pages/portal/byma/CensusForm'));
const Users = lazy(() => import('./pages/portal/admin/Users'));
const AdminCourses = lazy(() => import('./pages/portal/admin/AdminCourses'));
const Settings = lazy(() => import('./pages/portal/admin/Settings'));
const CensusReports = lazy(() => import('./pages/portal/admin/CensusReports'));
const AdminSuggestions = lazy(() => import('./pages/portal/admin/AdminSuggestions'));
const MarkAttendance = lazy(() => import('./pages/portal/khatheeb/MarkAttendance'));
const TreasurerDashboard = lazy(() => import('./pages/portal/raulathul/TreasurerDashboard'));
const ManageSamaja = lazy(() => import('./pages/portal/president/ManageSamaja'));
const ManageNotices = lazy(() => import('./pages/portal/president/ManageNotices'));

import ScrollToTop from './components/ScrollToTop';

// Loading Fallback Component
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
            </Route>

            {/* Portal Routes (Protected) */}
            <Route 
              path="/portal" 
              element={
                <ProtectedRoute>
                  <PortalLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<ProtectedRoute allowedRoles={['admin', 'khatheeb']}><Users /></ProtectedRoute>} />
              <Route path="courses" element={<ProtectedRoute allowedRoles={['admin', 'khatheeb']}><AdminCourses /></ProtectedRoute>} />
              <Route path="suggestions" element={<ProtectedRoute allowedRoles={['admin', 'khatheeb']}><AdminSuggestions /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute allowedRoles={['admin', 'khatheeb']}><Settings /></ProtectedRoute>} />
              <Route path="census-reports" element={<ProtectedRoute allowedRoles={['admin', 'khatheeb', 'member_byma', 'enumerator']}><CensusReports /></ProtectedRoute>} />
              <Route path="mark-attendance" element={<ProtectedRoute allowedRoles={['khatheeb']}><MarkAttendance /></ProtectedRoute>} />
              <Route path="treasurer" element={<ProtectedRoute allowedRoles={['admin', 'treasurer']}><TreasurerDashboard /></ProtectedRoute>} />
              <Route path="president/samaja" element={<ProtectedRoute allowedRoles={['admin', 'president', 'secretary', 'cleaning_minister']}><ManageSamaja /></ProtectedRoute>} />
              <Route path="president/notices" element={<ProtectedRoute allowedRoles={['admin', 'president', 'secretary', 'cleaning_minister']}><ManageNotices /></ProtectedRoute>} />
              <Route path="byma/census" element={<ProtectedRoute allowedRoles={['admin', 'member_byma', 'enumerator']}><CensusForm /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
