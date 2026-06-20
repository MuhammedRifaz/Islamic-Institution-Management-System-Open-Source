import { MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
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

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const name = form.elements['name'].value;
    const category = form.elements['category'].value;
    const rawMessage = form.elements['message'].value;
    
    const isMessageValid = validateField('message', rawMessage);
    if (!isMessageValid) return;

    setSuggestionState('sending');
    
    const message = `[${category}] ${rawMessage}`;
    
    // Import supabase locally
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-[var(--color-primary)] mb-6">Contact Us</h1>
        
        <div className="space-y-6 mb-8">
          <div className="flex items-start">
            <div className="p-3 bg-white rounded-full border border-[#E2D9C8] mr-4 shadow-sm">
              <MapPin size={24} className="text-[var(--color-secondary)]" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-ink)]">Address</h3>
              <p className="text-[var(--color-ink-mid)] mt-1">Islamic Community Center<br/>123 Example Street, City Name — 12345<br/>State, Country</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="p-3 bg-white rounded-full border border-[#E2D9C8] mr-4 shadow-sm">
              <Phone size={24} className="text-[var(--color-secondary)]" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-ink)]">Phone</h3>
              <p className="text-[var(--color-ink-mid)] mt-1">+1 (555) 123-4567</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="p-3 bg-white rounded-full border border-[#E2D9C8] mr-4 shadow-sm">
              <Mail size={24} className="text-[var(--color-secondary)]" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-ink)]">Email</h3>
              <p className="text-[var(--color-ink-mid)] mt-1">contact@communitymasjid.com</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8]">
        <h2 className="text-2xl font-heading font-bold text-[var(--color-primary)] mb-6">Send a Suggestion</h2>
        <form onSubmit={handleSuggestionSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-[var(--color-ink)]">Name (Optional)</label>
            <input name="name" type="text" className="w-full px-4 py-2.5 border border-[#E2D9C8] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-[var(--color-ink)]">Category</label>
            <select name="category" className="w-full px-4 py-2.5 border border-[#E2D9C8] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--color-primary)] bg-white transition-colors">
              <option>General Suggestion</option>
              <option>Madarasa Related</option>
              <option>Facilities / Maintenance</option>
              <option>Events</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-[var(--color-ink)]">Message <span className="text-red-500">*</span></label>
            <textarea 
              name="message"
              rows={4} 
              onChange={(e) => {
                if (fieldErrors.message) validateField('message', e.target.value);
              }}
              onBlur={(e) => validateField('message', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-[var(--radius-md)] focus:outline-none transition-colors resize-none ${
                fieldErrors.message 
                  ? 'border-red-500 focus:border-red-500 bg-red-50/30' 
                  : 'border-[#E2D9C8] focus:border-[var(--color-primary)]'
              }`}></textarea>
              {fieldErrors.message && <p className="text-sm text-red-500 mt-1 flex items-center"><span className="mr-1">⚠</span> {fieldErrors.message}</p>}
          </div>
          
          {suggestionState === 'sent' ? (
            <div className="w-full py-3 bg-green-50 text-green-700 font-bold rounded-[var(--radius-md)] flex items-center justify-center gap-2 border border-green-200">
              <CheckCircle2 size={20} /> Sent Successfully!
            </div>
          ) : (
            <button disabled={suggestionState === 'sending'} type="submit" className="w-full py-3 bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50">
              {suggestionState === 'sending' ? 'Sending...' : 'Submit Suggestion'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
