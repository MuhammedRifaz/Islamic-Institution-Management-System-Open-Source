import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Database, Search, ChevronDown, ChevronUp, User, MapPin, Phone, GraduationCap, Briefcase, FileText, Edit, Trash2 } from 'lucide-react';

export default function CensusReports() {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJamath, setFilterJamath] = useState('');
  const [filterSupport, setFilterSupport] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('census_records')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/portal/byma/census?edit=${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this census record? This cannot be undone.")) return;
    try {
      const { error } = await supabase
        .from('census_records')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      alert("Record deleted successfully.");
      setRecords(records.filter(r => r.id !== id));
    } catch (err) {
      alert("Error deleting record: " + err.message);
    }
  };

  const filteredRecords = records.filter(record => {
    const data = record.family_details || {};
    const matchesSearch = record.head_of_family?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          data.jamath_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          data.family_serial?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJamath = filterJamath ? data.jamath_name === filterJamath : true;
    
    let matchesSupport = true;
    if (filterSupport === 'Yes') {
      matchesSupport = data.aspirations?.expected_support && data.aspirations.expected_support !== 'None' && data.aspirations.expected_support !== '';
    } else if (filterSupport === 'No') {
      matchesSupport = !data.aspirations?.expected_support || data.aspirations.expected_support === 'None' || data.aspirations.expected_support === '';
    }

    return matchesSearch && matchesJamath && matchesSupport;
  });

  // Extract unique jamaths for the dropdown
  const uniqueJamaths = [...new Set(records.map(r => r.family_details?.jamath_name).filter(Boolean))];

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <div className="text-center py-12 text-[var(--color-ink-mid)] animate-pulse">Loading Census Database...</div>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-[var(--radius-md)] border border-red-200">Error loading records: {error}</div>;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-heading font-bold text-[var(--color-primary)]">Census Database</h1>
        <p className="text-[var(--color-ink-mid)]">View and analyze all synchronized family surveys.</p>
      </div>

      <div className="bg-white p-4 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-mid)]" size={18} />
            <input 
              type="text" 
              placeholder="Search by Name, Jamath, Serial..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#E2D9C8] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <select 
            value={filterJamath} 
            onChange={e => setFilterJamath(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 text-sm border border-[#E2D9C8] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">All Jamaths</option>
            {uniqueJamaths.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
          <select 
            value={filterSupport} 
            onChange={e => setFilterSupport(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 text-sm border border-[#E2D9C8] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">Any Support Need</option>
            <option value="Yes">Needs Masjid Support</option>
            <option value="No">No Support Needed</option>
          </select>
        </div>
        <div className="whitespace-nowrap text-sm font-bold text-[var(--color-primary)] bg-[var(--color-surface)] px-4 py-2 rounded-full border border-[#E2D9C8]">
          <Database size={16} className="inline mr-2" />
          {filteredRecords.length} / {records.length} Families
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="bg-white p-12 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8] text-center text-[var(--color-ink-mid)]">
          No records found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map(record => {
            const data = record.family_details;
            const isExpanded = expandedId === record.id;
            
            return (
              <div key={record.id} className="bg-white rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8] overflow-hidden transition-all duration-200">
                {/* Header / Summary Row */}
                <div 
                  onClick={() => toggleExpand(record.id)}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer hover:bg-[var(--color-surface-dim)]"
                >
                  <div>
                    <h3 className="text-lg font-bold text-[var(--color-primary)] flex items-center">
                      {record.head_of_family}
                      <span className="ml-3 text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                        {data.jamath_name || 'No Jamath'} - {data.family_serial || 'No Serial'}
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-[var(--color-ink-mid)]">
                      <span className="flex items-center"><MapPin size={14} className="mr-1" /> {record.address.substring(0, 25)}...</span>
                      <span className="flex items-center"><Phone size={14} className="mr-1" /> {record.phone_number}</span>
                      <span className="flex items-center"><User size={14} className="mr-1" /> {record.total_members} Members</span>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    {isExpanded ? <ChevronUp className="text-[var(--color-ink-mid)]" /> : <ChevronDown className="text-[var(--color-ink-mid)]" />}
                  </div>
                </div>

                {/* Expanded Details View */}
                {isExpanded && (
                  <div className="p-6 border-t border-[#E2D9C8] bg-gray-50/50 space-y-8 animate-fade-in">
                    
                    {/* Section A */}
                    <div>
                      <h4 className="font-bold text-[var(--color-primary)] border-b border-[#E2D9C8] pb-1 mb-3">A. Head of Family Details</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><span className="block text-xs text-[var(--color-ink-mid)]">Gender</span>{data.head_gender || '-'}</div>
                        <div><span className="block text-xs text-[var(--color-ink-mid)]">Age</span>{data.head_age || '-'}</div>
                        <div><span className="block text-xs text-[var(--color-ink-mid)]">Education</span>{data.head_education || '-'}</div>
                        <div><span className="block text-xs text-[var(--color-ink-mid)]">Occupation</span>{data.head_occupation || '-'}</div>
                        <div><span className="block text-xs text-[var(--color-ink-mid)]">Males</span>{data.male_members || 0}</div>
                        <div><span className="block text-xs text-[var(--color-ink-mid)]">Females</span>{data.female_members || 0}</div>
                        <div><span className="block text-xs text-[var(--color-ink-mid)]">Monthly Inc.</span>{data.monthly_income || '-'}</div>
                        <div><span className="block text-xs text-[var(--color-ink-mid)]">Annual Inc.</span>{data.annual_income || '-'}</div>
                      </div>
                    </div>

                    {/* Section E (Docs) */}
                    <div>
                      <h4 className="font-bold text-[var(--color-primary)] border-b border-[#E2D9C8] pb-1 mb-3">E. Documentation</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {Object.entries(data.docs || {}).map(([key, val]) => (
                          <div key={key} className="flex flex-col border border-[#E2D9C8] rounded p-2 bg-white">
                            <span className="font-semibold capitalize text-[var(--color-ink-mid)]">{key.replace('_', ' ')}</span>
                            <span className={`font-bold ${val.status === 'Yes' ? 'text-green-600' : 'text-red-500'}`}>{val.status}</span>
                            {val.details && <span className="text-gray-500 italic mt-1 truncate" title={val.details}>{val.details}</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section B */}
                    {data.family_members?.length > 0 && (
                      <div>
                        <h4 className="font-bold text-[var(--color-primary)] border-b border-[#E2D9C8] pb-1 mb-3">B. Family Members</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left border border-[#E2D9C8] rounded overflow-hidden">
                            <thead className="bg-[#E2D9C8]/30">
                              <tr>
                                <th className="px-3 py-2">Name</th><th className="px-3 py-2">Relation</th><th className="px-3 py-2">Age</th>
                                <th className="px-3 py-2">Edu</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Occ/Inst.</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.family_members.map((m, i) => (
                                <tr key={i} className="border-b border-[#E2D9C8] bg-white"><td className="px-3 py-2 font-semibold">{m.name || '-'}</td><td className="px-3 py-2">{m.relation || '-'}</td><td className="px-3 py-2">{m.age || '-'}</td><td className="px-3 py-2">{m.edu || '-'}</td><td className="px-3 py-2">{m.status || '-'}</td><td className="px-3 py-2">{m.occ || '-'}</td></tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Section C */}
                    {data.students?.length > 0 && (
                      <div>
                        <h4 className="font-bold text-[var(--color-primary)] border-b border-[#E2D9C8] pb-1 mb-3 flex items-center"><GraduationCap size={16} className="mr-2"/> C. Students</h4>
                        <div className="space-y-2">
                          {data.students.map((s, i) => (
                            <div key={i} className="bg-white p-3 border border-[#E2D9C8] rounded text-sm grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div><span className="font-semibold">{s.name || '-'}</span> ({s.course || '-'})</div>
                              <div><span className="text-gray-500">School:</span> {s.school || '-'}</div>
                              <div><span className="text-gray-500">Exams:</span> {s.exams || '-'}</div>
                              <div><span className="text-gray-500">Career:</span> {s.career || '-'}</div>
                              <div className="sm:col-span-2"><span className="text-gray-500">Support Needed:</span> <span className="font-semibold text-red-600">{s.support || 'None'}</span></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section D */}
                    {data.youth?.length > 0 && (
                      <div>
                        <h4 className="font-bold text-[var(--color-primary)] border-b border-[#E2D9C8] pb-1 mb-3 flex items-center"><Briefcase size={16} className="mr-2"/> D. Youth Employment</h4>
                        <div className="space-y-2">
                          {data.youth.map((y, i) => (
                            <div key={i} className="bg-white p-3 border border-[#E2D9C8] rounded text-sm grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div><span className="font-semibold">{y.name || '-'}</span> (Age {y.age || '-'})</div>
                              <div><span className="text-gray-500">Status:</span> {y.status || '-'}</div>
                              <div><span className="text-gray-500">Gov Job:</span> {y.gov_job} {y.exam_post && `(${y.exam_post})`}</div>
                              <div><span className="text-gray-500">Interests:</span> {y.skill_dev || '-'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section F */}
                    <div>
                      <h4 className="font-bold text-[var(--color-primary)] border-b border-[#E2D9C8] pb-1 mb-3 flex items-center"><FileText size={16} className="mr-2"/> F. Aspirations & Support</h4>
                      <div className="bg-white p-4 border border-[#E2D9C8] rounded text-sm space-y-3">
                        <div><span className="block font-semibold">Dream / Business Goals:</span> {data.aspirations?.dream_career || '-'} | {data.aspirations?.build_business || '-'}</div>
                        <div><span className="block font-semibold">Awareness (Scholarships / Gov Schemes):</span> {data.aspirations?.awareness_scholarships || '-'} | {data.aspirations?.awareness_gov_schemes || '-'}</div>
                        <div className="p-2 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded"><span className="font-bold">Expected Support from Masjid:</span> {data.aspirations?.expected_support || 'None specified'}</div>
                        <div><span className="block font-semibold text-gray-500">Additional Info:</span> {data.aspirations?.addl_info || '-'}</div>
                      </div>
                    </div>

                    {/* Action buttons (Edit & Delete) for allowed users */}
                    {(role === 'admin' || ((role === 'enumerator' || role === 'member_byma') && record.enumerator_id === user?.id)) && (
                      <div className="flex justify-end gap-3 pt-4 border-t border-[#E2D9C8]">
                        <button
                          onClick={() => handleEdit(record.id)}
                          className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 font-semibold text-sm rounded-[var(--radius-md)] border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          <Edit size={16} className="mr-1.5" /> Edit Survey
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="flex items-center px-4 py-2 bg-red-50 text-red-700 font-semibold text-sm rounded-[var(--radius-md)] border border-red-200 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} className="mr-1.5" /> Delete Survey
                        </button>
                      </div>
                    )}

                    <div className="text-right text-xs text-gray-400 mt-4">
                      Logged by Enumerator ID: {record.enumerator_id} on {data.enumerator_date}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
