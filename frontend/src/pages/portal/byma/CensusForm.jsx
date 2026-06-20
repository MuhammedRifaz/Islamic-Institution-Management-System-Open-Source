import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { saveOfflineRecord, syncOfflineRecords, getOfflineRecords } from '../../../lib/offlineSync';
import { Save, RefreshCw, CheckCircle, WifiOff, Wifi, ChevronRight, ChevronLeft, Plus, Trash2, AlertTriangle } from 'lucide-react';

export default function CensusForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  // ------------------ Form State ------------------
  const [step, setStep] = useState(1);
  const totalSteps = 7; // A, B, C, D, E, F, G

  const [formData, setFormData] = useState({
    jamath_name: '', family_serial: '', head_of_family: '', head_gender: '', head_age: '', head_education: '', head_occupation: '', address: '', phone_number: '', total_members: 1, male_members: 0, female_members: 0, monthly_income: '', annual_income: '',
    family_members: [],
    students: [],
    youth: [],
    docs: { birth_cert: { status: 'No', details: '' }, aadhaar: { status: 'No', details: '' }, voter: { status: 'No', details: '' }, pan: { status: 'No', details: '' }, ration: { status: 'No', details: '' }, health_card: { status: 'No', details: '' }, other_id: { status: 'No', details: '' }, disability: { status: 'No', details: '' } },
    aspirations: { dream_career: '', build_business: '', awareness_scholarships: '', awareness_gov_schemes: '', expected_support: '', addl_info: '' },
    community_service: [],
    enumerator_date: new Date().toISOString().split('T')[0]
  });

  const [validationError, setValidationError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'head_of_family') {
      if (!value.trim()) errorMsg = 'Head of Family Name is required';
    } else if (name === 'phone_number') {
      const phoneRegex = /^\d{10}$/;
      if (!value) errorMsg = 'Contact Number is required';
      else if (!phoneRegex.test(value.replace(/\D/g, ''))) errorMsg = 'Contact Number must be exactly 10 digits';
    } else if (name === 'address') {
      if (!value.trim()) errorMsg = 'Address is required';
    } else if (name === 'total_members') {
      if (!value || value < 1) errorMsg = 'Total Members must be at least 1';
    }
    
    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg === '';
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  // ------------------ Sync State ------------------
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (editId) {
      fetchEditRecord();
    }
  }, [editId]);

  const fetchEditRecord = async () => {
    try {
      const { data, error } = await supabase
        .from('census_records')
        .select('*')
        .eq('id', editId)
        .single();

      if (error) throw error;
      if (data && data.family_details) {
        setFormData(data.family_details);
      }
    } catch (err) {
      alert("Error loading survey details: " + err.message);
      navigate('/portal/census-reports');
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    updateUnsyncedCount();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && unsyncedCount > 0 && !syncing) {
      handleSync();
    }
  }, [isOnline]);

  const updateUnsyncedCount = async () => {
    const records = await getOfflineRecords();
    setUnsyncedCount(records.length);
  };

  const handleSync = async () => {
    if (!isOnline) return;
    setSyncing(true);
    try {
      await syncOfflineRecords(user?.id);
      await updateUnsyncedCount();
    } catch (err) {
      console.error("Sync failed", err);
    } finally {
      setSyncing(false);
    }
  };

  const validateStep = () => {
    setValidationError('');
    if (step === 1) {
      const total = formData.total_members || 0;
      const males = formData.male_members || 0;
      const females = formData.female_members || 0;
      if (males + females > total) {
        setValidationError(`Male (${males}) and Female (${females}) count cannot exceed Total Members (${total}).`);
        return false;
      }
      
      const phoneRegex = /^\d{10}$/;
      if (!formData.phone_number || !phoneRegex.test(formData.phone_number)) {
        setValidationError("Contact Number must contain exactly 10 digits and no letters.");
        return false;
      }
    } else if (step === 2) {
      const phoneRegex = /^\d{10}$/;
      for (let i = 0; i < formData.family_members.length; i++) {
        const phone = formData.family_members[i].phone;
        if (phone && !phoneRegex.test(phone)) {
           setValidationError(`Phone number for Member ${i+1} must contain exactly 10 digits.`);
           return false;
        }
        if (!formData.family_members[i].name || formData.family_members[i].name.trim() === '') {
           setValidationError(`Please enter the name for Member ${i+1}.`);
           return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    // Auto-generate family members array based on total_members when leaving Step 1
    if (step === 1) {
      const targetLength = Math.max(0, formData.total_members - 1);
      let newMembers = [...formData.family_members];
      
      if (newMembers.length < targetLength) {
        const diff = targetLength - newMembers.length;
        for (let i = 0; i < diff; i++) {
          newMembers.push({name:'', relation:'', gender:'', age:'', edu:'', status:'', occ:'', income:'', phone:''});
        }
      } else if (newMembers.length > targetLength) {
        newMembers = newMembers.slice(0, targetLength);
      }
      
      setFormData(prev => ({ ...prev, family_members: newMembers }));
    }

    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
      return;
    }

    try {
      const payload = {
        head_of_family: formData.head_of_family,
        address: formData.address,
        phone_number: formData.phone_number,
        total_members: formData.total_members,
        family_details: formData
      };

      if (editId) {
        const { error } = await supabase
          .from('census_records')
          .update(payload)
          .eq('id', editId);

        if (error) throw error;
        alert("Survey updated successfully!");
        navigate('/portal/census-reports');
      } else {
        await saveOfflineRecord(payload);
        setSaved(true);
        
        // Reset
        setStep(1);
        setFormData({
          jamath_name: '', family_serial: '', head_of_family: '', head_gender: '', head_age: '', head_education: '', head_occupation: '', address: '', phone_number: '', total_members: 1, male_members: 0, female_members: 0, monthly_income: '', annual_income: '', family_members: [], students: [], youth: [], docs: { birth_cert: { status: 'No', details: '' }, aadhaar: { status: 'No', details: '' }, voter: { status: 'No', details: '' }, pan: { status: 'No', details: '' }, ration: { status: 'No', details: '' }, health_card: { status: 'No', details: '' }, other_id: { status: 'No', details: '' }, disability: { status: 'No', details: '' } }, aspirations: { dream_career: '', build_business: '', awareness_scholarships: '', awareness_gov_schemes: '', expected_support: '', addl_info: '' }, community_service: [], enumerator_date: new Date().toISOString().split('T')[0]
        });

        await updateUnsyncedCount();
        if (isOnline) handleSync();
        setTimeout(() => setSaved(false), 3000);
        window.scrollTo(0, 0);
      }
    } catch (err) {
      alert("Error saving record: " + err.message);
    }
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    const newArr = [...formData[arrayName]];
    newArr[index][field] = value;
    setFormData({ ...formData, [arrayName]: newArr });
  };
  
  const addArrayItem = (arrayName, template) => {
    setFormData({ ...formData, [arrayName]: [...formData[arrayName], template] });
  };

  const removeArrayItem = (arrayName, index) => {
    const newArr = formData[arrayName].filter((_, i) => i !== index);
    setFormData({ ...formData, [arrayName]: newArr });
  };

  // ------------------ Step Renderers ------------------

  const renderStepA = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-heading">Comprehensive Family Data Collection</h2>
      </div>
      <h2 className="text-xl font-heading font-bold text-[var(--color-primary)] border-b border-[#E2D9C8] pb-2">Section A: Household & Demographics</h2>
      
      {validationError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-[var(--radius-md)] flex items-center border border-red-200">
          <AlertTriangle size={20} className="mr-2 flex-shrink-0" /> {validationError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-semibold mb-1">Jamath Name (Which Jamath you belong to)</label><input type="text" value={formData.jamath_name} onChange={e => setFormData({...formData, jamath_name: e.target.value})} className="w-full px-4 py-2 border border-[#E2D9C8] rounded focus:border-[var(--color-primary)] outline-none transition-colors" /></div>
        <div><label className="block text-sm font-semibold mb-1">Family Serial Number (as per Jamath document)</label><input type="text" value={formData.family_serial} onChange={e => setFormData({...formData, family_serial: e.target.value})} className="w-full px-4 py-2 border border-[#E2D9C8] rounded focus:border-[var(--color-primary)] outline-none transition-colors" /></div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1">Name of Head of Family <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            name="head_of_family"
            value={formData.head_of_family} 
            onChange={e => {
              setFormData({...formData, head_of_family: e.target.value});
              if(fieldErrors.head_of_family) validateField('head_of_family', e.target.value);
            }}
            onBlur={handleBlur}
            className={`w-full px-4 py-2 border rounded outline-none transition-colors ${fieldErrors.head_of_family ? 'border-red-500 focus:border-red-500 bg-red-50/30' : 'border-[#E2D9C8] focus:border-[var(--color-primary)]'}`} 
          />
          {fieldErrors.head_of_family && <p className="text-xs text-red-500 mt-1 flex items-center"><span className="mr-1">⚠</span> {fieldErrors.head_of_family}</p>}
        </div>
        
        <div className="grid grid-cols-4 gap-2 md:col-span-2">
            <div><label className="block text-xs font-semibold mb-1">Gender / Age / Education / Occupation of Head</label><select value={formData.head_gender} onChange={e => setFormData({...formData, head_gender: e.target.value})} className="w-full px-2 py-2 text-sm border border-[#E2D9C8] rounded"><option>Gender</option><option>Male</option><option>Female</option></select></div>
            <div><label className="block text-xs font-semibold mb-1">&nbsp;</label><input type="number" placeholder="Age" value={formData.head_age} onChange={e => setFormData({...formData, head_age: e.target.value})} className="w-full px-2 py-2 text-sm border border-[#E2D9C8] rounded" /></div>
            <div><label className="block text-xs font-semibold mb-1">&nbsp;</label><input type="text" placeholder="Education" value={formData.head_education} onChange={e => setFormData({...formData, head_education: e.target.value})} className="w-full px-2 py-2 text-sm border border-[#E2D9C8] rounded" /></div>
            <div><label className="block text-xs font-semibold mb-1">&nbsp;</label><input type="text" placeholder="Occupation" value={formData.head_occupation} onChange={e => setFormData({...formData, head_occupation: e.target.value})} className="w-full px-2 py-2 text-sm border border-[#E2D9C8] rounded" /></div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1">Full Address (Area, Ward) <span className="text-red-500">*</span></label>
          <textarea 
            name="address"
            rows="2" 
            value={formData.address} 
            onChange={e => {
              setFormData({...formData, address: e.target.value});
              if(fieldErrors.address) validateField('address', e.target.value);
            }} 
            onBlur={handleBlur}
            className={`w-full px-4 py-2 border rounded outline-none transition-colors ${fieldErrors.address ? 'border-red-500 focus:border-red-500 bg-red-50/30' : 'border-[#E2D9C8] focus:border-[var(--color-primary)]'}`}
          ></textarea>
          {fieldErrors.address && <p className="text-xs text-red-500 mt-1 flex items-center"><span className="mr-1">⚠</span> {fieldErrors.address}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Contact Number <span className="text-red-500">*</span></label>
          <input 
            type="tel" 
            name="phone_number"
            value={formData.phone_number} 
            onChange={e => {
              setFormData({...formData, phone_number: e.target.value});
              if(fieldErrors.phone_number) validateField('phone_number', e.target.value);
            }} 
            onBlur={handleBlur}
            className={`w-full px-4 py-2 border rounded outline-none transition-colors ${fieldErrors.phone_number ? 'border-red-500 focus:border-red-500 bg-red-50/30' : 'border-[#E2D9C8] focus:border-[var(--color-primary)]'}`} 
          />
          {fieldErrors.phone_number && <p className="text-xs text-red-500 mt-1 flex items-center"><span className="mr-1">⚠</span> {fieldErrors.phone_number}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">Total Number of Family Members <span className="text-red-500">*</span></label>
          <input 
            type="number" 
            name="total_members"
            min="1" 
            value={formData.total_members} 
            onChange={e => {
              setFormData({...formData, total_members: parseInt(e.target.value) || 0});
              if(fieldErrors.total_members) validateField('total_members', e.target.value);
            }} 
            onBlur={handleBlur}
            className={`w-full px-4 py-2 border rounded outline-none transition-colors ${fieldErrors.total_members ? 'border-red-500 focus:border-red-500 bg-red-50/30' : 'border-[#E2D9C8] focus:border-[var(--color-primary)]'}`} 
          />
          {fieldErrors.total_members && <p className="text-xs text-red-500 mt-1 flex items-center"><span className="mr-1">⚠</span> {fieldErrors.total_members}</p>}
        </div>
        <div><label className="block text-sm font-semibold mb-1">Number of Male Members</label><input type="number" min="0" value={formData.male_members} onChange={e => setFormData({...formData, male_members: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-[#E2D9C8] rounded focus:border-[var(--color-primary)] outline-none" /></div>
        <div><label className="block text-sm font-semibold mb-1">Number of Female Members</label><input type="number" min="0" value={formData.female_members} onChange={e => setFormData({...formData, female_members: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-[#E2D9C8] rounded focus:border-[var(--color-primary)] outline-none" /></div>

        <div><label className="block text-sm font-semibold mb-1">Monthly Income (Optional)</label><input type="text" value={formData.monthly_income} onChange={e => setFormData({...formData, monthly_income: e.target.value})} className="w-full px-4 py-2 border border-[#E2D9C8] rounded focus:border-[var(--color-primary)] outline-none" /></div>
        <div className="md:col-span-2"><label className="block text-sm font-semibold mb-1">Annual Income (Optional)</label><input type="text" value={formData.annual_income} onChange={e => setFormData({...formData, annual_income: e.target.value})} className="w-full px-4 py-2 border border-[#E2D9C8] rounded focus:border-[var(--color-primary)] outline-none" /></div>
      </div>
    </div>
  );

  const renderStepB = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center border-b border-[#E2D9C8] pb-2">
          <h2 className="text-xl font-heading font-bold text-[var(--color-primary)]">Section B: Family Member Details</h2>
          <span className="text-sm text-[var(--color-ink-mid)]">Auto-generated for {formData.family_members.length} member(s)</span>
        </div>
        
        {formData.family_members.length === 0 && <p className="text-sm text-[var(--color-ink-mid)] italic">Head of Family is the only member. Click Next.</p>}

        {formData.family_members.map((m, i) => (
          <div key={i} className="p-4 bg-[var(--color-surface)] border border-[#E2D9C8] rounded-[var(--radius-md)] space-y-4">
            <div className="font-bold text-[var(--color-primary)]">Member {i+1} (Excluding Head)</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div><label className="text-xs font-semibold">Name</label><input type="text" value={m.name} onChange={e => handleArrayChange('family_members', i, 'name', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
              <div><label className="text-xs font-semibold">Relationship to Head</label><input type="text" value={m.relation} onChange={e => handleArrayChange('family_members', i, 'relation', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
              <div>
                  <label className="text-xs font-semibold">Gender</label>
                  <select value={m.gender} onChange={e => handleArrayChange('family_members', i, 'gender', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded">
                      <option>Select</option><option>Male</option><option>Female</option>
                  </select>
              </div>
              <div><label className="text-xs font-semibold">Age</label><input type="number" value={m.age} onChange={e => handleArrayChange('family_members', i, 'age', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
              <div><label className="text-xs font-semibold">Educational Qualification</label><input type="text" value={m.edu} onChange={e => handleArrayChange('family_members', i, 'edu', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
              <div><label className="text-xs font-semibold">Current Status</label><input type="text" value={m.status} onChange={e => handleArrayChange('family_members', i, 'status', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
              <div><label className="text-xs font-semibold">Occupation / Institution</label><input type="text" value={m.occ} onChange={e => handleArrayChange('family_members', i, 'occ', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
              <div><label className="text-xs font-semibold">Monthly Income (Optional)</label><input type="text" value={m.income} onChange={e => handleArrayChange('family_members', i, 'income', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
              <div><label className="text-xs font-semibold">Phone Number</label><input type="text" value={m.phone} onChange={e => handleArrayChange('family_members', i, 'phone', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const availableNames = [
    formData.head_of_family,
    ...formData.family_members.map(m => m.name)
  ].filter(name => name && name.trim() !== '');

  const renderStepC = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-[#E2D9C8] pb-2">
        <h2 className="text-xl font-heading font-bold text-[var(--color-primary)]">Section C: Student & Education Details</h2>
        <button type="button" onClick={() => addArrayItem('students', {name:'', course:'', school:'', exams:'', talents:'', awards:'', career:'', support:''})} className="text-sm font-bold text-[var(--color-secondary)] hover:underline flex items-center"><Plus size={16}/> Add Student</button>
      </div>
      {formData.students.map((s, i) => (
        <div key={i} className="p-4 bg-[var(--color-surface)] border border-[#E2D9C8] rounded-[var(--radius-md)] space-y-4 relative">
          <button type="button" onClick={() => removeArrayItem('students', i)} className="absolute top-4 right-4 text-red-500"><Trash2 size={18}/></button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold">Name of Child / Student</label>
              <select value={s.name} onChange={e => handleArrayChange('students', i, 'name', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded">
                <option value="">Select Family Member</option>
                {availableNames.map((name, idx) => <option key={idx} value={name}>{name}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-semibold">Current Standard / Course</label><input type="text" value={s.course} onChange={e => handleArrayChange('students', i, 'course', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
            <div><label className="text-xs font-semibold">School / College Name</label><input type="text" value={s.school} onChange={e => handleArrayChange('students', i, 'school', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
            <div><label className="text-xs font-semibold">Any Competitive Exams Appeared / Preparing</label><input type="text" value={s.exams} onChange={e => handleArrayChange('students', i, 'exams', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
            <div><label className="text-xs font-semibold">Special Interests or Talents</label><input type="text" value={s.talents} onChange={e => handleArrayChange('students', i, 'talents', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
            <div><label className="text-xs font-semibold">Awards / Recognitions</label><input type="text" value={s.awards} onChange={e => handleArrayChange('students', i, 'awards', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
            <div><label className="text-xs font-semibold">Career Aspiration</label><input type="text" value={s.career} onChange={e => handleArrayChange('students', i, 'career', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
            <div><label className="text-xs font-semibold">Guidance or Support Required (Scholarship / Loan / Career Guidance)</label><input type="text" value={s.support} onChange={e => handleArrayChange('students', i, 'support', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStepD = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-[#E2D9C8] pb-2">
        <h2 className="text-xl font-heading font-bold text-[var(--color-primary)]">Section D: Youth Employment</h2>
        <button type="button" onClick={() => addArrayItem('youth', {name:'', age:'', status:'', gov_job:'', exam_post:'', coaching:'', skill_dev:''})} className="text-sm font-bold text-[var(--color-secondary)] hover:underline flex items-center"><Plus size={16}/> Add Youth</button>
      </div>
      {formData.youth.map((y, i) => (
        <div key={i} className="p-4 bg-[var(--color-surface)] border border-[#E2D9C8] rounded-[var(--radius-md)] space-y-4 relative">
          <button type="button" onClick={() => removeArrayItem('youth', i)} className="absolute top-4 right-4 text-red-500"><Trash2 size={18}/></button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold">Name</label>
              <select value={y.name} onChange={e => handleArrayChange('youth', i, 'name', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded">
                <option value="">Select Family Member</option>
                {availableNames.map((name, idx) => <option key={idx} value={name}>{name}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-semibold">Age</label><input type="number" value={y.age} onChange={e => handleArrayChange('youth', i, 'age', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
            <div><label className="text-xs font-semibold">Employment Status</label><input type="text" value={y.status} onChange={e => handleArrayChange('youth', i, 'status', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
            <div>
              <label className="text-xs font-semibold">Applied for Gov Job (Yes/No)</label>
              <select value={y.gov_job} onChange={e => handleArrayChange('youth', i, 'gov_job', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded">
                  <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
              </select>
            </div>
            <div><label className="text-xs font-semibold">If Yes, Which Exam / Post?</label><input type="text" value={y.exam_post} onChange={e => handleArrayChange('youth', i, 'exam_post', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
            <div>
              <label className="text-xs font-semibold">Coaching Attended (Yes/No)</label>
              <select value={y.coaching} onChange={e => handleArrayChange('youth', i, 'coaching', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded">
                  <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
              </select>
            </div>
            <div className="sm:col-span-2"><label className="text-xs font-semibold">Interest in Skill Development / Startup / Business</label><input type="text" value={y.skill_dev} onChange={e => handleArrayChange('youth', i, 'skill_dev', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStepE = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-heading font-bold text-[var(--color-primary)] border-b border-[#E2D9C8] pb-2">Section E: Documentation & Welfare</h2>
      <div className="space-y-4">
        {[
            { id: 'birth_cert', label: 'Birth Certificate (Mandatory)' }, 
            { id: 'aadhaar', label: 'Aadhaar Card Available and Updated' }, 
            { id: 'voter', label: 'Voter ID' }, 
            { id: 'pan', label: 'PAN Card' }, 
            { id: 'ration', label: 'Ration Card (APL / BPL)' }, 
            { id: 'health_card', label: 'Ayushman / Health Card' },
            { id: 'other_id', label: 'Any Other Government ID (Specify)' },
            { id: 'disability', label: 'Any Family Member with Disability (Specify)' }
        ].map(doc => (
          <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-[#E2D9C8] pb-4">
            <div className="sm:w-1/3"><label className="text-sm font-semibold">{doc.label}</label></div>
            <div className="sm:w-1/6">
                <select value={formData.docs[doc.id].status} onChange={e => setFormData({...formData, docs: {...formData.docs, [doc.id]: { ...formData.docs[doc.id], status: e.target.value }}})} className="w-full px-3 py-2 text-sm border border-[#E2D9C8] rounded outline-none">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                </select>
            </div>
            <div className="sm:w-1/2">
                <input type="text" placeholder="Address / Details" value={formData.docs[doc.id].details} onChange={e => setFormData({...formData, docs: {...formData.docs, [doc.id]: { ...formData.docs[doc.id], details: e.target.value }}})} className="w-full px-3 py-2 text-sm border border-[#E2D9C8] rounded outline-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepF = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-heading font-bold text-[var(--color-primary)] border-b border-[#E2D9C8] pb-2">Section F: Aspirations & Exposure</h2>
      <div className="grid grid-cols-1 gap-4">
        <div><label className="block text-sm font-semibold mb-1">Dream Career / Life Goal</label><input type="text" value={formData.aspirations.dream_career} onChange={e => setFormData({...formData, aspirations: {...formData.aspirations, dream_career: e.target.value}})} className="w-full px-4 py-2 border border-[#E2D9C8] rounded" /></div>
        <div><label className="block text-sm font-semibold mb-1">Any Dream to Build a Business</label><input type="text" value={formData.aspirations.build_business} onChange={e => setFormData({...formData, aspirations: {...formData.aspirations, build_business: e.target.value}})} className="w-full px-4 py-2 border border-[#E2D9C8] rounded" /></div>
        <div><label className="block text-sm font-semibold mb-1">Awareness of Scholarships / Schemes (e.g., Buddy4Study)</label><input type="text" value={formData.aspirations.awareness_scholarships} onChange={e => setFormData({...formData, aspirations: {...formData.aspirations, awareness_scholarships: e.target.value}})} className="w-full px-4 py-2 border border-[#E2D9C8] rounded" /></div>
        <div><label className="block text-sm font-semibold mb-1">Awareness of Any Government Schemes</label><input type="text" value={formData.aspirations.awareness_gov_schemes} onChange={e => setFormData({...formData, aspirations: {...formData.aspirations, awareness_gov_schemes: e.target.value}})} className="w-full px-4 py-2 border border-[#E2D9C8] rounded" /></div>
        <div><label className="block text-sm font-semibold mb-1">Support Expected from Masjid / Community</label><textarea rows="2" value={formData.aspirations.expected_support} onChange={e => setFormData({...formData, aspirations: {...formData.aspirations, expected_support: e.target.value}})} className="w-full px-4 py-2 border border-[#E2D9C8] rounded"></textarea></div>
        <div><label className="block text-sm font-semibold mb-1">Any Additional Information You Wish to Share</label><textarea rows="2" value={formData.aspirations.addl_info} onChange={e => setFormData({...formData, aspirations: {...formData.aspirations, addl_info: e.target.value}})} className="w-full px-4 py-2 border border-[#E2D9C8] rounded"></textarea></div>
      </div>
    </div>
  );

  const renderStepG = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-[#E2D9C8] pb-2">
        <h2 className="text-xl font-heading font-bold text-[var(--color-primary)]">Section G: Community Service</h2>
        <button type="button" onClick={() => addArrayItem('community_service', {name:'', type:'', hours:''})} className="text-sm font-bold text-[var(--color-secondary)] hover:underline flex items-center"><Plus size={16}/> Add Service</button>
      </div>
      {formData.community_service.map((v, i) => (
        <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[var(--color-surface)] border border-[#E2D9C8] rounded-[var(--radius-md)] relative">
          <button type="button" onClick={() => removeArrayItem('community_service', i)} className="absolute top-4 right-4 text-red-500"><Trash2 size={18}/></button>
          <div>
            <label className="text-xs font-semibold">Name of Family Member</label>
            <select value={v.name} onChange={e => handleArrayChange('community_service', i, 'name', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded">
                <option value="">Select Family Member</option>
                {availableNames.map((name, idx) => <option key={idx} value={name}>{name}</option>)}
            </select>
          </div>
          <div><label className="text-xs font-semibold">Type of Service Interested In</label><input type="text" value={v.type} onChange={e => handleArrayChange('community_service', i, 'type', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
          <div><label className="text-xs font-semibold">Hours Willing / Month</label><input type="number" value={v.hours} onChange={e => handleArrayChange('community_service', i, 'hours', e.target.value)} className="w-full px-3 py-1 text-sm border border-[#E2D9C8] rounded" /></div>
        </div>
      ))}

      <div className="pt-4 border-t border-[#E2D9C8]">
        <label className="block text-sm font-bold text-[var(--color-primary)] mb-1">Date of Survey Logging</label>
        <input type="date" value={formData.enumerator_date} onChange={e => setFormData({...formData, enumerator_date: e.target.value})} className="px-4 py-2 border border-[#E2D9C8] rounded outline-none" />
        <p className="text-xs text-[var(--color-ink-mid)] mt-1">Logged by Enumerator ID: {user?.id}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8]">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-primary)]">{editId ? 'Edit Census Survey' : 'Community Census'}</h1>
          <p className="text-sm text-[var(--color-ink-mid)]">Step {step} of {totalSteps}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className={`flex items-center text-sm font-bold px-3 py-1 rounded-full ${isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {isOnline ? <><Wifi size={16} className="mr-2" /> Online</> : <><WifiOff size={16} className="mr-2" /> Offline</>}
          </div>
          {unsyncedCount > 0 && (
            <button onClick={handleSync} disabled={syncing || !isOnline} className={`flex items-center text-sm font-bold px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 hover:bg-yellow-100 ${syncing ? 'opacity-50' : ''}`}>
              <RefreshCw size={16} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} /> Sync ({unsyncedCount})
            </button>
          )}
        </div>
      </div>

      {saved && (
        <div className="bg-green-50 text-green-700 p-4 rounded-[var(--radius-md)] flex items-center border border-green-200">
          <CheckCircle size={20} className="mr-2" /> Survey saved successfully! Moving to next family.
        </div>
      )}

      {/* Progress Dots */}
      <div className="flex justify-center space-x-2 px-2">
        {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((label, idx) => {
          const s = idx + 1;
          return (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-[var(--color-primary)] text-white' : 'bg-[#E2D9C8] text-[var(--color-ink-mid)]'}`}>
              {label}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-[var(--radius-lg)] shadow-sm border border-[#E2D9C8]">
        {step === 1 && renderStepA()}
        {step === 2 && renderStepB()}
        {step === 3 && renderStepC()}
        {step === 4 && renderStepD()}
        {step === 5 && renderStepE()}
        {step === 6 && renderStepF()}
        {step === 7 && renderStepG()}

        <div className="pt-8 mt-8 border-t border-[#E2D9C8] flex justify-between">
          <button type="button" onClick={() => { setStep(step - 1); setValidationError(''); window.scrollTo(0,0); }} disabled={step === 1} className="px-6 py-2 bg-[var(--color-surface)] text-[var(--color-ink)] font-bold rounded-[var(--radius-md)] hover:bg-[#E2D9C8] disabled:opacity-30 flex items-center transition-colors">
            <ChevronLeft size={20} className="mr-2" /> Back
          </button>
          
          <button type="submit" className="px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] flex items-center transition-colors">
            {step === totalSteps ? <><Save size={20} className="mr-2" /> {editId ? 'Update Survey' : 'Save Survey'}</> : <>Next <ChevronRight size={20} className="ml-2" /></>}
          </button>
        </div>
      </form>
    </div>
  );
}
