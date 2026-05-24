import React, { useState } from 'react';
import { X, ShieldCheck, Key, Landmark, AlertCircle } from 'lucide-react';

export default function BrankasLinkModal({ isOpen, onClose, onLinkSuccess }) {
  const [selectedBank, setSelectedBank] = useState(null); // 'bdo', 'bpi', 'ubp', 'gcash', 'maya'
  const [loginId, setLoginId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const banks = [
    { id: 'ubp', name: 'UnionBank of the Philippines', logoBg: 'bg-[#FF6600]', short: 'UnionBank' },
    { id: 'bdo', name: 'Banco de Oro (BDO)', logoBg: 'bg-[#0033A0]', short: 'BDO' },
    { id: 'bpi', name: 'Bank of the Philippine Islands (BPI)', logoBg: 'bg-[#980000]', short: 'BPI' },
    { id: 'gcash', name: 'GCash Corporate Wallet', logoBg: 'bg-[#005CE6]', short: 'GCash' },
    { id: 'maya', name: 'Maya Business Account', logoBg: 'bg-[#00E676]', short: 'Maya' }
  ];

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setError('');
    setLoginId('');
    setPin('');
  };

  const handleConnect = (e) => {
    e.preventDefault();
    setError('');

    if (!loginId || !pin) {
      setError('Please fill in your banking credentials.');
      return;
    }

    setLoading(true);

    // Simulate open finance authorization latency
    setTimeout(() => {
      setLoading(false);
      onLinkSuccess({
        bankName: selectedBank.short,
        balance: 12500000.00 // PHP 12.5 Million
      });
      setSelectedBank(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] font-outfit">
      
      {/* Modal Dialog Body */}
      <div className="glass-panel-gold rounded-3xl w-full max-w-md p-8 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative border border-[#D4AF37]/20">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setSelectedBank(null);
            onClose();
          }}
          disabled={loading}
          className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <X className="w-5 h-5" />
        </button>

        {!selectedBank ? (
          <>
            {/* Bank Select Screen */}
            <div className="text-center mb-6">
              <Landmark className="w-10 h-10 text-gold-metallic mx-auto mb-3" />
              <h2 className="font-cormorant text-2xl font-light tracking-wide text-white">
                Link Philippine Bank
              </h2>
              <p className="text-white/40 text-xs font-light mt-1">
                Link your commercial account via Southeast Asia's secure Brankas Open Finance API.
              </p>
            </div>

            <div className="space-y-3">
              {banks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => handleBankSelect(bank)}
                  className="w-full p-4 bg-[#0a0a0c] hover:bg-[#161618] border border-[#2C2C2C] hover:border-gold-metallic/40 rounded-2xl flex items-center gap-4 transition-all duration-300 cursor-pointer text-left group"
                >
                  {/* Localized mock bank avatar initials */}
                  <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-sm text-white ${bank.logoBg} shadow-md`}>
                    {bank.short.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-gold-metallic transition-colors">{bank.name}</span>
                    <span className="text-[9px] text-[#6a6a6a] block mt-0.5">Secure open finance connection</span>
                  </div>
                </button>
              ))}
            </div>
            
            <p className="text-[9px] text-center text-white/30 leading-relaxed font-light mt-6 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-metallic" />
              End-to-end 256-bit SSL encrypted. Fehuvia never stores login keys.
            </p>
          </>
        ) : (
          <>
            {/* Credentials Link Screen */}
            <div className="text-center mb-6">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white mx-auto mb-3 ${selectedBank.logoBg} shadow-lg`}>
                {selectedBank.short.substring(0, 2).toUpperCase()}
              </div>
              <h2 className="font-cormorant text-2xl font-light tracking-wide text-white">
                Connect to {selectedBank.short}
              </h2>
              <p className="text-white/40 text-xs font-light mt-1">
                Authenticate with your corporate online banking credentials.
              </p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">
                  Corporate Login ID
                </label>
                <input
                  type="text"
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#e4c37a]/50 focus:ring-1 focus:ring-[#e4c37a]/40 transition-all font-light text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  placeholder="e.g. bdo_corp_99182"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">
                  Access Password / PIN
                </label>
                <input
                  type="password"
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#e4c37a]/50 focus:ring-1 focus:ring-[#e4c37a]/40 transition-all font-light text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
              </div>

              <div className="p-4 rounded-xl border border-[#D4AF37]/10 bg-[#D4AF37]/5 flex gap-2.5 items-start">
                <Key className="w-4 h-4 text-gold-metallic shrink-0 mt-0.5" />
                <span className="text-[10px] text-white/50 leading-relaxed font-light">
                  Fehuvia handles this request via an encrypted API gateway. BDO will prompt an OTP verification code.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gold-metallic hover:box-gold-glow text-black font-bold uppercase tracking-wider text-xs rounded-full py-4 mt-4 transition-all duration-300 shadow-xl cursor-pointer ${
                  loading ? 'opacity-60 cursor-wait' : ''
                }`}
              >
                {loading ? 'Securing Connection...' : 'Authorize & Connect Link'}
              </button>

              <button
                type="button"
                onClick={() => setSelectedBank(null)}
                disabled={loading}
                className="w-full text-center text-xs text-white/40 hover:text-white transition-colors cursor-pointer py-1 block disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Go Back
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
