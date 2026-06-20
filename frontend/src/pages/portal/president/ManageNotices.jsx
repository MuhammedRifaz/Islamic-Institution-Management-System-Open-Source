import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Save, Loader, Trash2 } from 'lucide-react';

export default function ManageNotices() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('student_notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch past notices");
    } finally {
      setFetching(false);
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

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error: insertError } = await supabase
        .from('student_notices')
        .insert({
          title: formData.title,
          content: formData.content,
          created_by: user.id
        });

      if (insertError) throw insertError;

      setSuccess("Notice published successfully!");
      setFormData({ title: '', content: '' });
      fetchNotices();
    } catch (err) {
      console.error(err);
      setError("Failed to publish notice");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      const { error } = await supabase.from('student_notices').delete().eq('id', id);
      if (error) throw error;
      setNotices(notices.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete notice");
    }
  };

  if (fetching) return <div className="text-center py-12 animate-pulse">Loading notices...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-[var(--color-primary)]">Manage Notices & Reports</h1>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-[var(--radius-md)] mb-6 border border-red-100">{error}</div>}
      {success && <div className="p-4 bg-green-50 text-green-600 rounded-[var(--radius-md)] mb-6 border border-green-100">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8] mb-8">
        <h2 className="text-xl font-heading font-bold text-[var(--color-ink)] mb-4">Publish New Notice</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-ink)]">Title <span className="text-red-500">*</span></label>
            <input 
              type="text" name="title" required
              value={formData.title} onChange={handleChange}
              placeholder="E.g., Weekly Report or Important Announcement"
              className="w-full p-2.5 rounded-[var(--radius-md)] border border-black/10 bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-ink)]">Notice Content / Report details <span className="text-red-500">*</span></label>
            <textarea 
              name="content" required rows="6"
              value={formData.content} onChange={handleChange}
              placeholder="Write the full report or notice here..."
              className="w-full p-2.5 rounded-[var(--radius-md)] border border-black/10 bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            ></textarea>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            type="submit" disabled={loading}
            className="flex items-center px-6 py-3 bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm disabled:opacity-70"
          >
            {loading ? <Loader className="animate-spin mr-2" size={20} /> : <Save className="mr-2" size={20} />}
            Publish Notice
          </button>
        </div>
      </form>

      <h2 className="text-xl font-heading font-bold text-[var(--color-primary)] mb-4 border-b border-[#E2D9C8] pb-2">Past Notices</h2>
      
      {notices.length === 0 ? (
        <p className="text-center text-[var(--color-ink-mid)] py-8">No notices published yet.</p>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white p-5 rounded-[var(--radius-md)] shadow-sm border border-[#E2D9C8] flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-[var(--color-ink)]">{notice.title}</h3>
                <p className="text-xs text-[var(--color-ink-mid)] mb-3">{new Date(notice.created_at).toLocaleDateString()}</p>
                <p className="text-sm text-[var(--color-ink)] whitespace-pre-wrap">{notice.content}</p>
              </div>
              <button 
                onClick={() => handleDelete(notice.id)}
                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded transition-colors self-start shrink-0"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
