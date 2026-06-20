import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Filter, Search, Clock, Users, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setCourses(data);
    }
    setLoading(false);
  };

  const fetchEnrollments = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('course_enrollments')
      .select('course_id, status')
      .eq('user_id', user.id);
      
    if (!error && data) {
      setEnrollments(data);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Optimistic UI update
    setEnrollments([...enrollments, { course_id: courseId, status: 'Pending' }]);
    
    const { error } = await supabase
      .from('course_enrollments')
      .insert([
        { user_id: user.id, course_id: courseId, status: 'Pending' }
      ]);
      
    if (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll. You might already be enrolled.');
      fetchEnrollments(); // Revert
    }
  };

  const getEnrollmentStatus = (courseId) => {
    return enrollments.find(e => e.course_id === courseId)?.status;
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          (course.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
                          
    let matchesCategory = true;
    if (categoryFilter !== 'All Categories') {
       const lowerFilter = categoryFilter.toLowerCase();
       const typeStr = (course.course_type || '').toLowerCase();
       const audienceStr = (course.audience || '').toLowerCase();
       const badgeStr = (course.badge || '').toLowerCase();
       
       if (lowerFilter === 'online' || lowerFilter === 'offline') {
           matchesCategory = typeStr.includes(lowerFilter) || badgeStr.includes(lowerFilter);
       } else {
           matchesCategory = audienceStr.includes(lowerFilter) || badgeStr.includes(lowerFilter);
       }
    }
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-white min-h-[320px] flex flex-col justify-end p-8 md:p-12">
        <div className="absolute inset-0 z-0">
          <img src="https://picsum.photos/seed/library/1920/1080" alt="Library background" className="w-full h-full object-cover opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)] to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 tracking-tight">Educational Programs</h1>
          <p className="text-gray-200 text-lg leading-relaxed font-ui max-w-xl">
            Browse our comprehensive list of classes, workshops, and madarasa programs tailored for every age group and knowledge level.
          </p>
        </div>
      </div>

      {/* Filter Bar - Floating Glass Pill style */}
      <div className="sticky top-24 z-40 mx-auto glass rounded-2xl md:rounded-full px-6 py-4 md:py-3 flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-center shadow-tint max-w-5xl transition-all">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2 bg-[var(--color-surface-dim)] rounded-full text-[var(--color-ink-mid)] shrink-0">
            <Filter size={18} />
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent font-semibold text-sm outline-none w-full md:w-auto text-[var(--color-ink)] cursor-pointer hover:text-[var(--color-primary)] transition-colors appearance-none"
          >
            <option>All Categories</option>
            <option>Online</option>
            <option>Offline</option>
            <option>Youth</option>
            <option>Women</option>
            <option>Adult</option>
          </select>
        </div>
        <div className="relative w-full md:w-80 group">
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-white/50 border border-transparent rounded-full text-sm focus:outline-none focus:bg-white focus:border-[var(--color-secondary)] transition-all shadow-sm group-hover:shadow-md" 
          />
          <Search size={18} className="absolute left-4 top-3 text-[var(--color-ink-mid)] group-focus-within:text-[var(--color-primary)] transition-colors" />
        </div>
      </div>

      {/* Courses Masonry Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-[var(--radius-lg)] border border-black/5 shadow-sm max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-[var(--color-ink)] mb-2">No programs found</h3>
          <p className="text-[var(--color-ink-mid)]">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 mt-12 max-w-7xl mx-auto">
          {filteredCourses.map((course) => {
            const enrollmentStatus = getEnrollmentStatus(course.id);
            
            return (
              <div key={course.id} className="break-inside-avoid bg-white rounded-[var(--radius-lg)] p-8 shadow-sm hover:shadow-tint transition-all duration-300 flex flex-col border border-black/[0.03] group hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-surface-dim)] rounded-full blur-3xl opacity-50 -mr-10 -mt-10 group-hover:bg-[var(--color-secondary)] group-hover:opacity-20 transition-all"></div>
                
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-[var(--color-surface-dim)] text-[var(--color-primary)] text-xs font-bold tracking-wide rounded-full mb-4 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                    {course.badge || course.course_type}
                  </span>
                  <h3 className="font-heading font-bold text-2xl text-[var(--color-ink)] mb-3 leading-tight group-hover:text-[var(--color-primary)] transition-colors">{course.title}</h3>
                  <p className="text-[var(--color-ink-mid)] text-sm leading-relaxed mb-6">{course.description}</p>
                </div>
                
                <div className="mt-auto space-y-4 pt-6 border-t border-black/[0.04] relative z-10">
                  <div className="flex items-center text-sm font-medium text-[var(--color-ink-mid)]">
                    <Clock size={16} className="mr-3 text-[var(--color-secondary)]" /> {course.schedule_time || 'TBA'}
                  </div>
                  <div className="flex items-center text-sm font-medium text-[var(--color-ink-mid)]">
                    <Users size={16} className="mr-3 text-[var(--color-secondary)]" /> Audience: {course.audience || 'Any'}
                  </div>
                  <div className="pt-4">
                    {enrollmentStatus ? (
                      <div className="inline-flex w-full items-center justify-center py-3 px-5 bg-green-50 text-green-700 border border-green-200 font-bold rounded-[var(--radius-md)] cursor-default">
                        <CheckCircle2 size={18} className="mr-2" />
                        <span>Enrolled ({enrollmentStatus})</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEnroll(course.id)}
                        className="inline-flex w-full items-center justify-between py-3 px-5 bg-[var(--color-surface)] text-[var(--color-ink)] font-bold rounded-[var(--radius-md)] hover:bg-[var(--color-primary)] hover:text-white transition-all active-press group/btn"
                      >
                        <span>Enroll Now</span>
                        <ChevronRight size={18} className="text-[var(--color-secondary)] group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
