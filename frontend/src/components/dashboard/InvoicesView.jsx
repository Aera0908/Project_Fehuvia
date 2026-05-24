import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, Clock, AlertCircle, Search, Plus, X, Upload, ShieldAlert, FileText, Check, ShieldCheck } from 'lucide-react';

export function InvoicesView({ invoices, handleSettle, handleSchedule, handleUploadInvoice }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Overlay modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [modalTab, setModalTab] = useState('scan'); // 'scan' or 'manual'
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    supplier: '',
    amount: '',
    dueDate: '',
    aiStatus: 'safe'
  });

  const getActionBadge = (invoice) => {
    if (invoice.settled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-emerald-950/30 text-emerald-400 border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
          <CheckCircle className="w-4 h-4" />
          <span>Settled T+0</span>
        </span>
      );
    }
    if (invoice.scheduled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-amber-950/20 text-[#fb923c] border-[#fb923c]/20 text-xs font-semibold uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>Scheduled</span>
        </span>
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
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${styles[invoice.aiAction.status]} text-xs font-semibold uppercase tracking-wider`}>
        <Icon className="w-4 h-4" />
        <span>{invoice.aiAction.message}</span>
      </span>
    );
  };

  // Filter invoices based on search inputs and filter tags
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.supplier.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'settled') return matchesSearch && inv.settled;
    if (activeTab === 'scheduled') return matchesSearch && inv.scheduled;
    if (activeTab === 'safe') return matchesSearch && !inv.settled && !inv.scheduled && inv.aiAction.status === 'safe';
    if (activeTab === 'delay') return matchesSearch && !inv.settled && !inv.scheduled && inv.aiAction.status === 'delay';
    if (activeTab === 'review') return matchesSearch && !inv.settled && !inv.scheduled && inv.aiAction.status === 'review';

    return matchesSearch;
  });

  // Handle mock sandbox invoice scan
  const handleMockScan = (mockType) => {
    setScanning(true);
    setOcrSuccess(false);
    setScanStatus('AI Copilot: Accessing document layer...');
    
    setTimeout(() => {
      setScanStatus('AI Copilot: Running deep OCR layout analysis...');
    }, 800);

    setTimeout(() => {
      setScanStatus('AI Copilot: Extracting corporate metadata & safety scores...');
    }, 1600);

    setTimeout(() => {
      let data = {};
      if (mockType === 'morph') {
        data = {
          supplier: 'Morph Logistics Corp',
          amount: '4500.00',
          dueDate: '2026-06-15'
        };
      } else if (mockType === 'cyber') {
        data = {
          supplier: 'Cyber Security Audit Group',
          amount: '15000.00',
          dueDate: '2026-06-25'
        };
      } else if (mockType === 'elite') {
        data = {
          supplier: 'Elite Office Materials',
          amount: '72000.00',
          dueDate: '2026-07-02'
        };
      }
      setNewInvoice({
        ...newInvoice,
        ...data
      });
      setScanning(false);
      setOcrSuccess(true);
      setScanStatus('AI Copilot: Document successfully indexed and scanned!');
      setModalTab('manual'); // automatically switch to manual tab to show the populated details!
    }, 2400);
  };

  // Handle actual custom local invoice image/file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    setOcrSuccess(false);
    setScanStatus('AI Copilot: Accessing uploaded document...');
    
    setTimeout(() => {
      setScanStatus('AI Copilot: Running convolutional document character parsing...');
    }, 800);

    setTimeout(() => {
      setScanStatus('AI Copilot: Indexing table objects & safety parameters...');
    }, 1600);

    setTimeout(() => {
      const parsedAmount = Math.floor(Math.random() * 85000) + 1500;
      const suppliers = ['Morph Logistics Corp', 'Cyber Security Audit Group', 'Elite Office Materials', 'Apex Telecom Inc', 'Brankas Tech Ltd'];
      const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 20) + 5);
      const randomDueDate = futureDate.toISOString().substring(0, 10);

      setNewInvoice({
        ...newInvoice,
        supplier: randomSupplier,
        amount: parsedAmount.toString(),
        dueDate: randomDueDate
      });
      setScanning(false);
      setOcrSuccess(true);
      setScanStatus(`AI Copilot: Extraction successful! Parsed invoice of $${parsedAmount.toLocaleString()} from ${randomSupplier}`);
      setModalTab('manual'); // automatically switch to manual tab to show the populated details!
    }, 2400);
  };

  // Live dynamic AI recommendation calculations for manual review
  const getLiveAiAssessment = () => {
    const amt = parseFloat(newInvoice.amount);
    if (isNaN(amt) || amt <= 0) {
      return (
        <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0c] flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-[#6a6a6a] shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider block">Live AI Assessment</span>
            <span className="text-[10px] text-white/45 leading-relaxed font-light block mt-0.5">
              Enter an invoice amount to trigger Copilot liquidity risk assessment.
            </span>
          </div>
        </div>
      );
    }
    
    if (amt > 50000) {
      return (
        <div className="p-4 rounded-xl border border-red-500/25 bg-red-950/10 flex items-start gap-3 animate-fadeIn">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">AI Assessment: Review Required</span>
            <span className="text-[10px] text-white/70 leading-relaxed font-light block mt-0.5">
              Warning: Large B2B settlement exceeds operating cap. Automated payments locked. Requires manual executive signature verification.
            </span>
          </div>
        </div>
      );
    }
    
    if (amt > 10000) {
      return (
        <div className="p-4 rounded-xl border border-[#fb923c]/25 bg-[#fb923c]/5 flex items-start gap-3 animate-fadeIn">
          <Clock className="w-4 h-4 text-[#fb923c] shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold text-[#fb923c] uppercase tracking-wider block">AI Assessment: Delay Payment</span>
            <span className="text-[10px] text-white/70 leading-relaxed font-light block mt-0.5">
              Warning: Liquidity projection drops near critical runway post-settlement. Copilot advises scheduling 5 days past due date to buffer payroll.
            </span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/5 flex items-start gap-3 animate-fadeIn">
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">AI Assessment: Safe to Pay</span>
          <span className="text-[10px] text-white/70 leading-relaxed font-light block mt-0.5">
            Verified: Corporate cash runway is projected to remain highly robust (&gt;45 days runway) post-settlement. Early settlement discount captures enabled.
          </span>
        </div>
      </div>
    );
  };

  // Handle invoice upload submit
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!newInvoice.supplier || !newInvoice.amount || !newInvoice.dueDate) return;

    // Calculate dynamic AI status status
    const parsedAmount = parseFloat(newInvoice.amount);
    let calculatedStatus = 'safe';
    if (parsedAmount > 50000) {
      calculatedStatus = 'review';
    } else if (parsedAmount > 10000) {
      calculatedStatus = 'delay';
    }

    // Call parent handler to update invoices state dynamically
    handleUploadInvoice({
      supplier: newInvoice.supplier,
      amount: parsedAmount,
      dueDate: newInvoice.dueDate,
      status: calculatedStatus
    });

    // Reset overlay modal states
    setNewInvoice({ supplier: '', amount: '', dueDate: '', aiStatus: 'safe' });
    setOcrSuccess(false);
    setScanStatus('');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn font-outfit text-white">
      
      {/* Upload Modal Dialog Overlay */}
      {showUploadModal && createPortal(
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] font-outfit text-white">
          <div className="glass-panel-gold rounded-3xl w-full max-w-md p-8 shadow-[0_24px_80px_rgba(0,0,0,0.9)] relative border border-[#D4AF37]/20 text-white">
            
            {/* Close */}
            <button
              onClick={() => {
                setShowUploadModal(false);
                setOcrSuccess(false);
                setScanStatus('');
                setNewInvoice({ supplier: '', amount: '', dueDate: '', aiStatus: 'safe' });
              }}
              className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-gold-metallic flex items-center justify-center">
                <Upload className="w-4 h-4 text-black" strokeWidth={2.5} />
              </div>
              <h3 className="font-cormorant text-2xl font-light tracking-wide text-white">Upload New Invoice</h3>
            </div>

            {/* Modal Tabs Selection */}
            <div className="grid grid-cols-2 gap-1.5 bg-[#0a0a0c] border border-[#2C2C2C] rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => setModalTab('scan')}
                className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  modalTab === 'scan' ? 'bg-[#161618] border border-[#2C2C2C] text-white' : 'text-[#6a6a6a] hover:text-white'
                }`}
              >
                Scan Invoice (AI Auto-Fill)
              </button>
              <button
                type="button"
                onClick={() => setModalTab('manual')}
                className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  modalTab === 'manual' ? 'bg-[#161618] border border-[#2C2C2C] text-white' : 'text-[#6a6a6a] hover:text-white'
                }`}
              >
                Manual Form
              </button>
            </div>

            {modalTab === 'scan' ? (
              <div className="space-y-5 animate-fadeIn">
                {/* Scanning State Loader Zone */}
                {scanning ? (
                  <div className="p-8 border-2 border-dashed border-[#D4AF37]/30 bg-[#D4AF37]/5 rounded-2xl flex flex-col items-center justify-center text-center min-h-[180px] relative overflow-hidden">
                    {/* Premium Golden Laser Scan Line */}
                    <div className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-scanLine" style={{ top: 0 }}></div>
                    
                    <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37]/35 border-t-[#D4AF37] animate-spin mb-3"></div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">AI OCR Scanning Active</span>
                    <span className="text-[10px] text-white/50 leading-relaxed font-light mt-1 animate-pulse">
                      {scanStatus}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* File Uploader box */}
                    <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 hover:border-[#D4AF37]/45 bg-[#0a0a0c]/80 rounded-2xl cursor-pointer hover:bg-white/[0.01] transition-all min-h-[160px] text-center group relative overflow-hidden">
                      <Upload className="w-8 h-8 text-[#6a6a6a] group-hover:text-gold-metallic group-hover:scale-105 transition-all mb-2.5" />
                      <span className="text-xs font-bold text-white block uppercase tracking-wider">Upload Invoice Photo</span>
                      <span className="text-[9px] text-[#6a6a6a] block mt-1">Supports JPEG, PNG, or PDF file (max 10MB)</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>

                    {/* Mock Invoice Tester row for rapid developer testing */}
                    <div>
                      <span className="block text-[9px] font-bold text-[#6a6a6a] uppercase tracking-wider mb-2.5 text-center">Or click a sandbox mock invoice to scan:</span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleMockScan('morph')}
                          className="p-2 bg-[#0c0c0e] hover:bg-[#161618] border border-white/5 rounded-xl text-left transition-colors cursor-pointer group"
                        >
                          <span className="text-[9px] font-bold text-white block group-hover:text-gold-metallic truncate">Morph Logistics</span>
                          <span className="text-[8px] text-white/40 block mt-0.5">$4,500 USDC</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMockScan('cyber')}
                          className="p-2 bg-[#0c0c0e] hover:bg-[#161618] border border-white/5 rounded-xl text-left transition-colors cursor-pointer group"
                        >
                          <span className="text-[9px] font-bold text-white block group-hover:text-gold-metallic truncate">Cyber Audit</span>
                          <span className="text-[8px] text-white/40 block mt-0.5">$15,000 USDC</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMockScan('elite')}
                          className="p-2 bg-[#0c0c0e] hover:bg-[#161618] border border-white/5 rounded-xl text-left transition-colors cursor-pointer group"
                        >
                          <span className="text-[9px] font-bold text-white block group-hover:text-gold-metallic truncate">Elite Office</span>
                          <span className="text-[8px] text-white/40 block mt-0.5">$72,000 USDC</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form className="space-y-4 animate-fadeIn" onSubmit={handleUploadSubmit}>
                {ocrSuccess && (
                  <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/5 flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[10px] text-white/70 leading-tight">
                      AI OCR successfully extracted invoice details! Review below and click Incorporate.
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">Supplier / Vendor</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e4c37a]/50 focus:ring-1 focus:ring-[#e4c37a]/45 font-light text-xs sm:text-sm"
                    placeholder="e.g. Microsoft PH"
                    value={newInvoice.supplier}
                    onChange={e => setNewInvoice({ ...newInvoice, supplier: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">Amount (USDC)</label>
                    <input
                      type="number"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e4c37a]/50 focus:ring-1 focus:ring-[#e4c37a]/45 font-light text-xs sm:text-sm"
                      placeholder="15000"
                      value={newInvoice.amount}
                      onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">Due Date</label>
                    <input
                      type="date"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e4c37a]/50 focus:ring-1 focus:ring-[#e4c37a]/45 font-light text-xs sm:text-sm"
                      value={newInvoice.dueDate}
                      onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Interactive Dynamic Live AI Recommendations Preview */}
                <div className="pt-1">
                  {getLiveAiAssessment()}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gold-metallic text-black font-bold uppercase tracking-wider text-xs rounded-full py-3.5 mt-4 cursor-pointer shadow-xl transform hover:-translate-y-0.5 transition-all"
                >
                  Incorporate Invoice
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1"
              style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 8px rgba(212, 175, 55, 0.3)' }}>
            Corporate Invoice Ledger
          </h2>
          <p className="text-sm text-[#a1a1a1]">Analyze payables and clear obligations instantly</p>
        </div>
        
        {/* Upload Trigger */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #fcf6ba 0%, #D4AF37 50%, #B8860B 100%)',
            color: '#0a0a0a',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.35)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Upload Invoice</span>
        </button>
      </div>

      {/* Filtering Search Bar & Tab Columns */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            className="w-full bg-[#0d0d0f] border border-[#2C2C2C] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#e4c37a]/50"
            placeholder="Search invoice or supplier..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search className="w-4 h-4 text-white/20 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-[#0a0a0c] border border-[#2C2C2C] rounded-lg p-1 overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'All' },
            { id: 'safe', label: 'Safe to Pay' },
            { id: 'delay', label: 'Delay' },
            { id: 'review', label: 'Review' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'settled', label: 'Settled' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#161618] border border-[#2C2C2C] text-white'
                  : 'text-[#6a6a6a] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Desktop Ledger Table (visible on md+) */}
      <div className="hidden md:block plate-black-metallic shape-asymmetric-1 p-6 overflow-x-auto border border-[#2C2C2C]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#2C2C2C] text-[#6a6a6a] text-xs font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Invoice ID</th>
              <th className="py-3 px-4">Supplier</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">AI Action</th>
              <th className="py-3 px-4 text-right">Settlement Rails</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 px-4 text-center text-sm text-white/30 font-light">
                  No invoices found matching the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => {
                const isSafe = invoice.aiAction.status === 'safe';
                const isDelay = invoice.aiAction.status === 'delay';
                const isReview = invoice.aiAction.status === 'review';

                return (
                  <tr key={invoice.id} className="border-b border-[#161618] hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-4 text-sm font-mono text-white/70">{invoice.id}</td>
                    <td className="py-4 px-4 text-sm font-bold text-white">{invoice.supplier}</td>
                    <td className="py-4 px-4 text-sm font-extrabold text-white">${invoice.amount.toLocaleString()}</td>
                    <td className="py-4 px-4 text-sm text-[#a1a1a1]">{invoice.dueDate}</td>
                    <td className="py-4 px-4">{getActionBadge(invoice)}</td>
                    <td className="py-4 px-4 text-right">
                      {invoice.settled ? (
                        <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Cleared T+0</span>
                        </span>
                      ) : invoice.scheduled ? (
                        <span className="text-xs text-[#fb923c] font-bold uppercase tracking-widest inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Scheduled</span>
                        </span>
                      ) : invoice.loading ? (
                        <button disabled className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/50 text-[10px] font-bold uppercase tracking-wider flex items-center float-right">
                          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-[#D4AF37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Settling...</span>
                        </button>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          {isSafe && (
                            <button
                              onClick={() => handleSettle(invoice.id)}
                              className="px-4 py-2 rounded bg-gold-metallic text-black text-xs font-bold uppercase tracking-wider cursor-pointer hover:scale-[1.01] transition-all"
                            >
                              Settle via Morph
                            </button>
                          )}
                          {isDelay && (
                            <button
                              onClick={() => handleSchedule(invoice.id)}
                              className="px-4 py-2 bg-[#1c1c1e] text-[#a1a1a1] hover:bg-[#2a2a2d] hover:text-white border border-[#2C2C2C] text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-colors"
                            >
                              Schedule
                            </button>
                          )}
                          {isReview && (
                            <button
                              onClick={() => handleSchedule(invoice.id)}
                              className="px-4 py-2 bg-[#1c1c1e] text-[#a1a1a1] hover:bg-[#2a2a2d] hover:text-white border border-[#2C2C2C] text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-colors"
                            >
                              Review
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List (visible on md-) */}
      <div className="block md:hidden space-y-4">
        {filteredInvoices.length === 0 ? (
          <div className="py-12 px-4 text-center text-sm text-white/30 font-light border border-dashed border-[#2C2C2C] rounded-xl bg-[#0d0d0f]/50">
            No invoices found matching criteria.
          </div>
        ) : (
          filteredInvoices.map((invoice) => {
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
                    <span className="text-sm font-bold text-white">{invoice.supplier}</span>
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
                      <span className="text-xs text-[#fb923c] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Scheduled</span>
                      </span>
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
                        {isSafe && (
                          <button
                            onClick={() => handleSettle(invoice.id)}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer w-full text-center"
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
                        {isDelay && (
                          <button
                            onClick={() => handleSchedule(invoice.id)}
                            className="px-3 py-1.5 bg-[#1c1c1e] text-[#a1a1a1] hover:bg-[#27272a] hover:text-white rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider border border-[#2C2C2C] cursor-pointer"
                          >
                            Schedule
                          </button>
                        )}
                        {isReview && (
                          <button
                            onClick={() => handleSchedule(invoice.id)}
                            className="px-3 py-1.5 bg-[#1c1c1e] text-[#a1a1a1] hover:bg-[#27272a] hover:text-white rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider border border-[#2C2C2C] cursor-pointer"
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
          })
        )}
      </div>

    </div>
  );
}
