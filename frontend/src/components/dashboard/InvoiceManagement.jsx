import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function InvoiceManagement({ invoices, handleSettle, handleSchedule, handleReview, automationLevel }) {
  
  const formatScheduledDate = (dueDate) => {
    if (!dueDate) return '';
    const dateParts = dueDate.split('-');
    if (dateParts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      if (mIdx >= 0 && mIdx < 12) {
        return `${months[mIdx]} ${day}`;
      }
    }
    return dueDate;
  };

  const getActionBadge = (invoice) => {
    if (invoice.settled) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-emerald-950/30 text-emerald-400 border-emerald-500/20">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Settled T+0</span>
        </div>
      );
    }

    if (invoice.scheduled) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-amber-950/20 text-[#fb923c] border-[#fb923c]/20">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Scheduled ({formatScheduledDate(invoice.dueDate)})</span>
        </div>
      );
    }

    const styles = {
      safe: 'bg-[#1a3d1a]/80 text-[#4ade80] border-[#4ade80]/20',
      delay: 'bg-[#3d2a1a]/80 text-[#fb923c] border-[#fb923c]/20',
      review: 'bg-[#3d1a1a]/80 text-[#f87171] border-[#f87171]/20',
    };

    const icons = {
      safe: CheckCircle,
      delay: Clock,
      review: AlertCircle,
    };

    const Icon = icons[invoice.aiAction.status];

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${styles[invoice.aiAction.status]}`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">{invoice.aiAction.message}</span>
      </div>
    );
  };

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
      
      {/* Table Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-xl text-white font-semibold mb-1"
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 8px rgba(212, 175, 55, 0.3)'
              }}>
            Invoice Management
          </h2>
          <p className="text-sm text-[#a1a1a1]">AI-optimized payment scheduling</p>
        </div>
        <button
          onClick={() => {
            // Optimistically settle all safe invoices!
            invoices.forEach(inv => {
              if (inv.aiAction.status === 'safe' && !inv.settled) {
                handleSettle(inv.id);
              }
            });
          }}
          className="px-6 py-3 rounded-lg transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
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
          }}
        >
          Optimize All Payments
        </button>
      </div>

      {/* Ledger Table */}
      {/* Desktop Ledger Table (visible on md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#2C2C2C]">
              <th className="py-3 px-4 text-xs font-bold text-[#6a6a6a] uppercase tracking-wider">Invoice ID</th>
              <th className="py-3 px-4 text-xs font-bold text-[#6a6a6a] uppercase tracking-wider">Supplier</th>
              <th className="py-3 px-4 text-xs font-bold text-[#6a6a6a] uppercase tracking-wider">Amount</th>
              <th className="py-3 px-4 text-xs font-bold text-[#6a6a6a] uppercase tracking-wider">Due Date</th>
              <th className="py-3 px-4 text-xs font-bold text-[#6a6a6a] uppercase tracking-wider">AI Action</th>
              <th className="py-3 px-4 text-xs font-bold text-[#6a6a6a] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const isSafe = invoice.aiAction.status === 'safe';
              const isDelay = invoice.aiAction.status === 'delay';
              const isReview = invoice.aiAction.status === 'review';

              return (
                <tr key={invoice.id} className="border-b border-[#1c1c1f] hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4 text-sm font-mono text-white/80">{invoice.id}</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white leading-none">{invoice.supplier}</span>
                        {invoice.hasFehuviaAccount ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/25 uppercase tracking-wider animate-pulse">
                            Partner
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/5 text-white/40 border border-white/10 uppercase tracking-wider">
                            Off-Ramp
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-white/30 font-mono mt-1 block truncate max-w-[160px]">{invoice.supplierWallet}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-extrabold text-white">${invoice.amount.toLocaleString()}</td>
                  <td className="py-4 px-4 text-sm text-[#a1a1a1]">{invoice.dueDate}</td>
                  <td className="py-4 px-4">{getActionBadge(invoice)}</td>
                  <td className="py-4 px-4">
                    {invoice.settled ? (
                      <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest flex items-center space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Cleared T+0</span>
                      </span>
                    ) : invoice.scheduled ? (
                      (() => {
                        const todayStr = (() => {
                          const d = new Date();
                          const y = d.getFullYear();
                          const m = String(d.getMonth() + 1).padStart(2, '0');
                          const day = String(d.getDate()).padStart(2, '0');
                          return `${y}-${m}-${day}`;
                        })();
                        const isPastOrToday = invoice.dueDate <= todayStr;
                        if (isPastOrToday) {
                          return (
                            <button
                              onClick={() => handleSettle(invoice.id)}
                              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                              style={{
                                background: 'linear-gradient(135deg, #fcf6ba 0%, #D4AF37 50%, #B8860B 100%)',
                                color: '#0a0a0a',
                                boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.2)',
                                textShadow: '0 1px 1px rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.15)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 175, 55, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.2)';
                              }}
                            >
                              Settle Now
                            </button>
                          );
                        }
                        return (
                          <span className="text-xs text-[#fb923c] font-bold uppercase tracking-widest flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Scheduled</span>
                          </span>
                        );
                      })()
                    ) : invoice.loading ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 text-xs font-bold uppercase tracking-wider flex items-center"
                      >
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#D4AF37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Settling...</span>
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        {(isSafe || automationLevel === 'manual') && (
                          <button
                            onClick={() => handleSettle(invoice.id)}
                            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                            style={{
                              background: 'linear-gradient(135deg, #fcf6ba 0%, #D4AF37 50%, #B8860B 100%)',
                              color: '#0a0a0a',
                              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.2)',
                              textShadow: '0 1px 1px rgba(255, 255, 255, 0.2)',
                              border: '1px solid rgba(255, 255, 255, 0.15)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 175, 55, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.2)';
                            }}
                          >
                            Settle via Morph
                          </button>
                        )}
                        {(isDelay || automationLevel === 'manual') && (
                          <button
                            onClick={() => handleSchedule(invoice.id)}
                            className="px-4 py-2 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 border border-orange-500/30 hover:border-orange-500/50 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                          >
                            Schedule
                          </button>
                        )}
                        {(isReview && automationLevel !== 'manual') && (
                          <button
                            onClick={() => handleReview(invoice.id)}
                            className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List (visible on md-) */}
      <div className="block md:hidden space-y-4">
        {invoices.map((invoice) => {
          const isSafe = invoice.aiAction.status === 'safe';
          const isDelay = invoice.aiAction.status === 'delay';
          const isReview = invoice.aiAction.status === 'review';

          return (
            <div
              key={invoice.id}
              className="p-4 rounded-xl border border-[#2C2C2C] bg-[#0c0c0e] flex flex-col gap-3"
              style={{
                boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02)'
              }}
            >
              {/* Top Row: ID + Badge */}
              <div className="flex items-center justify-between gap-2 border-b border-[#1c1c1f] pb-2">
                <span className="text-xs font-mono text-[#D4AF37] font-semibold">{invoice.id}</span>
                {getActionBadge(invoice)}
              </div>

              {/* Middle Section: Supplier + Amount */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Supplier</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">{invoice.supplier}</span>
                    {invoice.hasFehuviaAccount ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[7px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/25 uppercase tracking-wider animate-pulse">
                        Partner
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[7px] font-bold bg-white/5 text-white/40 border border-white/10 uppercase tracking-wider">
                        Off-Ramp
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block font-light">Amount</span>
                  <span className="text-sm font-black text-white">${invoice.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Bottom Section: Due date & Actions */}
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#1c1c1f] flex-wrap">
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-[#6a6a6a] block">Due Date</span>
                  <span className="text-xs text-[#a1a1a1]">{invoice.dueDate}</span>
                </div>

                <div className="flex items-center gap-2 justify-end flex-1 min-w-[120px]">
                  {invoice.settled ? (
                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Cleared</span>
                    </span>
                  ) : invoice.scheduled ? (
                    (() => {
                      const todayStr = (() => {
                        const d = new Date();
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        return `${y}-${m}-${day}`;
                      })();
                      const isPastOrToday = invoice.dueDate <= todayStr;
                      if (isPastOrToday) {
                        return (
                          <button
                            onClick={() => handleSettle(invoice.id)}
                            className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer w-full text-center"
                            style={{
                              background: 'linear-gradient(135deg, #fcf6ba 0%, #D4AF37 50%, #B8860B 100%)',
                              color: '#0a0a0a',
                              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.2)',
                              textShadow: '0 1px 1px rgba(255, 255, 255, 0.2)',
                              border: '1px solid rgba(255, 255, 255, 0.15)'
                            }}
                          >
                            Settle Now
                          </button>
                        );
                      }
                      return (
                        <span className="text-xs text-[#fb923c] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Scheduled</span>
                        </span>
                      );
                    })()
                  ) : invoice.loading ? (
                    <button
                      disabled
                      className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 text-xs font-bold uppercase tracking-wider flex items-center animate-pulse"
                    >
                      <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-[#D4AF37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Settling...</span>
                    </button>
                    ) : (
                      <div className="flex gap-2 w-full justify-end">
                        {(isSafe || automationLevel === 'manual') && (
                          <button
                            onClick={() => handleSettle(invoice.id)}
                            className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer w-full text-center"
                            style={{
                              background: 'linear-gradient(135deg, #fcf6ba 0%, #D4AF37 50%, #B8860B 100%)',
                              color: '#0a0a0a',
                              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.35)',
                              border: '1px solid rgba(255, 255, 255, 0.15)'
                            }}
                          >
                            Settle T+0
                          </button>
                        )}
                        {(isDelay || automationLevel === 'manual') && (
                          <button
                            onClick={() => handleSchedule(invoice.id)}
                            className="px-3.5 py-1.5 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 border border-orange-500/30 hover:border-orange-500/50 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all"
                          >
                            Schedule
                          </button>
                        )}
                        {(isReview && automationLevel !== 'manual') && (
                          <button
                            onClick={() => handleReview(invoice.id)}
                            className="px-3.5 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Metrics */}
      <div className="mt-6 flex items-center justify-between text-xs flex-wrap gap-4 border-t border-white/5 pt-4">
        <p className="text-[#a1a1a1] font-light">
          AI Recommendation: <span className="text-[#4ade80] font-semibold">Approve {invoices.filter(inv => inv.aiAction.status === 'safe' && !inv.settled).length} safe invoices</span> today to maintain optimal cash runway safety.
        </p>
        <div className="flex gap-2">
          <div className="px-3.5 py-1.5 bg-[#161618] rounded-lg border border-[#2C2C2C] font-mono text-xs">
            <span className="text-[#a1a1a1]">Active Queue: </span>
            <span className="text-white font-bold">
              ${invoices.filter(inv => !inv.settled).reduce((acc, inv) => acc + inv.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
