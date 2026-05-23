import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
  { id: 1, day: 'Day 1', predicted: 2400000, actual: 2400000 },
  { id: 2, day: 'Day 3', predicted: 2450000, actual: 2420000 },
  { id: 3, day: 'Day 6', predicted: 2520000, actual: 2480000 },
  { id: 4, day: 'Day 9', predicted: 2580000, actual: 2550000 },
  { id: 5, day: 'Day 12', predicted: 2650000, actual: 2620000 },
  { id: 6, day: 'Day 15', predicted: 2720000, actual: 2690000 },
  { id: 7, day: 'Day 18', predicted: 2800000, actual: 2770000 },
  { id: 8, day: 'Day 21', predicted: 2880000, actual: 2850000 },
  { id: 9, day: 'Day 24', predicted: 2950000, actual: null },
  { id: 10, day: 'Day 27', predicted: 3020000, actual: null },
  { id: 11, day: 'Day 30', predicted: 3100000, actual: null },
];

export function CashflowPrediction() {
  return (
    <div className="relative bg-[#0d0d0f] border border-[#2C2C2C] rounded-xl p-6 font-outfit"
         style={{
           boxShadow: `
             0 8px 24px rgba(0, 0, 0, 0.08),
             0 2px 8px rgba(0, 0, 0, 0.06),
             inset 0 1px 1px rgba(255, 255, 255, 0.03),
             inset 0 -1px 1px rgba(0, 0, 0, 0.5)
           `,
           background: 'linear-gradient(145deg, #0d0d0d 0%, #0a0a0a 50%, #080808 100%)'
         }}>
      
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl text-white font-semibold mb-1"
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 8px rgba(212, 175, 55, 0.3)'
              }}>
            30-Day AI Cashflow Prediction
          </h2>
          <p className="text-sm text-[#a1a1a1]">AI-powered forecasting with 94% accuracy</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
             style={{
               background: 'linear-gradient(135deg, #fcf6ba 0%, #D4AF37 50%, #B8860B 100%)',
               boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.3)'
             }}>
          <TrendingUp className="w-4 h-4 text-[#0a0a0a]" />
          <span className="text-sm text-[#0a0a0a] font-semibold">+23.8%</span>
        </div>
      </div>

      {/* Recharts Area Container */}
      <div style={{ width: '100%', height: '320px' }}>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="goldLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fcf6ba"/>
                <stop offset="25%" stopColor="#D4AF37"/>
                <stop offset="50%" stopColor="#B8860B"/>
                <stop offset="75%" stopColor="#D4AF37"/>
                <stop offset="100%" stopColor="#fcf6ba"/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#222224" />
            <XAxis
              dataKey="day"
              stroke="#a1a1a1"
              tick={{ fill: '#a1a1a1', fontSize: 11 }}
            />
            <YAxis
              stroke="#a1a1a1"
              tick={{ fill: '#a1a1a1', fontSize: 11 }}
              tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161618',
                border: '1px solid #2C2C2C',
                borderRadius: '8px',
                color: '#ffffff'
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Predicted']}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="url(#goldLineGradient)"
              strokeWidth={3}
              fill="url(#goldGradient)"
              style={{ filter: 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.4))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Cashflow Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        
        <div className="bg-[#161618] border border-[#2C2C2C] rounded-lg p-4"
             style={{
               boxShadow: `
                 0 4px 12px rgba(0, 0, 0, 0.06),
                 inset 0 1px 1px rgba(255, 255, 255, 0.02),
                 inset 0 -1px 1px rgba(0, 0, 0, 0.4)
               `
             }}>
          <p className="text-xs text-[#a1a1a1] mb-1 font-medium uppercase tracking-wider">Projected End Balance</p>
          <p className="text-lg text-white font-bold"
             style={{
               textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8), -0.5px -0.5px 1px rgba(255, 255, 255, 0.1)'
             }}>
            $3,100,000
          </p>
        </div>

        <div className="bg-[#161618] border border-[#2C2C2C] rounded-lg p-4"
             style={{
               boxShadow: `
                 0 4px 12px rgba(0, 0, 0, 0.06),
                 inset 0 1px 1px rgba(255, 255, 255, 0.02),
                 inset 0 -1px 1px rgba(0, 0, 0, 0.4)
               `
             }}>
          <p className="text-xs text-[#a1a1a1] mb-1 font-medium uppercase tracking-wider">Expected Inflow</p>
          <p className="text-lg font-bold"
             style={{
               background: 'linear-gradient(135deg, #fcf6ba 0%, #D4AF37 50%, #B8860B 100%)',
               WebkitBackgroundClip: 'text',
               WebkitTextFillColor: 'transparent',
               backgroundClip: 'text',
               textShadow: '0 0 8px rgba(212, 175, 55, 0.3)'
             }}>
            +$1,450,000
          </p>
        </div>

        <div className="bg-[#161618] border border-[#2C2C2C] rounded-lg p-4"
             style={{
               boxShadow: `
                 0 4px 12px rgba(0, 0, 0, 0.06),
                 inset 0 1px 1px rgba(255, 255, 255, 0.02),
                 inset 0 -1px 1px rgba(0, 0, 0, 0.4)
               `
             }}>
          <p className="text-xs text-[#a1a1a1] mb-1 font-medium uppercase tracking-wider">Expected Outflow</p>
          <p className="text-lg text-white font-bold"
             style={{
               textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8), -0.5px -0.5px 1px rgba(255, 255, 255, 0.1)'
             }}>
            -$697,000
          </p>
        </div>

      </div>

    </div>
  );
}
