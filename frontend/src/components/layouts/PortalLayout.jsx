import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { LogOut, Home as HomeIcon, LayoutDashboard, Users, CheckSquare, Settings, BookOpen, Menu, Bell, MessageSquare, DollarSign, Database, X, Calendar, FileText } from 'lucide-react';

export default function PortalLayout() {
  const { role, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/portal') return 'Dashboard';
    if (path.includes('users')) return 'Manage Users';
    if (path.includes('courses')) return 'Courses & Madarasa';
    if (path.includes('suggestions')) return 'Suggestions';
    if (path.includes('settings')) return 'Settings';
    if (path.includes('mark-attendance')) return 'Mark Attendance';
    if (path.includes('census')) return 'Census Survey';
    return 'Portal';
  };

  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to || (to !== '/portal' && location.pathname.startsWith(to));
    return (
      <Link 
        to={to} 
        className={`flex items-center px-4 py-3 rounded-[var(--radius-md)] transition-all group ${
          isActive 
            ? 'bg-[var(--color-surface)] text-[var(--color-primary)] font-bold shadow-sm' 
            : 'hover:bg-white/10 text-white/80 hover:text-white'
        }`}
      >
        <Icon size={18} className={`mr-3 ${isActive ? 'text-[var(--color-secondary)]' : 'text-white/60 group-hover:text-[var(--color-secondary)]'} transition-colors`} /> 
        {children}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-dim)] text-[var(--color-ink)] flex font-ui">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Padded Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 p-4 transition-transform duration-300 md:static md:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col`}>
        <aside className="bg-[var(--color-primary)] text-white flex-1 rounded-[var(--radius-lg)] shadow-tint flex flex-col overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-secondary)] blur-[80px] opacity-20 -mr-10 -mt-10 rounded-full pointer-events-none"></div>
          
          <div className="p-6 border-b border-white/10 relative z-10">
            <div className="flex items-center space-x-3">
              
              <h2 className="text-xl font-heading font-bold text-white tracking-tight">Community Portal</h2>
            </div>
            <div className="inline-block px-2.5 py-1 mt-3 bg-white/10 rounded-full text-[0.65rem] font-bold text-[var(--color-secondary)] uppercase tracking-wider">
              {role ? role.replace('_', ' ') : 'User'} Access
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1.5 font-medium overflow-y-auto relative z-10 custom-scrollbar">
            <NavLink to="/portal" icon={LayoutDashboard}>Dashboard</NavLink>

            {(role === 'admin' || role === 'khatheeb') && (
              <>
                <NavLink to="/portal/users" icon={Users}>Manage Users</NavLink>
                <NavLink to="/portal/courses" icon={BookOpen}>Courses</NavLink>
                <NavLink to="/portal/suggestions" icon={MessageSquare}>Suggestions</NavLink>
                <NavLink to="/portal/settings" icon={Settings}>Settings</NavLink>
              </>
            )}

            {role === 'khatheeb' && (
              <NavLink to="/portal/mark-attendance" icon={CheckSquare}>Mark Attendance</NavLink>
            )}

            {(role === 'treasurer' || role === 'admin') && (
              <NavLink to="/portal/treasurer" icon={DollarSign}>Fee Management</NavLink>
            )}

            {['admin', 'president', 'secretary', 'cleaning_minister'].includes(role) && (
              <>
                <NavLink to="/portal/president/samaja" icon={Calendar}>Manage Samaja</NavLink>
                <NavLink to="/portal/president/notices" icon={FileText}>Manage Notices</NavLink>
              </>
            )}

            {(role === 'member_byma' || role === 'enumerator' || role === 'admin') && (
              <NavLink to="/portal/byma/census" icon={Users}>Census Survey</NavLink>
            )}

            {(role === 'admin' || role === 'khatheeb' || role === 'member_byma' || role === 'enumerator') && (
              <NavLink to="/portal/census-reports" icon={Database}>Census Database</NavLink>
            )}
          </nav>

          <div className="p-4 border-t border-white/10 space-y-1.5 relative z-10">
            <Link to="/" className="flex items-center px-4 py-3 rounded-[var(--radius-md)] hover:bg-white/10 text-white/80 hover:text-white transition-colors text-sm font-medium">
              <HomeIcon size={18} className="mr-3 text-white/60" /> Public Site
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 rounded-[var(--radius-md)] hover:bg-red-500/20 text-red-300 transition-colors text-sm font-medium">
              <LogOut size={18} className="mr-3 opacity-80" /> Sign Out
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden p-4 bg-[var(--color-primary)] text-white flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2">
            
            <h2 className="font-heading font-bold text-lg">Community Portal</h2>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-white/10 rounded-[var(--radius-sm)] hover-scale active-press"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>
        
        {/* Top Navbar for Desktop */}
        <header className="hidden md:flex h-20 items-center justify-between px-8 bg-transparent">
          <div className="flex items-center">
            <h1 className="text-2xl font-heading font-bold text-[var(--color-ink)]">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-[var(--color-ink-mid)] hover:text-[var(--color-primary)] bg-white rounded-full shadow-sm hover:shadow-md transition-all hover-scale">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full shadow-sm border border-black/5">
              <div className="w-8 h-8 rounded-full bg-[var(--color-surface-dim)] flex items-center justify-center text-[var(--color-primary)] font-bold text-sm">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-semibold text-[var(--color-ink)]">{profile?.full_name || 'User'}</span>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-auto p-4 md:px-8 md:pb-8 animate-fade-in-up">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
