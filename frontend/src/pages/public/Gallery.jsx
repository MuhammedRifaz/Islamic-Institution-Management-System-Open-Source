import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Image as ImageIcon } from 'lucide-react';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase.storage.from('gallery').list();
      if (error) throw error;
      
      // Filter out hidden files like .emptyFolderPlaceholder
      const files = data.filter(file => file.name && !file.name.startsWith('.'));
      
      const imageUrls = files.map(file => {
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(file.name);
        return {
          id: file.id,
          name: file.name,
          url: publicUrl
        };
      });
      
      setImages(imageUrls);
    } catch (err) {
      console.error('Error loading gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-heading font-bold text-[var(--color-primary)] mb-2">Photo Gallery</h1>
        <p className="text-[var(--color-ink-mid)]">Glimpses of our community and programs.</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
           <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-100 shadow-sm">
          <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-[var(--color-ink-mid)] font-semibold">No photos in the gallery yet.</p>
          <p className="text-sm text-gray-400 mt-2">Admins can upload images via the Supabase Storage "gallery" bucket.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id || image.name} className="aspect-video bg-[var(--color-surface-dim)] rounded-[var(--radius-md)] overflow-hidden border border-black/5 shadow-sm group">
              <img 
                src={image.url} 
                alt={image.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
