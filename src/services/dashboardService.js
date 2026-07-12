import { supabase } from '../lib/supabase'
import { getStockQuote } from './stockApi'

export const dashboardService = {
  /**
   * Fetches the summary metrics for the dashboard.
   * Aggregates data from transactions, portfolio, and budgets.
   */
  async getDashboardSummary() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // 1. Fetch All Transactions for overall balance and monthly metrics
      const { data: txData, error: tError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)

      if (tError) throw tError

      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const monthlyTransactions = (txData || []).filter(t => new Date(t.date) >= startOfMonth)
      
      const income = (txData || [])
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      const expenses = (txData || [])
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      // Group expenses for Pie Chart
      const categories = {}
      txData?.filter(t => t.type === 'expense').forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + Number(t.amount)
      })
      const expenseCategories = Object.keys(categories).map(name => ({ name, value: categories[name] }))

      // 2. Fetch Portfolio for investment value
      const { data: portfolioData, error: pError } = await supabase
        .from('portfolio')
        .select('*')
        .eq('user_id', user.id)
      
      if (pError) throw pError

      const investedAmount = (portfolioData || [])
        .reduce((sum, p) => sum + (p.quantity * p.avg_price), 0)

      // 3. Enrich investments with LIVE prices
      let currentVal = 0
      let dailyChg = 0
      
      if (portfolioData && portfolioData.length > 0) {
        const quotes = await Promise.all(
          portfolioData.map(async (p) => {
            try {
              const quote = await getStockQuote(p.symbol)
              return { ...p, quote }
            } catch (e) {
              return { ...p, quote: null }
            }
          })
        )
        
        currentVal = quotes.reduce((sum, p) => {
          const price = p.quote?.current || p.avg_price
          return sum + (p.quantity * price)
        }, 0)

        // Calculate weighted daily change %
        dailyChg = quotes.reduce((acc, p) => {
          return acc + (p.quote?.percentChange || 0)
        }, 0) / quotes.length
      }

      // 4. Fetch Budgets
      let totalBudget = 0
      try {
        const { data: budgets, error: bError } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id)

        if (!bError) {
          totalBudget = budgets?.reduce((sum, b) => sum + Number(b.limit_amount), 0) || 0
        }
      } catch (e) {
        console.warn('Budgets table might not exist yet.')
      }

      return {
        totalBalance: income - expenses,
        monthlyIncome,
        monthlyExpenses,
        investedAmount,
        currentValue: currentVal,
        dailyChange: dailyChg,
        expenseCategories,
        totalBudget,
        budgetUtilization: totalBudget > 0 ? (monthlyExpenses / totalBudget) * 100 : 0
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error)
      return null
    }
  },

  /**
   * Generates historical balance trend data.
   */
  async getBalanceTrend(days = 7) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, type, date')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true })

      if (error) throw error

      // Group by day
      const dailyNet = {}
      
      // Initialize days
      for (let i = 0; i <= days; i++) {
        const d = new Date()
        d.setDate(d.getDate() - (days - i))
        const label = d.toLocaleDateString('en-US', { weekday: 'short' })
        dailyNet[label] = 0
      }

      transactions.forEach(t => {
        const label = new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' })
        if (dailyNet[label] !== undefined) {
          const val = t.type === 'income' ? Number(t.amount) : -Number(t.amount)
          dailyNet[label] += val
        }
      })

      // Cumulative trend
      let cumulative = 0
      return Object.entries(dailyNet).map(([name, flow]) => {
        cumulative += flow
        return { name, balance: cumulative + 10000 } // Adding a base offset for visualization
      })
    } catch (error) {
      console.error('Error fetching balance trend:', error)
      return []
    }
  }
}
