import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Landmark, IndianRupee, Save, Info, RefreshCw, Calendar, TrendingUp, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

export default function Calculators() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('emi'); // emi, sip, compound, simple, amortization, retirement
  const [savedMessage, setSavedMessage] = useState('');

  const tabs = [
    { id: 'emi', name: 'EMI Calculator', desc: 'Plan monthly payments' },
    { id: 'sip', name: 'SIP Calculator', desc: 'Estimate mutual fund growth' },
    { id: 'compound', name: 'Compound Interest', desc: 'See compounding power' },
    { id: 'simple', name: 'Simple Interest', desc: 'Compute basic yields' },
    { id: 'amortization', name: 'Amortization', desc: 'Yearly breakdown schedule' },
    { id: 'retirement', name: 'Goal Planner', desc: 'Achieve retirement targets' }
  ];

  const saveCalculation = async (type, inputs, result) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('calculations').insert({
        user_id: user.id,
        type,
        inputs,
        result
      });
      if (error) throw error;
      setSavedMessage('Calculation successfully saved to your profile!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (err) {
      console.error('Error saving calculation:', err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-primary p-6 md:p-10 shadow-lg border border-white/5">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            Financial Simulator Suite
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Strategy Engines</h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Simulate loans, investments, and retirement milestones with precise calculations and visual analytics charts.
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20 text-sm font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4" />
          {savedMessage}
        </div>
      )}

      {/* Grid selector on desktop, scrolling tabs on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-4 rounded-2xl text-left border transition-all duration-300 flex flex-col justify-between h-24 ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/10'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === tab.id ? 'text-emerald-100' : 'text-slate-400'}`}>
              Engine
            </span>
            <div>
              <div className="font-extrabold text-sm leading-tight">{tab.name}</div>
              <div className={`text-[9px] mt-1 leading-normal ${activeTab === tab.id ? 'text-emerald-100/80' : 'text-slate-400'}`}>
                {tab.desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Calculator Container */}
      <div className="glass-panel p-6 md:p-8">
        {activeTab === 'emi' && <EMICalculator onSave={saveCalculation} user={user} />}
        {activeTab === 'sip' && <SIPCalculator onSave={saveCalculation} user={user} />}
        {activeTab === 'compound' && <CompoundInterestCalculator onSave={saveCalculation} user={user} />}
        {activeTab === 'simple' && <SimpleInterestCalculator onSave={saveCalculation} user={user} />}
        {activeTab === 'amortization' && <LoanAmortizationCalculator onSave={saveCalculation} user={user} />}
        {activeTab === 'retirement' && <RetirementGoalPlanner onSave={saveCalculation} user={user} />}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 1. EMI CALCULATOR COMPONENT WITH RANGE SLIDERS
// -------------------------------------------------------------
function EMICalculator({ onSave, user }) {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const P = parseFloat(loanAmount) || 0;
  const R = (parseFloat(interestRate) || 0) / 12 / 100;
  const N = (parseInt(tenureYears) || 0) * 12;

  let emi = 0;
  if (P > 0 && R > 0 && N > 0) {
    emi = Math.round((P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1));
  } else if (P > 0 && N > 0) {
    emi = Math.round(P / N);
  }

  const totalPayment = emi * N;
  const totalInterest = totalPayment - P;

  const chartData = [
    { name: 'Principal Amount', value: P, color: '#10b981' },
    { name: 'Total Interest', value: totalInterest > 0 ? totalInterest : 0, color: '#6366f1' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-500" />
            Equated Monthly Installment (EMI)
          </h3>
          <p className="text-xs text-slate-400 mt-1">Compute monthly installment outlays for housing, auto, or personal loans.</p>
        </div>
        
        <div className="space-y-6">
          {/* Loan Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="label-title mb-0">Loan Amount (₹)</label>
              <span className="text-sm font-bold text-emerald-500">₹{P.toLocaleString()}</span>
            </div>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="input-field"
            />
            <input
              type="range"
              min="10000"
              max="10000000"
              step="10000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
            />
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="label-title mb-0">Interest Rate (% P.A.)</label>
              <span className="text-sm font-bold text-indigo-500">{interestRate}%</span>
            </div>
            <input
              type="number"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="input-field"
            />
            <input
              type="range"
              min="1"
              max="25"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
            />
          </div>

          {/* Tenure */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="label-title mb-0">Loan Tenure (Years)</label>
              <span className="text-sm font-bold text-amber-500">{tenureYears} Years</span>
            </div>
            <input
              type="number"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              className="input-field"
            />
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
            />
          </div>
        </div>

        {user ? (
          <button
            onClick={() => onSave('emi', { loanAmount, interestRate, tenureYears }, { emi, totalPayment, totalInterest })}
            className="flex items-center justify-center gap-1.5 w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Save Calculation
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
            <HelpCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>You are currently in Guest Mode. Log in to save calculations permanently.</span>
          </div>
        )}
      </div>

      {/* Results View */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-6 bg-slate-50 dark:bg-slate-950/40 p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 rounded-xl text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Monthly EMI</span>
            <div className="text-2xl font-black text-emerald-500 mt-1">₹{emi.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 rounded-xl text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Interest</span>
            <div className="text-2xl font-black text-indigo-500 mt-1">₹{Math.round(totalInterest).toLocaleString()}</div>
          </div>
        </div>

        <div className="w-full h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${Math.round(value).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Total Payment</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">₹{Math.round(totalPayment).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-4 text-xs font-bold w-full justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Principal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-500" />
            <span>Interest</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. SIP CALCULATOR COMPONENT WITH RANGE SLIDERS
// -------------------------------------------------------------
function SIPCalculator({ onSave, user }) {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedRate, setExpectedRate] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  const P = parseFloat(monthlyInvestment) || 0;
  const r = (parseFloat(expectedRate) || 0) / 12 / 100;
  const n = (parseInt(timePeriod) || 0) * 12;

  let totalWealth = 0;
  let investedAmount = P * n;
  if (P > 0 && r > 0 && n > 0) {
    totalWealth = Math.round(P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  } else {
    totalWealth = investedAmount;
  }
  const estReturns = totalWealth - investedAmount;

  const chartData = [
    { name: 'Invested Amount', value: investedAmount, color: '#10b981' },
    { name: 'Est. Returns', value: estReturns > 0 ? estReturns : 0, color: '#f59e0b' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Systematic Investment Plan (SIP)
          </h3>
          <p className="text-xs text-slate-400 mt-1">Simulate wealth accumulation through monthly mutual fund schemes.</p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="label-title mb-0">Monthly Investment (₹)</label>
              <span className="text-sm font-bold text-emerald-500">₹{P.toLocaleString()}</span>
            </div>
            <input
              type="number"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(e.target.value)}
              className="input-field"
            />
            <input
              type="range"
              min="500"
              max="500000"
              step="500"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(e.target.value)}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="label-title mb-0">Expected Returns Rate (% P.A.)</label>
              <span className="text-sm font-bold text-indigo-500">{expectedRate}%</span>
            </div>
            <input
              type="number"
              step="0.1"
              value={expectedRate}
              onChange={(e) => setExpectedRate(e.target.value)}
              className="input-field"
            />
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={expectedRate}
              onChange={(e) => setExpectedRate(e.target.value)}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="label-title mb-0">Time Period (Years)</label>
              <span className="text-sm font-bold text-amber-500">{timePeriod} Years</span>
            </div>
            <input
              type="number"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="input-field"
            />
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
            />
          </div>
        </div>

        {user && (
          <button
            onClick={() => onSave('sip', { monthlyInvestment, expectedRate, timePeriod }, { investedAmount, estReturns, totalWealth })}
            className="flex items-center justify-center gap-1.5 w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Save Calculation
          </button>
        )}
      </div>

      <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-6 bg-slate-50 dark:bg-slate-950/40 p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 rounded-xl text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Invested Capital</span>
            <div className="text-2xl font-black text-emerald-500 mt-1">₹{investedAmount.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 rounded-xl text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Estimated Returns</span>
            <div className="text-2xl font-black text-amber-500 mt-1">₹{Math.round(estReturns).toLocaleString()}</div>
          </div>
        </div>

        <div className="w-full h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${Math.round(value).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Maturity Wealth</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">₹{Math.round(totalWealth).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-4 text-xs font-bold w-full justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Invested</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. COMPOUND INTEREST CALCULATOR COMPONENT
// -------------------------------------------------------------
function CompoundInterestCalculator({ onSave, user }) {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(10);
  const [frequency, setFrequency] = useState(1);

  const P = parseFloat(principal) || 0;
  const r = (parseFloat(rate) || 0) / 100;
  const t = parseFloat(years) || 0;
  const n = parseInt(frequency) || 1;

  let finalAmount = P;
  if (P > 0 && r > 0 && t > 0) {
    finalAmount = Math.round(P * Math.pow(1 + r / n, n * t));
  }
  const interestEarned = finalAmount - P;

  const chartData = [
    { name: 'Principal', value: P, color: '#10b981' },
    { name: 'Interest Earned', value: interestEarned > 0 ? interestEarned : 0, color: '#3b82f6' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-500" />
            Compound Interest Calculator
          </h3>
          <p className="text-xs text-slate-400 mt-1">Compute compound interests with annual, quarterly, or monthly compounding.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label-title">Principal Amount (₹)</label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-title">Rate of Interest (% P.A.)</label>
            <input
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-title">Tenure (Years)</label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-title">Compounding Interval</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="input-field">
              <option value="1">Annually</option>
              <option value="4">Quarterly</option>
              <option value="12">Monthly</option>
            </select>
          </div>
        </div>

        {user && (
          <button
            onClick={() => onSave('compound', { principal, rate, years, frequency }, { principal: P, interestEarned, finalAmount })}
            className="flex items-center justify-center gap-1.5 w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Save Calculation
          </button>
        )}
      </div>

      <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-6 bg-slate-50 dark:bg-slate-950/40 p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 rounded-xl text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Initial Principal</span>
            <div className="text-2xl font-black text-emerald-500 mt-1">₹{P.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 rounded-xl text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Interest Earned</span>
            <div className="text-2xl font-black text-blue-500 mt-1">₹{Math.round(interestEarned).toLocaleString()}</div>
          </div>
        </div>

        <div className="w-full h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${Math.round(value).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Total Yield</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">₹{finalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. SIMPLE INTEREST CALCULATOR COMPONENT
// -------------------------------------------------------------
function SimpleInterestCalculator({ onSave, user }) {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(5);

  const P = parseFloat(principal) || 0;
  const R = parseFloat(rate) || 0;
  const T = parseFloat(years) || 0;

  const interestEarned = Math.round((P * R * T) / 100);
  const totalAmount = P + interestEarned;

  const chartData = [
    { name: 'Principal Amount', value: P, color: '#10b981' },
    { name: 'Simple Interest', value: interestEarned, color: '#ec4899' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            Simple Interest Calculator
          </h3>
          <p className="text-xs text-slate-400 mt-1">Basic interest yield calculator for term plans or personal agreements.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label-title">Principal Amount (₹)</label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-title">Rate of Interest (% P.A.)</label>
            <input
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-title">Tenure (Years)</label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {user && (
          <button
            onClick={() => onSave('simple', { principal, rate, years }, { interestEarned, totalAmount })}
            className="flex items-center justify-center gap-1.5 w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Save Calculation
          </button>
        )}
      </div>

      <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-6 bg-slate-50 dark:bg-slate-950/40 p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 rounded-xl text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Initial Principal</span>
            <div className="text-2xl font-black text-emerald-500 mt-1">₹{P.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 rounded-xl text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Maturity Value</span>
            <div className="text-2xl font-black text-pink-500 mt-1">₹{totalAmount.toLocaleString()}</div>
          </div>
        </div>

        <div className="w-full h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${Math.round(value).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Interest Earned</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">₹{interestEarned.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. LOAN AMORTIZATION CALCULATOR COMPONENT
// -------------------------------------------------------------
function LoanAmortizationCalculator({ onSave, user }) {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(10);
  const [tenureYears, setTenureYears] = useState(5);

  const P = parseFloat(loanAmount) || 0;
  const R = (parseFloat(interestRate) || 0) / 12 / 100;
  const N = (parseInt(tenureYears) || 0) * 12;

  let emi = 0;
  if (P > 0 && R > 0 && N > 0) {
    emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
  }

  const schedule = [];
  let remainingBalance = P;

  for (let year = 1; year <= tenureYears; year++) {
    let interestPaidThisYear = 0;
    let principalPaidThisYear = 0;

    for (let month = 1; month <= 12; month++) {
      const interestForMonth = remainingBalance * R;
      const principalForMonth = emi - interestForMonth;
      
      interestPaidThisYear += interestForMonth;
      principalPaidThisYear += principalForMonth;
      remainingBalance = Math.max(0, remainingBalance - principalForMonth);
    }

    schedule.push({
      year,
      principalPaid: Math.round(principalPaidThisYear),
      interestPaid: Math.round(interestPaidThisYear),
      endingBalance: Math.round(remainingBalance)
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-500" />
              Amortization Schedule
            </h3>
            <p className="text-xs text-slate-400 mt-1">Yearly principal and interest outlays breakdown table.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label-title">Loan Amount (₹)</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-title">Interest Rate (% P.A.)</label>
              <input
                type="number"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-title">Loan Tenure (Years)</label>
              <input
                type="number"
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {user && (
            <button
              onClick={() => onSave('amortization', { loanAmount, interestRate, tenureYears }, { emi: Math.round(emi), schedule })}
              className="flex items-center justify-center gap-1.5 w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              Save Schedule
            </button>
          )}
        </div>

        <div className="lg:col-span-8 flex flex-col justify-center h-72">
          <span className="text-xs font-semibold text-slate-500 mb-2">Loan Balance Progress</span>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={schedule}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" name="Year" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Area type="monotone" dataKey="endingBalance" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="Ending Balance" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Year</th>
              <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Principal Paid</th>
              <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Interest Paid</th>
              <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Ending Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {schedule.map((row) => (
              <tr key={row.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                <td className="px-6 py-4 font-semibold">Year {row.year}</td>
                <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300">₹{row.principalPaid.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300 font-medium">₹{row.interestPaid.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-emerald-500 font-extrabold">₹{row.endingBalance.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. RETIREMENT / GOAL PLANNER COMPONENT
// -------------------------------------------------------------
function RetirementGoalPlanner({ onSave, user }) {
  const [targetAmount, setTargetAmount] = useState(10000000);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [expectedRate, setExpectedRate] = useState(10);
  const [yearsToGoal, setYearsToGoal] = useState(15);

  const target = parseFloat(targetAmount) || 0;
  const initial = parseFloat(currentSavings) || 0;
  const r = (parseFloat(expectedRate) || 0) / 100;
  const t = parseFloat(yearsToGoal) || 0;

  const fvOfInitial = initial * Math.pow(1 + r, t);
  const requiredAdditionalTarget = Math.max(0, target - fvOfInitial);
  
  const monthlyRate = r / 12;
  const totalMonths = t * 12;
  
  let requiredMonthlySIP = 0;
  if (requiredAdditionalTarget > 0 && monthlyRate > 0 && totalMonths > 0) {
    requiredMonthlySIP = Math.round(
      requiredAdditionalTarget * (monthlyRate / (Math.pow(1 + monthlyRate, totalMonths) - 1))
    );
  }

  const chartData = [
    { name: 'Target Goal', value: target, color: '#6366f1' },
    { name: 'Proj. Growth of Current Savings', value: Math.round(fvOfInitial), color: '#10b981' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            Retirement & Goal Planner
          </h3>
          <p className="text-xs text-slate-400 mt-1">Determine required monthly investments to achieve specific corpus targets.</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="label-title">Target Goal Amount (₹)</label>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-title">Current Savings/Lump Sum (₹)</label>
            <input
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-title">Expected Interest/Growth Rate (% P.A.)</label>
            <input
              type="number"
              step="0.1"
              value={expectedRate}
              onChange={(e) => setExpectedRate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-title">Time to Goal (Years)</label>
            <input
              type="number"
              value={yearsToGoal}
              onChange={(e) => setYearsToGoal(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {user && (
          <button
            onClick={() => onSave('retirement', { targetAmount, currentSavings, expectedRate, yearsToGoal }, { requiredMonthlySIP, fvOfInitial })}
            className="flex items-center justify-center gap-1.5 w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Save Goal Plan
          </button>
        )}
      </div>

      <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-6 bg-slate-50 dark:bg-slate-950/40 p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 rounded-xl text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Required Monthly SIP</span>
            <div className="text-2xl font-black text-emerald-500 mt-1">₹{requiredMonthlySIP.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 rounded-xl text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Savings Future Value</span>
            <div className="text-2xl font-black text-indigo-500 mt-1">₹{Math.round(fvOfInitial).toLocaleString()}</div>
          </div>
        </div>

        <div className="w-full h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${Math.round(value).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
