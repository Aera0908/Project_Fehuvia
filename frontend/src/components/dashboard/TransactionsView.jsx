import React, { useState, useEffect } from 'react';
import { History, Search, ArrowUpRight, ArrowDownLeft, Copy, Check, ExternalLink, Calendar, Filter, RefreshCw, Layers } from 'lucide-react';

export function TransactionsView({ API_BASE = 'http://localhost:3001', setToast }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'settlement', 'conversion'
  const [copiedId, setCopiedId] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('fehuvia_token');
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCopyHash = (txHash, id) => {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setCopiedId(id);
    if (setToast) {
      setToast({
        show: true,
        message: 'Transaction hash copied to clipboard.',
        txHash: `${txHash.substring(0, 10)}...`
      });
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered transactions
  const filtered = transactions.filter(tx => {
    const matchesSearch = 
      (tx.txHash && tx.txHash.toLowerCase().includes(search.toLowerCase())) ||
      (tx.referenceId && tx.referenceId.toLowerCase().includes(search.toLowerCase())) ||
      (tx.bankName && tx.bankName.toLowerCase().includes(search.toLowerCase())) ||
      (tx.type && tx.type.toLowerCase().includes(search.toLowerCase()));

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'settlement') return matchesSearch && tx.type === 'invoice_settlement';
    if (filterType === 'conversion') return matchesSearch && tx.type === 'coin_conversion';
    return matchesSearch;
  });

  // Calculate statistics
  const totalSettledUSD = transactions
    .filter(tx => tx.type === 'invoice_settlement')
    .reduce((sum, tx) => sum + Number(tx.amountUsd || 0), 0);

  const totalConversionsUSD = transactions
    .filter(tx => tx.type === 'coin_conversion')
    .reduce((sum, tx) => sum + Number(tx.amountUsd || 0), 0);

  const formatTxHash = (hash) => {
    if (!hash) return 'N/A';
    if (hash.startsWith('0xmock')) {
      return `${hash.substring(0, 10)} (Mock)`;
    }
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn font-outfit text-white">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-wide flex items-center gap-2"
              style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 8px rgba(212, 175, 55, 0.3)' }}>
            <History className="w-5 h-5 text-gold-metallic" />
            Corporate Transaction Ledger
          </h2>
          <p className="text-xs text-[#a1a1a1] mt-0.5">
            Unified real-time transaction telemetry of Morph L2 stablecoin settlements and traditional open banking conversion bridges.
          </p>
        </div>
        <button 
          onClick={fetchTransactions}
          className="self-start sm:self-center px-3 py-1.5 rounded-lg border border-[#2C2C2C] bg-[#101012] hover:bg-[#161618] text-[#a1a1a1] hover:text-white transition-all text-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Ledger
        </button>
      </div>

      {/* 2. Transaction Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card A: Total Invoices Settled */}
        <div className="plate-black-metallic p-5 rounded-2xl border border-[#2C2C2C] relative overflow-hidden"
             style={{ boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02)' }}>
          <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider block">USDC Settled Volume</span>
          <span className="text-2xl font-black text-white block mt-2 font-mono text-gold-metallic">
            ${totalSettledUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[9px] text-[#a1a1a1] mt-1.5 block">
            ₱{(totalSettledUSD * 58.30).toLocaleString(undefined, { maximumFractionDigits: 0 })} PHP • Instant Testnet Rails
          </span>
        </div>

        {/* Card B: Total Conversion Volume */}
        <div className="plate-black-metallic p-5 rounded-2xl border border-[#2C2C2C] relative overflow-hidden"
             style={{ boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02)' }}>
          <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <ArrowDownLeft className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider block">Bridge Conversion Volume</span>
          <span className="text-2xl font-black text-white block mt-2 font-mono text-gold-metallic">
            ${totalConversionsUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[9px] text-[#a1a1a1] mt-1.5 block">
            ₱{(totalConversionsUSD * 58.30).toLocaleString(undefined, { maximumFractionDigits: 0 })} PHP • StraitsX Smart Liquidity
          </span>
        </div>

        {/* Card C: On-Chain Gas Speed */}
        <div className="plate-black-metallic p-5 rounded-2xl border border-[#2C2C2C] relative overflow-hidden"
             style={{ boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02)' }}>
          <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
            <Layers className="w-4 h-4 text-gold-metallic" />
          </div>
          <span className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider block">Settlement Finality</span>
          <span className="text-2xl font-black text-white block mt-2 font-mono text-emerald-400">
            Instant T+0
          </span>
          <span className="text-[9px] text-[#a1a1a1] mt-1.5 block">
            Morph Layer 2 Failsafe • 3s average block time
          </span>
        </div>

      </div>

      {/* 3. Filtering and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-[#2C2C2C] bg-[#0c0c0e]/60 backdrop-blur-md">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a6a6a]" />
          <input
            type="text"
            placeholder="Search hash, invoice, bank..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#101012] border border-[#2C2C2C] rounded-lg text-xs text-white placeholder-[#6a6a6a] focus:outline-none focus:border-[#D4AF37]/50 transition-all font-sans"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-[#6a6a6a]" />
          <div className="flex bg-[#101012] border border-[#2C2C2C] rounded-lg p-0.5 gap-0.5">
            {[
              { id: 'all', label: 'All Actions' },
              { id: 'settlement', label: 'Settlements' },
              { id: 'conversion', label: 'Conversions' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filterType === f.id
                    ? 'bg-gold-metallic text-black'
                    : 'text-[#a1a1a1] hover:text-white hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Transactions List Table */}
      <div className="plate-black-metallic rounded-2xl border border-[#2C2C2C] overflow-hidden"
           style={{ boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02), 0 8px 30px rgba(0, 0, 0, 0.5)' }}>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-t-gold-metallic border-[#2C2C2C] animate-spin"></div>
              <p className="text-xs text-[#a1a1a1] uppercase tracking-widest font-bold">Querying Morph Testnet Ledger...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#101012] border border-[#2C2C2C] flex items-center justify-center mb-4">
                <History className="w-5 h-5 text-[#6a6a6a]" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Transactions Found</h3>
              <p className="text-xs text-[#6a6a6a] mt-1">There are no logged transactions matching the current filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-[#2C2C2C] bg-white/[0.01] text-[10px] font-bold uppercase tracking-wider text-[#6a6a6a]">
                  <th className="py-4 px-5">Date & Time</th>
                  <th className="py-4 px-4">Transaction Type</th>
                  <th className="py-4 px-4">Reference</th>
                  <th className="py-4 px-4">Morph Testnet TxHash</th>
                  <th className="py-4 px-4 text-right">Amount (USD)</th>
                  <th className="py-4 px-5 text-right">Amount (PHP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161618] text-xs">
                {filtered.map((tx) => {
                  const isSettlement = tx.type === 'invoice_settlement';
                  const isConversion = tx.type === 'coin_conversion';
                  const isFiatToToken = tx.direction === 'fiat_to_token';
                  
                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors">
                      
                      {/* Timestamp */}
                      <td className="py-4 px-5 text-white/70 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#6a6a6a]" />
                          {formatDate(tx.timestamp)}
                        </span>
                      </td>

                      {/* Type Badge */}
                      <td className="py-4 px-4">
                        {isSettlement ? (
                          tx.direction === 'incoming' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wide bg-emerald-950/20 text-emerald-400 border border-emerald-500/25">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              Payment Received
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wide bg-red-950/20 text-red-400 border border-red-500/25">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse"></span>
                              B2B Settlement
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wide bg-blue-950/20 text-blue-400 border border-blue-500/25">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                            {isFiatToToken ? 'PHP ➔ USDC Bridge' : 'USDC ➔ PHP Bridge'}
                          </span>
                        )}
                      </td>

                      {/* Reference */}
                      <td className="py-4 px-4 font-bold text-white font-mono uppercase">
                        {isSettlement ? (
                          <span className="text-[#e4c37a]/90 hover:text-white transition-colors cursor-pointer">
                            {tx.referenceId}
                          </span>
                        ) : (
                          <span className="text-white/60">
                            {tx.bankName || 'Treasury'}
                          </span>
                        )}
                      </td>

                      {/* Hash & Copy & Explorer */}
                      <td className="py-4 px-4 font-mono text-white/50">
                        {tx.txHash ? (
                          <div className="flex items-center gap-2">
                            <span>{formatTxHash(tx.txHash)}</span>
                            
                            <button
                              onClick={() => handleCopyHash(tx.txHash, tx.id)}
                              className="p-1 rounded bg-[#101012] border border-[#2C2C2C] hover:text-white transition-colors cursor-pointer active:scale-90"
                              title="Copy Hash"
                            >
                              {copiedId === tx.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-[#6a6a6a] hover:text-white" />
                              )}
                            </button>

                            {tx.txHash && !tx.txHash.startsWith('0xmock') && (
                              <a
                                href={`https://explorer-hoodi.morph.network/tx/${tx.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded bg-[#101012] border border-[#2C2C2C] text-[#6a6a6a] hover:text-white transition-colors flex items-center justify-center"
                                title="View on Morph Explorer"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#6a6a6a] italic">Pending gas...</span>
                        )}
                      </td>

                      {/* Amount USD */}
                      <td className={`py-4 px-4 text-right font-bold font-mono text-sm ${
                        isSettlement 
                          ? (tx.direction === 'incoming' ? 'text-emerald-400' : 'text-red-400/90') 
                          : (isFiatToToken ? 'text-emerald-400' : 'text-amber-400')
                      }`}>
                        {isSettlement 
                          ? (tx.direction === 'incoming' ? '+' : '-') 
                          : (isFiatToToken ? '+' : '-')
                        }${Number(tx.amountUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Amount PHP */}
                      <td className="py-4 px-5 text-right font-bold font-mono text-white/80 whitespace-nowrap">
                        ₱{Number(tx.amountPhp || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
}
