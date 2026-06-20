import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Save, Calendar, Loader } from 'lucide-react';

export default function ManageSamaja() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    topic: '',
    event_date: '',
    prayer_id: '',
    welcome_speech_id: '',
    inauguration_id: '',
    p_address_id: '',
    qiraath_id: '',
    thadrees_id: '',
    report_id: '',
    vote_of_thanks_id: '',
    speech1: '',
    speech2: '',
    speech3: '',
    song1: '',
    song2: ''
  });

  useEffect(() => {
    fetchStudentsAndSessions();
  }, []);

  const fetchStudentsAndSessions = async () => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('role', ['student_raulathul', 'president', 'treasurer', 'secretary', 'cleaning_minister'])
        .order('full_name');

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      const { data: sessionsData, error: sessionsError } = await supabase
        .from('samaja_sessions')
        .select('*')
        .order('event_date', { ascending: false });

      if (sessionsError) throw sessionsError;
      setSessions(sessionsData || []);

    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
    } finally {
      setFetching(false);
    }
  };

  const handleEditSelect = (e) => {
    const id = e.target.value;
    setEditingId(id);
    if (!id) {
      setFormData({
        topic: '', event_date: '', prayer_id: '', welcome_speech_id: '', inauguration_id: '',
        p_address_id: '', qiraath_id: '', thadrees_id: '', report_id: '', vote_of_thanks_id: '',
        speech1: '', speech2: '', speech3: '', song1: '', song2: ''
      });
      return;
    }
    const session = sessions.find(s => s.id === id);
    if (session) {
      setFormData({
        topic: session.topic || '',
        event_date: session.event_date || '',
        prayer_id: session.prayer_id || '',
        welcome_speech_id: session.welcome_speech_id || '',
        inauguration_id: session.inauguration_id || '',
        p_address_id: session.p_address_id || '',
        qiraath_id: session.qiraath_id || '',
        thadrees_id: session.thadrees_id || '',
        report_id: session.report_id || '',
        vote_of_thanks_id: session.vote_of_thanks_id || '',
        speech1: session.speech_ids?.[0] || '',
        speech2: session.speech_ids?.[1] || '',
        speech3: session.speech_ids?.[2] || '',
        song1: session.song_ids?.[0] || '',
        song2: session.song_ids?.[1] || ''
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const speech_ids = [formData.speech1, formData.speech2, formData.speech3].filter(Boolean);
    const song_ids = [formData.song1, formData.song2].filter(Boolean);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const payload = {
        topic: formData.topic,
        event_date: formData.event_date,
        prayer_id: formData.prayer_id || null,
        welcome_speech_id: formData.welcome_speech_id || null,
        inauguration_id: formData.inauguration_id || null,
        p_address_id: formData.p_address_id || null,
        qiraath_id: formData.qiraath_id || null,
        thadrees_id: formData.thadrees_id || null,
        report_id: formData.report_id || null,
        vote_of_thanks_id: formData.vote_of_thanks_id || null,
        speech_ids,
        song_ids,
        created_by: user.id
      };

      let insertError;
      if (editingId) {
        const { error } = await supabase
          .from('samaja_sessions')
          .update(payload)
          .eq('id', editingId);
        insertError = error;
      } else {
        const { error } = await supabase
          .from('samaja_sessions')
          .insert(payload);
        insertError = error;
      }

      if (insertError) throw insertError;

      setSuccess(editingId ? "Samaja session updated successfully!" : "Samaja session scheduled successfully!");
      setFormData({
        topic: '', event_date: '', prayer_id: '', welcome_speech_id: '', inauguration_id: '',
        p_address_id: '', qiraath_id: '', thadrees_id: '', report_id: '', vote_of_thanks_id: '',
        speech1: '', speech2: '', speech3: '', song1: '', song2: ''
      });
      setEditingId('');
      fetchStudentsAndSessions();
    } catch (err) {
      console.error(err);
      setError("Failed to schedule Samaja session");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center py-12 animate-pulse">Loading data...</div>;

  const StudentSelect = ({ name, label }) => (
    <div>
      <label className="block text-sm font-semibold mb-1 text-[var(--color-ink)]">{label}</label>
      <select 
        name={name} 
        value={formData[name]} 
        onChange={handleChange}
        className="w-full p-2.5 rounded-[var(--radius-md)] border border-black/10 bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
      >
        <option value="">-- Unassigned --</option>
        {students.map(s => (
          <option key={s.id} value={s.id}>{s.full_name}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-[var(--color-primary)]">Manage Wednesday Samaja</h1>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-[var(--radius-md)] mb-6 border border-red-100">{error}</div>}
      {success && <div className="p-4 bg-green-50 text-green-600 rounded-[var(--radius-md)] mb-6 border border-green-100">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8]">
        
        <div className="mb-8 border-b border-black/5 pb-8">
          <label className="block text-sm font-semibold mb-1 text-[var(--color-ink)]">Select Session to Edit (Optional)</label>
          <select 
            value={editingId} 
            onChange={handleEditSelect}
            className="w-full p-2.5 rounded-[var(--radius-md)] border border-black/10 bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
          >
            <option value="">-- Create New Session --</option>
            {sessions.map(s => (
              <option key={s.id} value={s.id}>{s.event_date} - {s.topic}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-black/5 pb-8">
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-ink)]">Topic / Theme <span className="text-red-500">*</span></label>
            <input 
              type="text" name="topic" required
              value={formData.topic} onChange={handleChange}
              placeholder="E.g., Importance of Time"
              className="w-full p-2.5 rounded-[var(--radius-md)] border border-black/10 bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-ink)]">Date (Wednesday) <span className="text-red-500">*</span></label>
            <input 
              type="date" name="event_date" required
              value={formData.event_date} onChange={handleChange}
              className="w-full p-2.5 rounded-[var(--radius-md)] border border-black/10 bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
          </div>
        </div>

        <h2 className="text-xl font-heading font-bold text-[var(--color-ink)] mb-4">Assign Roles</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <StudentSelect name="prayer_id" label="Prayer" />
          <StudentSelect name="welcome_speech_id" label="Welcome Speech" />
          <StudentSelect name="inauguration_id" label="Inauguration" />
          <StudentSelect name="p_address_id" label="Presidential Address" />
          <StudentSelect name="qiraath_id" label="Qiraath" />
          <StudentSelect name="thadrees_id" label="Thadrees" />
          <StudentSelect name="report_id" label="Report Reading" />
          <StudentSelect name="vote_of_thanks_id" label="Vote of Thanks" />
        </div>

        <div className="mt-8 border-t border-black/5 pt-8">
          <h3 className="font-heading font-bold text-[var(--color-ink)] mb-4">Speeches (Max 3)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StudentSelect name="speech1" label="Speech 1" />
            <StudentSelect name="speech2" label="Speech 2" />
            <StudentSelect name="speech3" label="Speech 3" />
          </div>
        </div>

        <div className="mt-8 border-t border-black/5 pt-8">
          <h3 className="font-heading font-bold text-[var(--color-ink)] mb-4">Islamic Songs (Max 2)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StudentSelect name="song1" label="Song 1" />
            <StudentSelect name="song2" label="Song 2" />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            type="submit" disabled={loading}
            className="flex items-center px-6 py-3 bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm disabled:opacity-70"
          >
            {loading ? <Loader className="animate-spin mr-2" size={20} /> : <Save className="mr-2" size={20} />}
            {editingId ? 'Update Schedule' : 'Publish Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
}
