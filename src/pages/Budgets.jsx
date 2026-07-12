import React, { useState, useEffect } from 'react'
import { Target, TrendingUp, AlertCircle, Plus, Trash2, X, Terminal, Activity, Shield } from 'lucide-react'
import { budgetService } from '../services/budgetService'
import { useAuth } from '../contexts/AuthContext'

const Budgets = () => {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalMode, setModalMode] = useState(null) // 'add', 'edit'
  const [selectedBudget, setSelectedBudget] = useState(null)
  const { user } = useAuth()

  // Form State
  const [formData, setFormData] = useState({
    category: 'Food',
    limit_amount: ''
  })

  const categories = ['Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Investment', 'General']

  useEffect(() => {
    if (user) {
      fetchBudgets()
    }
  }, [user])

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const data = await budgetService.getBudgets()
      setBudgets(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch budgets. Make sure the database table exists.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAdd = () => {
    setModalMode('add')
    setFormData({ category: 'Food', limit_amount: '' })
  }

  const handleOpenEdit = (budget) => {
    setModalMode('edit')
    setSelectedBudget(budget)
    setFormData({ 
      category: budget.category, 
      limit_amount: budget.limit_amount 
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (modalMode === 'add') {
        // Validation: Prevent duplicate categories
        const exists = budgets.find(b => b.category.toLowerCase() === formData.category.toLowerCase())
        if (exists) {
          throw new Error(`A budget for "${formData.category}" already exists. Adjust the existing one instead.`)
        }
        await budgetService.createBudget(formData.category, parseFloat(formData.limit_amount))
      } else if (modalMode === 'edit') {
        await budgetService.updateBudget(selectedBudget.id, parseFloat(formData.limit_amount))
      }
      
      setModalMode(null)
      setSelectedBudget(null)
      setFormData({ category: 'Food', limit_amount: '' })
      fetchBudgets()
    } catch (err) {
      alert(err.message || 'Operation failed')
    }
  }

  const handleDeleteBudget = async (id) => {
    if (!confirm('Are you sure you want to delete this budget?')) return
    try {
      await budgetService.deleteBudget(id)
      fetchBudgets()
    } catch (err) {
      alert(err.message || 'Failed to delete budget')
    }
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-border-outline pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-secondary/40" />
              <div className="w-2 h-2 rounded-full bg-secondary/20" />
            </div>
            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Resource Allocation</span>
          </div>
          <h1 className="text-6xl font-black uppercase text-foreground tracking-tighter leading-none">
            Budget <span className="text-secondary">Core</span>
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <p className="font-bold text-xs tracking-widest uppercase flex items-center gap-2">
              <Terminal size={14} /> MODULE: BGT-PLAN-X
            </p>
            <p className="font-bold text-xs tracking-widest uppercase flex items-center gap-2 border-l-2 border-border-outline pl-4">
              <Activity size={14} /> Status: Ready
            </p>
          </div>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="btn-secondary flex items-center justify-center gap-3 group px-8 py-5 h-fit brick-shadow-lg"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500 stroke-[4]" /> 
          <span className="tracking-[0.2em] font-black text-lg">NEW_TARGET</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card border-thick brick-shadow rounded-sm p-6 h-48 animate-pulse flex items-center justify-center">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Scanning internal memory...</span>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border-thick border-red-500 p-10 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500 border-thick border-black flex items-center justify-center text-white mx-auto brick-shadow">
            <Shield size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase text-red-500">Database Connection Error</h3>
            <p className="text-muted-foreground font-bold mt-2 uppercase text-xs tracking-widest">{error}</p>
          </div>
          <button onClick={fetchBudgets} className="btn-primary px-10 py-4">Retry Sync</button>
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-muted/30 border-thick border-dashed border-border-outline p-20 text-center space-y-4">
          <Target className="mx-auto text-muted-foreground opacity-20" size={64} />
          <h3 className="text-2xl font-black uppercase text-muted-foreground">No Budgets Defined</h3>
          <p className="text-muted-foreground font-bold max-w-md mx-auto">You haven't set any financial limits yet. Click 'NEW_TARGET' to start optimizing your spending.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((b) => {
            const isOver = b.percent >= 100
            const isWarning = b.percent >= 80 && !isOver

            return (
              <div key={b.id} className="bg-card border-thick brick-shadow rounded-sm p-6 transition-all hover:-translate-y-1 hover:brick-shadow-lg group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-black uppercase text-foreground text-xl tracking-tight">{b.category}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${isOver ? 'bg-primary' : isWarning ? 'bg-accent' : 'bg-secondary'}`} />
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Active Protocol</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isOver && (
                      <div className="flex items-center gap-1 bg-primary text-primary-foreground border-2 border-black px-2 py-1 rounded-sm text-[10px] font-black uppercase brick-shadow-sm">
                        <AlertCircle size={12} /> CRITICAL
                      </div>
                    )}
                    <button 
                      onClick={() => handleOpenEdit(b)}
                      className="p-2 border-2 border-transparent hover:border-secondary hover:bg-secondary/10 text-muted-foreground hover:text-secondary transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Plus className="rotate-45" size={16} /> {/* Using Plus rotated as a generic edit/pencil alt */}
                    </button>
                    <button 
                      onClick={() => handleDeleteBudget(b.id)}
                      className="p-2 border-2 border-transparent hover:border-red-500 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-foreground">₹{b.spent.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm font-bold uppercase tracking-tighter">OF ₹{b.limit_amount.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black tracking-tighter ${isOver ? 'text-primary' : isWarning ? 'text-accent' : 'text-secondary'}`}>
                      {b.percent.toFixed(0)}%
                    </div>
                    <div className="text-[8px] font-black text-muted-foreground uppercase">Consumption</div>
                  </div>
                </div>

                <div className="w-full bg-background border-thick h-5 p-1 overflow-hidden">
                  <div 
                    className={`h-full border-r-2 border-black transition-all duration-1000 relative ${
                      isOver ? 'bg-primary' : isWarning ? 'bg-accent' : 'bg-secondary'
                    }`} 
                    style={{ width: `${Math.min(b.percent, 100)}%` }} 
                  >
                    {!isOver && <div className="absolute inset-0 bg-white/10 animate-[shimmer_2s_infinite]" />}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-border-outline flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>REMAINING: ₹{Math.max(0, b.limit_amount - b.spent).toLocaleString()}</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={10} className={isOver ? 'text-primary' : 'text-secondary'} />
                    <span>MONTHLY_FREQ</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Analytics Summary */}
      <div className="bg-secondary text-secondary-foreground border-thick brick-shadow rounded-sm p-4 md:p-12 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-tertiary rounded-full border-thick opacity-30 block mix-blend-multiply" />
        <div className="flex-1 space-y-6 relative z-10 text-center md:text-left">
          <div className="w-16 h-16 bg-white/20 border-thick border-white flex items-center justify-center mx-auto md:mx-0">
            <Target size={32} />
          </div>
          <h2 className="text-4xl font-black uppercase leading-none tracking-tighter">Optimization Core Engaged.</h2>
          <p className="text-secondary-foreground/80 font-bold font-mono text-sm max-w-xl">
            System analysis suggests a <span className="bg-black text-white px-2 py-0.5">₹5,400 surplus</span> can be captured by redistributing unused allocations from low-velocity categories.
          </p>
          <button className="btn-accent border-thick brick-shadow-sm mt-4 w-full md:w-auto px-10">RUN_DEEP_SCAN</button>
        </div>
        <div className="flex-shrink-0 relative z-10 w-full md:w-auto">
          <div className="bg-card text-foreground border-thick brick-shadow-lg p-8 rounded-sm min-w-[240px]">
            <TrendingUp className="text-secondary mb-4" size={32} />
            <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Projected_Annual_Yield</div>
            <div className="text-5xl font-black mt-2 tracking-tighter">₹64,800</div>
            <div className="text-[9px] font-bold text-muted-foreground mt-4 border-t-2 border-border-outline pt-4 uppercase tracking-widest">Estimate for FY 2026-27</div>
          </div>
        </div>
      </div>

      {/* Add/Edit Budget Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="border-thick brick-shadow-lg w-full max-w-md p-10 bg-card relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-secondary" />
            <div className="flex justify-between items-center mb-10 border-b-4 border-border-outline pb-6">
              <div>
                <h2 className="text-3xl font-black uppercase text-foreground tracking-tighter">
                  {modalMode === 'add' ? 'Set Limit' : 'Adjust Limit'}
                </h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1">Resource allocation protocol</p>
              </div>
              <button 
                onClick={() => setModalMode(null)}
                className="w-12 h-12 flex items-center justify-center bg-muted hover:bg-red-500 hover:text-white border-thick text-foreground transition-all group"
              >
                <X size={24} className="group-hover:scale-125 transition-transform" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Classification Category</label>
                {modalMode === 'add' ? (
                  <select
                    className="bg-background border-thick w-full px-6 py-5 text-sm font-black text-foreground focus:outline-none focus:bg-muted transition-all uppercase tracking-[0.2em] cursor-pointer appearance-none"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-muted/50 border-thick w-full px-6 py-5 text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">
                    {formData.category}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Monthly Threshold (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  className="bg-background border-thick w-full px-6 py-5 text-sm font-black text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-muted transition-all"
                  value={formData.limit_amount}
                  onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-secondary w-full h-20 mt-6 brick-shadow-lg text-lg font-black uppercase tracking-[0.4em] active:translate-y-2 active:shadow-none transition-all">
                 {modalMode === 'add' ? 'INITIALIZE_BUDGET' : 'UPDATE_PROTOCOL'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Budgets
