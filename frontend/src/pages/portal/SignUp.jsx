import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserPlus, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'fullName') {
      if (!value.trim()) errorMsg = 'Full name is required';
    } else if (name === 'phone') {
      const phoneRegex = /^\d{10}$/;
      if (!value) errorMsg = 'Phone number is required';
      else if (!phoneRegex.test(value.replace(/\D/g, ''))) errorMsg = 'Please enter a valid 10-digit phone number';
    } else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) errorMsg = 'Email is required';
      else if (!emailRegex.test(value)) errorMsg = 'Please enter a valid email address';
    } else if (name === 'password') {
      if (!value) errorMsg = 'Password is required';
      else if (value.length < 6) errorMsg = 'Password must be at least 6 characters';
    }
    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg === '';
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) validateField(name, value);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    const isNameValid = validateField('fullName', formData.fullName);
    const isPhoneValid = validateField('phone', formData.phone);
    const isEmailValid = validateField('email', formData.email);
    const isPasswordValid = validateField('password', formData.password);
    
    if (!isNameValid || !isPhoneValid || !isEmailValid || !isPasswordValid) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone_number: formData.phone,
          }
        }
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen -mt-20 lg:-mx-8 flex bg-[var(--color-surface)]">
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10">
        <div className="w-full max-w-md animate-fade-in-up">
          <Link to="/" className="inline-block text-[var(--color-primary)] font-heading font-bold text-xl mb-12 hover-scale">
            Islamic Community Center
          </Link>
          
          <div className="mb-10">
            <h1 className="text-4xl font-heading font-bold text-[var(--color-ink)] tracking-tight mb-3">Create Account</h1>
            <p className="text-[var(--color-ink-mid)] text-lg">Join the Community Digital Hub to access resources and portals.</p>
          </div>

          {error && (
            <div className="bg-red-50/50 text-red-600 p-4 rounded-[var(--radius-md)] text-sm mb-6 border border-red-200/50 backdrop-blur-sm flex items-start">
              <span className="block mt-0.5 mr-2">⚠️</span>
              {error}
            </div>
          )}

          {success ? (
            <div className="bg-[#E8F5EE]/50 text-[var(--color-primary)] p-8 rounded-[var(--radius-lg)] text-center border border-[var(--color-primary)]/20 backdrop-blur-sm">
              <CheckCircle2 size={48} className="mx-auto mb-4 opacity-80" />
              <h3 className="font-heading font-bold text-2xl mb-2">Registration Successful!</h3>
              <p className="text-[var(--color-ink-mid)]">Your account has been created. Please check your email for a verification link. Redirecting you to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--color-ink-mid)]">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-white/60 border rounded-[var(--radius-md)] focus:outline-none transition-all shadow-sm ${
                    fieldErrors.fullName 
                      ? 'border-red-500 focus:border-red-500 bg-red-50/30' 
                      : 'border-black/5 focus:border-[var(--color-secondary)] focus:bg-white'
                  }`} 
                  placeholder="John Doe"
                />
                {fieldErrors.fullName && <p className="text-sm text-red-500 flex items-center"><span className="mr-1">⚠</span> {fieldErrors.fullName}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--color-ink-mid)]">Phone Number <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-white/60 border rounded-[var(--radius-md)] focus:outline-none transition-all shadow-sm ${
                    fieldErrors.phone 
                      ? 'border-red-500 focus:border-red-500 bg-red-50/30' 
                      : 'border-black/5 focus:border-[var(--color-secondary)] focus:bg-white'
                  }`} 
                  placeholder="1234567890"
                />
                {fieldErrors.phone && <p className="text-sm text-red-500 flex items-center"><span className="mr-1">⚠</span> {fieldErrors.phone}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--color-ink-mid)]">Email Address <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-white/60 border rounded-[var(--radius-md)] focus:outline-none transition-all shadow-sm ${
                    fieldErrors.email 
                      ? 'border-red-500 focus:border-red-500 bg-red-50/30' 
                      : 'border-black/5 focus:border-[var(--color-secondary)] focus:bg-white'
                  }`} 
                  placeholder="you@example.com"
                />
                {fieldErrors.email && <p className="text-sm text-red-500 flex items-center"><span className="mr-1">⚠</span> {fieldErrors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--color-ink-mid)]">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-white/60 border rounded-[var(--radius-md)] focus:outline-none transition-all shadow-sm pr-12 ${
                      fieldErrors.password 
                        ? 'border-red-500 focus:border-red-500 bg-red-50/30' 
                        : 'border-black/5 focus:border-[var(--color-secondary)] focus:bg-white'
                    }`} 
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-sm text-red-500 flex items-center"><span className="mr-1">⚠</span> {fieldErrors.password}</p>}
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full py-3.5 mt-4 bg-[var(--color-ink)] text-white font-bold rounded-[var(--radius-md)] hover:bg-[var(--color-primary)] transition-all shadow-md active-press flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Profile...' : (
                  <>
                    Sign Up
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
          
          <div className="mt-10 text-center pt-6 border-t border-black/5">
            <p className="text-[var(--color-ink-mid)]">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] font-bold transition-colors">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Image showcase */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[var(--color-primary)]">
        <img 
          src="https://picsum.photos/seed/community/1000/1200" 
          alt="Community Gathering" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/90 via-transparent to-transparent"></div>
        <div className="absolute bottom-24 left-16 right-16 text-white p-10 glass-dark rounded-[var(--radius-lg)]">
          <UserPlus size={32} className="mb-6 text-[var(--color-secondary)]" />
          <h2 className="text-3xl font-heading font-bold mb-4">Empowering Our Community</h2>
          <p className="text-white/80 leading-relaxed text-lg">
            Create an account to track attendance, register for courses, and engage with the local community digitally.
          </p>
        </div>
      </div>
    </div>
  );
}
