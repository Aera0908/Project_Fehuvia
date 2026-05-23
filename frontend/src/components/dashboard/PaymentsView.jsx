import React from 'react';
import { ExternalLink, CheckCircle, Wallet, ArrowUpRight, ShieldCheck } from 'lucide-react';

export function PaymentsView({ payments }) {
  return (
    <div className="space-y-8 animate-fadeIn font-outfit text-white">
      
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1"
              style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 8px rgba(212, 175, 55, 0.3)' }}>
            Morph Settled Payments Log
          </h2>
          <p className="text-sm text-[#a1a1a1]">Real-time immutable ledger of T+0 stablecoin disbursements</p>
        </div>
        
        <div className="flex items-center gap-2.5 px-4 py-2 border border-emerald-500/20 bg-emerald-950/10 rounded-lg text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>L2 Network Secured</span>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            label: 'Total Settled Capital',
            value: `$${payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            desc: `${payments.length} successful transactions`,
            accent: 'text-[#e4c37a]'
          },
          {
            label: 'Avg. L2 Gas Fee',
            value: '< $0.0001',
            desc: '99.9% cheaper than L1 Ethereum',
            accent: 'text-emerald-400'
          },
          {
            label: 'Rails Utilization',
            value: 'USDC on Morph L2',
            desc: 'T+0 instantaneous settlement',
            accent: 'text-white'
          }
        ].map((stat, i) => (
          <div key={i} className="plate-black-metallic shape-asymmetric-3 p-5 border border-[#2C2C2C]">
            <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-1 font-semibold">{stat.label}</span>
            <span className={`text-xl font-black tracking-wide block mb-1.5 ${stat.accent}`}>{stat.value}</span>
            <span className="text-[10px] text-white/50">{stat.desc}</span>
          </div>
        ))}
      </div>

      {/* Desktop Ledger Table (visible on md+) */}
      <div className="hidden md:block plate-black-metallic shape-asymmetric-1 p-6 overflow-x-auto border border-[#2C2C2C]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#2C2C2C] text-[#6a6a6a] text-xs font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Invoice ID</th>
              <th className="py-3 px-4">Recipient / Supplier</th>
              <th className="py-3 px-4">Destination Wallet</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Gas (L2 Fee)</th>
              <th className="py-3 px-4 text-right">L2 Tx Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 px-4 text-center text-sm text-white/30 font-light">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Wallet className="w-8 h-8 text-[#6a6a6a] animate-pulse" />
                    <span>No settled payments recorded on-chain yet.</span>
                    <span className="text-xs text-white/20">Go to the Invoices tab and settle pending obligations.</span>
                  </div>
                </td>
              </tr>
            ) : (
              [...payments].reverse().map((payment, index) => (
                <tr key={index} className="border-b border-[#161618] hover:bg-white/[0.01] transition-colors">
                  <td className="py-4 px-4 text-xs text-[#a1a1a1] whitespace-nowrap">{payment.timestamp}</td>
                  <td className="py-4 px-4 text-sm font-mono text-[#e4c37a]">{payment.invoiceId}</td>
                  <td className="py-4 px-4 text-sm font-bold text-white">{payment.supplier}</td>
                  <td className="py-4 px-4 text-xs font-mono text-white/50 whitespace-nowrap">
                    <span className="bg-white/5 px-2 py-1 rounded border border-white/5">
                      {payment.destination}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-extrabold text-white">${payment.amount.toLocaleString()}</td>
                  <td className="py-4 px-4 text-xs font-mono text-emerald-400">{payment.fee}</td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center gap-3 justify-end">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-emerald-950/20 text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle className="w-3 h-3" />
                        <span>Success</span>
                      </span>
                      <a
                        href={`https://explorer.morphl2.io/tx/${payment.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#6a6a6a] hover:text-[#e4c37a] transition-colors p-1"
                        title="View on Morph Explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List (visible on md-) */}
      <div className="block md:hidden space-y-4">
        {payments.length === 0 ? (
          <div className="py-12 px-4 text-center text-sm text-white/30 font-light border border-dashed border-[#2C2C2C] rounded-xl bg-[#0d0d0f]/50">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Wallet className="w-8 h-8 text-[#6a6a6a] animate-pulse" />
              <span>No settled payments recorded on-chain yet.</span>
            </div>
          </div>
        ) : (
          [...payments].reverse().map((payment, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-[#2C2C2C] bg-[#0c0c0e] flex flex-col gap-3"
              style={{
                boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02)'
              }}
            >
              {/* Top Row: Timestamp & Status badge */}
              <div className="flex items-center justify-between gap-2 border-b border-[#1c1c1f] pb-2">
                <span className="text-[10px] text-[#a1a1a1]">{payment.timestamp}</span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border bg-emerald-950/20 text-emerald-400 border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider">
                    <CheckCircle className="w-2.5 h-2.5" />
                    <span>Success</span>
                  </span>
                  <a
                    href={`https://explorer.morphl2.io/tx/${payment.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#6a6a6a] hover:text-[#e4c37a] transition-colors p-1"
                    title="View on Morph Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Middle Section: Recipient Supplier + Amount */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Recipient / Supplier</span>
                  <span className="text-sm font-bold text-white">{payment.supplier}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block font-light">Settled Amount</span>
                  <span className="text-sm font-black text-emerald-400">${payment.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Bottom Section: Destination Wallet + Gas fee */}
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#1c1c1f] text-xs flex-wrap">
                <div className="min-w-0 flex-1">
                  <span className="text-[8px] uppercase tracking-wider text-[#6a6a6a] block">Destination Wallet</span>
                  <p className="text-[10px] font-mono text-white/50 truncate max-w-[200px]" title={payment.destination}>
                    {payment.destination}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[8px] uppercase tracking-wider text-[#6a6a6a] block">L2 Gas Fee</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">{payment.fee}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
