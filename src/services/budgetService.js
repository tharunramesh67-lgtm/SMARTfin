import { supabase } from '../lib/supabase'

export const budgetService = {
  async getBudgets() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // 1. Fetch budgets
      const { data: budgets, error: bError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)

      if (bError) throw bError

      // 2. Fetch transactions for this month to calculate spent amount
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: transactions, error: tError } = await supabase
        .from('transactions')
        .select('amount, category')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', startOfMonth.toISOString())

      if (tError) throw tError

      // 3. Map spent amounts to budgets
      const spentByCategory = (transactions || []).reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount)
        return acc
      }, {})

      return (budgets || []).map(b => ({
        ...b,
        spent: spentByCategory[b.category] || 0,
        remaining: Math.max(0, b.limit_amount - (spentByCategory[b.category] || 0)),
        percent: b.limit_amount > 0 ? ((spentByCategory[b.category] || 0) / b.limit_amount) * 100 : 0
      }))
    } catch (error) {
      console.error('Error fetching budgets:', error)
      return []
    }
  },

  async createBudget(category, limitAmount) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('budgets')
        .insert([{
          user_id: user.id,
          category,
          limit_amount: limitAmount
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating budget:', error)
      throw error
    }
  },

  async updateBudget(id, limitAmount) {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update({ limit_amount: limitAmount })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating budget:', error)
      throw error
    }
  },

  async deleteBudget(id) {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting budget:', error)
      throw error
    }
  }
}
