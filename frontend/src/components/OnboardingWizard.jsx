import React, { useState, useEffect } from 'react';
import { Cpu, ShieldAlert, Sparkles, Wallet, Sliders, ChevronRight, ChevronLeft, Check, CheckCircle2, X } from 'lucide-react';
import { ethers } from 'ethers';
import { getFriendlyError } from '../utils/errorMessages';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export default function OnboardingWizard({ setView }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [automationLevel, setAutomationLevel] = useState('semi'); // 'auto', 'semi', 'manual'
  const [riskProfile, setRiskProfile] = useState('balanced'); // 'defensive', 'balanced', 'aggressive'
  const [walletAddress, setWalletAddress] = useState('');

  // EVM Wallet Modal states
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState([]);

  // Check and list installed wallets dynamically (installed first)
  const checkInstalledWallets = () => {
    const isMetaMask = !!(window.ethereum && window.ethereum.isMetaMask);
    const isCoinbase = !!(window.coinbaseWalletExtension || (window.ethereum && window.ethereum.isCoinbaseWallet));
    const isOKX = !!window.okxwallet;
    const isRainbow = !!(window.ethereum && window.ethereum.isRainbow);

    const walletList = [
      { id: 'metamask', name: 'MetaMask', isInstalled: isMetaMask, installUrl: 'https://metamask.io/download/', logoBg: 'bg-[#E17026]' },
      { id: 'coinbase', name: 'Coinbase Wallet', isInstalled: isCoinbase, installUrl: 'https://www.coinbase.com/wallet', logoBg: 'bg-[#0052FF]' },
      { id: 'okx', name: 'OKX Wallet', isInstalled: isOKX, installUrl: 'https://www.okx.com/web3', logoBg: 'bg-[#000000]' },
      { id: 'rainbow', name: 'Rainbow', isInstalled: isRainbow, installUrl: 'https://rainbow.me/', logoBg: 'bg-[#0E76FD]' },
      { id: 'walletconnect', name: 'WalletConnect', isInstalled: false, installUrl: 'https://walletconnect.com/', logoBg: 'bg-[#3B99FC]' }
    ];

    // Sort: installed wallets first!
    const sorted = walletList.sort((a, b) => (b.isInstalled ? 1 : 0) - (a.isInstalled ? 1 : 0));
    setDetectedWallets(sorted);
  };

  // Run detection on mount and whenever the selection modal opens
  useEffect(() => {
    checkInstalledWallets();
  }, [isWalletModalOpen]);

  // Clear any active errors when transitioning between steps
  useEffect(() => {
    setError('');
  }, [step]);

  // Handle wallet connection inside the wizard
  const handleConnectWallet = async (walletId = 'metamask') => {
    setError('');
    
    if (walletId === 'walletconnect') {
      setError('WalletConnect integration is only available in production mainnet.');
      return;
    }

    let providerSource = window.ethereum;
    if (walletId === 'metamask') {
      if (window.ethereum?.providers) {
        providerSource = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum;
      } else if (window.ethereum?.isMetaMask) {
        providerSource = window.ethereum;
      }
    } else if (walletId === 'okx' && window.okxwallet) {
      providerSource = window.okxwallet;
    } else if (walletId === 'coinbase' && window.coinbaseWalletExtension) {
      providerSource = window.coinbaseWalletExtension;
    }

    if (!providerSource) {
      setError('The selected EVM wallet extension is not installed in your browser.');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(providerSource);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      // Switch chain requests (local Hardhat Node or Morph)
      const initialChainIdHex = await providerSource.request({ method: 'eth_chainId' });
      let chainId = Number(initialChainIdHex);

      if (chainId !== 2910 && chainId !== 2818) {
        // Automatically request network switch to Morph Testnet (Chain ID: 2910, hex: 0xb5e)
        try {
          await providerSource.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xb5e' }],
          });
          // Re-fetch network details after switch approval
          const hexChainId = await providerSource.request({ method: 'eth_chainId' });
          chainId = Number(hexChainId);
        } catch (switchError) {
          // If the network is not added to the user's wallet extension, request to add it!
          if (switchError.code === 4902 || switchError.message?.toLowerCase().includes('unrecognized')) {
            try {
              await providerSource.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xb5e',
                  chainName: 'Morph Testnet',
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://rpc-hoodi.morph.network'],
                  blockExplorerUrls: ['https://explorer-testnet.morph.network']
                }],
              });
              // Re-fetch network details after add
              const hexChainId = await providerSource.request({ method: 'eth_chainId' });
              chainId = Number(hexChainId);
            } catch (addError) {
              console.error('Failed to add Morph Testnet chain:', addError);
            }
          } else {
            console.error('Failed to switch Morph Testnet chain:', switchError);
          }
        }
      }

      // Re-verify after switch attempt
      if (chainId !== 2910 && chainId !== 2818) {
        setError('Please switch your wallet to Morph Testnet (Chain ID: 2910) to continue.');
        return;
      }

      setError('');
      setWalletAddress(address);
      setIsWalletModalOpen(false); // Close selection modal on success
    } catch (err) {
      console.error('Wizard wallet connection failed:', err);
      setError('Connection failed. Please authorize the wallet request in MetaMask.');
    }
  };

  const renderWalletLogo = (id) => {
    const urls = {
      metamask: 'https://raw.githubusercontent.com/rainbow-me/rainbowkit/main/packages/rainbowkit/src/wallets/walletConnectors/metaMaskWallet/metaMaskWallet.svg',
      coinbase: 'https://raw.githubusercontent.com/rainbow-me/rainbowkit/main/packages/rainbowkit/src/wallets/walletConnectors/coinbaseWallet/coinbaseWallet.svg',
      okx: 'https://raw.githubusercontent.com/rainbow-me/rainbowkit/main/packages/rainbowkit/src/wallets/walletConnectors/okxWallet/okxWallet.svg',
      rainbow: 'https://raw.githubusercontent.com/rainbow-me/rainbowkit/main/packages/rainbowkit/src/wallets/walletConnectors/rainbowWallet/rainbowWallet.svg',
      walletconnect: 'https://raw.githubusercontent.com/rainbow-me/rainbowkit/main/packages/rainbowkit/src/wallets/walletConnectors/walletConnectWallet/walletConnectWallet.svg'
    };

    if (urls[id]) {
      return (
        <img 
          src={urls[id]} 
          alt={`${id} logo`} 
          className="w-7 h-7 object-contain" 
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    }
    return <Wallet className="w-5 h-5 text-white" />;
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
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          automationLevel,
          riskProfile,
          walletAddress: walletAddress || null
        })
      });

      const contentType = res.headers.get('content-type') || '';
      const responseText = await res.text();

      let data = null;
      if (contentType.includes('application/json')) {
        try {
          data = responseText ? JSON.parse(responseText) : null;
        } catch {
          throw new Error('Backend returned malformed JSON during onboarding.');
        }
      } else {
        throw new Error('server_unavailable');
      }

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
      localStorage.setItem('fehuvia_onboarding_completed', 'true');
      localStorage.removeItem('fehuvia_coach_viewed');

      // 3. Complete onboarding
      setView('dashboard');
    } catch (err) {
      console.error('Onboarding submission failed:', err);
      setError(getFriendlyError(err, 'general'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] flex items-center justify-center p-4 font-outfit text-white relative overflow-hidden">
      
      {/* Decorative premium radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none"></div>

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
        <div className="min-h-65 flex flex-col justify-center">

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
                      onClick={() => setIsWalletModalOpen(true)}
                      className="w-full py-5 bg-[#0a0a0c] hover:bg-[#D4AF37]/5 border border-[#2C2C2C] hover:border-gold-metallic rounded-2xl flex flex-col items-center gap-2.5 transition-all duration-300 cursor-pointer group hover:scale-[1.01]"
                    >
                      <Wallet className="w-6 h-6 text-[#6a6a6a] group-hover:text-gold-metallic group-hover:scale-105 transition-all" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Connect EVM Wallet</span>
                      <span className="text-[9px] text-[#6a6a6a]">Select from installed browser wallets to link L2</span>
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

      {/* EVM Wallet Selection Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] font-outfit">
          <div className="glass-panel-gold rounded-3xl w-full max-w-md p-8 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative border border-[#D4AF37]/20 text-white">
            
            {/* Close Button */}
            <button
              onClick={() => setIsWalletModalOpen(false)}
              className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <Wallet className="w-10 h-10 text-gold-metallic mx-auto mb-3" />
              <h2 className="font-cormorant text-2xl font-light tracking-wide text-white">
                Connect EVM Wallet
              </h2>
              <p className="text-white/40 text-xs font-light mt-1">
                Select an injected browser extension wallet to establish your non-custodial L2 settlement key.
              </p>
            </div>

            {/* Wallet List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {detectedWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => {
                    if (wallet.isInstalled || wallet.id === 'walletconnect') {
                      handleConnectWallet(wallet.id);
                    } else {
                      window.open(wallet.installUrl, '_blank');
                    }
                  }}
                  className="w-full p-4 bg-[#0a0a0c] hover:bg-[#161618] border border-[#2C2C2C] hover:border-gold-metallic/40 rounded-2xl flex items-center justify-between transition-all duration-300 cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-4">
                    {/* Injected Premium SVG Wallet Logo */}
                    <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center bg-[#141416] border border-white/5 shadow-md overflow-hidden transition-transform duration-300 group-hover:scale-105">
                      {renderWalletLogo(wallet.id)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-gold-metallic transition-colors">
                        {wallet.name}
                      </span>
                      <span className="text-[9px] text-[#6a6a6a] block mt-0.5">
                        {wallet.id === 'walletconnect' ? 'Connect via QR Code scan' : `Connect using ${wallet.name} extension`}
                      </span>
                    </div>
                  </div>

                  {/* Installed Status Badge */}
                  <div className="flex items-center">
                    {wallet.id === 'walletconnect' ? (
                      <span className="text-[8px] font-bold text-[#6a6a6a] bg-white/5 border border-white/5 px-2 py-0.5 rounded uppercase tracking-wider">
                        EVM Rail
                      </span>
                    ) : wallet.isInstalled ? (
                      <span className="text-[8px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse"></span>
                        Installed
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold text-zinc-500 bg-zinc-950/20 border border-zinc-800/20 px-2 py-0.5 rounded uppercase tracking-wider hover:text-white hover:border-white/30 transition-colors">
                        Get Extension
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <p className="text-[9px] text-center text-white/30 leading-relaxed font-light mt-6">
              *Fehuvia links your address securely for transaction signing. Your private keys never leave your custody.
            </p>

          </div>
        </div>
      )}
    </div>
  );
}
