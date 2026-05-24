import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, BookOpen, MessageSquare, ShieldCheck, Cpu, HardDrive, Check } from 'lucide-react';

export function HelpView({ onStartTour }) {
  const [activeFaq, setActiveFaq] = useState(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('general');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);
  
  // Real-time block height mock
  const [blockHeight, setBlockHeight] = useState(14829381);
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight(prev => prev + Math.floor(Math.random() * 2) + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const faqItems = [
    {
      q: "What is Fehuvia early settlement system?",
      a: "Fehuvia uses smart contracts on the Morph L2 blockchain to facilitate secure early settlement discount agreements. Suppliers upload invoices, and buyers settle them instantly with a touch of a button. The system enables automated early discounts that are locked and resolved dynamically in seconds."
    },
    {
      q: "How does the AI Copilot make recommendations?",
      a: "Our machine learning runway optimization agents scan your upcoming payables, average stablecoin interest rates, and historical payment performance. It computes an optimal Runway Health metric and flags which invoices can be delayed, paid early for discount capture, or cleared standard."
    },
    {
      q: "Is it safe to pay invoices via the Morph blockchain?",
      a: "Yes, fully secure. Every invoice settlement transaction undergoes pre-execution checkups inside our AI safety sandbox (detecting double spending, compliance threats, and invalid destination credentials) before launching to the Morph Testnet."
    },
    {
      q: "What stablecoins are supported for liquidity settlement?",
      a: "Fehuvia currently supports high-volume digital assets including USDC, USDT, and EURC for liquidity transactions. Settlement happens peer-to-peer and minimizes traditional cross-border FX fees."
    }
  ];

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    
    // Trigger successful mock submission
    setTicketSent(true);
    setTimeout(() => {
      setTicketSent(false);
      setTicketSubject('');
      setTicketMessage('');
    }, 5000);
  };

  return (
    <div className="space-y-8 font-outfit animate-[fadeIn_0.4s_ease-out]">
      
      {/* Page Header */}
      <div className="border-b border-[#2C2C2C] pb-6">
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <HelpCircle className="w-6 h-6 text-[#D4AF37]" />
          Help & Support Desk
        </h1>
        <p className="text-xs text-[#6a6a6a] mt-1">
          Review core Web3 system documentation, browse FAQs, monitor network telemetry, or submit a support ticket.
        </p>
      </div>

      {/* Diagnostics & Documentation Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core System Documentation Cards */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs text-[#6a6a6a] uppercase tracking-wider font-bold">Documentation categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {[
              {
                icon: BookOpen,
                color: 'text-[#D4AF37] border-[#D4AF37]/25 bg-[#D4AF37]/5',
                title: "Morph L2 Setup Guide",
                desc: "Learn to hook up MetaMask, obtain Morph test tokens, and execute zero-latency invoice clearing."
              },
              {
                icon: Cpu,
                color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
                title: "AI Runway Optimization",
                desc: "Understand how the Runway optimization metrics are calculated and how delay targets preserve working capital."
              },
              {
                icon: ShieldCheck,
                color: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
                title: "Safety Sandboxing",
                desc: "Deep dive into compliance checks, vendor wallet assertions, and invoice double-spend defenses."
              },
              {
                icon: HardDrive,
                color: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
                title: "Discount Smart Contracts",
                desc: "Read specifications on discount dynamic escrow, rate-locking mechanisms, and settlement logs."
              }
            ].map((doc, idx) => {
              const Icon = doc.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-[#2C2C2C] bg-[#0c0c0e]/80 hover:border-[#a1a1a1]/30 transition-all flex gap-4 cursor-pointer group"
                >
                  <div className={`w-10 h-10 rounded-xl border shrink-0 flex items-center justify-center ${doc.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-gold-metallic transition-colors leading-tight">{doc.title}</h3>
                    <p className="text-[11px] text-[#6a6a6a] mt-1.5 leading-relaxed">{doc.desc}</p>
                  </div>
                </div>
              );
            })}

          </div>

          {/* Interactive FAQs Accordion */}
          <div className="space-y-4 pt-4">
            <h2 className="text-xs text-[#6a6a6a] uppercase tracking-wider font-bold">Frequently Asked Questions</h2>
            
            <div className="space-y-2.5">
              {faqItems.map((item, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#2C2C2C] bg-[#08080a] overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs font-bold text-white hover:bg-white/[0.01] transition-colors cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <ChevronDown className={`w-4 h-4 text-[#6a6a6a] transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} />
                    </button>
                    
                    <div className={`transition-all duration-300 overflow-hidden ${
                      isOpen ? 'max-h-32 opacity-100 border-t border-[#1b1b1d]' : 'max-h-0 opacity-0'
                    }`}>
                      <p className="p-4 text-[11px] text-[#a1a1a1] leading-relaxed bg-[#0a0a0c]/60">
                        {item.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Support Ticket Submission form & Live Web3 Diagnostics */}
        <div className="space-y-6">
          
          {/* Diagnostic Widget */}
          <div className="p-5 rounded-2xl border border-[#2C2C2C] bg-[#0a0a0c]/90 space-y-4"
               style={{
                 boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.01)'
               }}>
            <div>
              <h2 className="text-xs text-[#6a6a6a] uppercase tracking-wider font-bold">System Diagnostics</h2>
              <p className="text-[10px] text-[#6a6a6a] mt-1">Live smart contract telemetry feed</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-[#1b1b1d] pb-2 text-[11px]">
                <span className="text-[#6a6a6a]">Morph Chain Node</span>
                <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  Testnet Active
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#1b1b1d] pb-2 text-[11px]">
                <span className="text-[#6a6a6a]">Block Height</span>
                <span className="font-mono text-white font-bold">{blockHeight.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#1b1b1d] pb-2 text-[11px]">
                <span className="text-[#6a6a6a]">Contract Latency</span>
                <span className="font-mono text-white">42 ms</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#1b1b1d] pb-2 text-[11px]">
                <span className="text-[#6a6a6a]">Discount Engine</span>
                <span className="font-mono text-gold-metallic font-bold">v1.0.4-Morph</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#6a6a6a]">Morph L2 Gas Limit</span>
                <span className="font-mono text-emerald-400 font-bold">&lt; 0.0001 ETH</span>
              </div>
            </div>

            {/* Retake Tour Button */}
            <div className="border-t border-[#1b1b1d] pt-4">
              <button
                onClick={onStartTour}
                className="w-full py-2.5 text-xs font-bold text-center text-white border border-gold-metallic/30 hover:border-gold-metallic hover:bg-gold-metallic/5 rounded-lg transition-all cursor-pointer uppercase tracking-wider"
              >
                Retake Workstation Tour
              </button>
            </div>
          </div>

          {/* Support Ticket Console */}
          <div className="p-5 rounded-2xl border border-[#2C2C2C] bg-[#0a0a0c]/80 relative overflow-hidden"
               style={{
                 boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.01)'
               }}>
            
            {ticketSent && (
              <div className="absolute inset-0 bg-[#070708]/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center animate-[fadeIn_0.25s_ease-out]">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xs text-white uppercase tracking-wider font-bold">Ticket Submitted</h3>
                <p className="text-[11px] text-[#6a6a6a] mt-2 max-w-[200px] leading-relaxed">
                  Support ticket lodged successfully. Fehuvia engineers will review and respond within 2 hours.
                </p>
              </div>
            )}

            <div>
              <h2 className="text-xs text-[#6a6a6a] uppercase tracking-wider font-bold">Lodge Support Ticket</h2>
              <p className="text-[10px] text-[#6a6a6a] mt-1">Get custom solutions from core engineers</p>
            </div>

            <form onSubmit={handleSupportSubmit} className="space-y-3.5 pt-4">
              <div>
                <label className="block text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider mb-1">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full bg-[#070708] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#a1a1a1]/30"
                >
                  <option value="general">General Inquiry</option>
                  <option value="settlement">Morph Contract Settlement</option>
                  <option value="ai">AI Copilot & Optimizations</option>
                  <option value="wallet">Wallet Connection & Web3</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Settlement transaction error"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-[#070708] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-[#a1a1a1]/30"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider mb-1">Message</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Provide transaction hashes or specific error alerts..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full bg-[#070708] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-[#a1a1a1]/30 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-center text-[#0a0a0a] rounded-lg transition-all hover:scale-[1.01] hover:shadow-[0_4px_12px_rgba(212,175,55,0.25)] cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #fcf6ba 0%, #D4AF37 50%, #B8860B 100%)',
                  boxShadow: '0 2px 8px rgba(212, 175, 55, 0.2)'
                }}
              >
                Submit Ticket
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
