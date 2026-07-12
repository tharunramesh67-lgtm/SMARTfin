import React, { useState, useEffect } from 'react';
import { 
  Calculator as CalcIcon, 
  TrendingUp, 
  Home, 
  RefreshCcw, 
  IndianRupee, 
  Info,
  Zap,
  ChevronRight
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const Calculator = () => {
  const [activeTab, setActiveTab] = useState('compound'); // compound, roi, mortgage, inflation

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-primary text-white border-thick brick-shadow p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-4">
          <div className="inline-block px-4 py-1 bg-white text-primary text-[10px] font-black uppercase tracking-[0.2em] border-2 border-white">
            FINANCE LAB v1.0
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            Strategy <span className="italic text-secondary">Engines</span>
          </h1>
          <p className="text-white/80 font-bold text-sm md:text-base max-w-xl uppercase tracking-wide">
            Simulate your financial future with precision. High-torque engines for compound growth, returns, and real estate.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          {[
            { id: 'compound', icon: TrendingUp, label: 'Growth' },
            { id: 'roi', icon: RefreshCcw, label: 'ROI' },
            { id: 'mortgage', icon: Home, label: 'Loans' },
            { id: 'inflation', icon: Zap, label: 'Erosion' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-6 border-thick transition-all flex flex-col items-center gap-3 ${activeTab === tab.id ? 'bg-secondary text-secondary-foreground brick-shadow -translate-y-1' : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'}`}
            >
              <tab.icon className="stroke-[3]" size={32} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Calculator Body */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'compound' && <CompoundCalculator />}
        {activeTab === 'roi' && <ROICalculator />}
        {activeTab === 'mortgage' && <MortgageCalculator />}
        {activeTab === 'inflation' && <InflationCalculator />}
      </div>
    </div>
  );
};

const CompoundCalculator = () => {
  const [p, setP] = useState(10000);
  const [pmt, setPmt] = useState(500);
  const [r, setR] = useState(8);
  const [t, setT] = useState(20);
  const [data, setData] = useState([]);

  useEffect(() => {
    const results = [];
    let currentBalance = p;
    const rate = r / 100;
    
    for (let i = 0; i <= t; i++) {
      results.push({
        year: i,
        balance: Math.round(currentBalance)
      });
      currentBalance = (currentBalance + pmt * 12) * (1 + rate);
    }
    setData(results);
  }, [p, pmt, r, t]);

  const finalBalance = data[data.length - 1]?.balance || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-card border-thick brick-shadow p-8 space-y-8">
          <div className="flex items-center gap-3 border-b-4 border-border-outline pb-4">
            <TrendingUp size={24} className="text-primary stroke-[3]" />
            <h3 className="text-xl font-black uppercase tracking-tighter">Growth Input</h3>
          </div>
          
          <div className="space-y-8">
            {[
              { label: 'Initial Capital', value: `₹${p.toLocaleString()}`, val: p, set: setP, min: 0, max: 1000000, step: 5000 },
              { label: 'Monthly Deposit', value: `₹${pmt.toLocaleString()}`, val: pmt, set: setPmt, min: 0, max: 50000, step: 500 },
              { label: 'Annual Return', value: `${r}%`, val: r, set: setR, min: 1, max: 30, step: 0.5 },
              { label: 'Horizon', value: `${t} Yrs`, val: t, set: setT, min: 1, max: 50, step: 1 }
            ].map((input, i) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{input.label}</label>
                  <span className="text-lg font-black text-foreground uppercase tracking-tighter">{input.value}</span>
                </div>
                <input 
                  type="range" min={input.min} max={input.max} step={input.step} value={input.val}
                  onChange={(e) => input.set(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-muted border-2 border-border-outline appearance-none cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary text-white border-thick brick-shadow p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Projected Balance</p>
          <h2 className="text-5xl font-black tracking-tighter italic">₹{finalBalance.toLocaleString()}</h2>
          <div className="mt-6 p-4 bg-black/20 border-2 border-white/20 text-[10px] font-bold uppercase tracking-wide leading-relaxed">
            Projection assumes reinvestment of all yields and consistent monthly deposits.
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 bg-card border-thick brick-shadow p-8 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CalcIcon size={24} className="text-primary stroke-[3]" />
            <h3 className="text-xl font-black uppercase tracking-tighter">Wealth Trajectory</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary border-2 border-border-outline"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Balance</span>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-[400px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" stroke="var(--border-outline)" strokeOpacity={0.1} />
              <XAxis 
                dataKey="year" 
                axisLine={{ stroke: 'var(--border-outline)', strokeWidth: 2 }}
                tickLine={{ stroke: 'var(--border-outline)', strokeWidth: 2 }}
                tick={{ fill: 'var(--foreground)', fontWeight: 900, fontSize: 10 }}
              />
              <YAxis 
                axisLine={{ stroke: 'var(--border-outline)', strokeWidth: 2 }}
                tickLine={{ stroke: 'var(--border-outline)', strokeWidth: 2 }}
                tick={{ fill: 'var(--foreground)', fontWeight: 900, fontSize: 10 }}
                tickFormatter={(val) => `₹${val > 999 ? (val/1000).toFixed(0) + 'K' : val}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '4px solid var(--border-outline)', 
                  borderRadius: '0px',
                  boxShadow: '8px 8px 0px var(--border-outline)'
                }}
                itemStyle={{ color: 'var(--foreground)', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                labelStyle={{ color: 'var(--primary)', fontWeight: 900, marginBottom: '4px', fontSize: '12px' }}
                formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Total Balance']}
              />
              <Area 
                type="stepAfter" 
                dataKey="balance" 
                stroke="var(--primary)" 
                strokeWidth={4} 
                fill="var(--primary)" 
                fillOpacity={0.1} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const ROICalculator = () => {
  const [cost, setCost] = useState(5000);
  const [revenue, setRevenue] = useState(7500);

  const roi = cost > 0 ? (((revenue - cost) / cost) * 100).toFixed(2) : 0;
  const profit = revenue - cost;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card border-thick brick-shadow p-10 space-y-10">
        <div className="flex items-center gap-4 border-b-4 border-border-outline pb-6">
          <RefreshCcw size={32} className="text-primary stroke-[3]" />
          <h3 className="text-3xl font-black uppercase tracking-tighter">Audit Engine</h3>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Initial Capital (Cost)</label>
            <div className="relative">
              <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" size={24} />
              <input 
                type="number" 
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full bg-muted border-thick pl-16 pr-8 py-6 text-3xl font-black text-foreground focus:outline-none focus:bg-background transition-colors"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Terminal Value (Revenue)</label>
            <div className="relative">
              <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary" size={24} />
              <input 
                type="number" 
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="w-full bg-muted border-thick pl-16 pr-8 py-6 text-3xl font-black text-foreground focus:outline-none focus:bg-background transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="bg-secondary text-secondary-foreground border-thick brick-shadow flex-1 flex flex-col items-center justify-center p-12 text-center">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-4 opacity-70">Return on Investment</p>
          <h2 className="text-8xl font-black tracking-tighter italic leading-none">{roi}%</h2>
          <div className="mt-8 px-6 py-3 bg-black/10 border-2 border-black/10 flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Net Profit:</span>
            <span className="text-xl font-black">₹{profit.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-card border-thick brick-shadow p-8 border-l-[12px] border-l-primary">
          <h4 className="font-black mb-3 text-primary flex items-center gap-2 uppercase tracking-widest text-sm">
            <Info size={16} className="stroke-[3]" />
            ROI Logic
          </h4>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-relaxed">
            ROI measures the gain or loss generated on an investment relative to the amount of money invested. It's the standard metric for comparative capital efficiency across all assets.
          </p>
        </div>
      </div>
    </div>
  );
};

const MortgageCalculator = () => {
  const [loan, setLoan] = useState(300000);
  const [rate, setRate] = useState(4.5);
  const [years, setYears] = useState(30);

  const monthlyRate = rate / 100 / 12;
  const numberOfPayments = years * 12;
  const monthlyPayment = (
    (loan * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  ).toFixed(2);

  const totalPayment = (monthlyPayment * numberOfPayments).toFixed(2);
  const totalInterest = (totalPayment - loan).toFixed(2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-card border-thick brick-shadow p-8 space-y-8">
        <div className="flex items-center gap-3 border-b-4 border-border-outline pb-4">
          <Home size={24} className="text-primary stroke-[3]" />
          <h3 className="text-xl font-black uppercase tracking-tighter">Loan Specs</h3>
        </div>
        
        <div className="space-y-8">
          {[
            { label: 'Loan Amount', value: `₹${loan.toLocaleString()}`, val: loan, set: setLoan, min: 50000, max: 10000000, step: 50000 },
            { label: 'Interest Rate', value: `${rate}%`, val: rate, set: setRate, min: 1, max: 15, step: 0.1 },
            { label: 'Loan Term', value: `${years} Yrs`, val: years, set: setYears, min: 5, max: 30, step: 1 }
          ].map((input, i) => (
            <div key={i} className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{input.label}</label>
                <span className="text-lg font-black text-foreground uppercase tracking-tighter">{input.value}</span>
              </div>
              <input 
                type="range" min={input.min} max={input.max} step={input.step} value={input.val}
                onChange={(e) => input.set(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-muted border-2 border-border-outline appearance-none cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-primary text-white border-thick brick-shadow p-12 flex flex-col items-center text-center justify-center">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-4 opacity-80">Monthly Installment</p>
          <h2 className="text-6xl font-black tracking-tighter italic">₹{parseFloat(monthlyPayment).toLocaleString()}</h2>
        </div>

        <div className="bg-tertiary text-tertiary-foreground border-thick brick-shadow p-12 flex flex-col items-center text-center justify-center">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-4 opacity-80">Total Interest</p>
          <h2 className="text-6xl font-black tracking-tighter italic">₹{parseFloat(totalInterest).toLocaleString()}</h2>
        </div>

        <div className="md:col-span-2 bg-card border-thick brick-shadow p-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Cost of Ownership</p>
              <p className="text-4xl font-black tracking-tighter uppercase">₹{parseFloat(totalPayment).toLocaleString()}</p>
            </div>
            
            <div className="flex-1 w-full space-y-4">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-primary">Principal: {((loan / totalPayment) * 100).toFixed(0)}%</span>
                  <span className="text-tertiary">Interest: {((totalInterest / totalPayment) * 100).toFixed(0)}%</span>
               </div>
               <div className="w-full h-8 bg-muted border-4 border-border-outline flex overflow-hidden">
                  <div 
                    className="bg-primary h-full border-r-4 border-border-outline transition-all duration-1000" 
                    style={{ width: `${(loan / totalPayment) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-tertiary h-full transition-all duration-1000" 
                    style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
                  ></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InflationCalculator = () => {
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(3);
  const [years, setYears] = useState(10);

  const futureValue = amount * Math.pow(1 + (rate / 100), years);
  const loss = futureValue - amount;
  const purchasingPower = amount / Math.pow(1 + (rate / 100), years);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card border-thick brick-shadow p-10 space-y-10">
        <div className="flex items-center gap-4 border-b-4 border-border-outline pb-6">
          <Zap size={32} className="text-primary stroke-[3]" />
          <h3 className="text-3xl font-black uppercase tracking-tighter">Erosion Lab</h3>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Current Capital</label>
            <div className="relative">
              <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" size={24} />
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-muted border-thick pl-16 pr-8 py-6 text-3xl font-black text-foreground focus:outline-none focus:bg-background transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Inflation Rate (%)</label>
              <input 
                type="number" 
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full bg-muted border-thick px-6 py-6 text-2xl font-black text-foreground focus:outline-none focus:bg-background transition-colors"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] flex justify-between">
                Timeline <span>{years} Yrs</span>
              </label>
              <input 
                type="range" min="1" max="50" step="1" value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-muted border-2 border-border-outline appearance-none cursor-pointer mt-4"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-primary text-white border-thick brick-shadow p-12">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-4 opacity-80">Future Equivalent Cost</p>
          <h2 className="text-6xl font-black tracking-tighter italic">₹{Math.round(futureValue).toLocaleString()}</h2>
          <p className="mt-8 text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-70">
            In {years} years, you'll need this much to maintain the purchasing power of ₹{amount.toLocaleString()} today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border-thick brick-shadow p-8 border-l-[12px] border-l-red-500">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Purchasing Power</p>
            <p className="text-3xl font-black tracking-tighter">₹{Math.round(purchasingPower).toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground font-bold uppercase mt-2">Real value in today's terms</p>
          </div>
          <div className="bg-card border-thick brick-shadow p-8 border-l-[12px] border-l-orange-500">
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Impact Score</p>
            <p className="text-3xl font-black tracking-tighter">-{Math.round((1 - purchasingPower/amount) * 100)}%</p>
            <p className="text-[9px] text-muted-foreground font-bold uppercase mt-2">Total capital degradation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
