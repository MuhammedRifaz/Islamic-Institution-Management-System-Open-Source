export default function Register() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold text-[var(--color-primary)] mb-2">Course Registration</h1>
        <p className="text-[var(--color-ink-mid)]">Enroll in our educational programs.</p>
      </div>

      <div className="bg-white p-8 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8]">
        {/* Placeholder for Multi-step form */}
        <div className="flex justify-between items-center mb-8 border-b border-[var(--color-surface-dim)] pb-4">
          <div className="font-bold text-[var(--color-primary)]">1. Personal Details</div>
          <div className="text-[var(--color-ink-mid)]">2. Course Selection</div>
          <div className="text-[var(--color-ink-mid)]">3. Review</div>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <input type="text" className="w-full px-4 py-2 border border-[#E2D9C8] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--color-primary)]" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Age</label>
              <input type="number" className="w-full px-4 py-2 border border-[#E2D9C8] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--color-primary)]" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Gender</label>
              <select className="w-full px-4 py-2 border border-[#E2D9C8] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--color-primary)]">
                <option>Select</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Phone Number</label>
              <input type="tel" className="w-full px-4 py-2 border border-[#E2D9C8] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--color-primary)]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Full Address</label>
              <textarea rows={3} className="w-full px-4 py-2 border border-[#E2D9C8] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--color-primary)]"></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="w-5 h-5 border border-[#E2D9C8] rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                <span className="text-sm font-semibold text-[var(--color-ink)]">I am a resident of the local neighborhood</span>
              </label>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button type="button" className="px-8 py-3 bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] transition-colors">
              Next Step
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
