import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { DollarSign, ArrowUpRight, ArrowDownRight, Users, PlusCircle, Edit2, Trash2 } from 'lucide-react';

export default function TreasurerDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    type: 'fee_payment',
    description: ''
  });

  const [editingTxId, setEditingTxId] = useState(null);

  const [bulkMonth, setBulkMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear().toString());
  const [bulkAmount, setBulkAmount] = useState('50');
  const [bulkLoading, setBulkLoading] = useState(false);

  const [ledger, setLedger] = useState({
    totalCollected: 0,
    totalExpenses: 0,
    totalDue: 0
  });

  const [studentSummaries, setStudentSummaries] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch students (including treasurers who are also students)
    const { data: studentsData } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .in('role', ['student_raulathul', 'treasurer', 'president', 'secretary', 'cleaning_minister']);
      
    if (studentsData) setStudents(studentsData);

    // Fetch transactions
    const { data: txData } = await supabase
      .from('fee_transactions')
      .select('*, profiles!fee_transactions_student_id_fkey(full_name)')
      .order('created_at', { ascending: false });

    if (txData) {
      setTransactions(txData);
      calculateLedger(txData);
      
      if (studentsData) {
        const summaries = studentsData.map(student => {
          let dues = 0;
          let paid = 0;
          txData.forEach(tx => {
            if (tx.student_id === student.id) {
              const amt = parseFloat(tx.amount);
              if (tx.transaction_type === 'fee_due') dues += amt;
              else if (tx.transaction_type === 'fee_payment') paid += amt;
            }
          });
          return {
            id: student.id,
            name: student.full_name || 'Unnamed Student',
            role: student.role,
            dues,
            paid,
            pending: dues - paid
          };
        });
        setStudentSummaries(summaries);
      }
    }
    setLoading(false);
  };

  const calculateLedger = (txData) => {
    let collected = 0;
    let expenses = 0;
    let dues = 0;

    txData.forEach(tx => {
      const amt = parseFloat(tx.amount);
      if (tx.transaction_type === 'fee_payment') collected += amt;
      else if (tx.transaction_type === 'expense') expenses += amt;
      else if (tx.transaction_type === 'fee_due') dues += amt;
    });

    setLedger({ totalCollected: collected, totalExpenses: expenses, totalDue: dues });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || isNaN(formData.amount)) return alert("Please enter a valid amount");
    if (formData.type !== 'expense' && !formData.studentId) return alert("Please select a student");

    if (editingTxId) {
      const { error } = await supabase
        .from('fee_transactions')
        .update({
          student_id: formData.type === 'expense' ? null : formData.studentId,
          amount: parseFloat(formData.amount),
          transaction_type: formData.type,
          description: formData.description
        })
        .eq('id', editingTxId);

      if (error) {
        alert("Error updating transaction: " + error.message);
      } else {
        setFormData({ studentId: '', amount: '', type: 'fee_payment', description: '' });
        setEditingTxId(null);
        fetchData();
        alert("Transaction updated successfully!");
      }
    } else {
      const { error } = await supabase.from('fee_transactions').insert([{
        student_id: formData.type === 'expense' ? null : formData.studentId,
        amount: parseFloat(formData.amount),
        transaction_type: formData.type,
        description: formData.description,
        recorded_by: (await supabase.auth.getUser()).data.user.id
      }]);

      if (error) {
        alert("Error saving transaction: " + error.message);
      } else {
        setFormData({ studentId: '', amount: '', type: 'fee_payment', description: '' });
        fetchData();
        alert("Transaction recorded successfully!");
      }
    }
  };

  const handleEditClick = (tx) => {
    setFormData({
      studentId: tx.student_id || '',
      amount: tx.amount.toString(),
      type: tx.transaction_type,
      description: tx.description || ''
    });
    setEditingTxId(tx.id);
  };

  const handleCancelEdit = () => {
    setFormData({ studentId: '', amount: '', type: 'fee_payment', description: '' });
    setEditingTxId(null);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction? This will update the student's balance.")) return;
    try {
      const { error } = await supabase
        .from('fee_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert("Transaction deleted successfully!");
      fetchData();
    } catch (err) {
      alert("Error deleting transaction: " + err.message);
    }
  };

  const handleBulkCharge = async (e) => {
    e.preventDefault();
    if (!bulkAmount || isNaN(bulkAmount)) return alert("Please enter a valid amount");
    if (students.length === 0) return alert("No students found to charge");

    setBulkLoading(true);
    try {
      const description = `${bulkMonth} ${bulkYear} Monthly Fees`;

      // Check existing dues to avoid duplicate charges
      const { data: existingDues } = await supabase
        .from('fee_transactions')
        .select('student_id')
        .eq('transaction_type', 'fee_due')
        .eq('description', description);

      const chargedStudentIds = new Set(existingDues?.map(d => d.student_id) || []);
      const studentsToCharge = students.filter(s => !chargedStudentIds.has(s.id));

      if (studentsToCharge.length === 0) {
        alert(`All students have already been charged for ${description}.`);
        return;
      }

      const { data: authUser } = await supabase.auth.getUser();
      const currentUserId = authUser?.user?.id;

      const transactionsToInsert = studentsToCharge.map(student => ({
        student_id: student.id,
        amount: parseFloat(bulkAmount),
        transaction_type: 'fee_due',
        description: description,
        recorded_by: currentUserId
      }));

      const { error } = await supabase.from('fee_transactions').insert(transactionsToInsert);

      if (error) {
        alert("Failed to apply bulk fees: " + error.message);
      } else {
        alert(`Successfully charged ₹${bulkAmount} to ${studentsToCharge.length} students for ${description}!`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during bulk charging.");
    } finally {
      setBulkLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading treasurer dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-primary)]">Treasurer Ledger</h1>
          <p className="text-[var(--color-ink-mid)] mt-1">Manage Raulathul Uloom student fees and expenses</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[var(--radius-lg)] border border-[#E2D9C8] shadow-sm flex flex-col justify-center">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-yellow-50 rounded-full text-yellow-600 mr-3">
              <Users size={20} />
            </div>
            <p className="text-sm text-[var(--color-ink-mid)] font-semibold">Total Pending Dues</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">₹{Math.max(0, ledger.totalDue - ledger.totalCollected).toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-[var(--radius-lg)] border border-[#E2D9C8] shadow-sm flex flex-col justify-center">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-green-50 rounded-full text-green-600 mr-3">
              <ArrowDownRight size={20} />
            </div>
            <p className="text-sm text-[var(--color-ink-mid)] font-semibold">Fees Collected</p>
          </div>
          <p className="text-2xl font-bold text-[var(--color-ink)]">₹{ledger.totalCollected.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-[var(--radius-lg)] border border-[#E2D9C8] shadow-sm flex flex-col justify-center">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-red-50 rounded-full text-red-600 mr-3">
              <ArrowUpRight size={20} />
            </div>
            <p className="text-sm text-[var(--color-ink-mid)] font-semibold">Total Expenses</p>
          </div>
          <p className="text-2xl font-bold text-[var(--color-ink)]">₹{ledger.totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-[var(--radius-lg)] border border-[#E2D9C8] shadow-sm flex flex-col justify-center">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-blue-50 rounded-full text-blue-600 mr-3">
              <DollarSign size={20} />
            </div>
            <p className="text-sm text-[var(--color-ink-mid)] font-semibold">Net Balance</p>
          </div>
          <p className="text-2xl font-bold text-[var(--color-primary)]">₹{(ledger.totalCollected - ledger.totalExpenses).toFixed(2)}</p>
        </div>
      </div>

      {/* Student Fee Summaries Table */}
      <div className="bg-white rounded-[var(--radius-lg)] border border-[#E2D9C8] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E2D9C8]">
          <h2 className="text-lg font-bold text-[var(--color-ink)]">Student Fee Summary</h2>
          <p className="text-sm text-[var(--color-ink-mid)] mt-1">Overview of all students dues, payments, and balances</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E2D9C8] text-sm text-[var(--color-ink-mid)]">
                <th className="p-4 font-semibold">Student Name</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold text-right">Total Dues</th>
                <th className="p-4 font-semibold text-right">Total Paid</th>
                <th className="p-4 font-semibold text-right">Pending Balance</th>
              </tr>
            </thead>
            <tbody>
              {studentSummaries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">No students found.</td>
                </tr>
              ) : (
                studentSummaries.map(student => (
                  <tr key={student.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-[var(--color-ink)]">{student.name}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs ${student.role === 'treasurer' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}>
                        {student.role === 'treasurer' ? 'Treasurer' : 'Student'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right text-yellow-600 font-semibold">₹{student.dues.toFixed(2)}</td>
                    <td className="p-4 text-sm text-right text-green-600 font-semibold">₹{student.paid.toFixed(2)}</td>
                    <td className={`p-4 text-sm text-right font-bold ${student.pending > 0 ? 'text-red-600' : 'text-green-700'}`}>
                      ₹{student.pending.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Record Transaction Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[var(--radius-lg)] border border-[#E2D9C8] shadow-sm">
          <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-[var(--color-primary)]" />
            {editingTxId ? 'Edit Transaction' : 'Record Transaction'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-ink)]">Type</label>
              <select 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-[#E2D9C8] rounded outline-none focus:border-[var(--color-primary)] bg-white"
              >
                <option value="fee_payment">Fee Payment (Income)</option>
                <option value="fee_due">Fee Due (Charge to Student)</option>
                <option value="expense">General Expense</option>
              </select>
            </div>

            {formData.type !== 'expense' && (
              <div>
                <label className="block text-sm font-semibold mb-1 text-[var(--color-ink)]">Student</label>
                <select 
                  value={formData.studentId} 
                  onChange={e => setFormData({...formData, studentId: e.target.value})}
                  className="w-full px-3 py-2 border border-[#E2D9C8] rounded outline-none focus:border-[var(--color-primary)] bg-white"
                  required
                >
                  <option value="">-- Select Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name || 'Unnamed Student'}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-ink)]">Amount (₹)</label>
              <input 
                type="number" 
                step="0.01" 
                required
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-2 border border-[#E2D9C8] rounded outline-none focus:border-[var(--color-primary)]"
                placeholder="e.g. 500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-ink)]">Description / Notes</label>
              <input 
                type="text" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-[#E2D9C8] rounded outline-none focus:border-[var(--color-primary)]"
                placeholder="e.g. October 2026 Fees"
              />
            </div>

            <button type="submit" className="w-full py-2 bg-[var(--color-primary)] text-white font-bold rounded hover:bg-[var(--color-primary-hover)] transition-colors">
              {editingTxId ? 'Update Record' : 'Save Record'}
            </button>
            {editingTxId && (
              <button 
                type="button" 
                onClick={handleCancelEdit}
                className="w-full mt-2 py-2 bg-gray-100 text-gray-700 font-bold rounded hover:bg-gray-200 transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        {/* Bulk Charge Monthly Dues */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[var(--radius-lg)] border border-[#E2D9C8] shadow-sm">
          <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-[var(--color-secondary)]" />
            Bulk Charge Monthly Fees
          </h2>
          <p className="text-xs text-[var(--color-ink-mid)] mb-4 leading-relaxed">
            Charge the standard fee to all students at once. You can pause or skip months (e.g. during summer holidays) simply by not generating charges for those periods.
          </p>
          <form onSubmit={handleBulkCharge} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1 text-[var(--color-ink)]">Month</label>
                <select 
                  value={bulkMonth} 
                  onChange={e => setBulkMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2D9C8] rounded outline-none focus:border-[var(--color-primary)] bg-white"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-[var(--color-ink)]">Year</label>
                <input 
                  type="number" 
                  value={bulkYear} 
                  onChange={e => setBulkYear(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2D9C8] rounded outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-ink)]">Amount (₹)</label>
              <input 
                type="number" 
                step="0.01" 
                required
                value={bulkAmount} 
                onChange={e => setBulkAmount(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2D9C8] rounded outline-none focus:border-[var(--color-primary)]"
                placeholder="e.g. 50"
              />
            </div>

            <button 
              type="submit" 
              disabled={bulkLoading}
              className="w-full py-2 bg-[var(--color-secondary)] text-[var(--color-primary)] font-bold rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {bulkLoading ? 'Applying...' : 'Charge All Students'}
            </button>
          </form>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white rounded-[var(--radius-lg)] border border-[#E2D9C8] shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-[#E2D9C8]">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[#E2D9C8] text-sm text-[var(--color-ink-mid)]">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Student / Entity</th>
                  <th className="p-4 font-semibold">Description</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold text-right">Amount</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">No transactions recorded yet.</td>
                  </tr>
                ) : (
                  transactions.map(tx => (
                    <tr key={tx.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-sm font-medium text-[var(--color-ink)]">{tx.profiles?.full_name || 'General Account'}</td>
                      <td className="p-4 text-sm text-[var(--color-ink-mid)]">{tx.description || '-'}</td>
                      <td className="p-4 text-sm">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          tx.transaction_type === 'fee_payment' ? 'bg-green-100 text-green-700' :
                          tx.transaction_type === 'expense' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {tx.transaction_type.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className={`p-4 text-sm font-bold text-right ${
                        tx.transaction_type === 'fee_payment' ? 'text-green-600' :
                        tx.transaction_type === 'expense' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {tx.transaction_type === 'expense' ? '-' : '+'}₹{tx.amount}
                      </td>
                      <td className="p-4 text-sm text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEditClick(tx)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:scale-110 transition-transform"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(tx.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:scale-110 transition-transform"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
