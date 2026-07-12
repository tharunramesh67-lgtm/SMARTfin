import React, { useState, useEffect } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { TrendingUp, Wallet, ArrowUpCircle, ArrowDownCircle, Briefcase, Shield, RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { dashboardService } from '../services/dashboardService'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    investedAmount: 0,
    currentValue: 0,
    dailyChange: 0,
    budgetUtilization: 0
  })
  const [expenseData, setExpenseData] = useState([])
  const [timeRange, setTimeRange] = useState(7)
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // AI Insight Generator
  const getAiInsight = () => {
    if (loading) return "Analyzing financial vectors..."
    
    if (stats.budgetUtilization > 80) {
      return `Critical burn rate detected. Budget utilization at ${stats.budgetUtilization.toFixed(1)}%. Recommend immediate reduction in non-essential categories.`
    }
    
    if (stats.dailyChange < -2) {
      return "Market volatility affecting equity. Portfolio delta exceeded -2%. Hedge positioning suggested for the next cycle."
    }
    
    if (stats.totalBalance > stats.monthlyExpenses * 3) {
      return "Excess capital detected in liquid state. Recommend reallocating ₹" + Math.floor(stats.totalBalance * 0.2).toLocaleString() + " to 'Market Equity' for growth optimization."
    }
    
    return "Financial parameters stable. Wealth projection shows consistent upward trajectory. Maintain current allocation matrix."
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user?.id])

  useEffect(() => {
    if (user) {
      fetchTrendData()
    }
  }, [timeRange])

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true)
      if (!user) return

      const summary = await dashboardService.getDashboardSummary()
      if (summary) {
        setStats(summary)
        setExpenseData(summary.expenseCategories)
      }
      
      await fetchTrendData()

    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const fetchTrendData = async () => {
    try {
      const trend = await dashboardService.getBalanceTrend(timeRange)
      if (trend) {
        setTrendData(trend)
      }
    } catch (err) {
      console.error('Error fetching trend data:', err)
    }
  }

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-10 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-thick border-border-outline/10 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-primary rounded-none" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Operational</span>
          </div>
          <h1 className="text-5xl font-black uppercase text-foreground tracking-tighter italic">
            Unified<span className="text-primary">Wealth</span>
          </h1>
          <p className="text-muted-foreground font-bold text-xs tracking-[0.1em] mt-1 uppercase opacity-70">
            Welcome, Agent {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]} // Authentication Level 4
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="px-5 py-3 bg-card border-thick brick-shadow flex items-center gap-4 hover:bg-muted transition-all active:translate-y-1"
          >
            <RefreshCw size={16} className={`text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Data Stream</span>
              <span className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">{isRefreshing ? 'Syncing...' : 'SYNC_NOW'}</span>
            </div>
          </button>
          <div className="px-5 py-3 bg-card border-thick brick-shadow flex items-center gap-4">
            <div className="relative">
              <div className="w-3 h-3 bg-primary animate-ping absolute inset-0" />
              <div className="w-3 h-3 bg-primary relative border-standard border-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Exchange Status</span>
              <span className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">Market Open // Global</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border-thick brick-shadow p-6 group hover:-translate-y-1 hover:brick-shadow-lg transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
            <Wallet size={80} />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Capital</span>
            <div className="p-2 bg-secondary/10 border-standard border-secondary/20"><Wallet size={18} className="text-secondary" /></div>
          </div>
          <h2 className="text-4xl font-black mt-6 text-foreground tracking-tight leading-none">
            {loading ? <span className="animate-pulse opacity-30">₹---</span> : `₹${stats.totalBalance.toLocaleString()}`}
          </h2>
          <div className="mt-4 pt-4 border-t-standard border-border-outline/10 flex justify-between items-center">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Liquid Assets</p>
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-secondary" />
              <div className="w-1 h-3 bg-secondary/40" />
            </div>
          </div>
        </div>

        <div className="bg-card border-thick brick-shadow p-6 group hover:-translate-y-1 hover:brick-shadow-lg transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
            <Briefcase size={80} />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Market Equity</span>
            <div className="p-2 bg-primary/10 border-standard border-primary/20"><Briefcase size={18} className="text-primary" /></div>
          </div>
          <h2 className="text-4xl font-black mt-6 text-foreground tracking-tight leading-none">
            {loading ? <span className="animate-pulse opacity-30">₹---</span> : `₹${stats.currentValue.toLocaleString()}`}
          </h2>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t-standard border-border-outline/10">
             <span className={`text-[10px] font-black ${stats.dailyChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
               {stats.dailyChange >= 0 ? '▲' : '▼'} {Math.abs(stats.dailyChange).toFixed(2)}%
             </span>
             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">24H Delta</span>
          </div>
        </div>

        <div className="bg-card border-thick brick-shadow p-6 group hover:-translate-y-1 hover:brick-shadow-lg transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
            <TrendingUp size={80} />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Inflow</span>
            <div className="p-2 bg-accent/10 border-standard border-accent/20"><TrendingUp size={18} className="text-accent" /></div>
          </div>
          <h2 className="text-4xl font-black mt-6 text-foreground tracking-tight leading-none">
            ₹{stats.monthlyIncome.toLocaleString()}
          </h2>
          <div className="mt-4 pt-4 border-t-standard border-border-outline/10">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-accent animate-pulse" />
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">High Velocity</p>
            </div>
          </div>
        </div>

        <div className="bg-card border-thick brick-shadow p-6 group hover:-translate-y-1 hover:brick-shadow-lg transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
            <ArrowDownCircle size={80} />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Burn</span>
            <div className="p-2 bg-destructive/10 border-standard border-destructive/20"><ArrowDownCircle size={18} className="text-destructive" /></div>
          </div>
          <h2 className="text-4xl font-black mt-6 text-foreground tracking-tight leading-none">
            ₹{stats.monthlyExpenses.toLocaleString()}
          </h2>
          <div className="mt-4 space-y-2 pt-4 border-t-standard border-border-outline/10">
            <div className="w-full bg-background border-standard border-border-outline/20 h-1 overflow-hidden">
              <div 
                className="bg-destructive h-full transition-all duration-1000" 
                style={{ width: `${Math.min(stats.budgetUtilization, 100)}%` }} 
              />
            </div>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Util: {stats.budgetUtilization.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Trend Chart */}
        <div className="lg:col-span-8 bg-card border-thick brick-shadow p-8 h-[500px] flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 border-b-4 border-border-outline pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary border-thick brick-shadow-sm flex items-center justify-center">
                <TrendingUp size={24} className="text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-black uppercase text-xl text-foreground tracking-widest">
                  Capital Vectors
                </h3>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Asset Growth Projection // Active</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setTimeRange(7)}
                className={`px-4 py-2 border-2 border-black text-[10px] font-black uppercase transition-all brick-shadow-sm ${timeRange === 7 ? 'bg-secondary text-white' : 'bg-muted hover:bg-secondary/20'}`}
              >
                7D
              </button>
              <button 
                onClick={() => setTimeRange(30)}
                className={`px-4 py-2 border-2 border-black text-[10px] font-black uppercase transition-all brick-shadow-sm ${timeRange === 30 ? 'bg-secondary text-white' : 'bg-muted hover:bg-secondary/20'}`}
              >
                30D
              </button>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-outline)" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: 'var(--border-outline)', strokeWidth: 2 }} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 900 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 900 }}
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <Tooltip 
                  cursor={{ stroke: 'var(--primary)', strokeWidth: 2, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)',
                    border: '4px solid var(--border-outline)',
                    borderRadius: '0',
                    boxShadow: 'var(--brick-shadow-sm)',
                    padding: '12px',
                  }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{payload[0].payload.name} // STAGE_ALPHA</p>
                          <p className="text-lg font-black text-primary uppercase">₹{payload[0].value.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="var(--primary)" 
                  strokeWidth={6}
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="lg:col-span-4 space-y-8">
           {/* Expense Distribution */}
          <div className="bg-card border-thick brick-shadow p-8 h-[400px] flex flex-col">
            <div className="mb-6 border-b-4 border-border-outline pb-4">
              <h3 className="font-black uppercase text-lg text-foreground tracking-widest">Resource Drain</h3>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Outflow Matrix</p>
            </div>
            <div className="flex-1 w-full relative">
              {expenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="var(--card)"
                      strokeWidth={4}
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', border: '4px solid var(--border-outline)', borderRadius: '0' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      iconType="rect"
                      iconSize={8}
                      formatter={(value) => <span className="text-[8px] font-black text-muted-foreground uppercase ml-1">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30">
                  <TrendingUp size={48} className="mb-2" />
                  <span className="text-[10px] font-black uppercase">Scanning categories...</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-primary text-primary-foreground border-thick brick-shadow p-8 rounded-sm relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <Shield size={120} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI_CORE_ADVISORY</span>
              </div>
              <h4 className="text-xl font-black uppercase tracking-tighter leading-none italic">
                Optimization <br /> Strategy Engaged.
              </h4>
              <p className="text-[11px] font-bold leading-relaxed opacity-90 min-h-[44px]">
                {getAiInsight()}
              </p>
              <button 
                onClick={() => alert("Strategy implementation logic under development.")}
                className="w-full py-3 bg-white text-primary border-2 border-black text-[10px] font-black uppercase brick-shadow-sm hover:translate-y-0.5 active:translate-y-1 transition-all"
              >
                EXECUTE_REALLOCATION
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
