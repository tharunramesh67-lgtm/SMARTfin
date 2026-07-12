import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wallet, ArrowUpCircle, ArrowDownCircle, TrendingUp, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      const local = localStorage.getItem('fincalc_transactions');
      setTransactions(local ? JSON.parse(local) : []);
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching dashboard transactions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Metrics calculation
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  const currentBalance = totalIncome - totalExpense;

  // Category wise pie chart data
  const categorySummary = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + parseFloat(curr.amount || 0);
      return acc;
    }, {});

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#06b6d4', '#14b8a6'];

  const categoryPieData = Object.keys(categorySummary).map((name, index) => ({
    name,
    value: Math.round(categorySummary[name]),
    color: COLORS[index % COLORS.length]
  }));

  // Monthly income vs expense bar chart data
  const monthlySummary = transactions.reduce((acc, curr) => {
    // Format Month
    const dateObj = new Date(curr.date);
    const monthYear = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = { month: monthYear, Income: 0, Expense: 0 };
    }
    if (curr.type === 'income') {
      acc[monthYear].Income += parseFloat(curr.amount || 0);
    } else {
      acc[monthYear].Expense += parseFloat(curr.amount || 0);
    }
    return acc;
  }, {});

  // Convert monthlySummary object to array and sort chronologically by date
  const monthlyBarData = Object.values(monthlySummary).reverse().slice(-6); // Last 6 months

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Financial Insights</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time metrics, cashflow dynamics, and visual breakdowns.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="glass-panel p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Net Balance</span>
            <h2 className="text-3xl font-black tracking-tight">₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Income Card */}
        <div className="glass-panel p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Income</span>
            <h2 className="text-3xl font-black tracking-tight text-emerald-500">₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ArrowUpCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Expense Card */}
        <div className="glass-panel p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Expenses</span>
            <h2 className="text-3xl font-black tracking-tight text-indigo-500">₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income vs Expense Bar Chart */}
        <div className="glass-panel p-6 md:p-8 space-y-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight">Income vs Expense Trend</h3>
            <span className="text-xs text-slate-400">Cashflow tracking across recent months</span>
          </div>
          <div className="h-80 w-full">
            {monthlyBarData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No chart data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expense" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category-wise Donut Chart */}
        <div className="glass-panel p-6 md:p-8 space-y-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight">Category Breakdown</h3>
            <span className="text-xs text-slate-400">Distribution of monthly expense categories</span>
          </div>
          <div className="h-80 w-full flex flex-col md:flex-row items-center justify-center">
            {categoryPieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No expenses logged.</div>
            ) : (
              <>
                <div className="w-full md:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 flex flex-col gap-2 mt-4 md:mt-0">
                  {categoryPieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-100">₹{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
