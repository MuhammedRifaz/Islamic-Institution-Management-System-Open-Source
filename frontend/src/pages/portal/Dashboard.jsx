import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import BymaDashboard from './byma/BymaDashboard';
import RaulathulDashboard from './raulathul/RaulathulDashboard';

export default function Dashboard() {
  const { role, profile } = useAuth();

  // Role-based routing logic
  if (role === 'admin' || role === 'khatheeb') {
    return <AdminDashboard />;
  }

  if (role === 'member_byma' || role === 'enumerator') {
    return <BymaDashboard />;
  }

  if (['student_raulathul', 'treasurer', 'president', 'secretary', 'cleaning_minister'].includes(role)) {
    return <RaulathulDashboard />;
  }

  // Fallback generic portal for students or members
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold text-[var(--color-primary)]">Welcome, {profile?.full_name || 'User'}</h1>
      <p className="text-[var(--color-ink-mid)]">Your portal access is currently restricted to basic view. Depending on your association enrollment, relevant widgets will appear here.</p>
    </div>
  );
}
