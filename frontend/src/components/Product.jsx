import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, TrendingUp, AlertTriangle, FileText, Clock, CheckCircle } from 'lucide-react';

const chartData = [
  { id: 1, day: 'Day 1', predicted: 2400000 },
  { id: 2, day: 'Day 5', predicted: 2500000 },
  { id: 3, day: 'Day 10', predicted: 2600000 },
  { id: 4, day: 'Day 15', predicted: 2700000 },
  { id: 5, day: 'Day 20', predicted: 2850000 },
  { id: 6, day: 'Day 25', predicted: 2950000 },
  { id: 7, day: 'Day 30', predicted: 3100000 },
];

export default function Product() {
  // Mini Dashboard Interactive States (matches Figma figures!)
  const [balance, setBalance] = useState(1289401.07);
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-001',
      supplier: 'Acme Corp',
      amount: 125000,
      dueDate: '2026-05-20',
      status: 'safe',
      reco: 'Safe to Pay',
      settled: false,
      loading: false
    },
    {
      id: 'INV-002',
      supplier: 'Global Suppliers Ltd',
      amount: 89500,
      dueDate: '2026-05-22',
      status: 'safe',
      reco: 'Safe to Pay',
      settled: false,
      loading: false
    }
  ]);

  // Handle simulated Morph settlement inside the mini landing-page preview
  const handleSettle = (id) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, loading: true } : inv));

    setTimeout(() => {
      setInvoices(prev => prev.map(inv => {
        if (inv.id === id) {
          setBalance(prevBal => prevBal - inv.amount);
          return { ...inv, loading: false, settled: true };
        }
        return inv;
      }));
    }, 1200);
  };

  const pendingCount = invoices.filter(inv => !inv.settled).length;
  const pendingTotal = invoices.filter(inv => !inv.settled).reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <section
      id="workflow"
      className="relative z-10 px-8 md:px-16 py-12 md:py-16 min-h-[100svh] snap-start flex flex-col justify-center overflow-hidden font-outfit"
      style={{
        backgroundImage: 'linear-gradient(180deg, rgba(0, 0, 0, 0.94), rgba(8, 8, 8, 0.98)), radial-gradient(circle at top right, rgba(228, 195, 122, 0.08), transparent 30%), radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.03), transparent 25%)',
      }}
    >
      <div className="max-w-[1400px] mx-auto w-full relative z-10 flex flex-col justify-center">
        
        {/* Section Header - Kept compact */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-6">
          <div className="max-w-2xl">
            <span className="text-[#e4c37a] text-xs font-bold tracking-[0.3em] uppercase drop-shadow-[0_0_10px_rgba(228,195,122,0.3)] block mb-1.5">
              The Platform
            </span>
            <h2 className="font-cormorant text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">
              An interface defined by <span className="italic text-gold-metallic">decisive execution</span>.
            </h2>
          </div>
          <p className="max-w-xl text-white/50 leading-relaxed text-sm font-light">
            Fehuvia's interface synthesizes complicated multi-currency cash flows into a single, actionable dashboard. Experience the live interactive preview below.
          </p>
        </div>

        {/* Dashboard Workstation Frame: Black Metallic Plate with Massive Asymmetrical Corners */}
        <div className="plate-black-metallic shape-asymmetric-1 p-5 md:p-6 relative w-full overflow-hidden">
          {/* Subtle Background Textures */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.015)_0%,rgba(255,255,255,0)_50%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.005)_0px,rgba(255,255,255,0.005)_1px,transparent_1px,transparent_12px)] opacity-10 mix-blend-overlay pointer-events-none" />

          <div className="relative z-10">
            
            {/* Top Stats Bar - Enlarged values and labels slightly */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-white/5 pb-4 mb-4">
              
              {/* Stat 1: Wallet Treasury */}
              <div className="flex flex-col space-y-1">
                <span className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  Portfolio Value
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    $2,847,392.00
                  </span>
                  <span className="text-gold-metallic text-xs font-bold tracking-wide">
                    +12.5%
                  </span>
                </div>
              </div>

              {/* Stat 2: Available balance */}
              <div className="flex flex-col space-y-1">
                <span className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  Available Balance
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-white/30 text-xs font-medium">
                    45.3% of total
                  </span>
                </div>
              </div>

              {/* Stat 3: Active Obligations */}
              <div className="flex flex-col space-y-1">
                <span className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  Pending Payables Queue
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl md:text-3xl font-extrabold text-gold-metallic tracking-tight">
                    {pendingCount} Invoices
                  </span>
                  <span className="text-white/30 text-xs font-semibold">
                    (${pendingTotal.toLocaleString()})
                  </span>
                </div>
              </div>

            </div>

            {/* Dashboard Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Cashflow predict area chart & invoice table */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Embedded dynamic Recharts Line Graph - Enlarged chart title and scales */}
                <div className="plate-black-metallic shape-asymmetric-3 p-4 border border-white/5 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">30-Day AI Cashflow Prediction</span>
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      <span>Forecast Live</span>
                    </div>
                  </div>

                  <div style={{ width: '100%', height: '165px' }}>
                    <ResponsiveContainer width="100%" height={165}>
                      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="miniGoldGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="miniGoldLine" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#fcf6ba"/>
                            <stop offset="50%" stopColor="#D4AF37"/>
                            <stop offset="100%" stopColor="#B8860B"/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222224" />
                        <XAxis dataKey="day" stroke="#6a6a6a" tick={{ fill: '#6a6a6a', fontSize: 10 }} />
                        <YAxis stroke="#6a6a6a" tick={{ fill: '#6a6a6a', fontSize: 10 }} tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                        <Tooltip contentStyle={{ backgroundColor: '#161618', border: '1px solid #2C2C2C', borderRadius: '8px', color: '#ffffff', fontSize: 11 }} />
                        <Area type="monotone" dataKey="predicted" stroke="url(#miniGoldLine)" strokeWidth={2} fill="url(#miniGoldGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Compact Invoice ledger table - Shape-masked wrapper to prevent scrollbar clip */}
                <div className="plate-black-metallic shape-asymmetric-3 border border-white/5 overflow-hidden">
                  <div className="p-4 pb-3 overflow-x-auto">
                    <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider block mb-2">Pending Obligations ledger</span>
                    
                    <table className="w-full text-left text-[11px] sm:text-xs">
                      <thead>
                        <tr className="border-b border-[#2C2C2C] text-[#6a6a6a] font-bold text-[9px] sm:text-[10px]">
                          <th className="py-1.5 px-1.5 sm:px-2 uppercase">Invoice ID</th>
                          <th className="py-1.5 px-1.5 sm:px-2 uppercase">Supplier</th>
                          <th className="py-1.5 px-1.5 sm:px-2 uppercase">Amount</th>
                          <th className="py-1.5 px-1.5 sm:px-2 uppercase">AI Action</th>
                          <th className="py-1.5 px-1.5 sm:px-2 uppercase text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="border-b border-[#1c1c1f] hover:bg-white/[0.01] transition-colors">
                            <td className="py-2 px-1.5 sm:px-2 font-mono text-white/70 text-[10px] sm:text-xs">{inv.id}</td>
                            <td className="py-2 px-1.5 sm:px-2 font-bold text-white text-[11px] sm:text-xs">{inv.supplier}</td>
                            <td className="py-2 px-1.5 sm:px-2 font-extrabold text-white text-xs sm:text-sm">${inv.amount.toLocaleString()}</td>
                            <td className="py-2 px-1.5 sm:px-2">
                              {inv.settled ? (
                                <span className="text-[9px] sm:text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 shrink-0" />
                                  <span>Settled T+0</span>
                                </span>
                              ) : (
                                <span className="bg-[#1a3d1a]/80 text-[#4ade80] border border-[#4ade80]/20 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wider inline-block">
                                  Safe to Pay
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-1.5 sm:px-2 text-right">
                              {inv.settled ? (
                                <span className="text-[#4ade80] font-bold uppercase tracking-wider text-[9px]">Cleared</span>
                              ) : inv.loading ? (
                                <span className="text-gold-metallic font-bold uppercase tracking-wider text-[9px] animate-pulse">Settling...</span>
                              ) : (
                                <button
                                  onClick={() => handleSettle(inv.id)}
                                  className="px-2.5 py-1 rounded bg-gold-metallic text-black font-bold uppercase tracking-wider text-[9px] sm:text-[10px] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                  Settle via Morph
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column: Mini AI strategically advice list - Enlarged insight descriptions slightly */}
              <div className="lg:col-span-4 h-full">
                
                <div className="plate-black-metallic shape-asymmetric-4 p-4 border border-white/5 flex flex-col justify-between min-h-[230px] lg:h-[362px]">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded bg-gold-metallic flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-black" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Financial Copilot</h4>
                        <span className="text-[9px] text-[#a1a1a1] block">Active Strategy Recommendations</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Insight 1: Acme early discount */}
                      <div className="p-3 bg-[#161618] border border-[#2C2C2C] rounded-lg">
                        <div className="flex gap-2">
                          <TrendingUp className="w-3.5 h-3.5 text-[#e4c37a] mt-0.5" />
                          <div className="flex-1">
                            <span className="text-[9px] font-bold text-[#e4c37a] uppercase tracking-wider block">Opportunity</span>
                            <p className="text-[10px] sm:text-xs text-white/70 leading-relaxed font-light mt-0.5">
                              Cash position optimal for early discount with Acme Corp. Settle INV-001 today to save $2,500.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Insight 2: Manufacturing delay alert */}
                      <div className="p-3 bg-[#161618] border border-[#2C2C2C] rounded-lg">
                        <div className="flex gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#fb923c] mt-0.5" />
                          <div className="flex-1">
                            <span className="text-[9px] font-bold text-[#fb923c] uppercase tracking-wider block">Alert</span>
                            <p className="text-[10px] sm:text-xs text-white/70 leading-relaxed font-light mt-0.5">
                              Manufacturing Co historically takes 45+ days to process refunds. Recommend delaying payables by 3 days.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-3 py-2.5 rounded bg-gold-metallic text-black text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer">
                    View All Recommendations
                  </button>

                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
