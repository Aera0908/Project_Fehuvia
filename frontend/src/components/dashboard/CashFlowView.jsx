import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Clock, ShieldAlert } from 'lucide-react';

export function CashFlowView({ predictions, runway = 45 }) {
  const isTrendRisk = predictions?.cash_flow_trend === 'risk';
  const analysisText = predictions?.analysis_summary || 'AI-modeled treasury prediction: Runway is optimized, settlement delays eliminated.';

  // Dynamic 30-day inflow vs outflow comparison trend
  const cashFlowTrends = Array.from({ length: 7 }).map((_, idx) => {
    const dayNum = 1 + idx * 5;
    const baseInflow = 4000 + Math.sin(idx) * 1500;
    const baseOutflow = 2500 + Math.cos(idx) * 1200 * (isTrendRisk ? 1.4 : 0.8);
    return {
      day: `Day ${dayNum}`,
      Inflow: Math.round(baseInflow),
      Outflow: Math.round(baseOutflow)
    };
  });

  const weeklyInflow = 5500.00;
  const weeklyOutflow = isTrendRisk ? 4200.00 : 2600.00;

  return (
    <div className="space-y-8 animate-fadeIn font-outfit text-white">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold mb-1"
            style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 8px rgba(212, 175, 55, 0.3)' }}>
          Detailed Liquidity Forecast
        </h2>
        <p className="text-sm text-[#a1a1a1]">AI-modeled cash inflow vs outflow pathways</p>
      </div>

      {/* Spacing grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: comparative Area graph (Span 2) */}
        <div className="lg:col-span-2 plate-black-metallic shape-asymmetric-3 p-6 border border-[#2C2C2C]">
          <span className="text-sm font-bold text-white uppercase tracking-wider block mb-6">Inflow vs Outflow comparison</span>
          
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cashFlowTrends} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222224" />
                <XAxis dataKey="day" stroke="#a1a1a1" tick={{ fill: '#a1a1a1', fontSize: 11 }} />
                <YAxis stroke="#a1a1a1" tick={{ fill: '#a1a1a1', fontSize: 11 }} tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#161618', border: '1px solid #2C2C2C', borderRadius: '8px', color: '#ffffff' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="Inflow" stroke="#4ade80" strokeWidth={2.5} fill="url(#inflowGrad)" />
                <Area type="monotone" dataKey="Outflow" stroke="#f87171" strokeWidth={2} fill="url(#outflowGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Liquidity Parameters */}
        <div className="space-y-6">
          
          {/* Card 1: Runway Extender */}
          <div className="plate-gold-metallic shape-asymmetric-4 p-6 shadow-2xl flex flex-col justify-between min-h-[160px]"
               style={{
                 background: isTrendRisk ? 'linear-gradient(135deg, #fecaca 0%, #f87171 100%)' : undefined
               }}>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${isTrendRisk ? 'text-red-950' : 'text-black/55'}`}>Runway Safety Index</span>
              <p className={`text-3xl font-black tracking-tight ${isTrendRisk ? 'text-red-950' : 'text-black'}`}>{runway} Days</p>
            </div>
            <p className={`text-xs leading-relaxed font-medium ${isTrendRisk ? 'text-red-900' : 'text-black/75'}`}>
              AI optimization models show stablecoins settle payments in <span className="font-bold">0.0s</span>, adding an average of <span className="font-bold">+12.4 days</span> to treasury runways.
            </p>
          </div>

          {/* Card 2: Liquidity status alerts */}
          <div className="plate-black-metallic shape-asymmetric-3 p-6 border border-[#2C2C2C] flex flex-col justify-between min-h-[160px]">
            <div className={`flex items-center gap-2 mb-2 ${isTrendRisk ? 'text-red-400' : 'text-[#fb923c]'}`}>
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Identified Bottlenecks</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-light mb-4">
              {analysisText}
            </p>
            <div className={`text-[10px] font-mono uppercase tracking-wider ${isTrendRisk ? 'text-red-400' : 'text-[#fb923c]'}`}>
              AI Action Tag: {isTrendRisk ? 'High Risk Inflow Strain' : 'Moderate Risk Balanced'}
            </div>
          </div>

        </div>

      </div>

      {/* Inflow/Outflow breakdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Weekly Gross Inflow', value: `$${weeklyInflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Weekly Gross Outflow', value: `$${weeklyOutflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingDown, color: isTrendRisk ? 'text-red-400' : 'text-emerald-400' },
          { label: 'Avg. Bank Settlement Delay', value: '3.1 Days', icon: Clock, color: 'text-[#e4c37a]' },
          { label: 'Morph Web3 Settlement Speed', value: 'T+0 Instant', icon: TrendingUp, color: 'text-[#e4c37a]' }
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="plate-black-metallic shape-asymmetric-3 p-5 border border-[#2C2C2C] flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-1 font-semibold">{item.label}</span>
                <span className={`text-lg font-black tracking-wide ${item.color}`}>{item.value}</span>
              </div>
              <div className="h-8 w-8 rounded bg-white/5 flex items-center justify-center border border-white/5 text-white/50">
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
