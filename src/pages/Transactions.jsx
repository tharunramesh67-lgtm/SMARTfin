import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, Trash2, Calendar, Tag, Terminal, Activity, Shield, Zap } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'General',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    let isMounted = true
    if (user) {
      fetchTransactions()
      
      const timer = setTimeout(() => {
        if (isMounted) setLoading(false)
      }, 5000)

      return () => {
        isMounted = false
        clearTimeout(timer)
      }
    } else {
      setLoading(false)
    }
  }, [filter, user?.id])


  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      if (!user) return

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('type', filter)
      }

      const { data, error: sbError } = await query
      
      if (sbError) {
        console.error('Supabase error:', sbError)
        throw new Error(sbError.message)
      }
      
      setTransactions(data || [])
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
      setError(err.message || 'Failed to connect to database')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    const { error } = await supabase
      .from('transactions')
      .insert([{
        ...formData,
        amount: parseFloat(formData.amount),
        user_id: user.id
      }])

    if (error) {
      alert(error.message)
    } else {
      setShowAddModal(false)
      setFormData({ title: '', amount: '', type: 'expense', category: 'General', date: new Date().toISOString().split('T')[0] })
      fetchTransactions()
    }
  }

  const deleteTransaction = async (id) => {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) alert(error.message)
    else fetchTransactions()
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Terminal Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-border-outline pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-primary/40" />
              <div className="w-2 h-2 rounded-full bg-primary/20" />
            </div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">System Data Stream</span>
          </div>
          <h1 className="text-6xl font-black uppercase text-foreground tracking-tighter leading-none">
            Ledger <span className="text-primary">Logs</span>
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <p className="font-bold text-xs tracking-widest uppercase flex items-center gap-2">
              <Terminal size={14} /> ID: UNIFIED-WLT-042
            </p>
            <p className="font-bold text-xs tracking-widest uppercase flex items-center gap-2 border-l-2 border-border-outline pl-4">
              <Activity size={14} /> Status: Operational
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center justify-center gap-3 group px-8 py-5 h-fit brick-shadow-lg"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500 stroke-[4]" /> 
          <span className="tracking-[0.2em] font-black text-lg">NEW_ENTRY</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="border-thick brick-shadow bg-card overflow-hidden">
            {/* Toolbar */}
            <div className="p-5 border-b-4 border-border-outline flex flex-col md:flex-row items-center justify-between gap-6 bg-muted/50">
              <div className="flex items-center gap-1 bg-background p-1.5 border-2 border-border-outline brick-shadow-sm">
                {['all', 'income', 'expense'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-5 py-2.5 text-[10px] font-black uppercase transition-all tracking-widest border-2 ${
                      filter === f 
                        ? 'bg-primary text-white border-border-outline shadow-[2px_2px_0px_rgba(0,0,0,1)]' 
                        : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 max-w-sm w-full group">
                <div className="absolute inset-0 bg-primary/5 -m-1 blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="SCAN_RECORDS..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background border-thick w-full pl-12 pr-4 py-4 text-xs text-foreground font-black placeholder:text-muted-foreground focus:outline-none focus:bg-muted transition-all tracking-[0.2em] relative z-10" 
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-4 border-border-outline bg-muted">
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground border-r-2 border-border-outline">Type</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground border-r-2 border-border-outline">Description</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground border-r-2 border-border-outline">Category</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground border-r-2 border-border-outline">Timestamp</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right border-r-2 border-border-outline">Amount</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-border-outline font-mono">
                  {loading ? (
                    <tr><td colSpan="6" className="px-6 py-20 text-center text-primary font-black uppercase tracking-[0.3em] animate-pulse">Initializing data stream...</td></tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                          <div className="w-16 h-16 bg-red-500/20 border-thick border-red-500 flex items-center justify-center text-red-500">
                            <Shield size={32} />
                          </div>
                          <p className="text-red-500 font-black text-sm uppercase tracking-widest">{error}</p>
                          <button 
                            onClick={fetchTransactions}
                            className="btn-primary w-full py-4 text-xs"
                          >
                            RETRY_CONNECTION
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : transactions.filter(t => 
                      t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      t.category.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-20 text-center text-muted-foreground font-black uppercase tracking-[0.2em]">Zero records found in local cache.</td></tr>
                  ) : (
                    transactions
                      .filter(t => 
                        t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.category.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((t) => (

                      <tr key={t.id} className="hover:bg-muted/50 transition-colors group border-b-2 border-border-outline last:border-0">
                        <td className="px-6 py-6 border-r-2 border-border-outline">
                          <div className={`w-12 h-12 border-thick flex items-center justify-center transition-all group-hover:scale-110 ${
                            t.type === 'income' 
                              ? 'bg-primary/20 border-primary text-primary shadow-[4px_4px_0px_rgba(16,185,129,0.2)]' 
                              : 'bg-red-500/20 border-red-500 text-red-500 shadow-[4px_4px_0px_rgba(239,68,68,0.2)]'
                          }`}>
                            {t.type === 'income' ? <ArrowUpRight size={22} className="stroke-[3]" /> : <ArrowDownLeft size={22} className="stroke-[3]" />}
                          </div>
                        </td>
                        <td className="px-6 py-6 border-r-2 border-border-outline">
                          <div className="font-black text-foreground uppercase tracking-tight text-base mb-1">{t.title}</div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black px-2 py-0.5 border border-border-outline uppercase tracking-widest ${
                              t.type === 'income' ? 'text-primary bg-primary/5' : 'text-red-500 bg-red-500/5'
                            }`}>
                              {t.type}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-bold tracking-[0.2em]">REF: {t.id.slice(0, 8).toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 border-r-2 border-border-outline">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-background border-2 border-border-outline text-muted-foreground text-[10px] font-black uppercase tracking-widest w-fit">
                            <Tag size={12} className="text-primary" />
                            {t.category}
                          </div>
                        </td>
                        <td className="px-6 py-6 border-r-2 border-border-outline">
                          <div className="text-muted-foreground font-black text-[10px] tracking-[0.1em] flex items-center gap-2">
                            <Calendar size={12} />
                            {new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase()}
                          </div>
                        </td>
                        <td className={`px-6 py-6 font-black text-right border-r-2 border-border-outline text-lg tracking-tighter ${
                          t.type === 'income' ? 'text-primary' : 'text-foreground'
                        }`}>
                          {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-6">
                          <button 
                            onClick={() => deleteTransaction(t.id)}
                            className="w-10 h-10 flex items-center justify-center border-2 border-transparent hover:border-red-500 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} className="stroke-[2.5]" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Footer */}
            <div className="p-4 border-t-4 border-border-outline bg-muted flex items-center justify-between">
               <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">System Data End-of-Stream</span>
               <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">{transactions.length} Records Loaded</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Spending Velocity */}
          <div className="border-thick brick-shadow p-8 bg-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap size={60} className="text-primary rotate-12" />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Velocity Status</span>
              <div className="flex justify-between items-end mt-4">
                <h4 className="text-4xl font-black text-foreground tracking-tighter">₹80,000</h4>
                <span className="text-[10px] text-muted-foreground font-black uppercase mb-1 tracking-widest border-b-2 border-primary">Limit</span>
              </div>
              <div className="w-full bg-background border-thick h-6 mt-6 p-1">
                <div className="bg-primary h-full border-r-2 border-border-outline transition-all duration-1000 relative" style={{ width: '70%' }}>
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <p className="text-[10px] text-primary font-black uppercase tracking-widest">70% Consumption</p>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">30% Remaining</p>
              </div>
            </div>
          </div>

          {/* Insights Engine */}
          <div className="border-thick brick-shadow p-8 bg-card relative overflow-hidden group hover:bg-muted/30 transition-colors">
             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rotate-45 translate-x-12 -translate-y-12 border-l border-b border-primary/20" />
             <div className="p-4 bg-primary/20 border-thick border-primary w-fit mb-6 shadow-[4px_4px_0px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">
               <Tag size={24} className="text-primary stroke-[3]" />
             </div>
             <h4 className="font-black text-foreground uppercase text-sm mb-4 tracking-[0.3em] flex items-center gap-2">
               Insights_Engine <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
             </h4>
             <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase tracking-wide">
               Pattern recognized: <span className="text-foreground border-b-2 border-primary">Entertainment</span> spending is <span className="text-red-500">15% higher</span> than your 30-day baseline.
             </p>
             <button className="mt-8 text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-2 transition-transform">
               VIEW_ANALYSIS <ArrowUpRight size={14} />
             </button>
          </div>

          {/* Decorative Card */}
          <div className="border-thick border-dashed border-muted-foreground/30 p-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-crosshair">
            <div className="flex justify-between mb-4">
               <Shield size={20} />
               <Activity size={20} />
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] leading-loose">
              Encryption Enabled<br/>
              Local Storage Locked<br/>
              Cloud Sync v4.2
            </p>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
          <div className="border-thick brick-shadow-lg w-full max-w-xl p-10 animate-in zoom-in-95 duration-500 bg-card relative">
            {/* Modal Header */}
            <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
            <div className="flex justify-between items-center mb-10 border-b-4 border-border-outline pb-6">
              <div>
                <h2 className="text-4xl font-black uppercase text-foreground tracking-tighter">Initialize entry</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1">Transaction record creation protocol</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-14 h-14 flex items-center justify-center bg-muted hover:bg-red-500 hover:text-white border-thick text-foreground transition-all group"
              >
                <Plus size={32} className="rotate-45 group-hover:rotate-0 transition-transform duration-500 stroke-[4]" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-8">
              <div className="grid grid-cols-2 gap-4 bg-muted border-thick p-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`py-4 text-xs font-black uppercase transition-all tracking-[0.2em] border-2 ${
                    formData.type === 'expense' 
                      ? 'bg-red-500 text-white border-border-outline shadow-[4px_4px_0px_rgba(0,0,0,1)]' 
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  EXPENSE_OUT
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`py-4 text-xs font-black uppercase transition-all tracking-[0.2em] border-2 ${
                    formData.type === 'income' 
                      ? 'bg-primary text-white border-border-outline shadow-[4px_4px_0px_rgba(0,0,0,1)]' 
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  INCOME_IN
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Object Description</label>
                <input
                  type="text"
                  required
                  placeholder="INPUT_DESCRIPTION..."
                  className="bg-background border-thick w-full px-6 py-5 text-sm font-black text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-muted transition-all tracking-[0.1em]"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Credit Units (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    className="bg-background border-thick w-full px-6 py-5 text-sm font-black text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-muted transition-all"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Log Date</label>
                  <input
                    type="date"
                    required
                    className="bg-background border-thick w-full px-6 py-5 text-sm font-black text-foreground focus:outline-none focus:bg-muted transition-all uppercase"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Classification</label>
                <select
                  className="bg-background border-thick w-full px-6 py-5 text-sm font-black text-foreground focus:outline-none focus:bg-muted transition-all uppercase tracking-[0.2em] cursor-pointer appearance-none"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {['General', 'Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Investment', 'Salary'].map(cat => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary w-full h-20 mt-6 brick-shadow-lg text-lg font-black uppercase tracking-[0.4em] active:translate-y-2 active:shadow-none transition-all">
                 COMMIT_TO_LEDGER
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions
