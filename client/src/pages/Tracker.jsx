import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Calendar, FileSpreadsheet, ArrowUpRight, ArrowDownLeft, AlertCircle, Edit, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function Tracker() {
  const { user } = useAuth();
  
  // Local storage state for guest mode
  const [transactions, setTransactions] = useState(() => {
    if (!user) {
      const local = localStorage.getItem('fincalc_transactions');
      return local ? JSON.parse(local) : [];
    }
    return [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'Food',
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Filter/Sort States
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Categories list
  const categories = ['Food', 'Utilities', 'Salary', 'Rent', 'Investment', 'Entertainment', 'Transport', 'Healthcare', 'Others'];

  // Sync / Fetch Transactions
  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      // Guest mode sync
      localStorage.setItem('fincalc_transactions', JSON.stringify(transactions));
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (err) throw err;
      setTransactions(data || []);
    } catch (err) {
      setError(err.message || 'Error fetching transactions.');
    } finally {
      setLoading(false);
    }
  };

  // Add / Edit Transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return setError('Please enter a valid amount.');
    }

    setLoading(true);
    try {
      if (user) {
        if (editingId) {
          const { error: err } = await supabase
            .from('transactions')
            .update({
              type: formData.type,
              category: formData.category,
              amount: parseFloat(formData.amount),
              note: formData.note,
              date: formData.date
            })
            .eq('id', editingId);
          if (err) throw err;
        } else {
          const { error: err } = await supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              type: formData.type,
              category: formData.category,
              amount: parseFloat(formData.amount),
              note: formData.note,
              date: formData.date
            });
          if (err) throw err;
        }
        await fetchTransactions();
      } else {
        // Guest Mode
        if (editingId) {
          setTransactions(prev => prev.map(t => t.id === editingId ? { ...t, ...formData, amount: parseFloat(formData.amount) } : t));
        } else {
          const newTx = {
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
            ...formData,
            amount: parseFloat(formData.amount),
            created_at: new Date().toISOString()
          };
          setTransactions(prev => [newTx, ...prev]);
        }
      }
      // Reset Form
      setFormData({
        type: 'expense',
        category: 'Food',
        amount: '',
        note: '',
        date: new Date().toISOString().split('T')[0]
      });
      setEditingId(null);
      setShowAddForm(false);
    } catch (err) {
      setError(err.message || 'Failed to save transaction.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Transaction
  const handleDelete = async (id) => {
    if (user) {
      try {
        setLoading(true);
        const { error: err } = await supabase.from('transactions').delete().eq('id', id);
        if (err) throw err;
        await fetchTransactions();
      } catch (err) {
        setError(err.message || 'Failed to delete transaction.');
      } finally {
        setLoading(false);
      }
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // Trigger Edit mode
  const handleEditInit = (t) => {
    setEditingId(t.id);
    setFormData({
      type: t.type,
      category: t.category,
      amount: t.amount,
      note: t.note || '',
      date: t.date
    });
    setShowAddForm(true);
  };

  // CSV Export Function
  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];
    const rows = transactions.map(t => [t.date, t.type, t.category, t.amount, t.note || '']);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fincalc_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sorting & Filtering Logic on display list
  const filteredTransactions = transactions
    .filter(t => {
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      const txDate = new Date(t.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      const matchesStart = !start || txDate >= start;
      const matchesEnd = !end || txDate <= end;
      
      return matchesType && matchesCategory && matchesStart && matchesEnd;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (sortField === 'amount') {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      } else if (sortField === 'date') {
        valA = new Date(valA);
        valB = new Date(valB);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Income & Expense Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Log transactions and manage your cashflow.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                type: 'expense',
                category: 'Food',
                amount: '',
                note: '',
                date: new Date().toISOString().split('T')[0]
              });
              setShowAddForm(!showAddForm);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 active:scale-[0.98] transition-all w-full sm:w-auto shadow-md shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
          <button
            onClick={exportToCSV}
            disabled={transactions.length === 0}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200/50 dark:border-red-900/50">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Slide-out/Form Panel */}
      {showAddForm && (
        <div className="glass-panel p-6 border-l-4 border-emerald-500 animate-in fade-in duration-200">
          <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Transaction' : 'New Transaction'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="label-title">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="input-field"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="label-title">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="input-field"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-title">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-title">Note</label>
              <input
                type="text"
                placeholder="Note/description"
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm"
              >
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="py-3 px-4 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="glass-panel p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="label-title">Filter Type</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field">
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div>
          <label className="label-title">Filter Category</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-field">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label-title">Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label-title">End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setFilterType('all');
              setFilterCategory('all');
              setStartDate('');
              setEndDate('');
            }}
            className="w-full py-3 px-4 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl uppercase tracking-wider text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr>
                <th onClick={() => toggleSort('date')} className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer select-none">
                  <div className="flex items-center gap-1">
                    Date <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th onClick={() => toggleSort('category')} className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer select-none">
                  <div className="flex items-center gap-1">
                    Category <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Note</th>
                <th onClick={() => toggleSort('amount')} className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer select-none">
                  <div className="flex items-center justify-end gap-1">
                    Amount <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-500 dark:text-slate-400">
                    {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      tx.type === 'income' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-slate-600 dark:text-slate-300 font-medium">
                    {tx.note || '—'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${
                    tx.type === 'income' ? 'text-emerald-500' : 'text-indigo-500'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'} ₹{parseFloat(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEditInit(tx)}
                        className="text-slate-500 hover:text-emerald-500 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-slate-500 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No transactions found. Add a new one to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
