import React, { useState } from 'react';
import { User, Wallet, Shield, Key, Sliders, CheckCircle2, Copy, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

export function ProfileView() {
  const [walletConnected, setWalletConnected] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  const [riskTolerance, setRiskTolerance] = useState(65); // percentage slider

  // Toggles
  const [toggles, setToggles] = useState({
    autoOptimize: true,
    discountCapture: true,
    postponeWarning: false,
    auditTrail: true,
  });

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyKey = () => {
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn font-outfit text-white">
      
      {/* Header bar */}
      <div>
        <h2 className="text-xl font-semibold mb-1"
            style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 8px rgba(212, 175, 55, 0.3)' }}>
          Profile & Workstation Settings
        </h2>
        <p className="text-sm text-[#a1a1a1]">Configure Web3 settlement rails, API connections, and AI Copilot configurations</p>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: General Profile + Wallet connection (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Connected Wallet Plate */}
          <div className="plate-black-metallic shape-asymmetric-1 p-6 border border-[#2C2C2C]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-gold-metallic">
                <Wallet className="w-4 h-4" />
              </div>
              <h3 className="font-cormorant text-2xl font-light tracking-wide text-white">Morph Settlement Wallet</h3>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-[#0a0a0c] border border-[#2C2C2C] rounded-2xl">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Morph Testnet Connected</span>
                </div>
                <p className="text-sm font-mono text-white/80 select-all">0x9d3fB7A215E9f1165A98C72B9eB4d693fE3eA23e</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-white/40">Network: <strong className="text-white/60">Morph L2</strong></span>
                  <span className="text-xs text-white/40">Gas Token: <strong className="text-white/60">ETH</strong></span>
                </div>
              </div>

              <button
                onClick={() => setWalletConnected(!walletConnected)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  walletConnected
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                    : 'bg-gold-metallic text-black hover:scale-[1.01]'
                }`}
              >
                {walletConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
              </button>
            </div>
          </div>

          {/* Section 2: General Admin profile settings form */}
          <div className="plate-black-metallic shape-asymmetric-3 p-6 border border-[#2C2C2C]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-gold-metallic">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-cormorant text-2xl font-light tracking-wide text-white">General Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">Username</label>
                <input
                  type="text"
                  readOnly
                  value="Admin User"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/60 focus:outline-none cursor-not-allowed font-light text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value="admin@fehuvia.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/60 focus:outline-none cursor-not-allowed font-light text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">Notifications Webhook URL</label>
                <input
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e4c37a]/50 focus:ring-1 focus:ring-[#e4c37a]/40 font-light text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: API Credentials Panel */}
          <div className="plate-black-metallic shape-asymmetric-2 p-6 border border-[#2C2C2C]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-gold-metallic">
                <Key className="w-4 h-4" />
              </div>
              <h3 className="font-cormorant text-2xl font-light tracking-wide text-white">Integrations & API Tokens</h3>
            </div>
            <p className="text-xs text-white/40 mb-6 font-light">
              Connect external billing tools and ERP channels directly to the Fehuvia core processing engine.
            </p>

            <div className="bg-[#0a0a0c] border border-[#2C2C2C] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <span className="text-[9px] uppercase tracking-widest text-white/30 block mb-1 font-semibold">Active Secret Token</span>
                <span className="text-xs font-mono text-white/70 block truncate">sk_live_fehuvia_b89c05d39e12b94ac00918ef</span>
              </div>
              
              <button
                onClick={handleCopyKey}
                className="w-10 h-10 shrink-0 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
                title="Copy API Token"
              >
                {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: AI risk configurations & Sliders */}
        <div className="space-y-6">
          
          {/* Card 1: AI Risk Tolerance Configuration */}
          <div className="plate-black-metallic shape-asymmetric-4 p-6 border border-[#2C2C2C]">
            <div className="flex items-center gap-2 mb-2 text-gold-metallic">
              <Sliders className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">AI Agent Parameters</span>
            </div>
            <h4 className="text-white text-base font-semibold mb-2">Treasury Risk Level</h4>
            <p className="text-xs text-white/50 leading-relaxed font-light mb-6">
              Adjusts the AI Copilot threshold for early payment optimization and postponing high-risk invoices.
            </p>

            {/* Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#a1a1a1]">Defensive</span>
                <span className="text-gold-metallic font-bold">{riskTolerance}% Yield Capture</span>
                <span className="text-[#a1a1a1]">Aggressive</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={riskTolerance}
                onChange={e => setRiskTolerance(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
              />
              <div className="text-[9px] font-mono text-center text-white/40">
                Recommended threshold: <span className="text-gold-metallic font-bold">65%</span> (Balanced Mode)
              </div>
            </div>
          </div>

          {/* Card 2: AI Automation Switches */}
          <div className="plate-black-metallic shape-asymmetric-3 p-6 border border-[#2C2C2C] space-y-5">
            <div className="flex items-center gap-2 text-gold-metallic border-b border-white/5 pb-3">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Security Toggles</span>
            </div>

            {[
              {
                id: 'autoOptimize',
                title: 'Auto-Optimize Railing',
                desc: 'Instantly schedule delay paths',
              },
              {
                id: 'discountCapture',
                title: 'Capture Early Discounts',
                desc: 'Prioritize prompt T+0 cash back',
              },
              {
                id: 'postponeWarning',
                title: 'Pre-Payment Verification',
                desc: 'Mandatory human approval logs',
              },
              {
                id: 'auditTrail',
                title: 'On-chain Audit Trails',
                desc: 'Write settled details to Morph L2',
              }
            ].map((toggle) => (
              <div key={toggle.id} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <span className="text-xs font-bold text-white block leading-tight mb-0.5">{toggle.title}</span>
                  <span className="text-[10px] text-white/40 block leading-tight font-light">{toggle.desc}</span>
                </div>
                
                <button
                  onClick={() => handleToggle(toggle.id)}
                  className="text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  {toggles[toggle.id] ? (
                    <ToggleRight className="w-9 h-9 text-[#D4AF37]" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-[#6a6a6a]" />
                  )}
                </button>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
