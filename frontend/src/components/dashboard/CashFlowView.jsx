import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Clock, ShieldAlert } from 'lucide-react';

const cashFlowTrends = [
  { day: 'Day 1', Inflow: 180000, Outflow: 120000 },
  { day: 'Day 5', Inflow: 290000, Outflow: 160000 },
  { day: 'Day 10', Inflow: 140000, Outflow: 280000 },
  { day: 'Day 15', Inflow: 420000, Outflow: 190000 },
  { day: 'Day 20', Inflow: 310000, Outflow: 220000 },
  { day: 'Day 25', Inflow: 280000, Outflow: 150000 },
  { day: 'Day 30', Inflow: 560000, Outflow: 240000 },
];

export function CashFlowView() {
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
                <YAxis stroke="#a1a1a1" tick={{ fill: '#a1a1a1', fontSize: 11 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
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
          <div className="plate-gold-metallic shape-asymmetric-4 p-6 shadow-2xl flex flex-col justify-between min-h-[160px]">
            <div>
              <span className="text-[10px] font-bold text-black/55 uppercase tracking-widest block mb-1">Runway Safety Index</span>
              <p className="text-3xl font-black text-black tracking-tight">42.8 Days</p>
            </div>
            <p className="text-xs text-black/75 leading-relaxed font-medium">
              AI optimization models show stablecoins settle payments in <span className="font-bold">0.0s</span>, adding an average of <span className="font-bold">+12.4 days</span> to treasury runways.
            </p>
          </div>

          {/* Card 2: Liquidity status alerts */}
          <div className="plate-black-metallic shape-asymmetric-3 p-6 border border-[#2C2C2C] flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center gap-2 mb-2 text-[#fb923c]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Identified Bottlenecks</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-light mb-4">
              Traditional multi-day bank settlements cause capital bottlenecks on Day 12. Deferring the payables queue is recommended.
            </p>
            <div className="text-[10px] font-mono text-[#fb923c] uppercase tracking-wider">
              AI Action Tag: Moderate Risk
            </div>
          </div>

        </div>

      </div>

      {/* Inflow/Outflow breakdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Weekly Gross Inflow', value: '$680,000.00', icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Weekly Gross Outflow', value: '$410,000.00', icon: TrendingDown, color: 'text-red-400' },
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
