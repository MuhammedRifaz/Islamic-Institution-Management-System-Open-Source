import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { BookOpen, Plus, FolderPlus, ArrowRight, Trash2, Edit2, Clock, Users, UserCheck, X } from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', course_type: 'madarasa', badge: '', audience: '', schedule_time: '' });
  const [saving, setSaving] = useState(false);
  
  // Registration View State
  const [viewingCourse, setViewingCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    
    // Fetch courses
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
      
    // Fetch enrollments
    const { data: enrollmentsData } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        profiles:user_id ( full_name, phone_number )
      `);

    if (!coursesError && coursesData) {
      const coursesWithEnrollments = coursesData.map(c => ({
        ...c,
        enrollments: enrollmentsData ? enrollmentsData.filter(e => e.course_id === c.id) : []
      }));
      setCourses(coursesWithEnrollments);
    }
    setLoading(false);
  };

  const [editingCourseId, setEditingCourseId] = useState(null);

  const openCreateModal = () => {
    setEditingCourseId(null);
    setFormData({ title: '', description: '', course_type: 'madarasa', badge: '', audience: '', schedule_time: '' });
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setEditingCourseId(course.id);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      course_type: course.course_type || 'madarasa',
      badge: course.badge || '',
      audience: course.audience || '',
      schedule_time: course.schedule_time || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    if (editingCourseId) {
      // Update
      const { data, error } = await supabase.from('courses').update(formData).eq('id', editingCourseId).select();
      if (!error && data) {
        setCourses(courses.map(c => c.id === editingCourseId ? { ...data[0], enrollments: c.enrollments } : c));
        setShowModal(false);
      } else {
        console.error(error);
        alert('Error updating course.');
      }
    } else {
      // Create
      const { data, error } = await supabase.from('courses').insert([formData]).select();
      if (!error && data) {
        setCourses([{ ...data[0], enrollments: [] }, ...courses]);
        setShowModal(false);
      } else {
        console.error(error);
        alert('Error creating course.');
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this course?')) {
      await supabase.from('courses').delete().eq('id', id);
      setCourses(courses.filter(c => c.id !== id));
    }
  };
  
  const handleStatusUpdate = async (enrollmentId, newStatus) => {
    const { error } = await supabase
      .from('course_enrollments')
      .update({ status: newStatus })
      .eq('id', enrollmentId);
      
    if (!error) {
      // Refresh local state
      fetchCourses();
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-ink)]">Manage Courses</h1>
          <p className="text-[var(--color-ink-mid)] text-sm mt-1">Review course registrations and student enrollments.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-ink)] text-white font-semibold rounded-[var(--radius-md)] hover:bg-[var(--color-primary)] transition-all shadow-md active-press hover-scale group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          <span>Create Course</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
           <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : courses.length === 0 ? (
        /* Premium Empty State */
        <div className="flex-1 bg-white rounded-[var(--radius-lg)] shadow-sm border border-black/5 flex flex-col items-center justify-center p-12 text-center min-h-[400px] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-50 rounded-full opacity-50 z-0"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#E8F5EE] rounded-full opacity-50 z-0"></div>
          
          <div className="relative z-10 max-w-md mx-auto">
            <div className="w-20 h-20 bg-white shadow-tint rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
              <BookOpen size={40} className="text-[var(--color-primary)] opacity-80" />
            </div>
            
            <h2 className="text-2xl font-heading font-bold text-[var(--color-ink)] mb-3">No Courses Found</h2>
            <p className="text-[var(--color-ink-mid)] mb-8 leading-relaxed">
              It looks like there are no active courses or educational programs. Start building your madarasa's curriculum by creating the first course.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={openCreateModal} className="w-full sm:w-auto px-6 py-3 bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] transition-all active-press flex items-center justify-center gap-2 group shadow-tint">
                <FolderPlus size={18} />
                <span>Create First Course</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-[var(--radius-lg)] p-5 border border-black/5 shadow-sm hover:shadow-tint transition-all group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="px-2.5 py-1 bg-[var(--color-surface)] text-[var(--color-primary)] text-xs font-bold rounded-md uppercase tracking-wider">
                  {course.course_type}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(course)} className="p-1.5 text-gray-400 hover:text-[var(--color-primary)] bg-gray-50 rounded-md transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(course.id)} className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 rounded-md transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="text-lg font-heading font-bold text-[var(--color-ink)] mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-[var(--color-ink-mid)] text-sm mb-4 flex-1 line-clamp-3">{course.description}</p>
              
              <div className="pt-4 border-t border-black/5 space-y-2 mb-4">
                <div className="flex items-center text-xs text-gray-500">
                  <Users size={14} className="mr-2" /> <span>Audience: {course.audience || 'Any'}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock size={14} className="mr-2" /> <span>Time: {course.schedule_time || 'TBA'}</span>
                </div>
              </div>
              
              <button 
                onClick={() => setViewingCourse(course)}
                className="w-full flex items-center justify-between py-2.5 px-4 bg-gray-50 hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold rounded-[var(--radius-md)] transition-colors text-sm"
              >
                <div className="flex items-center gap-2">
                  <UserCheck size={16} />
                  <span>View Registrations</span>
                </div>
                <span className="bg-white px-2 py-0.5 rounded-full text-xs border border-[var(--color-primary)]/20">
                  {course.enrollments?.length || 0}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-[var(--radius-lg)] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-black/5">
              <h2 className="text-xl font-heading font-bold text-[var(--color-ink)]">{editingCourseId ? 'Edit Course' : 'Create New Course'}</h2>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink-mid)] mb-1">Course Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-black/10 rounded-[var(--radius-md)] focus:outline-none focus:bg-white focus:border-[var(--color-secondary)] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink-mid)] mb-1">Description</label>
                <textarea required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-black/10 rounded-[var(--radius-md)] focus:outline-none focus:bg-white focus:border-[var(--color-secondary)] transition-all resize-none"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink-mid)] mb-1">Type</label>
                  <select value={formData.course_type} onChange={e => setFormData({...formData, course_type: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-black/10 rounded-[var(--radius-md)] focus:outline-none focus:bg-white focus:border-[var(--color-secondary)] transition-all">
                    <option value="madarasa">Madarasa</option>
                    <option value="public">Public Program</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink-mid)] mb-1">Badge (e.g., NEW)</label>
                  <input type="text" value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-black/10 rounded-[var(--radius-md)] focus:outline-none focus:bg-white focus:border-[var(--color-secondary)] transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink-mid)] mb-1">Audience</label>
                  <input type="text" placeholder="e.g., Kids 5-10" value={formData.audience} onChange={e => setFormData({...formData, audience: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-black/10 rounded-[var(--radius-md)] focus:outline-none focus:bg-white focus:border-[var(--color-secondary)] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink-mid)] mb-1">Schedule Time</label>
                  <input type="text" placeholder="e.g., Mon/Wed 4pm" value={formData.schedule_time} onChange={e => setFormData({...formData, schedule_time: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-black/10 rounded-[var(--radius-md)] focus:outline-none focus:bg-white focus:border-[var(--color-secondary)] transition-all" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-black/5 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 font-semibold text-gray-500 hover:bg-gray-50 rounded-[var(--radius-md)] transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : (editingCourseId ? 'Save Changes' : 'Create Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* View Registrations Modal */}
      {viewingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-[var(--radius-lg)] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-black/5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-heading font-bold text-[var(--color-ink)]">Registrations</h2>
                <p className="text-sm text-[var(--color-ink-mid)] mt-1">{viewingCourse.title}</p>
              </div>
              <button onClick={() => setViewingCourse(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-0 overflow-y-auto overflow-x-auto flex-1">
              {viewingCourse.enrollments?.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <UserCheck size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No users have enrolled in this course yet.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="p-4 border-b border-black/5">User</th>
                      <th className="p-4 border-b border-black/5">Contact</th>
                      <th className="p-4 border-b border-black/5">Status</th>
                      <th className="p-4 border-b border-black/5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {viewingCourse.enrollments.map(enrollment => (
                      <tr key={enrollment.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-[var(--color-ink)]">{enrollment.profiles?.full_name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5" title={enrollment.user_id}>{enrollment.user_id.substring(0,8)}...</div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {enrollment.profiles?.phone_number || 'N/A'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${
                            enrollment.status === 'Approved' ? 'bg-green-100 text-green-700' :
                            enrollment.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {enrollment.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <select 
                            value={enrollment.status}
                            onChange={(e) => handleStatusUpdate(enrollment.id, e.target.value)}
                            className="px-2 py-1 text-xs font-bold rounded-md border border-black/10 bg-white focus:outline-none focus:border-[var(--color-primary)] uppercase tracking-wider"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="p-6 border-t border-black/5 bg-gray-50">
              <div className="flex justify-between items-center text-sm font-semibold text-gray-600">
                <span>Total Registrations: {viewingCourse.enrollments?.length || 0}</span>
                <button onClick={() => setViewingCourse(null)} className="px-5 py-2 bg-[var(--color-ink)] text-white rounded-[var(--radius-md)] hover:bg-black transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
