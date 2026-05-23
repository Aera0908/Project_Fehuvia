import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PolarAngleAxis, Tooltip } from 'recharts';
import { Zap, Percent, ShieldCheck, Flame, Cpu, ArrowUpRight } from 'lucide-react';

const radialData = [
  { name: 'Early-Discounts Capture', value: 92, fill: '#fcf6ba' },
  { name: 'Cash Flow Efficiency', value: 85, fill: '#D4AF37' },
  { name: 'USDC Settlement Coverage', value: 78, fill: '#4ade80' },
];

export function AnalyticsView() {
  return (
    <div className="space-y-8 animate-fadeIn font-outfit text-white">
      
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1"
              style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 8px rgba(212, 175, 55, 0.3)' }}>
            AI Optimization & Analytics
          </h2>
          <p className="text-sm text-[#a1a1a1]">Real-time efficiency indices and stablecoin discount yields</p>
        </div>
      </div>

      {/* Main radial dials & metrics splitting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Radial Bar Chart (Span 2) */}
        <div className="lg:col-span-2 plate-black-metallic shape-asymmetric-3 p-6 border border-[#2C2C2C] flex flex-col justify-between">
          <div>
            <span className="text-sm font-bold text-white uppercase tracking-wider block mb-2">Treasury Optimization Ratios</span>
            <p className="text-xs text-white/50 mb-6 font-light">
              Comparative analysis of active stablecoin utility across invoice batches.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-around gap-6">
            
            {/* Recharts Circular Radial bar */}
            <div style={{ width: '280px', height: '280px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="35%"
                  outerRadius="100%"
                  barSize={12}
                  data={radialData}
                  startAngle={180}
                  endAngle={-180}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar
                    minAngle={15}
                    background={{ fill: '#141416' }}
                    clockWise
                    dataKey="value"
                    angleAxisId={0}
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#161618', border: '1px solid #2C2C2C', color: '#fff', borderRadius: '8px' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              
              {/* Center efficiency score */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase tracking-wider text-[#6a6a6a] font-bold">Overall Yield</span>
                <span className="text-3xl font-black text-white">88.5%</span>
                <span className="text-[9px] text-[#4ade80] font-semibold mt-0.5">OPTIMIZED</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="space-y-4 max-w-xs w-full">
              {radialData.map((item, idx) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-xs font-semibold text-white/70">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-white">{item.value}%</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right side metric cards column */}
        <div className="space-y-6">
          
          {/* Card 1: Early discount capture */}
          <div className="plate-gold-metallic shape-asymmetric-4 p-6 shadow-2xl flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between mb-2">
              <Percent className="w-5 h-5 text-black/60" />
              <span className="text-[9px] font-mono bg-black/10 px-2 py-0.5 rounded border border-black/5 font-semibold text-black/80">Captured Yield</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-black/55 uppercase tracking-widest block mb-1">Discount Savings</span>
              <p className="text-3xl font-black text-black tracking-tight">$34,810.50</p>
            </div>
            <p className="text-xs text-black/75 leading-relaxed font-medium mt-2">
              Captured via T+0 instant L2 settlements which enabled early settlement discounts of up to 3%.
            </p>
          </div>

          {/* Card 2: AI Gas Shield */}
          <div className="plate-black-metallic shape-asymmetric-3 p-6 border border-[#2C2C2C] flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 font-semibold text-emerald-400">99.9% Savings</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Gas Cost Reduction</span>
              <p className="text-3xl font-black text-white tracking-tight">$8,290.45</p>
            </div>
            <p className="text-xs text-white/60 leading-relaxed font-light mt-2">
              L2 settlement rails prevent high Ethereum mainnet fee bottlenecks. AI batches and submits on L2 automatically.
            </p>
          </div>

        </div>

      </div>

      {/* Grid of 3 key sub-metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'AI Copilot Engine', subtitle: 'Optimizing 100% of pipeline', icon: Cpu, score: 'Active' },
          { title: 'Financial Runway', subtitle: 'Extended by 12.4 days', icon: ShieldCheck, score: '+28.9%' },
          { title: 'L2 Congestion Guard', subtitle: 'Auto-batching triggered', icon: Flame, score: 'Stable' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="plate-black-metallic shape-asymmetric-2 p-5 border border-[#2C2C2C] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center text-[#e4c37a]">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{item.title}</span>
                  <span className="text-[10px] text-white/50 block font-light">{item.subtitle}</span>
                </div>
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-gold-metallic bg-[#D4AF37]/10 px-2.5 py-1 rounded border border-[#D4AF37]/20">
                {item.score}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
