import React from 'react'
import { Bell, CreditCard, PieChart, TrendingUp, X, CheckSquare, Trash2 } from 'lucide-react'

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = React.useState([
    { 
      id: 1, 
      title: 'Budget Alert', 
      desc: 'You have reached 80% of your Food budget.', 
      type: 'budget', 
      time: '2 hours ago',
      icon: PieChart,
      color: 'text-primary'
    },
    { 
      id: 2, 
      title: 'Large Expense', 
      desc: 'A transaction of ₹12,000 for "Rent" was recorded.', 
      type: 'transaction', 
      time: '5 hours ago',
      icon: CreditCard,
      color: 'text-secondary'
    },
    { 
      id: 3, 
      title: 'Market Update', 
      desc: 'Your portfolio is up 2.4% today! Great job.', 
      type: 'portfolio', 
      time: '1 day ago',
      icon: TrendingUp,
      color: 'text-tertiary'
    }
  ])

  const clearAll = () => setNotifications([])
  const removeOne = (id) => setNotifications(notifications.filter(n => n.id !== id))

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[190]" onClick={onClose} />
      <div className="fixed sm:absolute top-20 sm:top-full left-4 sm:left-auto right-4 sm:right-0 mt-4 w-auto sm:w-96 bg-card border-thick brick-shadow rounded-none animate-in fade-in slide-in-from-top-4 duration-200 z-[200]">

        <div className="p-4 border-b-4 border-border-outline flex items-center justify-between bg-muted">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-secondary" />
            <h3 className="font-black uppercase text-sm tracking-widest text-foreground">Notifications</h3>
          </div>
          <div className="flex gap-2">
            {notifications.length > 0 && (
              <button 
                onClick={clearAll}
                className="p-1 hover:text-red-500 transition-colors"
                title="Clear All"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button onClick={onClose} className="p-1 hover:text-primary transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 text-center space-y-3 px-6">
              <CheckSquare size={40} className="mx-auto text-primary/20" />
              <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-border-outline">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 hover:bg-muted group transition-colors relative">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-sm bg-card border-2 border-border-outline flex items-center justify-center shrink-0 group-hover:brick-shadow transition-all ${n.color}`}>
                      <n.icon size={20} />
                    </div>
                    <div className="space-y-1 pr-6">
                      <p className="font-black uppercase text-xs text-foreground tracking-tight">{n.title}</p>
                      <p className="text-[10px] text-muted-foreground font-bold leading-tight">{n.desc}</p>
                      <p className="text-[9px] text-muted-foreground/60 font-mono italic">{n.time}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeOne(n.id)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t-2 border-border-outline bg-muted/30 text-center">
            <button className="text-[9px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-colors">
              View All Activity
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default NotificationCenter
