import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'email') {
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
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
    
    // Clear error as user types, or re-validate if there was an error
    if (fieldErrors[name]) {
      validateField(name, value);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    
    if (!isEmailValid || !isPasswordValid) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Navigate to dashboard on success
      navigate('/portal');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-[var(--color-primary)]" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-primary)]">Portal Login</h1>
          <p className="text-sm text-[var(--color-ink-mid)] mt-1">Authorized personnel only</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-[var(--radius-md)] text-sm mb-6 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-[var(--color-ink)]">
              Email Address <span className="text-red-500 ml-1">*</span>
            </label>
            <input 
              type="email" 
              name="email"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-2.5 border rounded-[var(--radius-md)] focus:outline-none transition-colors ${
                fieldErrors.email 
                  ? 'border-red-500 focus:border-red-500 bg-red-50/30' 
                  : 'border-[#E2D9C8] focus:border-[var(--color-primary)]'
              }`} 
              placeholder="admin@communitymasjid.com"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-500 flex items-center"><span className="mr-1">⚠</span> {fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-[var(--color-ink)]">
              Password <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2.5 border rounded-[var(--radius-md)] focus:outline-none transition-colors pr-12 ${
                  fieldErrors.password 
                    ? 'border-red-500 focus:border-red-500 bg-red-50/30' 
                    : 'border-[#E2D9C8] focus:border-[var(--color-primary)]'
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
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-500 flex items-center"><span className="mr-1">⚠</span> {fieldErrors.password}</p>
            )}
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
        
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-[var(--color-ink-mid)]">
            Don't have an account? <a href="/signup" className="text-[var(--color-primary)] hover:underline font-bold">Sign up</a>
          </p>
          <a href="/" className="block text-sm text-[var(--color-ink-mid)] hover:text-[var(--color-primary)] transition-colors">
            &larr; Back to Public Site
          </a>
        </div>
      </div>
    </div>
  );
}
