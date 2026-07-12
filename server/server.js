import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Supabase Client with Service Role Key (Privileged operations, bypasses RLS)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin;
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('Supabase Admin Client initialized successfully.');
} else {
  console.warn('Supabase Admin Client NOT initialized. Check environment variables.');
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Privileged Operation: Fetch overall system statistics (bypassing RLS)
app.get('/api/admin/stats', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' });
  }

  try {
    // Since we're using the service_role key, this will fetch all rows regardless of RLS
    const { data: calculations, error: calcError } = await supabaseAdmin
      .from('calculations')
      .select('type, created_at');

    const { data: transactions, error: transError } = await supabaseAdmin
      .from('transactions')
      .select('type, amount, created_at');

    if (calcError || transError) {
      throw calcError || transError;
    }

    const totalCalculations = calculations.length;
    const totalTransactions = transactions.length;
    
    // Aggregation logic
    const calcByType = calculations.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {});

    const totalVolume = transactions.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

    res.json({
      totalCalculations,
      totalTransactions,
      calcByType,
      totalVolume,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Admin stats error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Privileged Operation: Delete calculation for any user (Admin override)
app.delete('/api/admin/calculations/:id', async (req, res) => {
  const { id } = req.params;
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('calculations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Calculation deleted successfully by admin override', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`FinCalc backend API running on port ${PORT}`);
});
