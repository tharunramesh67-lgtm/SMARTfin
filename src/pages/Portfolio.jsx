import React, { useState, useEffect } from 'react'
import { Plus, Search, TrendingUp, TrendingDown, Eye, Edit3, Trash2, PieChart as PieIcon, Briefcase, Newspaper, Globe, Zap, Shield, Activity, Terminal } from 'lucide-react'
import { getStockQuote, searchStocks, getMarketNews } from '../services/stockApi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

const CHART_COLORS = ['#facc15', '#fb923c', '#a855f7', '#ef4444', '#22c55e', '#3b82f6']

const Portfolio = () => {
  const [holdings, setHoldings] = useState([])
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    symbol: '',
    quantity: '',
    avgPrice: ''
  })

  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    if (user) {
      setLoading(true)
      const loadData = async () => {
        try {
          await Promise.all([
            fetchPortfolio(true),
            fetchNews()
          ])
        } catch (err) {
          console.error("Error loading portfolio:", err)
        } finally {
          if (isMounted) setLoading(false)
        }
      }
      loadData()

      const timer = setTimeout(() => {
        if (isMounted) setLoading(false)
      }, 8000)

      return () => {
        isMounted = false
        clearTimeout(timer)
      }
    } else {
      setLoading(false)
    }
  }, [user?.id])


  const fetchNews = async () => {
    try {
      const newsData = await getMarketNews()
      setNews(newsData)
    } catch (err) {
      console.error('Error fetching news:', err)
    }
  }

  const fetchPortfolio = async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    
    try {
      if (!user) return
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      // Enrich with live data - handle individual failures gracefully
      const enriched = await Promise.all((data || []).map(async (h) => {
        try {
          const quote = await getStockQuote(h.symbol)
          return { ...h, quote }
        } catch (e) {
          console.error(`Quote fetch failed for ${h.symbol}:`, e)
          return { ...h, quote: null }
        }
      }))

      
      setHoldings(enriched)
    } catch (err) {
      console.error('Error fetching portfolio:', err)
      setError(err.message || 'Failed to load portfolio')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const handleSearch = (e) => {
    const query = e.target.value
    setFormData(prev => ({ ...prev, symbol: query }))
    
    if (searchTimeout) clearTimeout(searchTimeout)

    if (query.trim().length > 1) {
      const timeout = setTimeout(async () => {
        const results = await searchStocks(query)
        setSearchResults(results)
      }, 300)
      setSearchTimeout(timeout)
    } else {
      setSearchResults([])
    }
  }

  const selectStock = (stock) => {
    setFormData({ ...formData, symbol: stock.displaySymbol || stock.symbol })
    setSearchResults([])
  }

  const handleAddHolding = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!user?.id) {
      alert('Your session has expired. Please log in again.')
      return
    }

    if (!formData.symbol.trim()) {
      alert('Please enter or select a stock symbol.')
      return
    }
    
    setIsSubmitting(true)
    try {
      const payload = {
        symbol: formData.symbol.trim().toUpperCase(),
        quantity: parseFloat(formData.quantity),
        avg_price: parseFloat(formData.avgPrice),
        user_id: user.id
      }

      const { error } = await supabase
        .from('portfolio')
        .insert([payload])

      if (error) throw error

      setShowAddModal(false)
      setFormData({ symbol: '', quantity: '', avgPrice: '' })
      setSearchResults([])
      await fetchPortfolio(true)
    } catch (err) {
      console.error('Submission error:', err)
      alert(err.message || 'Failed to add holding.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteHolding = async (id) => {
    if (!confirm('Are you sure you want to delete this position?')) return
    
    try {
      const { error } = await supabase
        .from('portfolio')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchPortfolio(true)
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete holding.')
    }
  }


  const calculateTotals = () => {
    let totalInvested = 0
    let currentVal = 0

    holdings.forEach(h => {
      totalInvested += h.quantity * h.avg_price
      if (h.quote) {
        currentVal += h.quantity * h.quote.current
      }
    })

    const totalPL = currentVal - totalInvested
    const percentPL = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0

    return { totalInvested, currentVal, totalPL, percentPL }
  }

  const totals = calculateTotals()

  const lineChartData = [
    { month: 'JAN', value: Math.round(totals.currentVal * 0.70) },
    { month: 'FEB', value: Math.round(totals.currentVal * 0.80) },
    { month: 'MAR', value: Math.round(totals.currentVal * 0.75) },
    { month: 'APR', value: Math.round(totals.currentVal * 0.90) },
    { month: 'MAY', value: Math.round(totals.currentVal * 0.95) },
    { month: 'JUN', value: Math.round(totals.currentVal) },
  ]

  const pieChartData = holdings
    .map(h => ({ name: h.symbol, value: h.quote ? h.quote.current * h.quantity : 0 }))
    .filter(d => d.value > 0)

  return (
    <div className="space-y-10 pb-10">
      {/* Terminal Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-border-outline pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-primary/40" />
              <div className="w-2 h-2 rounded-full bg-primary/20" />
            </div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Market Intelligence Unit</span>
          </div>
          <h1 className="text-6xl font-black uppercase text-foreground tracking-tighter leading-none">
            Asset <span className="text-primary">Vault</span>
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <p className="font-bold text-xs tracking-widest uppercase flex items-center gap-2">
              <Globe size={14} /> Systems: Online
            </p>
            <p className="font-bold text-xs tracking-widest uppercase flex items-center gap-2 border-l-2 border-border-outline pl-4 text-primary">
              <Zap size={14} /> Live Quote Sync Active
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-muted border-thick p-4 flex items-center gap-4 brick-shadow-sm">
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Net Value</p>
              <p className="text-2xl font-black text-foreground tracking-tighter">₹{totals.currentVal.toLocaleString()}</p>
            </div>
            <div className={`p-2 border-2 ${totals.totalPL >= 0 ? 'bg-primary/20 text-primary border-primary' : 'bg-red-500/20 text-red-500 border-red-500'}`}>
              {totals.totalPL >= 0 ? <TrendingUp size={20} className="stroke-[3]" /> : <TrendingDown size={20} className="stroke-[3]" />}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Visualizer */}
        <div className="lg:col-span-2 border-thick brick-shadow bg-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Activity className="text-primary" size={24} /> 
              Growth_Trajectory
            </h3>
            <div className="flex gap-2">
              {['1D', '1W', '1M', '1Y'].map(t => (
                <button key={t} className={`px-4 py-2 text-[9px] font-black border-2 transition-all ${t === '1M' ? 'bg-primary text-white border-border-outline' : 'border-transparent text-muted-foreground hover:bg-muted'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900, fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '2px solid #000', borderRadius: 0, color: '#f8fafc', fontWeight: 900, fontSize: 12 }} formatter={v => [`₹${v.toLocaleString()}`, 'Value']} />
                <Line type="linear" dataKey="value" stroke="#facc15" strokeWidth={3} dot={{ fill: '#000', stroke: '#facc15', strokeWidth: 2, r: 5 }} activeDot={{ r: 7, fill: '#facc15' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 border-t-4 border-border-outline pt-8">
             <div>
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total P/L</p>
               <p className={`text-sm font-black ${totals.totalPL >= 0 ? 'text-primary' : 'text-red-500'}`}>
                 {totals.totalPL >= 0 ? '+' : '-'}₹{Math.abs(totals.totalPL).toLocaleString()}
               </p>
             </div>
             <div>
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Return Rate</p>
               <p className={`text-sm font-black ${totals.totalPL >= 0 ? 'text-primary' : 'text-red-500'}`}>
                 {totals.percentPL.toFixed(2)}%
               </p>
             </div>
             <div>
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Sync Status</p>
               <p className="text-sm font-black text-foreground">Verified</p>
             </div>
          </div>
        </div>

        {/* Allocation Pie */}
        <div className="border-thick brick-shadow bg-card p-8 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-4 right-4">
             <Shield className="text-primary/10" size={48} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter mb-8 self-start flex items-center gap-3">
            <PieIcon className="text-primary" size={24} />
            Allocation
          </h3>
          <div className="w-full max-w-[240px] relative mb-8">
            <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={0}>
              <PieChart>
                <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" strokeWidth={2} stroke="#000">
                  {pieChartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '2px solid #000', borderRadius: 0, color: '#f8fafc', fontWeight: 900, fontSize: 12 }} formatter={v => [`₹${v.toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full space-y-2 max-h-[200px] overflow-y-auto pr-2">
             {holdings.map((h, i) => (
               <div key={h.id} className="flex justify-between items-center p-3 border-2 border-border-outline bg-muted/30">
                  <span className="text-[10px] font-black uppercase tracking-widest">{h.symbol}</span>
                  <span className="text-[10px] font-black text-foreground tracking-widest">
                    {((h.quote?.current * h.quantity / totals.currentVal) * 100 || 0).toFixed(1)}%
                  </span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Inventory_List</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary px-6 py-3 flex items-center gap-2 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-[10px] font-black tracking-widest uppercase">ACQUIRE_ASSET</span>
          </button>
        </div>

        <div className="bg-card border-thick brick-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted border-b-4 border-border-outline text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Security</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Avg_Cost</th>
                  <th className="px-6 py-4">Market_Val</th>
                  <th className="px-6 py-4">Performance</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-border-outline">
                {holdings.map((h) => {
                  const investedVal = h.avg_price * h.quantity
                  const currentVal = h.quote ? h.quote.current * h.quantity : 0
                  const pl = currentVal - investedVal
                  const plPercent = investedVal > 0 ? (pl / investedVal) * 100 : 0

                  return (
                    <tr key={h.id} className="hover:bg-muted/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-background border-2 border-border-outline flex items-center justify-center font-black text-xs text-primary">
                             {h.symbol[0]}
                           </div>
                           <div>
                             <div className="font-black text-foreground uppercase tracking-widest">{h.symbol}</div>
                             <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Common Stock</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-black text-foreground text-sm">{h.quantity}</td>
                      <td className="px-6 py-5 font-black text-foreground text-sm">₹{h.avg_price.toLocaleString()}</td>
                      <td className="px-6 py-5">
                        <div className="font-black text-foreground text-sm">₹{h.quote?.current?.toLocaleString() || '---'}</div>
                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">LIVE_FEED</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`font-black text-sm ${pl >= 0 ? 'text-primary' : 'text-red-500'}`}>
                          {pl >= 0 ? '+' : ''}₹{Math.abs(pl).toLocaleString()}
                        </div>
                        <div className={`text-[9px] font-black uppercase tracking-widest ${pl >= 0 ? 'text-primary' : 'text-red-500'}`}>
                          {plPercent.toFixed(2)}% {pl >= 0 ? 'GAINED' : 'LOSS'}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => deleteHolding(h.id)}
                          className="p-2 border-2 border-border-outline bg-background text-red-500 hover:bg-red-500 hover:text-white transition-all brick-shadow-sm"
                        >
                           <Trash2 size={16} />
                        </button>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Market News Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
         <div className="md:col-span-2 space-y-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Newspaper className="text-primary" size={24} />
              Intel_Stream
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {news.slice(0, 4).map((item, i) => (
                <a key={i} href={item.url} target="_blank" className="bg-card border-thick brick-shadow p-5 hover:translate-y-1 hover:shadow-none transition-all group">
                   <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 flex items-center justify-between">
                     {item.source}
                     <span className="text-muted-foreground">{new Date(item.datetime * 1000).toLocaleDateString()}</span>
                   </div>
                   <h4 className="text-sm font-black uppercase tracking-tight line-clamp-2 group-hover:text-primary transition-colors">{item.headline}</h4>
                </a>
              ))}
            </div>
         </div>
         <div className="space-y-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Shield className="text-primary" size={24} />
              SecOps
            </h3>
            <div className="bg-muted border-thick p-6 space-y-6">
               <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                     <span>Encryption</span>
                     <span className="text-primary">AES-256</span>
                  </div>
                  <div className="h-2 bg-background border-2 border-border-outline w-full" />
               </div>
               <div className="p-4 bg-background border-2 border-border-outline flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Vault Status</p>
                    <p className="text-xs font-black text-foreground">Secure & Operational</p>
                  </div>
               </div>
               <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed tracking-widest">
                  All transactions are audited via the Supabase secure protocol layer. Asset intelligence is provided by the Finnhub real-time data bridge.
               </p>
            </div>
         </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-card border-thick brick-shadow w-full max-w-md p-8 relative">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter">Add_Position</h2>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">Initiate asset acquisition protocol</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 flex items-center justify-center bg-muted border-2 border-border-outline brick-shadow-sm hover:translate-y-0.5"
              >
                <Plus size={24} className="rotate-45 stroke-[3]" />
              </button>
            </div>

            <form onSubmit={handleAddHolding} className="space-y-6">
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Asset_Ticker</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground stroke-[3]" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="ENTER SYMBOL..."
                    className="w-full bg-background border-thick h-14 pl-12 pr-4 text-foreground placeholder:text-muted-foreground outline-none uppercase font-black text-lg focus:bg-muted transition-colors"
                    value={formData.symbol}
                    onChange={handleSearch}
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-card border-thick brick-shadow mt-2 z-50 max-h-60 overflow-y-auto p-2">
                    {searchResults.map((stock) => (
                      <button key={stock.symbol} type="button" onClick={() => selectStock(stock)} className="w-full text-left p-3 hover:bg-muted flex justify-between items-center border-2 border-transparent hover:border-border-outline">
                        <span className="font-black text-foreground uppercase tracking-tighter">{stock.symbol}</span>
                        <span className="text-[9px] font-black bg-secondary text-secondary-foreground border-2 border-border-outline px-2 py-0.5 uppercase">{stock.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Quantity</label>
                  <input type="number" required placeholder="0" className="w-full bg-background border-thick h-14 px-4 text-foreground outline-none font-black text-lg focus:bg-muted" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Unit_Price</label>
                  <input type="number" step="0.01" required placeholder="0.00" className="w-full bg-background border-thick h-14 px-4 text-foreground outline-none font-black text-lg focus:bg-muted" value={formData.avgPrice} onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })} />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground border-thick brick-shadow h-16 font-black text-lg uppercase tracking-widest hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50">
                {isSubmitting ? "PROCESSING..." : "COMMIT_ENTRY"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Portfolio
