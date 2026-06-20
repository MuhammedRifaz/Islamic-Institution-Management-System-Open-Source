import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Calendar, CheckCircle, XCircle, Clock, Users, FileText, LayoutDashboard } from 'lucide-react';

export default function RaulathulDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [attendance, setAttendance] = useState([]);
  const [balance, setBalance] = useState({ dues: 0, paid: 0, pending: 0 });
  
  const [notices, setNotices] = useState([]);
  const [samaja, setSamaja] = useState(null);
  const [profilesMap, setProfilesMap] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch profiles for name mapping
      const { data: profilesData } = await supabase.from('profiles').select('id, full_name');
      const pMap = {};
      if (profilesData) {
        profilesData.forEach(p => pMap[p.id] = p.full_name);
        setProfilesMap(pMap);
      }

      // 2. Fetch attendance
      const { data: attData } = await supabase
        .from('raulathul_attendance')
        .select('*')
        .eq('student_id', user.id)
        .order('date', { ascending: false });
      if (attData) setAttendance(attData);

      // 3. Fetch fees
      const { data: feeData } = await supabase
        .from('fee_transactions')
        .select('*')
        .eq('student_id', user.id);

      if (feeData) {
        let d = 0, p = 0;
        feeData.forEach(tx => {
          if (tx.transaction_type === 'fee_due') d += parseFloat(tx.amount);
          if (tx.transaction_type === 'fee_payment') p += parseFloat(tx.amount);
        });
        setBalance({ dues: d, paid: p, pending: d - p });
      }

      // 4. Fetch Notices
      const { data: noticeData } = await supabase
        .from('student_notices')
        .select('*')
        .order('created_at', { ascending: false });
      if (noticeData) setNotices(noticeData);

      // 5. Fetch Latest Samaja
      const { data: samajaData } = await supabase
        .from('samaja_sessions')
        .select('*')
        .order('event_date', { ascending: false })
        .limit(1)
        .single();
      
      if (samajaData) setSamaja(samajaData);

    } catch (err) {
      console.error("Dashboard fetch error:", err);
      // It's okay if samaja is not found (PGRST116)
      if (err.code !== 'PGRST116') {
        setError("Failed to load some dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-[var(--color-ink-mid)] animate-pulse">Loading dashboard...</div>;

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;

  const getName = (id) => profilesMap[id] || 'Unassigned';

  const renderOverview = () => (
    <div className="animate-fade-in">
      <div className="mb-10 bg-[var(--color-surface)] border border-[#E2D9C8] rounded-[var(--radius-lg)] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-heading font-bold text-[var(--color-ink)]">Your Fee Status</h2>
            <p className="text-sm text-[var(--color-ink-mid)] mt-1">Track your personal pending Madarasa fees</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-[var(--color-ink-mid)] uppercase tracking-wider">Your Pending Fees</div>
            <div className={`text-3xl font-bold ${balance.pending > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₹{Math.max(0, balance.pending).toFixed(2)}
            </div>
          </div>
        </div>
        
        {balance.pending > 0 && (
          <div className="mt-6 pt-6 border-t border-[#E2D9C8]">
            {/* Generic UPI Link */}
            <a 
              href={`upi://pay?pa=community@upi&pn=Community%20Masjid&am=${balance.pending}&cu=INR`}
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm mb-4"
            >
              Pay Pending ₹{balance.pending.toFixed(2)} via UPI
            </a>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
              <span className="text-sm font-semibold text-[var(--color-ink-mid)] uppercase tracking-wider">Quick Pay:</span>
              <div className="flex flex-wrap gap-2">
                <a 
                  href={`upi://pay?pa=community@upi&pn=Community%20Masjid&am=${balance.pending}&cu=INR`}
                  className="px-4 py-2 bg-white border border-black/10 rounded-md shadow-sm hover:bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-800 transition-colors"
                >
                  <span className="text-blue-500 mr-0.5">G</span>
                  <span className="text-red-500 mr-0.5">P</span>
                  <span className="text-yellow-500 mr-0.5">a</span>
                  <span className="text-green-500">y</span>
                </a>
                <a 
                  href={`upi://pay?pa=community@upi&pn=Community%20Masjid&am=${balance.pending}&cu=INR`}
                  className="px-4 py-2 bg-[#5f259f] text-white rounded-md shadow-sm hover:bg-[#4a1c7c] flex items-center justify-center text-sm font-bold transition-colors"
                >
                  PhonePe
                </a>
                <a 
                  href={`upi://pay?pa=community@upi&pn=Community%20Masjid&am=${balance.pending}&cu=INR`}
                  className="px-4 py-2 bg-black text-[#fdd835] rounded-md shadow-sm hover:bg-gray-900 flex items-center justify-center text-sm font-bold transition-colors"
                >
                  FamPay
                </a>
              </div>
            </div>

            <p className="text-xs text-[var(--color-ink-mid)]">
              * Note: iPhone users might be redirected to WhatsApp. To use a specific app, copy the UPI ID: <strong className="select-all">community@upi</strong>
            </p>
          </div>
        )}
      </div>

      <h2 className="text-xl font-heading font-bold text-[var(--color-primary)] mb-4 border-b border-[#E2D9C8] pb-2">Your Attendance Overview</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 p-4 rounded-[var(--radius-md)] border border-green-100 text-center">
              <div className="text-2xl font-bold text-green-700">{presentCount}</div>
              <div className="text-xs text-green-600 font-semibold uppercase tracking-wider">Present</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-[var(--radius-md)] border border-yellow-100 text-center">
              <div className="text-2xl font-bold text-yellow-700">{lateCount}</div>
              <div className="text-xs text-yellow-600 font-semibold uppercase tracking-wider">Late</div>
          </div>
          <div className="bg-red-50 p-4 rounded-[var(--radius-md)] border border-red-100 text-center">
              <div className="text-2xl font-bold text-red-700">{absentCount}</div>
              <div className="text-xs text-red-600 font-semibold uppercase tracking-wider">Absent</div>
          </div>
      </div>

      <h2 className="text-xl font-heading font-bold text-[var(--color-primary)] mb-4 border-b border-[#E2D9C8] pb-2">Recent Logs</h2>

      {attendance.length === 0 ? (
        <p className="text-center text-[var(--color-ink-mid)] py-8">No attendance records found yet.</p>
      ) : (
        <div className="space-y-3">
          {attendance.map((record) => (
            <div key={record.id} className="flex justify-between items-center p-4 bg-[var(--color-surface)] border border-[#E2D9C8] rounded-[var(--radius-md)]">
              <div className="flex items-center text-[var(--color-ink)] font-bold">
                <Calendar size={18} className="text-[var(--color-ink-mid)] mr-3" />
                {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div>
                {record.status === 'present' && <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center"><CheckCircle size={14} className="mr-1"/> Present</span>}
                {record.status === 'late' && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full flex items-center"><Clock size={14} className="mr-1"/> Late</span>}
                {record.status === 'absent' && <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full flex items-center"><XCircle size={14} className="mr-1"/> Absent</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSamaja = () => (
    <div className="animate-fade-in">
      {!samaja ? (
         <div className="text-center py-12 text-[var(--color-ink-mid)] bg-white rounded-[var(--radius-lg)] border border-[#E2D9C8]">No Samaja session scheduled yet.</div>
      ) : (
        <div className="bg-white rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8] overflow-hidden">
          <div className="bg-[var(--color-primary)] p-6 text-center text-white">
            <h2 className="text-2xl font-heading font-bold tracking-tight mb-2">{samaja.topic}</h2>
            <p className="opacity-80 font-medium">Scheduled for Wednesday, {new Date(samaja.event_date).toLocaleDateString()}</p>
          </div>
          
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-6 text-center border-b border-black/5 pb-4 uppercase tracking-wider">Assigned Roles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="text-[var(--color-ink-mid)] font-medium">Prayer</span>
                <span className="font-bold text-[var(--color-ink)]">{getName(samaja.prayer_id)}</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="text-[var(--color-ink-mid)] font-medium">Welcome Speech</span>
                <span className="font-bold text-[var(--color-ink)]">{getName(samaja.welcome_speech_id)}</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="text-[var(--color-ink-mid)] font-medium">Inauguration</span>
                <span className="font-bold text-[var(--color-ink)]">{getName(samaja.inauguration_id)}</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="text-[var(--color-ink-mid)] font-medium">Presidential Address</span>
                <span className="font-bold text-[var(--color-ink)]">{getName(samaja.p_address_id)}</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="text-[var(--color-ink-mid)] font-medium">Qiraath</span>
                <span className="font-bold text-[var(--color-ink)]">{getName(samaja.qiraath_id)}</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="text-[var(--color-ink-mid)] font-medium">Thadrees</span>
                <span className="font-bold text-[var(--color-ink)]">{getName(samaja.thadrees_id)}</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="text-[var(--color-ink-mid)] font-medium">Report Reading</span>
                <span className="font-bold text-[var(--color-ink)]">{getName(samaja.report_id)}</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="text-[var(--color-ink-mid)] font-medium">Vote of Thanks</span>
                <span className="font-bold text-[var(--color-ink)]">{getName(samaja.vote_of_thanks_id)}</span>
              </div>
            </div>

            {(samaja.speech_ids?.length > 0 || samaja.song_ids?.length > 0) && (
              <div className="mt-8 pt-6 border-t border-[#E2D9C8]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {samaja.speech_ids?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-[var(--color-ink)] mb-3 text-sm uppercase tracking-wider text-center">Speeches</h4>
                      <ul className="space-y-2">
                        {samaja.speech_ids.map((id, i) => (
                           <li key={i} className="text-center bg-[var(--color-surface)] py-2 rounded-[var(--radius-sm)] border border-black/5 font-semibold text-[var(--color-primary)]">
                             {getName(id)}
                           </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {samaja.song_ids?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-[var(--color-ink)] mb-3 text-sm uppercase tracking-wider text-center">Islamic Songs</h4>
                      <ul className="space-y-2">
                        {samaja.song_ids.map((id, i) => (
                           <li key={i} className="text-center bg-[var(--color-surface)] py-2 rounded-[var(--radius-sm)] border border-black/5 font-semibold text-[var(--color-secondary)]">
                             {getName(id)}
                           </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderNotices = () => (
    <div className="animate-fade-in">
      {notices.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-ink-mid)] bg-white rounded-[var(--radius-lg)] border border-[#E2D9C8]">No notices available.</div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8]">
              <h3 className="font-heading font-bold text-xl text-[var(--color-primary)] mb-2">{notice.title}</h3>
              <p className="text-xs text-[var(--color-ink-mid)] mb-4 font-medium uppercase tracking-wider">{new Date(notice.created_at).toLocaleDateString()}</p>
              <div className="text-[var(--color-ink)] whitespace-pre-wrap leading-relaxed">{notice.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white p-6 sm:p-8 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8]">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--color-primary)] mb-2">Raulathul Uloom Portal</h1>
        <p className="text-[var(--color-ink-mid)] mb-8">Welcome back, {profile?.full_name}</p>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b border-[#E2D9C8] mb-6 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center px-4 py-3 font-semibold text-sm transition-colors whitespace-nowrap border-b-2 ${activeTab === 'overview' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-ink-mid)] hover:text-[var(--color-ink)]'}`}
          >
            <LayoutDashboard size={18} className="mr-2"/> Overview
          </button>
          <button 
            onClick={() => setActiveTab('samaja')}
            className={`flex items-center px-4 py-3 font-semibold text-sm transition-colors whitespace-nowrap border-b-2 ${activeTab === 'samaja' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-ink-mid)] hover:text-[var(--color-ink)]'}`}
          >
            <Users size={18} className="mr-2"/> Samaja Roles
          </button>
          <button 
            onClick={() => setActiveTab('notices')}
            className={`flex items-center px-4 py-3 font-semibold text-sm transition-colors whitespace-nowrap border-b-2 ${activeTab === 'notices' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-ink-mid)] hover:text-[var(--color-ink)]'}`}
          >
            <FileText size={18} className="mr-2"/> Notices & Reports
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'samaja' && renderSamaja()}
        {activeTab === 'notices' && renderNotices()}

      </div>
    </div>
  );
}
