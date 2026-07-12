import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Trash2, Calendar, FileText, Lock, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('calculations')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setHistory(data || []);
    } catch (err) {
      setError(err.message || 'Error loading calculations history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const { error: err } = await supabase.from('calculations').delete().eq('id', id);
      if (err) throw err;
      await fetchHistory();
    } catch (err) {
      setError(err.message || 'Failed to delete entry.');
    } finally {
      setLoading(false);
    }
  };

  const formatInputs = (type, inputs) => {
    if (!inputs) return '';
    if (type === 'emi') return `Loan: ₹${parseFloat(inputs.loanAmount).toLocaleString()}, Tenure: ${inputs.tenureYears} yrs @ ${inputs.interestRate}%`;
    if (type === 'sip') return `Monthly SIP: ₹${parseFloat(inputs.monthlyInvestment).toLocaleString()}, Tenure: ${inputs.timePeriod} yrs @ ${inputs.expectedRate}%`;
    if (type === 'compound') return `Principal: ₹${parseFloat(inputs.principal).toLocaleString()}, Tenure: ${inputs.years} yrs @ ${inputs.rate}%`;
    if (type === 'simple') return `Principal: ₹${parseFloat(inputs.principal).toLocaleString()}, Tenure: ${inputs.years} yrs @ ${inputs.rate}%`;
    if (type === 'amortization') return `Loan: ₹${parseFloat(inputs.loanAmount).toLocaleString()}, Tenure: ${inputs.tenureYears} yrs @ ${inputs.interestRate}%`;
    if (type === 'retirement') return `Target: ₹${parseFloat(inputs.targetAmount).toLocaleString()}, Current: ₹${parseFloat(inputs.currentSavings).toLocaleString()}`;
    return JSON.stringify(inputs);
  };

  const formatResult = (type, result) => {
    if (!result) return '';
    if (type === 'emi') return `EMI: ₹${result.emi?.toLocaleString()}`;
    if (type === 'sip') return `Total Wealth: ₹${result.totalWealth?.toLocaleString()}`;
    if (type === 'compound') return `Final Value: ₹${result.finalAmount?.toLocaleString()}`;
    if (type === 'simple') return `Final Value: ₹${result.totalAmount?.toLocaleString()}`;
    if (type === 'amortization') return `Monthly EMI: ₹${result.emi?.toLocaleString()}`;
    if (type === 'retirement') return `Required SIP: ₹${result.requiredMonthlySIP?.toLocaleString()}`;
    return JSON.stringify(result);
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight">Access Restricted</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Calculation history is only saved for authenticated users. Register or sign in to save your calculations to your permanent profile logs.
          </p>
        </div>
        <Link to="/login" className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-md">
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Calculation History</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review your previously calculated figures and inputs.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-200/50">
          {error}
        </div>
      )}

      {loading && history.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((item) => (
            <div key={item.id} className="glass-panel p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md uppercase">
                    {item.type}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {formatInputs(item.type, item.inputs)}
                </p>
                <p className="text-sm font-bold text-emerald-500">
                  {formatResult(item.type, item.result)}
                </p>
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                title="Delete Entry"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          ))}

          {history.length === 0 && (
            <div className="glass-panel p-12 text-center text-slate-400">
              No saved calculations found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
