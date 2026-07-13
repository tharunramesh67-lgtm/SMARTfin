import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Calendar, Key, AlertCircle, Save, Sparkles } from 'lucide-react';

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [stats, setStats] = useState({ calculations: 0, transactions: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || user?.email || '');
    } else if (user) {
      setEmail(user.email || '');
    }
    
    if (user) {
      fetchStats();
    }
  }, [profile, user]);

  const fetchStats = async () => {
    try {
      const { count: calcCount, error: calcError } = await supabase
        .from('calculations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: transCount, error: transError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (calcError || transError) throw calcError || transError;

      setStats({
        calculations: calcCount || 0,
        transactions: transCount || 0
      });
    } catch (err) {
      console.error('Error fetching profile statistics:', err.message);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          email: email,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Please sign in to view your profile dashboard.</p>
      </div>
    );
  }

  const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-primary p-6 md:p-10 shadow-lg border border-white/5">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              <User className="w-3 h-3" />
              Member Space
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {fullName || 'User Profile'}
            </h1>
            <p className="text-slate-300 text-sm max-w-md">
              Manage your personal credentials, and track your calculator & transaction activity.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-center backdrop-blur-sm">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block">Saved Calcs</span>
              <span className="text-2xl font-black text-emerald-400">{stats.calculations}</span>
            </div>
            <div className="px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-center backdrop-blur-sm">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block">Transactions</span>
              <span className="text-2xl font-black text-indigo-400">{stats.transactions}</span>
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl border text-sm font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
        }`}>
          {message.type === 'success' ? <Sparkles className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Details Sidebar */}
        <div className="md:col-span-1 glass-panel p-6 space-y-6 flex flex-col justify-between h-fit">
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-3xl shadow-sm">
                {email[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">{fullName || 'FinCalc User'}</h3>
                <span className="text-xs text-slate-400 font-medium">Standard Account</span>
              </div>
            </div>

            <div className="border-t border-slate-200/50 dark:border-slate-800/80 pt-6 space-y-4 text-sm">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-350">
                <Mail className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="truncate">{email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-350">
                <Calendar className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Joined {joinDate}</span>
              </div>
            </div>
          </div>

          <button
            onClick={signOut}
            className="w-full mt-6 py-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold hover:bg-rose-500 hover:text-white transition-all duration-200"
          >
            Sign Out of Account
          </button>
        </div>

        {/* Edit Profile Panel */}
        <div className="md:col-span-2 glass-panel p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-500" />
              Account Settings
            </h3>
            <p className="text-xs text-slate-400 mt-1">Configure your personal profiles and contact information.</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-2">
              <label className="label-title">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <label className="label-title">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="input-field opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-950"
              />
              <span className="text-[10px] text-slate-400 font-medium">To modify your registered email address, please contact support.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
