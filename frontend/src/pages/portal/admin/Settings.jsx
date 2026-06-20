import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Save, User, MapPin, Phone, Shield } from 'lucide-react';

export default function Settings() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          address: formData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      
      // Auto-hide message
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[var(--color-ink)]">Profile Settings</h1>
        <p className="text-[var(--color-ink-mid)] text-sm mt-1">Update your personal information and contact details.</p>
      </div>
      
      <div className="bg-white p-8 rounded-[var(--radius-lg)] shadow-sm border border-black/5">
        {message.text && (
          <div className={`p-4 rounded-[var(--radius-md)] mb-6 text-sm flex items-center border ${
            message.type === 'success' 
              ? 'bg-[#E8F5EE] text-[var(--color-primary)] border-[var(--color-primary)]/20' 
              : 'bg-red-50 text-red-600 border-red-200'
          }`}>
            <span className="mr-2">{message.type === 'success' ? '✓' : '⚠️'}</span>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--color-ink-mid)] flex items-center gap-2">
                <User size={16} /> Full Name
              </label>
              <input 
                type="text" 
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-black/10 rounded-[var(--radius-md)] focus:outline-none focus:bg-white focus:border-[var(--color-secondary)] transition-all" 
              />
            </div>
            
            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--color-ink-mid)] flex items-center gap-2">
                <Phone size={16} /> Phone Number
              </label>
              <input 
                type="tel" 
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-black/10 rounded-[var(--radius-md)] focus:outline-none focus:bg-white focus:border-[var(--color-secondary)] transition-all" 
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[var(--color-ink-mid)] flex items-center gap-2">
              <MapPin size={16} /> Address
            </label>
            <textarea 
              rows="3"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-black/10 rounded-[var(--radius-md)] focus:outline-none focus:bg-white focus:border-[var(--color-secondary)] transition-all resize-none" 
              placeholder="Enter your full residential address..."
            />
          </div>

          {/* Role (Read Only) */}
          <div className="pt-4 border-t border-black/5">
            <label className="block text-sm font-semibold text-[var(--color-ink-mid)] flex items-center gap-2 mb-2">
              <Shield size={16} /> Current Role
            </label>
            <div className="inline-block px-3 py-1.5 bg-[var(--color-surface-dim)] text-[var(--color-primary)] font-bold text-sm uppercase tracking-wider rounded-[var(--radius-sm)]">
              {profile?.role ? profile.role.replace('_', ' ') : 'Loading...'}
            </div>
            <p className="text-xs text-gray-500 mt-2">Contact a system administrator to change your role or access level.</p>
          </div>

          {/* Submit Button */}
          <div className="pt-6 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 bg-[var(--color-ink)] text-white font-bold rounded-[var(--radius-md)] hover:bg-[var(--color-primary)] transition-all active-press flex items-center gap-2 shadow-sm disabled:opacity-70"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
