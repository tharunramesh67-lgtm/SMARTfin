import React, { useState, useEffect } from 'react'
import { Bell, Search, Menu, User, X, LayoutDashboard, Wallet, PieChart, LineChart, Settings, LogOut, Zap, Calculator as CalcIcon, Terminal } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useLocation } from 'react-router-dom'
import CommandPalette from './CommandPalette'
import NotificationCenter from './NotificationCenter'

const Navbar = () => {
  const { profile, user, signOut } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setShowSearch(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { title: 'Transactions', icon: Wallet, path: '/transactions' },
    { title: 'Budgets', icon: PieChart, path: '/budgets' },
    { title: 'Portfolio', icon: LineChart, path: '/portfolio' },
    { title: 'Finance Lab', icon: CalcIcon, path: '/calculator' },
  ]

  return (
    <>
      <CommandPalette isOpen={showSearch} onClose={() => setShowSearch(false)} />
      
      <header className="sticky top-0 left-0 right-0 bg-background border-b-thick border-border-outline z-[1000] px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-primary border-thick brick-shadow group-hover:translate-y-0.5 group-hover:shadow-none transition-all flex items-center justify-center">
                <Zap className="text-primary-foreground w-7 h-7" strokeWidth={3} fill="currentColor" />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-2xl font-black tracking-tighter text-foreground hidden sm:block uppercase italic">
                  Unified<span className="text-primary">Wealth</span>
                </span>
                <div className="flex items-center gap-2">
                  <Terminal size={10} className="text-primary hidden sm:block" />
                  <span className="text-[9px] font-black tracking-[0.3em] text-muted-foreground hidden sm:block uppercase opacity-60">
                    V2.0.4-LTS
                  </span>
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-2 ml-4">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-5 py-2.5 font-black text-[10px] uppercase tracking-widest transition-all border-standard ${
                      isActive 
                        ? 'bg-secondary text-secondary-foreground brick-shadow-sm -translate-y-0.5 border-border-outline' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted border-transparent'
                    }`}
                  >
                    <item.icon size={15} strokeWidth={3} className={isActive ? 'text-secondary-foreground' : 'text-primary'} />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button 
              onClick={() => setShowSearch(true)}
              className="p-3 bg-card border-standard brick-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all text-muted-foreground hover:text-foreground group flex items-center gap-3"
            >
              <Search size={20} strokeWidth={3} className="group-hover:text-primary transition-colors" />
              <div className="hidden xl:flex flex-col items-start leading-none">
                <span className="text-[10px] font-black uppercase tracking-widest">Search</span>
                <span className="text-[8px] font-bold opacity-40 uppercase">Ctrl+K</span>
              </div>
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-3 bg-card border-standard brick-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all text-muted-foreground hover:text-foreground ${showNotifications ? 'bg-secondary text-secondary-foreground shadow-none translate-y-0.5 border-border-outline' : ''}`}
              >
                <Bell size={22} strokeWidth={3} />
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-primary text-primary-foreground border-thick border-black/10 flex items-center justify-center text-[9px] font-black brick-shadow-sm">
                  3
                </span>
              </button>
              <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
            </div>

            <div className="flex items-center gap-4 pl-5 border-l-thick border-border-outline/10 ml-2">
              <div className="hidden sm:flex flex-col items-end justify-center">
                <p className="text-[11px] font-black text-foreground uppercase tracking-tight leading-tight">
                  {profile?.full_name || user?.email?.split('@')[0]}
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <button onClick={handleSignOut} className="text-[8px] font-black text-muted-foreground hover:text-destructive uppercase tracking-widest transition-colors">
                    Disconnect
                  </button>
                </div>
              </div>
              <Link to="/settings" className="w-12 h-12 bg-card border-thick brick-shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:translate-y-0.5 hover:shadow-none transition-all overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={22} strokeWidth={3} />
                )}
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 bg-card border-thick brick-shadow-sm text-foreground ml-2"
            >
              {isMobileMenuOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-b-thick border-border-outline p-6 animate-in slide-in-from-top-4 duration-300 z-40 brick-shadow-lg">
            <nav className="flex flex-col gap-4 relative z-10">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-5 px-5 py-5 border-thick transition-all uppercase font-black text-sm tracking-widest ${
                      isActive 
                        ? 'bg-primary text-primary-foreground brick-shadow-sm' 
                        : 'bg-card text-muted-foreground hover:text-foreground hover:translate-y-0.5 hover:shadow-none'
                    }`}
                  >
                    <item.icon size={24} className="stroke-[3]" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
              <div className="h-1.5 w-full bg-border-outline/10 my-2" />
              <Link 
                to="/settings" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex items-center gap-5 px-5 py-5 bg-card border-thick text-muted-foreground font-black uppercase text-sm tracking-widest hover:text-foreground transition-all"
              >
                <Settings size={24} className="stroke-[3]" />
                <span>Settings</span>
              </Link>
              <button 
                onClick={handleSignOut} 
                className="flex items-center gap-5 w-full text-left px-5 py-5 bg-destructive border-thick text-destructive-foreground font-black uppercase text-sm tracking-widest brick-shadow-sm active:translate-y-0.5 active:shadow-none transition-all mt-2"
              >
                <LogOut size={24} className="stroke-[3]" />
                <span>Logout Session</span>
              </button>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}

export default Navbar

