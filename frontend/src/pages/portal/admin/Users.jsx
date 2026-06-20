import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Search, Filter, MoreVertical, Edit2, Trash2, Mail, Shield } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [currentUserRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchCurrentUserRole();
  }, []);

  const fetchCurrentUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.rpc('get_user_role', { user_id: user.id });
      setCurrentUserRole(data);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    // Optimistic UI update
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating role:', error);
      alert('Failed to update user role.');
      fetchUsers(); // Revert on failure
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md uppercase tracking-wider">Admin</span>;
      case 'president': return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md uppercase tracking-wider">President</span>;
      case 'secretary': return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-md uppercase tracking-wider">Secretary</span>;
      case 'cleaning_minister': return <span className="px-2.5 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-md uppercase tracking-wider">Cleaning Min & Jt Sec</span>;
      case 'khatheeb': return <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-md uppercase tracking-wider">Khatheeb</span>;
      case 'member_byma': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md uppercase tracking-wider">BYMA</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md uppercase tracking-wider">{role.replace('_', ' ')}</span>;
    }
  };

  const filteredUsers = users.filter(user => 
    (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    user.id.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-black/5">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-ink)]">Manage Users</h1>
          <p className="text-[var(--color-ink-mid)] text-sm mt-1">View and edit user roles and association memberships.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-black/10 rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" 
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button className="p-2 border border-black/10 rounded-[var(--radius-md)] hover:bg-gray-50 text-gray-600 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-[var(--radius-lg)] shadow-sm border border-black/5 overflow-hidden">
        {/* Table Header Area */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-black/5 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div className="col-span-5 pl-4">User Details</div>
          <div className="col-span-3">User ID</div>
          <div className="col-span-4 pr-4">Role / Actions</div>
        </div>

        {/* List Body */}
        {loading ? (
          <div className="p-8 text-center text-gray-500 flex justify-center">
            <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found.</div>
        ) : (
          <div className="divide-y divide-black/5">
            {filteredUsers.map((user) => (
              <div key={user.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:items-center hover:bg-gray-50/50 transition-colors group">
                
                {/* User Details */}
                <div className="col-span-1 md:col-span-5 flex items-center gap-4 pl-0 md:pl-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-surface-dim)] flex items-center justify-center text-[var(--color-primary)] font-bold text-sm border border-black/10">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--color-ink)] text-sm md:text-base group-hover:text-[var(--color-primary)] transition-colors">{user.full_name || 'Anonymous User'}</h3>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                      <Mail size={12} className="mr-1" /> {user.phone_number || 'No contact'}
                    </div>
                  </div>
                </div>

                {/* ID (Mobile: Hidden, Desktop: Shown) */}
                <div className="hidden md:block col-span-3 text-sm text-gray-600 font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  <span className="truncate block w-32" title={user.id}>{user.id.substring(0, 8)}...</span>
                </div>

                {/* Role / Actions */}
                <div className="col-span-1 md:col-span-4 flex items-center justify-between md:justify-end gap-4 pr-0 md:pr-4 pt-2 md:pt-0 border-t border-gray-100 md:border-0 mt-2 md:mt-0">
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="md:hidden text-xs text-gray-500 font-bold uppercase w-16">Role:</span>
                    {currentUserRole === 'admin' ? (
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="flex-1 md:w-auto px-2 py-1.5 text-xs font-bold rounded-md border border-black/10 bg-white focus:outline-none focus:border-[var(--color-primary)] uppercase tracking-wider"
                      >
                        <option value="public">Public</option>
                        <option value="admin">Admin</option>
                        <option value="khatheeb">Khatheeb</option>
                        <option value="president">President</option>
                        <option value="secretary">Secretary</option>
                        <option value="treasurer">Treasurer</option>
                        <option value="cleaning_minister">Cleaning Minister & Joint Secretary</option>
                        <option value="member_byma">BYMA Member</option>
                        <option value="enumerator">Enumerator</option>
                        <option value="student_raulathul">Student (Raulathul)</option>
                      </select>
                    ) : (
                      getRoleBadge(user.role)
                    )}
                  </div>
                  {currentUserRole === 'admin' && (
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shrink-0" title="Delete User (Not Implemented)">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
