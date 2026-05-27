import React, { useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, ShieldAlert } from 'lucide-react';
import AIRecommendationsModal from './AIRecommendationsModal';

export function AICopilot({ predictions }) {
  const [modalOpen, setModalOpen] = useState(false);

  let insights = [];

  if (predictions && predictions.copilot_insights && predictions.copilot_insights.length > 0) {
    insights = predictions.copilot_insights.map(item => {
      const typeLower = item.type.toLowerCase();
      const type = item.title || item.type.charAt(0).toUpperCase() + item.type.slice(1);
      const icon = typeLower === 'opportunity' 
        ? TrendingUp 
        : typeLower === 'alert' 
        ? ShieldAlert 
        : Sparkles;
      const priority = typeLower === 'alert' 
        ? 'high' 
        : typeLower === 'opportunity' 
        ? 'low' 
        : 'medium';

      return {
        icon,
        type,
        message: item.message,
        priority
      };
    });
  } else if (predictions && predictions.recommendations && predictions.recommendations.length > 0) {
    const apiInsights = predictions.recommendations.map(rec => {
      const type = rec.status === 'safe' 
        ? 'Safe to Pay' 
        : rec.status === 'delay' 
        ? 'Delay payment' 
        : 'Audit review';
      const icon = rec.status === 'safe' 
        ? TrendingUp 
        : rec.status === 'delay' 
        ? AlertTriangle 
        : Sparkles;
      const priority = rec.status === 'safe' 
        ? 'low' 
        : rec.status === 'delay' 
        ? 'high' 
        : 'medium';

      return {
        icon,
        type,
        message: `${rec.invoiceId}: ${rec.reason}`,
        priority
      };
    });

    const sorted = [...apiInsights].sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });

    insights = sorted.slice(0, 3);
  }

  return (
    <div className="relative bg-[#0d0d0f] border border-[#2C2C2C] rounded-xl overflow-hidden font-outfit h-full"
         style={{
           boxShadow: `
             0 8px 24px rgba(0, 0, 0, 0.08),
             0 2px 8px rgba(0, 0, 0, 0.06),
             inset 0 1px 1px rgba(255, 255, 255, 0.03),
             inset 0 -1px 1px rgba(0, 0, 0, 0.5)
           `,
           background: 'linear-gradient(145deg, #0d0d0d 0%, #0a0a0a 50%, #080808 100%)'
         }}>
      <div className="p-6 flex flex-col justify-between h-full">
        
        {/* Header section */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
               style={{
                 background: 'linear-gradient(135deg, #fcf6ba 0%, #D4AF37 50%, #B8860B 100%)',
                 boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.3)'
               }}>
            <Sparkles className="w-6 h-6 text-[#0a0a0a]" />
          </div>
          <div>
            <h3 className="text-lg text-white font-semibold"
                style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 8px rgba(212, 175, 55, 0.3)'
                }}>
              AI Financial Copilot
            </h3>
            <p className="text-xs text-[#a1a1a1]">Real-time strategic recommendations</p>
          </div>
        </div>

        {/* Insight List */}
        <div className="space-y-4 flex-1">
          {insights.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 animate-pulse">
              <Sparkles className="w-8 h-8 text-[#6a6a6a] mb-3" />
              <p className="text-xs text-white/70 font-semibold mb-1">No Strategic Recommendations</p>
              <p className="text-[10px] text-[#6a6a6a] leading-relaxed">
                Your B2B treasury pipeline is empty. Upload invoices to activate the AI CFO and trigger automated liquidity analysis.
              </p>
            </div>
          ) : (
            insights.map((insight, index) => {
              const Icon = insight.icon;
              const typeLower = insight.type.toLowerCase();
              
              let colors = { bg: 'rgba(74, 222, 128, 0.08)', border: 'rgba(74, 222, 128, 0.3)', icon: '#4ade80' }; // Default Opportunity/Green
              
              if (typeLower === 'alert') {
                colors = { bg: 'rgba(248, 113, 113, 0.08)', border: 'rgba(248, 113, 113, 0.3)', icon: '#f87171' }; // Alert/Red
              } else if (typeLower === 'insight') {
                colors = { bg: 'rgba(56, 189, 248, 0.08)', border: 'rgba(56, 189, 248, 0.3)', icon: '#38bdf8' }; // Insight/Blue
              } else if (typeLower === 'opportunity') {
                colors = { bg: 'rgba(74, 222, 128, 0.08)', border: 'rgba(74, 222, 128, 0.3)', icon: '#4ade80' }; // Opportunity/Green
              } else {
                // Backward compatibility priority mapping
                const priorityColors = {
                  high: { bg: 'rgba(212, 175, 55, 0.08)', border: 'rgba(212, 175, 55, 0.4)', icon: '#D4AF37' },
                  medium: { bg: 'rgba(251, 146, 60, 0.08)', border: 'rgba(251, 146, 60, 0.3)', icon: '#fb923c' },
                  low: { bg: 'rgba(74, 222, 128, 0.08)', border: 'rgba(74, 222, 128, 0.3)', icon: '#4ade80' }
                };
                colors = priorityColors[insight.priority] || priorityColors.low;
              }

              return (
                <div key={index}
                     className="p-4 rounded-lg bg-[#161618] border border-[#2C2C2C]"
                     style={{
                       boxShadow: `
                         0 4px 12px rgba(0, 0, 0, 0.06),
                         inset 0 1px 1px rgba(255, 255, 255, 0.02),
                         inset 0 -1px 1px rgba(0, 0, 0, 0.4)
                       `
                     }}>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border"
                         style={{
                           backgroundColor: colors.bg,
                           borderColor: colors.border,
                           boxShadow: `0 0 8px ${colors.icon}20`
                         }}>
                      <Icon className="w-4 h-4" style={{ color: colors.icon }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
                         style={{
                           color: colors.icon,
                           textShadow: `0 0 4px ${colors.icon}30`
                         }}>
                        {insight.type}
                      </p>
                      <p className="text-xs text-white/80 leading-relaxed font-light">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* View Details Button */}
        <button 
          onClick={() => setModalOpen(true)}
          className="w-full mt-5 px-4 py-3.5 rounded-lg text-xs uppercase font-bold tracking-wider transition-all cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #fcf6ba 0%, #D4AF37 50%, #B8860B 100%)',
            color: '#0a0a0a',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.2)',
            textShadow: '0 1px 1px rgba(255, 255, 255, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(212, 175, 55, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.2)';
          }}>
          View All Recommendations
        </button>
      </div>
      
      <AIRecommendationsModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </div>
  );
}
