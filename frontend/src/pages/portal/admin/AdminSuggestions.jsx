import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { MessageSquare, Trash2, CheckCircle, Clock } from 'lucide-react';

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setSuggestions(data);
    }
    setLoading(false);
  };

  const handleMarkRead = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Unread' ? 'Read' : 'Unread';
    const { error } = await supabase
      .from('suggestions')
      .update({ status: newStatus })
      .eq('id', id);
      
    if (!error) {
      setSuggestions(suggestions.map(s => s.id === id ? { ...s, status: newStatus } : s));
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this suggestion?')) {
      const { error } = await supabase.from('suggestions').delete().eq('id', id);
      if (!error) {
        setSuggestions(suggestions.filter(s => s.id !== id));
      }
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-ink)]">Community Suggestions</h1>
          <p className="text-[var(--color-ink-mid)] text-sm mt-1">Review feedback and suggestions from the public portal.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
           <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="flex-1 bg-white rounded-[var(--radius-lg)] shadow-sm border border-black/5 flex flex-col items-center justify-center p-12 text-center">
          <MessageSquare size={48} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-heading font-bold text-[var(--color-ink)] mb-2">No Suggestions Yet</h2>
          <p className="text-[var(--color-ink-mid)]">The suggestion box is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className={`bg-white rounded-[var(--radius-lg)] p-5 border shadow-sm transition-all relative ${suggestion.status === 'Unread' ? 'border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5' : 'border-black/5'}`}>
              
              {suggestion.status === 'Unread' && (
                <div className="absolute top-4 right-4 w-3 h-3 bg-[var(--color-secondary)] rounded-full animate-pulse"></div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[var(--color-primary)] font-bold">
                  {suggestion.name ? suggestion.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-ink)]">{suggestion.name || 'Anonymous'}</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={12} className="mr-1" />
                    {new Date(suggestion.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-[var(--radius-md)] text-[var(--color-ink-mid)] text-sm mb-4 border border-black/5 leading-relaxed">
                "{suggestion.message}"
              </div>
              
              <div className="flex justify-end gap-2 pt-2 border-t border-black/5">
                <button 
                  onClick={() => handleMarkRead(suggestion.id, suggestion.status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    suggestion.status === 'Unread' 
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle size={14} />
                  {suggestion.status === 'Unread' ? 'Mark as Read' : 'Mark Unread'}
                </button>
                <button 
                  onClick={() => handleDelete(suggestion.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
