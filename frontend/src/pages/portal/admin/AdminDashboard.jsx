import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, CheckCircle, Settings, Database, Activity } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeStudents: 0,
    censusFamilies: 0,
    totalIndividuals: 0
  });
  const [recentCensus, setRecentCensus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch student count
      const { count: studentCount, error: studentError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['student_raulathul', 'secretary', 'cleaning_minister', 'president', 'treasurer']);
        
      if (studentError) throw studentError;

      // Fetch census data
      const { data: censusData, error: censusError } = await supabase
        .from('census_records')
        .select('id, total_members, head_of_family, created_at, family_details')
        .order('created_at', { ascending: false });

      if (censusError) throw censusError;

      const totalIndiv = censusData.reduce((sum, record) => sum + (record.total_members || 0), 0);

      setStats({
        activeStudents: studentCount || 0,
        censusFamilies: censusData.length,
        totalIndividuals: totalIndiv
      });

      // Get last 3 census records for recent activity
      setRecentCensus(censusData.slice(0, 3));

    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-[var(--color-primary)] mb-2">Committee Overview</h1>
        <p className="text-[var(--color-ink-mid)]">Manage the operations of Islamic Community Center.</p>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8]">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-[var(--radius-md)] w-max mb-4">
            <Users size={24} />
          </div>
          <h3 className="font-semibold text-sm text-[var(--color-ink-mid)] mb-1">Active Students</h3>
          <p className="text-3xl font-bold font-heading text-[var(--color-primary)]">
            {loading ? '...' : stats.activeStudents}
          </p>
        </div>

        <div className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8]">
          <div className="p-3 bg-green-50 text-green-600 rounded-[var(--radius-md)] w-max mb-4">
            <CheckCircle size={24} />
          </div>
          <h3 className="font-semibold text-sm text-[var(--color-ink-mid)] mb-1">Census Families Logged</h3>
          <p className="text-3xl font-bold font-heading text-[var(--color-primary)]">
            {loading ? '...' : stats.censusFamilies}
          </p>
        </div>

        <div className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8]">
          <div className="p-3 bg-yellow-50 text-[var(--color-secondary)] rounded-[var(--radius-md)] w-max mb-4">
            <Activity size={24} />
          </div>
          <h3 className="font-semibold text-sm text-[var(--color-ink-mid)] mb-1">Total Individuals Enumerated</h3>
          <p className="text-3xl font-bold font-heading text-[var(--color-primary)]">
            {loading ? '...' : stats.totalIndividuals}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8] overflow-hidden">
          <div className="p-6 border-b border-[var(--color-surface-dim)]">
            <h2 className="text-xl font-heading font-bold text-[var(--color-primary)]">Quick Actions</h2>
          </div>
          <div className="divide-y divide-[var(--color-surface-dim)]">
            <Link to="/portal/census-reports" className="w-full flex items-center p-4 hover:bg-[var(--color-surface-dim)] transition-colors text-left">
              <Database className="text-[var(--color-ink-mid)] mr-4" size={20} />
              <div>
                <div className="font-bold text-[var(--color-ink)]">View Census Database</div>
                <div className="text-sm text-[var(--color-ink-mid)]">Read and analyze all submitted family surveys.</div>
              </div>
            </Link>
            <Link to="/portal/users" className="w-full flex items-center p-4 hover:bg-[var(--color-surface-dim)] transition-colors text-left">
              <Users className="text-[var(--color-ink-mid)] mr-4" size={20} />
              <div>
                <div className="font-bold text-[var(--color-ink)]">Manage Users & Roles</div>
                <div className="text-sm text-[var(--color-ink-mid)]">Approve association members or assign the Khatheeb role.</div>
              </div>
            </Link>
            <Link to="/portal/courses" className="w-full flex items-center p-4 hover:bg-[var(--color-surface-dim)] transition-colors text-left">
              <FileText className="text-[var(--color-ink-mid)] mr-4" size={20} />
              <div>
                <div className="font-bold text-[var(--color-ink)]">Process Course Registrations</div>
                <div className="text-sm text-[var(--color-ink-mid)]">Review and approve pending student applications.</div>
              </div>
            </Link>
            <Link to="/portal/settings" className="w-full flex items-center p-4 hover:bg-[var(--color-surface-dim)] transition-colors text-left">
              <Settings className="text-[var(--color-ink-mid)] mr-4" size={20} />
              <div>
                <div className="font-bold text-[var(--color-ink)]">System Settings</div>
                <div className="text-sm text-[var(--color-ink-mid)]">Adjust portal settings and system rules.</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8] overflow-hidden">
          <div className="p-6 border-b border-[var(--color-surface-dim)]">
            <h2 className="text-xl font-heading font-bold text-[var(--color-primary)]">Recent Census Submissions</h2>
          </div>
          <div className="p-6 space-y-6">
            {loading ? (
              <p className="text-[var(--color-ink-mid)]">Loading activity...</p>
            ) : recentCensus.length === 0 ? (
              <p className="text-[var(--color-ink-mid)]">No recent activity.</p>
            ) : (
              recentCensus.map((record, index) => {
                const colors = ['bg-[var(--color-secondary)]', 'bg-blue-500', 'bg-green-500'];
                return (
                  <div key={record.id} className="flex items-start">
                    <div className={`w-2 h-2 mt-2 rounded-full ${colors[index % colors.length]} mr-4 flex-shrink-0`}></div>
                    <div>
                      <p className="text-[var(--color-ink)] font-semibold text-sm">
                        Family of {record.head_of_family} ({record.total_members} members) logged.
                      </p>
                      <p className="text-xs text-[var(--color-ink-mid)] mt-1">
                        {new Date(record.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
