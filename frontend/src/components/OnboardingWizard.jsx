import React, { useState } from 'react';
import { Cpu, ShieldAlert, Sparkles, Wallet, Sliders, ChevronRight, ChevronLeft, Check, CheckCircle2 } from 'lucide-react';
import { ethers } from 'ethers';

const API_BASE = 'http://localhost:3001';

export default function OnboardingWizard({ setView }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [automationLevel, setAutomationLevel] = useState('semi'); // 'auto', 'semi', 'manual'
  const [riskProfile, setRiskProfile] = useState('balanced'); // 'defensive', 'balanced', 'aggressive'
  const [walletAddress, setWalletAddress] = useState('');

  // Handle wallet connection inside the wizard
  const handleConnectWallet = async () => {
    setError('');
    if (!window.ethereum) {
      setError('MetaMask or another EVM wallet is required to connect.');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      // Switch chain requests (local Hardhat Node or Morph)
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      if (chainId !== 31337 && chainId !== 2818) {
        setError('Please switch MetaMask to Hardhat Localhost (Chain ID: 31337) or Morph Testnet.');
      }

      setWalletAddress(address);
    } catch (err) {
      console.error('Wizard wallet connection failed:', err);
      setError('Connection failed. Please authorize the wallet request in MetaMask.');
    }
  };

  const handleCompleteSetup = async () => {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('fehuvia_token');
    if (!token) {
      setError('Session expired. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      // 1. Submit preferences to backend API
      const res = await fetch(`${API_BASE}/api/auth/onboarding`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          automationLevel,
          riskProfile,
          walletAddress: walletAddress || null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register onboarding settings.');
      }

      // 2. Update local storage session cache
      const storedUser = JSON.parse(localStorage.getItem('fehuvia_user') || '{}');
      const updatedUser = {
        ...storedUser,
        automationLevel,
        riskProfile,
        walletAddress: walletAddress || undefined
      };
      localStorage.setItem('fehuvia_user', JSON.stringify(updatedUser));

      // 3. Complete onboarding
      setView('dashboard');
    } catch (err) {
      console.error('Onboarding submission failed:', err);
      setError(err.message || 'Failed to finalize setup. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] flex items-center justify-center p-4 font-outfit text-white relative overflow-hidden">
      
      {/* Decorative premium radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none"></div>

      <div className="glass-panel-gold rounded-3xl w-full max-w-2xl p-8 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.9)] relative animate-fadeIn z-10">
        
        {/* Step Progress Tracker bar */}
        <div className="flex items-center justify-between mb-10 max-w-md mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#2C2C2C] -translate-y-1/2 z-0"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-gold-metallic -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>

          {[1, 2, 3].map((num) => (
            <div 
              key={num}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border z-10 transition-all duration-300 ${
                step >= num 
                  ? 'bg-gold-metallic text-black border-gold-metallic shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                  : 'bg-[#0a0a0c] border-[#2C2C2C] text-[#6a6a6a]'
              }`}
            >
              {step > num ? <Check className="w-4 h-4" strokeWidth={3} /> : num}
            </div>
          ))}
        </div>

        {/* Wizard Header */}
        <div className="text-center mb-8">
          <h1 className="font-cormorant text-3xl md:text-4xl font-light tracking-wide mb-2 text-white">
            Configure Your Workstation
          </h1>
          <p className="text-white/40 text-xs md:text-sm font-light">
            Set up secure permissions, risk tolerances, and settlement keys for your treasury.
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-medium animate-[fadeIn_0.2s_ease-out] text-center">
            {error}
          </div>
        )}

        {/* Step content panels */}
        <div className="min-h-[260px] flex flex-col justify-center">

          {/* STEP 1: AUTOPILOT CONFIG */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center max-w-md mx-auto mb-4">
                <h3 className="font-semibold text-white text-base flex items-center justify-center gap-2">
                  <Cpu className="w-4 h-4 text-[#D4AF37]" /> Step 1: Treasury Autopilot Levels
                </h3>
                <p className="text-xs text-white/50 mt-1 font-light">
                  Define what permissions you delegate to the Fehuvia AI runway controller.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'auto',
                    title: 'Autopilot (Fully Auto)',
                    desc: 'Instantly captures early discounts and delays high-risk payables automatically.',
                    tag: 'Aggressive'
                  },
                  {
                    id: 'semi',
                    title: 'Co-Pilot (Semi-Auto)',
                    desc: 'AI generates optimal payment paths but requires explicit human approval before execution.',
                    tag: 'Recommended'
                  },
                  {
                    id: 'manual',
                    title: 'Manual (Pure Ledger)',
                    desc: 'Behaves purely as a digital ledger. All forecasting and payables run strictly on your schedule.',
                    tag: 'Standard'
                  }
                ].map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setAutomationLevel(option.id)}
                    className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col text-left ${
                      automationLevel === option.id
                        ? 'bg-[#D4AF37]/5 border-gold-metallic shadow-[0_0_15px_rgba(212,175,55,0.08)]'
                        : 'bg-[#0a0a0c] border-[#2C2C2C] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{option.title}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        option.id === 'semi' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/5 text-white/40'
                      }`}>{option.tag}</span>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed font-light mt-auto">
                      {option.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: METAMASK WALLET CONFIG */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center max-w-md mx-auto mb-4">
                <h3 className="font-semibold text-white text-base flex items-center justify-center gap-2">
                  <Wallet className="w-4 h-4 text-[#D4AF37]" /> Step 2: Connect Settlement Wallet
                </h3>
                <p className="text-xs text-white/50 mt-1 font-light">
                  Required to execute non-custodial smart settlements on the Morph L2 network.
                </p>
              </div>

              <div className="max-w-md mx-auto flex flex-col items-center">
                {walletAddress ? (
                  <div className="w-full p-5 bg-[#D4AF37]/5 border border-gold-metallic rounded-2xl flex flex-col items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Morph Settlement Key Active</span>
                      <span className="text-xs font-mono text-white/80 select-all leading-none">{walletAddress}</span>
                    </div>
                    <button 
                      onClick={() => setWalletAddress('')}
                      className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider mt-1 cursor-pointer"
                    >
                      Disconnect & Swap Wallet
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-3">
                    <button
                      onClick={handleConnectWallet}
                      className="w-full py-5 bg-[#0a0a0c] hover:bg-[#D4AF37]/5 border border-[#2C2C2C] hover:border-gold-metallic rounded-2xl flex flex-col items-center gap-2.5 transition-all duration-300 cursor-pointer group hover:scale-[1.01]"
                    >
                      <Wallet className="w-6 h-6 text-[#6a6a6a] group-hover:text-gold-metallic group-hover:scale-105 transition-all" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Connect MetaMask Wallet</span>
                      <span className="text-[9px] text-[#6a6a6a]">Securely link your L2 settlement address</span>
                    </button>

                    <div className="text-center py-2 relative">
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 -translate-y-1/2 z-0"></div>
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest bg-[#070708] px-3 relative z-10">Or</span>
                    </div>

                    <button
                      onClick={() => setStep(3)}
                      className="w-full py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Skip Wallet Connection for Now
                    </button>
                    <p className="text-[9px] text-center text-white/30 leading-relaxed font-light">
                      *Note: If you skip wallet connection, dashboard features will be locked behind a Web3 secure blur until a key is established.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: RISK TOLERANCE CONFIG */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center max-w-md mx-auto mb-4">
                <h3 className="font-semibold text-white text-base flex items-center justify-center gap-2">
                  <Sliders className="w-4 h-4 text-[#D4AF37]" /> Step 3: Treasury Risk Parameter
                </h3>
                <p className="text-xs text-white/50 mt-1 font-light">
                  Calibrate how aggressive the AI Copilot is in capturing payment discounts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'defensive',
                    title: 'Defensive Mode',
                    desc: 'Prioritizes maximum liquidity runway conservation. Ideal for businesses facing tight credit windows.',
                    tag: 'Conservative'
                  },
                  {
                    id: 'balanced',
                    title: 'Balanced Mode',
                    desc: 'Captures discounts while ensuring operating runway remains above 30 days.',
                    tag: 'Optimal'
                  },
                  {
                    id: 'aggressive',
                    title: 'Aggressive Mode',
                    desc: 'Maximizes early-payment discount yields. Captures high returns at the expense of temporary cash drawdowns.',
                    tag: 'High Yield'
                  }
                ].map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setRiskProfile(option.id)}
                    className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col text-left ${
                      riskProfile === option.id
                        ? 'bg-[#D4AF37]/5 border-gold-metallic shadow-[0_0_15px_rgba(212,175,55,0.08)]'
                        : 'bg-[#0a0a0c] border-[#2C2C2C] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{option.title}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        option.id === 'balanced' ? 'bg-[#4ade80]/20 text-[#4ade80]' : 'bg-white/5 text-white/40'
                      }`}>{option.tag}</span>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed font-light mt-auto">
                      {option.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between mt-10 border-t border-white/5 pt-6">
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1}
            className={`flex items-center gap-1.5 px-5 py-3 text-xs font-bold uppercase tracking-wider border border-[#2C2C2C] hover:bg-white/5 text-white rounded-xl transition-all cursor-pointer ${
              step === 1 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="flex items-center gap-1.5 px-6 py-3 text-xs font-bold uppercase tracking-wider bg-gold-metallic text-black rounded-xl hover:scale-[1.01] transition-all cursor-pointer shadow-lg"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCompleteSetup}
              disabled={loading}
              className="flex items-center gap-1.5 px-6 py-3 text-xs font-bold uppercase tracking-wider bg-gold-metallic text-black rounded-xl hover:scale-[1.01] transition-all cursor-pointer shadow-lg disabled:opacity-60"
            >
              {loading ? 'Finalizing Setup...' : 'Complete Workstation Setup'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
