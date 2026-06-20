import { Calendar, Clock, MapPin, Play, Camera, BookOpen, Users, GraduationCap, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Home() {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [suggestionState, setSuggestionState] = useState('idle');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'message') {
      if (!value.trim()) errorMsg = 'Suggestion message is required';
      else if (value.trim().length < 10) errorMsg = 'Please provide at least 10 characters';
    }
    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg === '';
  };

  useEffect(() => {
    fetch('https://api.aladhan.com/v1/timingsByCity?city=London&country=UK&method=1')
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          setPrayerTimes(data.data.timings);
        }
      })
      .catch(err => console.error("Error fetching prayer times:", err));
  }, []);

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const name = form.elements['name'].value;
    const message = form.elements['message'].value;
    
    const isMessageValid = validateField('message', message);
    if (!isMessageValid) return;

    setSuggestionState('sending');
    
    // Import supabase locally since we don't have it imported at the top
    const { supabase } = await import('../../lib/supabase');
    
    const { error } = await supabase
      .from('suggestions')
      .insert([{ name: name || null, message }]);

    if (!error) {
      setSuggestionState('sent');
      form.reset();
      setTimeout(() => setSuggestionState('idle'), 3000);
    } else {
      console.error("Error submitting suggestion:", error);
      setSuggestionState('idle');
      alert("Failed to send suggestion. Please try again later.");
    }
  };

  const formatTime = (time24h) => {
    if (!time24h) return '--:--';
    const [h, m] = time24h.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-[var(--color-surface-dim)] rounded-[var(--radius-lg)] border border-[#E2D9C8]">
        {/* Subtle Mashrabiya Pattern Background (Placeholder using CSS gradients for now) */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#1A4731_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="relative z-10 px-6 py-20 md:py-28 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-[var(--color-primary)] mb-4 leading-tight">
            Islamic Community Center
          </h1>
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-secondary)] mb-6 leading-relaxed"
            style={{ fontFamily: "'Amiri', 'Traditional Arabic', 'Scheherazade New', serif" }}
            dir="rtl"
          >
            المسجد والمدرسة
          </h2>
          <p className="text-lg text-[var(--color-ink-mid)] mb-10 max-w-2xl mx-auto">
            A Centre of Knowledge, Prayer & Community in the local area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses" className="px-8 py-3.5 bg-[var(--color-primary)] text-white font-semibold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm">
              Explore Courses
            </Link>
            <Link to="/register" className="px-8 py-3.5 border-2 border-[var(--color-secondary)] text-[var(--color-primary)] font-semibold rounded-[var(--radius-md)] hover:bg-[var(--color-secondary-hover)] transition-colors">
              Register Now
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Prayer Times Widget */}
      <section>
        <div className="bg-white rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8] overflow-hidden">
          <div className="bg-[var(--color-primary)] text-white p-4 text-center">
            <h3 className="font-heading font-bold text-xl">Today's Prayer Times</h3>
            <p className="text-sm opacity-90">Local City</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
                <div key={prayer} className="p-3 bg-[var(--color-surface)] rounded-[var(--radius-md)] border border-[var(--color-surface-dim)]">
                  <div className="text-xs text-[var(--color-ink-mid)] font-semibold uppercase tracking-wider mb-1">{prayer}</div>
                  <div className="font-mono text-lg font-bold text-[var(--color-primary)]">
                    {prayerTimes ? formatTime(prayerTimes[prayer]) : '--:--'}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center text-sm text-[var(--color-ink-mid)]">
              Juma: <span className="font-bold text-[var(--color-primary)]">1:15 PM</span> • Next prayer: Asr in <span className="text-[var(--color-secondary)] font-bold">2h 14m</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. About Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-heading font-bold text-[var(--color-primary)] mb-6">Serving the Community for Generations</h2>
          <p className="text-[var(--color-ink-mid)] leading-relaxed mb-6">
            Islamic Community Center has been the spiritual heart of the local area, fostering a community grounded in faith, education, and mutual support. Through the Community Madarasa, we nurture the next generation with authentic Islamic knowledge while our various adult programs ensure continuous spiritual growth for all ages.
          </p>
          <Link to="/about" className="inline-flex items-center font-semibold text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors">
            Read our full history <ChevronRight size={18} className="ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8] text-center">
            <MapPin className="mx-auto mb-3 text-[var(--color-secondary)]" size={32} />
            <div className="text-3xl font-bold font-heading text-[var(--color-primary)] mb-1">50+</div>
            <div className="text-sm font-semibold text-[var(--color-ink-mid)]">Years of Service</div>
          </div>
          <div className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8] text-center">
            <GraduationCap className="mx-auto mb-3 text-[var(--color-secondary)]" size={32} />
            <div className="text-3xl font-bold font-heading text-[var(--color-primary)] mb-1">300+</div>
            <div className="text-sm font-semibold text-[var(--color-ink-mid)]">Students</div>
          </div>
          <div className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8] text-center">
            <BookOpen className="mx-auto mb-3 text-[var(--color-secondary)]" size={32} />
            <div className="text-3xl font-bold font-heading text-[var(--color-primary)] mb-1">8</div>
            <div className="text-sm font-semibold text-[var(--color-ink-mid)]">Active Classes</div>
          </div>
        </div>
      </section>

      {/* Latticework Divider */}
      <div className="w-full flex justify-center py-4">
        <div className="w-3/5 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-50"></div>
      </div>

      {/* 4. Courses Overview */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-heading font-bold text-[var(--color-primary)] mb-2">Educational Programs</h2>
            <p className="text-[var(--color-ink-mid)]">Discover classes for every age and level.</p>
          </div>
          <Link to="/courses" className="hidden sm:inline-flex items-center font-semibold text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors">
            View All <ChevronRight size={18} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Daily Morning Classes", badge: "Online / Live", time: "Daily Mornings", desc: "Start your day with live Tafseer and Hadees sessions." },
            { title: "Al Kuthubul Majmoo'a", badge: "Offline / Arabic", time: "Morning", desc: "Structured Arabic study for adults." },
            { title: "Community Madarasa", badge: "Madarasa / Children", time: "Evening", desc: "Comprehensive Islamic school for children Class 1 to 8." }
          ].map((course, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8] flex flex-col h-full">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-[#E8F5EE] text-[var(--color-primary)] text-xs font-bold rounded-full mb-3">
                  {course.badge}
                </span>
                <h3 className="font-heading font-bold text-xl text-[var(--color-ink)] mb-2">{course.title}</h3>
                <p className="text-[var(--color-ink-mid)] text-sm">{course.desc}</p>
              </div>
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--color-surface-dim)]">
                <div className="flex items-center text-sm font-semibold text-[var(--color-ink-mid)]">
                  <Clock size={16} className="mr-2 text-[var(--color-secondary)]" />
                  {course.time}
                </div>
                <Link to="/courses" className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] p-2">
                  <ChevronRight size={20} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Khatheeb Usthad & Suggestions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8] p-8 flex flex-col md:flex-row gap-8 items-center">
          <div className="w-32 h-32 rounded-full bg-[var(--color-surface-dim)] border-4 border-[#F5E6B8] flex-shrink-0 flex items-center justify-center overflow-hidden">
            {/* Avatar Placeholder */}
          </div>
          <div>
            <h3 className="text-2xl font-heading font-bold text-[var(--color-primary)] mb-1">Community Imam</h3>
            <p className="text-[var(--color-secondary)] font-semibold mb-4">Chief Imam</p>
            <p className="text-[var(--color-ink-mid)] text-sm leading-relaxed mb-6">
              Leading the spiritual initiatives at Islamic Community Center. Join the daily live sessions and stay connected with the teachings.
            </p>
            <div className="flex gap-3">
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-[var(--radius-md)] text-sm hover:bg-red-100 transition-colors">
                <Play size={16} className="mr-2" /> YouTube
              </a>
              <a href="#" className="flex items-center px-4 py-2 bg-pink-50 text-pink-600 font-semibold rounded-[var(--radius-md)] text-sm hover:bg-pink-100 transition-colors">
                <Camera size={16} className="mr-2" /> Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-primary)] text-white rounded-[var(--radius-lg)] shadow-sm p-8">
          <h3 className="text-xl font-heading font-bold mb-2">Suggestions Box</h3>
          <p className="text-sm text-gray-300 mb-6">We value community feedback.</p>
          <form onSubmit={handleSuggestionSubmit} className="space-y-4">
            <div>
              <input 
                name="name" 
                type="text" 
                placeholder="Name (Optional)" 
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-[var(--radius-md)] text-white placeholder-gray-400 focus:outline-none focus:border-[var(--color-secondary)] transition-colors" 
              />
            </div>
            <div>
              <label className="sr-only">Your suggestion</label>
              <textarea 
                name="message"
                rows={3} 
                placeholder="Your suggestion... *" 
                onChange={(e) => {
                  if (fieldErrors.message) validateField('message', e.target.value);
                }}
                onBlur={(e) => validateField('message', e.target.value)}
                className={`w-full px-4 py-2.5 bg-white/10 border rounded-[var(--radius-md)] text-white placeholder-gray-400 focus:outline-none transition-colors resize-none ${
                  fieldErrors.message 
                    ? 'border-red-400 focus:border-red-400 bg-red-500/10' 
                    : 'border-white/20 focus:border-[var(--color-secondary)]'
                }`}></textarea>
                {fieldErrors.message && <p className="text-sm text-red-300 mt-1 flex items-center"><span className="mr-1">⚠</span> {fieldErrors.message}</p>}
            </div>
            
            {suggestionState === 'sent' ? (
              <div className="w-full py-2.5 bg-green-500/20 text-green-300 font-bold rounded-[var(--radius-md)] flex items-center justify-center gap-2 border border-green-500/50">
                <CheckCircle2 size={18} /> Sent Successfully!
              </div>
            ) : (
              <button disabled={suggestionState === 'sending'} type="submit" className="w-full py-2.5 bg-[var(--color-secondary)] text-[var(--color-primary)] font-bold rounded-[var(--radius-md)] hover:bg-[#F5E6B8] transition-colors disabled:opacity-50">
                {suggestionState === 'sending' ? 'Sending...' : 'Submit'}
              </button>
            )}
          </form>
        </div>
      </section>

    </div>
  );
}
