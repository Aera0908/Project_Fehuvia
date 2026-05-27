import React, { useState } from 'react';
import { User, Shield, Key, Sliders, CheckCircle2, Copy, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

export function ProfileView({ 
  userProfile = {}, 
  handleUpdateAutomationLevel,
  onResetDemo
}) {
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

  const userEmail = userProfile.email || 'admin@fehuvia.com';
  const businessName = userProfile.username || userEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' Corp';
  const isConnected = !!userProfile.walletAddress;
  const walletAddress = userProfile.walletAddress || 'Not Connected';

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
        
        {/* Left Side: General Profile + Web3 settings (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">

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
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">Business Name</label>
                <input
                  type="text"
                  readOnly
                  value={businessName}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/60 focus:outline-none cursor-not-allowed font-light text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value={userEmail}
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

            {/* Automation Mode Tabs Selector */}
            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#e4c37a]/80 block">Workstation Automation Mode</span>
              <div className="grid grid-cols-3 gap-1.5 bg-[#0a0a0c] border border-[#2C2C2C] rounded-xl p-1">
                {[
                  { id: 'auto', label: 'Auto' },
                  { id: 'semi', label: 'Co-Pilot' },
                  { id: 'manual', label: 'Manual' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleUpdateAutomationLevel && handleUpdateAutomationLevel(opt.id)}
                    className={`py-2 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      (userProfile.automationLevel || 'semi') === opt.id
                        ? 'bg-[#161618] border border-[#2C2C2C] text-[#D4AF37]'
                        : 'text-[#6a6a6a] hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
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
                id: 'aiRecommendations',
                title: 'AI Recommendations',
                desc: 'Enable strategic CFO forecasts & guides',
                value: userProfile.automationLevel !== 'manual',
                onToggle: () => {
                  const nextLevel = userProfile.automationLevel === 'manual' ? 'semi' : 'manual';
                  if (handleUpdateAutomationLevel) {
                    handleUpdateAutomationLevel(nextLevel);
                  }
                }
              },
              {
                id: 'autoOptimize',
                title: 'Auto-Optimize Railing',
                desc: 'Instantly schedule delay paths',
                value: toggles.autoOptimize,
                onToggle: () => handleToggle('autoOptimize')
              },
              {
                id: 'discountCapture',
                title: 'Capture Early Discounts',
                desc: 'Prioritize prompt T+0 cash back',
                value: toggles.discountCapture,
                onToggle: () => handleToggle('discountCapture')
              },
              {
                id: 'postponeWarning',
                title: 'Pre-Payment Verification',
                desc: 'Mandatory human approval logs',
                value: toggles.postponeWarning,
                onToggle: () => handleToggle('postponeWarning')
              },
              {
                id: 'auditTrail',
                title: 'On-chain Audit Trails',
                desc: 'Write settled details to Morph L2',
                value: toggles.auditTrail,
                onToggle: () => handleToggle('auditTrail')
              }
            ].map((toggle) => (
              <div key={toggle.id} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <span className="text-xs font-bold text-white block leading-tight mb-0.5">{toggle.title}</span>
                  <span className="text-[10px] text-white/40 block leading-tight font-light">{toggle.desc}</span>
                </div>
                
                <button
                  onClick={toggle.onToggle}
                  className="text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  {toggle.value ? (
                    <ToggleRight className="w-9 h-9 text-[#D4AF37]" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-[#6a6a6a]" />
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Presentation Demo Utilities Panel */}
          {onResetDemo && (
            <div className="mt-8 border-t border-white/5 pt-6 space-y-4">
              <div className="flex items-center gap-2 text-gold-metallic">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Presentation Demo Mode</span>
              </div>
              <div className="p-4 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/5 space-y-3">
                <p className="text-[10px] text-white/70 leading-relaxed font-light">
                  Fehuvia is operating in presentation sandbox mode. You can instantly restore all invoices, GCash linkages, Cashflow runway logs, and wallet balances to pristine seeded states for pitch demonstrations.
                </p>
                <button
                  onClick={onResetDemo}
                  className="w-full py-2 rounded-lg bg-gold-metallic hover:brightness-110 active:scale-[0.98] text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  style={{
                    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.25)'
                  }}
                >
                  Reset Demo Database
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
