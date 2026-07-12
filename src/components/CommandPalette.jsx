import React, { useState, useEffect } from 'react'
import { Search, Command, Home, LayoutDashboard, Receipt, PieChart, Briefcase, Calculator, Settings, Plus, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onClose() // Toggle logic handled by parent, but this is a fallback
      }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const actions = [
    { id: 'dash', title: 'Dashboard', icon: LayoutDashboard, category: 'Navigation', shortcut: 'G D', action: () => { navigate('/'); onClose(); } },
    { id: 'trans', title: 'Transactions', icon: Receipt, category: 'Navigation', shortcut: 'G T', action: () => { navigate('/transactions'); onClose(); } },
    { id: 'bud', title: 'Budgets', icon: PieChart, category: 'Navigation', shortcut: 'G B', action: () => { navigate('/budgets'); onClose(); } },
    { id: 'port', title: 'Portfolio', icon: Briefcase, category: 'Navigation', shortcut: 'G P', action: () => { navigate('/portfolio'); onClose(); } },
    { id: 'calc', title: 'Calculators', icon: Calculator, category: 'Navigation', shortcut: 'G C', action: () => { navigate('/calculator'); onClose(); } },
    { id: 'set', title: 'Settings', icon: Settings, category: 'Navigation', shortcut: 'G S', action: () => { navigate('/settings'); onClose(); } },
    { id: 'new-t', title: 'Add Transaction', icon: Plus, category: 'Quick Actions', shortcut: 'N T', action: () => { navigate('/transactions?add=true'); onClose(); } },
    { id: 'new-b', title: 'Create Budget', icon: Plus, category: 'Quick Actions', shortcut: 'N B', action: () => { navigate('/budgets?add=true'); onClose(); } },
  ]

  const filteredActions = actions.filter(
    (action) =>
      action.title.toLowerCase().includes(query.toLowerCase()) ||
      action.category.toLowerCase().includes(query.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-[10vh] px-4">
      <div className="absolute inset-0 bg-slate-950/80" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-card border-thick brick-shadow rounded-none overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center p-4 border-b-4 border-border-outline gap-3 bg-muted">
          <Search className="text-muted-foreground" size={20} />
          <input
            autoFocus
            type="text"
            placeholder="Search commands or navigate..."
            className="flex-1 bg-transparent border-none outline-none text-foreground font-black uppercase text-lg placeholder:text-muted-foreground/30"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="px-2 py-1 bg-card border-2 border-border-outline rounded-sm text-[10px] font-black uppercase text-muted-foreground">
            Esc
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4 py-4">
          {filteredActions.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <Command size={48} className="mx-auto text-muted-foreground opacity-20" />
              <p className="text-muted-foreground font-black uppercase text-xs">No commands found for "{query}"</p>
            </div>
          ) : (
            <>
              {['Navigation', 'Quick Actions'].map((category) => {
                const categoryActions = filteredActions.filter(a => a.category === category)
                if (categoryActions.length === 0) return null
                return (
                  <div key={category} className="space-y-1">
                    <h4 className="px-3 text-[10px] font-black uppercase text-muted-foreground mb-2">{category}</h4>
                    {categoryActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={action.action}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-sm border-2 border-transparent hover:border-border-outline hover:bg-muted group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-card border-2 border-border-outline flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <action.icon size={16} />
                          </div>
                          <span className="font-black uppercase text-sm text-foreground">{action.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {action.shortcut.split(' ').map((key) => (
                            <kbd key={key} className="px-2 py-1 bg-card border-2 border-border-outline rounded-sm text-[10px] font-mono text-muted-foreground">
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              })}
            </>
          )}
        </div>

        <div className="p-3 border-t-2 border-border-outline bg-muted/50 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-card border-2 border-border-outline rounded-sm text-[8px] font-mono">↵</kbd>
              <span className="text-[8px] font-black uppercase text-muted-foreground">Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-card border-2 border-border-outline rounded-sm text-[8px] font-mono">↑↓</kbd>
              <span className="text-[8px] font-black uppercase text-muted-foreground">Navigate</span>
            </div>
          </div>
          <span className="text-[8px] font-black uppercase text-primary">SMARTfin Quick Command</span>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
