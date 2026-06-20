import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function MarkAttendance() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({}); // { student_id: 'present' | 'absent' | 'late' }
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStudentsAndAttendance();
  }, [selectedDate]);

  const fetchStudentsAndAttendance = async () => {
    try {
      setLoading(true);
      // Fetch all raulathul students
      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('role', ['student_raulathul', 'secretary', 'cleaning_minister', 'president', 'treasurer']);
      
      if (studentError) throw studentError;
      setStudents(studentData || []);

      // Fetch existing attendance for this date
      const { data: attData, error: attError } = await supabase
        .from('raulathul_attendance')
        .select('student_id, status')
        .eq('date', selectedDate);
        
      if (attError) throw attError;
      
      const attMap = {};
      if (attData) {
        attData.forEach(r => { attMap[r.student_id] = r.status; });
      }
      setAttendance(attMap);

    } catch (err) {
      console.error(err);
      setMessage("Error loading data.");
    } finally {
      setLoading(false);
    }
  };

  const markStatus = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      // Prepare upsert payload
      const payload = Object.keys(attendance).map(studentId => ({
        student_id: studentId,
        date: selectedDate,
        status: attendance[studentId],
        marked_by: user.id
      }));

      if (payload.length === 0) {
         setMessage("No attendance marked yet.");
         setSaving(false);
         return;
      }

      const { error } = await supabase
        .from('raulathul_attendance')
        .upsert(payload, { onConflict: 'student_id, date' });

      if (error) throw error;
      setMessage("Attendance saved successfully!");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage("Error saving attendance.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-[var(--color-ink-mid)] animate-pulse">Loading class list...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8]">
        <h1 className="text-2xl font-heading font-bold text-[var(--color-primary)] mb-2">Mark Attendance</h1>
        <p className="text-[var(--color-ink-mid)] mb-6">Raulathul Uloom Students</p>

        <div className="flex items-center space-x-4 mb-8">
          <Calendar className="text-[var(--color-ink-mid)]" />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-[#E2D9C8] rounded outline-none focus:border-[var(--color-primary)] font-bold text-[var(--color-ink)]"
          />
        </div>

        {message && (
          <div className={`p-4 rounded-[var(--radius-md)] mb-6 ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        {students.length === 0 ? (
          <p className="text-center text-[var(--color-ink-mid)] py-8">No Raulathul Uloom students registered.</p>
        ) : (
          <div className="space-y-3">
            {students.map(student => (
              <div key={student.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[var(--color-surface)] border border-[#E2D9C8] rounded-[var(--radius-md)]">
                <span className="font-bold text-[var(--color-primary)] mb-3 sm:mb-0">{student.full_name}</span>
                <div className="flex space-x-2 w-full sm:w-auto">
                  <button 
                    onClick={() => markStatus(student.id, 'present')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded font-bold text-sm flex items-center justify-center transition-colors ${attendance[student.id] === 'present' ? 'bg-green-600 text-white' : 'bg-white border border-[#E2D9C8] text-gray-600 hover:bg-green-50'}`}
                  >
                    <CheckCircle size={16} className="mr-2 hidden sm:block" /> Present
                  </button>
                  <button 
                    onClick={() => markStatus(student.id, 'late')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded font-bold text-sm flex items-center justify-center transition-colors ${attendance[student.id] === 'late' ? 'bg-yellow-500 text-white' : 'bg-white border border-[#E2D9C8] text-gray-600 hover:bg-yellow-50'}`}
                  >
                    <Clock size={16} className="mr-2 hidden sm:block" /> Late
                  </button>
                  <button 
                    onClick={() => markStatus(student.id, 'absent')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded font-bold text-sm flex items-center justify-center transition-colors ${attendance[student.id] === 'absent' ? 'bg-red-600 text-white' : 'bg-white border border-[#E2D9C8] text-gray-600 hover:bg-red-50'}`}
                  >
                    <XCircle size={16} className="mr-2 hidden sm:block" /> Absent
                  </button>
                </div>
              </div>
            ))}
            
            <div className="pt-6 border-t border-[#E2D9C8] text-right mt-6">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="px-8 py-3 bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Attendance Record'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
