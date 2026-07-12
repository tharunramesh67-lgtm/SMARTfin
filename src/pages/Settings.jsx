import React, { useState } from 'react'
import { User, Lock, Bell, Moon, Sun, CreditCard, Shield, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const Settings = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSignOut = async () => {
    await signOut()
  }

  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
  })

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    const { error } = await supabase.auth.updateUser({
      data: { full_name: profileData.fullName }
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    }
    setLoading(false)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-foreground">Settings</h1>
          <p className="text-muted-foreground font-bold font-mono">Manage your account and preferences.</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 border-2 border-destructive text-destructive font-black uppercase rounded-sm hover:bg-destructive hover:text-white transition-all brick-shadow"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm border-2 font-black uppercase transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground border-border-outline brick-shadow -translate-y-1' 
                  : 'bg-card text-muted-foreground border-transparent hover:border-border-outline'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 bg-card border-thick brick-shadow rounded-sm p-8">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black uppercase text-foreground mb-4">Profile Information</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-foreground">Full Name</label>
                    <input
                      type="text"
                      className="input-field w-full"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 opacity-60">
                    <label className="text-[10px] font-black uppercase text-foreground">Email Address (Read Only)</label>
                    <input
                      type="email"
                      disabled
                      className="input-field w-full cursor-not-allowed"
                      value={profileData.email}
                    />
                  </div>
                  
                  {message.text && (
                    <div className={`p-3 rounded-sm border-2 font-bold text-xs uppercase ${message.type === 'error' ? 'bg-destructive/10 border-destructive text-destructive' : 'bg-success/10 border-success text-success'}`}>
                      {message.text}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn-primary w-full md:w-auto px-8"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>

              <div className="pt-6 border-t-4 border-border-outline">
                <h3 className="text-xl font-black uppercase text-foreground mb-4">Account Metadata</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 border-2 border-border-outline rounded-sm">
                    <span className="text-[10px] font-black uppercase text-muted-foreground block">User ID</span>
                    <code className="text-xs font-mono break-all">{user?.id}</code>
                  </div>
                  <div className="bg-muted p-4 border-2 border-border-outline rounded-sm">
                    <span className="text-[10px] font-black uppercase text-muted-foreground block">Last Login</span>
                    <span className="text-xs font-bold">{new Date(user?.last_sign_in_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black uppercase text-foreground mb-4">Security Settings</h3>
                <div className="bg-muted border-2 border-border-outline p-6 rounded-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="text-secondary" />
                      <div>
                        <p className="font-black uppercase text-sm">Two-Factor Authentication</p>
                        <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-background border-2 border-border-outline text-[10px] font-black uppercase rounded-full">Disabled</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t-4 border-border-outline">
                <button className="btn-secondary w-full">Change Password</button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase text-foreground mb-4">App Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted border-2 border-border-outline rounded-sm">
                  <div className="flex items-center gap-3">
                    <Moon className="text-primary" />
                    <span className="font-black uppercase text-sm">Dark Mode</span>
                  </div>
                  <div className="w-12 h-6 bg-primary border-2 border-border-outline rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted border-2 border-border-outline rounded-sm">
                  <div className="flex items-center gap-3">
                    <Bell className="text-secondary" />
                    <span className="font-black uppercase text-sm">Push Notifications</span>
                  </div>
                  <div className="w-12 h-6 bg-muted-foreground/30 border-2 border-border-outline rounded-full relative">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="text-center py-10 space-y-4">
              <CreditCard size={48} className="mx-auto text-muted-foreground opacity-20" />
              <p className="font-black uppercase text-muted-foreground">Billing history and subscription management coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
