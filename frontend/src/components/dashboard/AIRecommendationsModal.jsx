import React, { useState, useEffect } from 'react';
import { X, ArrowUpDown, ShieldCheck, ShieldAlert, Cpu, Calendar, TrendingUp } from 'lucide-react';

export default function AIRecommendationsModal({ isOpen, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, safe, delay, review
  const [sortField, setSortField] = useState('date'); // date, status, amount
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

  const sortingOptions = [
    { value: 'date-desc', label: 'Date (Newest First)' },
    { value: 'date-asc', label: 'Date (Oldest First)' },
    { value: 'amount-desc', label: 'Amount (Highest First)' },
    { value: 'amount-asc', label: 'Amount (Lowest First)' },
    { value: 'status-asc', label: 'Status (Action Required First)' },
    { value: 'status-desc', label: 'Status (Safe First)' }
  ];

  const activeOption = sortingOptions.find(opt => opt.value === `${sortField}-${sortOrder}`) || sortingOptions[0];

  // Fetch history only ONCE when the modal opens to prevent loading flicker blinks
  useEffect(() => {
    if (isOpen) {
      const fetchHistory = async () => {
        setLoading(true);
        const token = localStorage.getItem('fehuvia_token');
        if (!token) return;

        try {
          const res = await fetch(`${API_BASE}/api/recommendations`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setHistory(data);
          }
        } catch (err) {
          console.error('Error fetching recommendation history:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // 1. Filter locally
  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  // 2. Sort locally (Instantaneous in-memory transition with ZERO loading blinks!)
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortField === 'status') {
      const statusOrder = { 'safe': 1, 'review': 2, 'delay': 3 };
      comparison = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
    } else {
      // date
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 font-outfit text-white animate-fadeIn">
      
      {/* Modal Plate container */}
      <div 
        className="w-full max-w-5xl bg-[#0d0d0f] border border-[#2C2C2C] rounded-2xl flex flex-col max-h-[85vh] shadow-[0_24px_50px_rgba(0,0,0,0.9)] overflow-hidden"
        style={{
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02)'
        }}
      >
        
        {/* Header bar */}
        <div className="px-6 py-5 border-b border-[#2C2C2C] flex items-center justify-between bg-[#0a0a0c]/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-metallic/10 border border-gold-metallic/20 flex items-center justify-center text-gold-metallic shadow-[0_0_15px_rgba(212,175,55,0.15)]">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide"
                  style={{ 
                    fontFamily: "'Montserrat', sans-serif",
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 8px rgba(212, 175, 55, 0.3)' 
                  }}>
                AI Recommendation Ledger
              </h2>
              <p className="text-xs text-[#a1a1a1]">Immutable historical record of automated CFO predictions & advice</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors flex items-center justify-center text-white/50 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Controls */}
        <div className="px-6 py-4 border-b border-[#1b1b1d] bg-[#0c0c0e]/50 flex flex-wrap items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#050507] border border-[#2C2C2C] rounded-lg p-1">
            {[
              { id: 'all', label: 'All Recommendations' },
              { id: 'safe', label: 'Safe to Pay' },
              { id: 'delay', label: 'Postponed' },
              { id: 'review', label: 'Manual Review' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-1.5 rounded text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                  filter === tab.id
                    ? 'bg-[#1c1c1f] text-white border border-[#2C2C2C]'
                    : 'text-[#6a6a6a] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Custom Sorting Dropdown */}
          <div className="flex items-center gap-2 relative">
            <span className="text-xs text-[#6a6a6a]">Sort by:</span>
            
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-[#161618] border border-[#2C2C2C] hover:border-gold-metallic/40 text-gold-metallic text-xs rounded px-4 py-2 font-bold cursor-pointer transition-all flex items-center justify-between gap-2 min-w-[210px]"
            >
              <span>{activeOption.label}</span>
              <span className="text-[10px] opacity-75">▼</span>
            </button>

            {dropdownOpen && (
              <>
                {/* Overlay backdrop to catch click outside */}
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[#161618] border border-[#2C2C2C] shadow-[0_15px_35px_rgba(0,0,0,0.8)] z-50 overflow-hidden divide-y divide-[#2C2C2C]/20 animate-fadeIn">
                  {sortingOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        const [field, order] = opt.value.split('-');
                        setSortField(field);
                        setSortOrder(order);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-xs transition-colors cursor-pointer block ${
                        opt.value === activeOption.value
                          ? 'bg-[#2C2C2C]/50 text-gold-metallic font-bold'
                          : 'text-white/80 hover:bg-[#2c2c2c]/30 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>

        {/* Ledger Table Section */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          
          {loading ? (
            <div className="py-24 text-center text-[#6a6a6a] flex flex-col items-center justify-center gap-3">
              <Cpu className="w-8 h-8 text-[#6a6a6a] animate-spin" />
              <span className="text-sm font-light">Decrypting historical optimization ledger...</span>
            </div>
          ) : sortedHistory.length === 0 ? (
            <div className="py-24 text-center text-[#6a6a6a] border border-dashed border-[#2C2C2C] rounded-xl bg-white/[0.01]">
              <p className="text-sm font-light">No recommendation records matching the filter tab.</p>
              <span className="text-xs text-white/20">Recommendations are automatically generated during AI Cashflow Prediction audits.</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2C2C2C] text-[#6a6a6a] text-[10px] font-bold uppercase tracking-widest bg-[#09090b]/50">
                  <th className="py-3 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('date')}>
                    <div className="flex items-center gap-1.5">
                      <span>Prediction Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Recipient / Supplier</th>
                  <th className="py-3 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('amount')}>
                    <div className="flex items-center gap-1.5">
                      <span>Amount</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('status')}>
                    <div className="flex items-center gap-1.5">
                      <span>AI Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">AI Co-pilot Analysis & Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161618]">
                {sortedHistory.map((item, index) => {
                  const isSafe = item.status === 'safe';
                  const isDelay = item.status === 'delay';
                  
                  return (
                    <tr key={index} className="hover:bg-white/[0.01] transition-colors group">
                      {/* Prediction Date */}
                      <td className="py-4 px-4 text-xs text-[#a1a1a1] whitespace-nowrap font-light">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#6a6a6a]" />
                          <span>{new Date(item.createdAt).toLocaleString()}</span>
                        </div>
                      </td>
                      
                      {/* Invoice ID */}
                      <td className="py-4 px-4 text-sm font-mono text-[#e4c37a] font-bold">
                        {item.invoiceId}
                      </td>

                      {/* Supplier */}
                      <td className="py-4 px-4 text-sm text-white font-bold group-hover:text-gold-metallic transition-colors">
                        {item.supplier}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 text-sm font-black text-white whitespace-nowrap">
                        ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${
                          isSafe 
                            ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' 
                            : isDelay 
                            ? 'bg-rose-950/20 border-rose-500/20 text-rose-400'
                            : 'bg-amber-950/20 border-amber-500/20 text-amber-400'
                        }`}>
                          {isSafe ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                          <span>{isSafe ? 'Safe to Pay' : isDelay ? 'Postpone' : 'Review'}</span>
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-4 px-4 text-xs text-white/70 leading-relaxed font-light max-w-md">
                        {item.reason}
                        {item.predictedRunway && (
                          <span className="block mt-1.5 text-[10px] text-emerald-400/80 font-mono">
                            ↳ Predicted Runway Safety: {item.predictedRunway} days
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2C2C2C] bg-[#09090b] flex items-center justify-between text-xs text-[#6a6a6a]">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-gold-metallic" />
            <span>Fehuvia Intelligent CFO v1.2</span>
          </div>
          <span>Total Predictions Generated: {filteredHistory.length} records</span>
        </div>

      </div>

    </div>
  );
}
