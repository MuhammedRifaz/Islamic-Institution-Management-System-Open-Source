import { useState, useEffect } from 'react';
import { FileText, ClipboardList, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

export default function BymaDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ surveys: 0, individuals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('census_records')
        .select('total_members')
        .eq('enumerator_id', profile.id);

      if (error) throw error;

      if (data) {
        const totalIndividuals = data.reduce((sum, record) => sum + (record.total_members || 0), 0);
        setStats({ surveys: data.length, individuals: totalIndividuals });
      }
    } catch (err) {
      console.error('Error fetching enumerator stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-[var(--color-primary)] mb-2">Enumerator Portal</h1>
        <p className="text-[var(--color-ink-mid)]">Manage your census data collection tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8]">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-[var(--radius-md)] w-max mb-4">
            <FileText size={24} />
          </div>
          <h3 className="font-semibold text-sm text-[var(--color-ink-mid)] mb-1">Total Surveys Logged</h3>
          <p className="text-3xl font-bold font-heading text-[var(--color-primary)]">
            {loading ? '...' : stats.surveys}
          </p>
        </div>

        <div className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8]">
          <div className="p-3 bg-green-50 text-green-600 rounded-[var(--radius-md)] w-max mb-4">
            <Users size={24} />
          </div>
          <h3 className="font-semibold text-sm text-[var(--color-ink-mid)] mb-1">Total Individuals Enumerated</h3>
          <p className="text-3xl font-bold font-heading text-[var(--color-primary)]">
            {loading ? '...' : stats.individuals}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8] overflow-hidden">
        <div className="p-6 border-b border-[var(--color-surface-dim)]">
          <h2 className="text-xl font-heading font-bold text-[var(--color-primary)]">Community Census Survey</h2>
          <p className="text-sm text-[var(--color-ink-mid)] mt-1">Conduct door-to-door data collection securely.</p>
        </div>
        <div className="p-6">
          <Link 
            to="/portal/byma/census" 
            className="inline-flex items-center px-6 py-3 bg-[var(--color-secondary)] text-[var(--color-primary)] font-bold rounded-[var(--radius-md)] hover:bg-[#b89842] transition-colors"
          >
            <ClipboardList size={20} className="mr-2" /> Start New Survey
          </Link>
        </div>
      </div>
    </div>
  );
}
