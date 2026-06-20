export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-heading font-bold text-[var(--color-primary)] mb-4">About Us</h1>
        <p className="text-lg text-[var(--color-ink-mid)]">Discover the history and mission of Islamic Community Center.</p>
      </div>
      
      <div className="bg-white p-8 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8]">
        <h2 className="text-2xl font-heading font-bold text-[var(--color-primary)] mb-4">Our History</h2>
        <p className="text-[var(--color-ink-mid)] leading-relaxed mb-6">
          Established over 50 years ago, Islamic Community Center has been a cornerstone of the local community. What started as a small gathering place has blossomed into a full-fledged spiritual and educational hub.
        </p>
        <p className="text-[var(--color-ink-mid)] leading-relaxed">
          Through the Community Madarasa, we have educated thousands of students in authentic Islamic traditions, emphasizing compassion, community service, and academic excellence.
        </p>
      </div>

      <div className="bg-[var(--color-primary)] text-white p-8 rounded-[var(--radius-lg)] shadow-sm text-center">
        <h2 className="text-2xl font-heading font-bold mb-4 text-[var(--color-secondary)]">Mission & Vision</h2>
        <p className="text-lg mb-4">"To cultivate a community grounded in faith, united by purpose, and driven by service to humanity."</p>
      </div>
    </div>
  );
}
