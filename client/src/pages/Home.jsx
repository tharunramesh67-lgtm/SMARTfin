import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, DollarSign, BarChart2, ShieldCheck, Zap, ArrowRight, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-16 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12 border border-white/10">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-widest rounded-full">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Empowering Wealth Management
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white">
            Precision Financial <br/>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Calculators & Tracker</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-xl">
            Take control of your investments and expenses in one modern dashboard. Plan loans, SIP returns, goal targets, and compound growth with absolute clarity.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/calculators"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all text-white text-sm md:text-base shadow-lg shadow-emerald-500/20"
            >
              Explore Calculators
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/tracker"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 active:scale-[0.98] transition-all text-sm md:text-base"
            >
              Track Transactions
            </Link>
          </div>
        </div>

        {/* Feature Overview Widget */}
        <div className="relative z-10 w-full md:w-80 p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 space-y-4 shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Portfolio Growth</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">₹1,24,500</div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: '68%' }} />
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            68% of retirement target goal achieved. Keep compounding to maximize returns.
          </p>
        </div>
      </div>

      {/* Main Core Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel-interactive p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Landmark className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">Compound Calculators</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            EMI, SIP, Loan Amortization tables, and retirement projections designed with comprehensive principal-vs-interest breakdown charts.
          </p>
          <Link to="/calculators" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-500 hover:underline">
            View calculators <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="glass-panel-interactive p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">Income & Expense Tracker</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Log daily transactions, define specific categories, and monitor cashflow patterns directly in your user account workspace.
          </p>
          <Link to="/tracker" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-500 hover:underline">
            Track expenses <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="glass-panel-interactive p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <BarChart2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">Premium Analytics</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Gain immediate insights with Donut charts for category-wise distribution and Bar charts showing monthly income vs expense trends.
          </p>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-500 hover:underline">
            Open dashboard <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Guest Mode vs Saved Banner */}
      {!user && (
        <div className="glass-panel p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-emerald-500 shadow-lg">
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight">Sync & Secure Your Projections</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl">
              Guests can calculate inputs locally, but signing up allows you to store calculator reports, track historical logs, and keep transaction records.
            </p>
          </div>
          <Link
            to="/signup"
            className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-95 transition-all text-sm whitespace-nowrap shadow-md"
          >
            Create Free Account
          </Link>
        </div>
      )}
    </div>
  );
}
