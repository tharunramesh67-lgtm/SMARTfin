import React from 'react'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col stud-grid bg-mesh overflow-hidden">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* System Sidebar - Desktop only */}
        <aside className="hidden lg:flex w-20 border-r-thick border-border-outline bg-card flex-col items-center py-8 justify-between z-40">
          <div className="space-y-8 flex flex-col items-center">
            <div className="w-10 h-10 border-2 border-primary flex items-center justify-center rotate-45 hover:rotate-90 transition-transform duration-500 cursor-help group">
              <span className="rotate-[-45deg] group-hover:rotate-[-90deg] transition-transform duration-500 text-[10px] font-black text-primary">IO</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-1 h-8 bg-secondary animate-pulse" />
              <div className="w-1 h-4 bg-muted-foreground/30" />
              <div className="w-1 h-12 bg-accent" />
              <div className="w-1 h-6 bg-primary" />
            </div>
          </div>
          
          <div className="writing-vertical-lr transform rotate-180 text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 font-mono">
            SMARTFIN_OS_v4.0.2
          </div>
          
          <div className="flex flex-col gap-4 items-center">
             <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
             <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          </div>
        </aside>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 overflow-y-auto relative">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 border-t-thick border-r-thick border-primary/10 -z-10" />
          
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>

      <footer className="border-t-thick border-border-outline bg-card px-4 md:px-8 py-2 flex flex-col md:flex-row items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground font-mono z-50">
        <div className="flex gap-6 mb-2 md:mb-0">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-success rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> 
            CORE: NOMINAL
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.6)]" /> 
            DATA_SYNC: OK
          </span>
          <span className="hidden sm:inline opacity-40">|</span>
          <span className="hidden sm:inline">TX_RELAY: ACTIVE</span>
        </div>
        <div className="flex gap-6 items-center">
          <span className="opacity-60">UPTIME: 12.4H</span>
          <span className="opacity-60">ENCRYPTION: AES-256</span>
          <span className="text-primary-foreground bg-primary px-2 py-0.5 brick-shadow-sm">SECURE_NODE_01</span>
        </div>
      </footer>
    </div>
  )
}

export default DashboardLayout
