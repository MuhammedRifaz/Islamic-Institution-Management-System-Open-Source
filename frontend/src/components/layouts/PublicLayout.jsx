import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, MapPin, Phone, Mail, Camera, Play, X } from 'lucide-react';

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-[100dvh] bg-[var(--color-surface)] text-[var(--color-ink)] flex flex-col font-ui relative">
      {/* Header */}
      <header className="sticky top-4 z-50 mx-4 sm:mx-6 lg:mx-8 glass rounded-[var(--radius-lg)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo area */}
            <div className="flex items-center z-20">
              <Link to="/" className="flex items-center hover-scale">
                
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-heading font-bold text-[var(--color-primary)]">Islamic Community Center</span>
                  <span className="text-xs text-[var(--color-ink-mid)] uppercase tracking-widest font-semibold hidden sm:block">Local Neighborhood</span>
                </div>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8 font-medium text-sm">
              <Link to="/" className="hover:text-[var(--color-primary)] hover:-translate-y-0.5 transition-all">Home</Link>
              <Link to="/courses" className="hover:text-[var(--color-primary)] hover:-translate-y-0.5 transition-all">Courses</Link>
              <Link to="/about" className="hover:text-[var(--color-primary)] hover:-translate-y-0.5 transition-all">About</Link>
              <Link to="/gallery" className="hover:text-[var(--color-primary)] hover:-translate-y-0.5 transition-all">Gallery</Link>
              <Link to="/contact" className="hover:text-[var(--color-primary)] hover:-translate-y-0.5 transition-all">Contact</Link>
              
              <Link to="/portal" className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] active-press shadow-tint">
                Login / Portal
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center z-20">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] active-press p-2"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
          
          {/* Mobile Nav Dropdown */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full mt-2 bg-white rounded-[var(--radius-lg)] shadow-xl border border-black/5 p-4 flex flex-col space-y-4 font-medium text-center z-10 animate-fade-in-up">
              <Link to="/" className="py-2 hover:bg-gray-50 rounded-md text-[var(--color-ink)]">Home</Link>
              <Link to="/courses" className="py-2 hover:bg-gray-50 rounded-md text-[var(--color-ink)]">Courses</Link>
              <Link to="/about" className="py-2 hover:bg-gray-50 rounded-md text-[var(--color-ink)]">About</Link>
              <Link to="/gallery" className="py-2 hover:bg-gray-50 rounded-md text-[var(--color-ink)]">Gallery</Link>
              <Link to="/contact" className="py-2 hover:bg-gray-50 rounded-md text-[var(--color-ink)]">Contact</Link>
              
              <div className="pt-4 border-t border-gray-100">
                <Link to="/portal" className="block w-full py-3 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] shadow-tint">
                  Login / Portal
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 animate-fade-in-up">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[var(--color-primary)] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Column 1: Info */}
            <div className="md:col-span-1">
              <h3 className="font-heading font-bold text-2xl text-[var(--color-secondary)] mb-4">Islamic Community Center</h3>
              <p className="text-sm text-gray-200 mb-6 leading-relaxed">
                A Centre of Knowledge, Prayer & Community serving the people of our Local Neighborhood.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-all">
                  <Play size={20} />
                </a>
                <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-all">
                  <Camera size={20} />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="md:col-span-1">
              <h4 className="font-bold text-lg mb-4 text-[var(--color-secondary)]">Quick Links</h4>
              <ul className="space-y-3 text-sm text-gray-200">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">Madarasa & Courses</Link></li>
                <li><Link to="/gallery" className="hover:text-white transition-colors">Photo Gallery</Link></li>
                <li><Link to="/portal" className="hover:text-white transition-colors">Committee Portal</Link></li>
              </ul>
            </div>

            {/* Column 3: Contact Details */}
            <div className="md:col-span-1">
              <h4 className="font-bold text-lg mb-4 text-[var(--color-secondary)]">Contact</h4>
              <ul className="space-y-4 text-sm text-gray-200">
                <li className="flex items-start">
                  <MapPin size={18} className="mr-3 flex-shrink-0 mt-0.5 text-[var(--color-secondary)]" />
                  <span>123 Example Street,<br />City Name — 12345,<br />State, Country</span>
                </li>
                <li className="flex items-center">
                  <Phone size={18} className="mr-3 flex-shrink-0 text-[var(--color-secondary)]" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <Mail size={18} className="mr-3 flex-shrink-0 text-[var(--color-secondary)]" />
                  <span>contact@communitymasjid.com</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Map */}
            <div className="md:col-span-1 h-48 bg-white/10 rounded-[var(--radius-md)] overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.83543450937!2d144.9537353153166!3d-37.817327679751795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d4c2b349649%3A0xb6899234e561db11!2sEnvato!5e0!3m2!1sen!2sau!4v1611130669116!5m2!1sen!2sau" 
                width="100%" 
                height="100%" 
                style={{border: 0}} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps"
              ></iframe>
            </div>
          </div>
          
          {/* Credit Line */}
          <div className="border-t border-white/20 pt-6 text-center text-xs text-gray-400">
            <p>&copy; {new Date().getFullYear()} Islamic Community Center. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
