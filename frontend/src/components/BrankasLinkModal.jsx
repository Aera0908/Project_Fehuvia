import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Key, Landmark, AlertCircle, Phone, Delete } from 'lucide-react';

export default function BrankasLinkModal({ isOpen, initialBank, onClose, onLinkSuccess }) {
  const [selectedBank, setSelectedBank] = useState(null); // 'bdo', 'bpi', 'ubp', 'gcash', 'maya'
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync selectedBank with initialBank when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialBank) {
        setSelectedBank(initialBank);
      } else {
        setSelectedBank(null);
      }
      setOtpCode('');
      setError('');
    }
  }, [isOpen, initialBank]);

  if (!isOpen) return null;

  const handleConnect = (e) => {
    if (e) e.preventDefault();
    setError('');

    if (otpCode.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (otpCode !== '123456') {
      setError('Invalid sandbox OTP code. Please enter 123456.');
      return;
    }

    setLoading(true);

    // Simulate open finance authorization latency
    setTimeout(() => {
      setLoading(false);
      onLinkSuccess({
        bankName: selectedBank.short,
        bankId: selectedBank.id,
        balance: selectedBank.id === 'ubp' ? 3200000.00 :
                 selectedBank.id === 'bdo' ? 4500000.00 :
                 selectedBank.id === 'bpi' ? 5800000.00 :
                 selectedBank.id === 'gcash' ? 12500000.00 :
                 selectedBank.id === 'maya' ? 1200000.00 : 12500000.00
      });
      setSelectedBank(null);
      setOtpCode('');
    }, 2500);
  };

  const handleKeypadPress = (num) => {
    if (otpCode.length < 6) {
      setOtpCode(prev => prev + num);
      setError('');
    }
  };

  const handleKeypadDelete = () => {
    setOtpCode(prev => prev.slice(0, -1));
  };

  const logoBg = selectedBank ? (
    selectedBank.id === 'ubp' ? 'bg-[#FF6600]' :
    selectedBank.id === 'bdo' ? 'bg-[#0033A0]' :
    selectedBank.id === 'bpi' ? 'bg-[#980000]' :
    selectedBank.id === 'gcash' ? 'bg-[#005CE6]' :
    selectedBank.id === 'maya' ? 'bg-[#00E676]' : 'bg-[#D4AF37]'
  ) : '';

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

        {selectedBank && (
          <>
            {/* Direct SMS OTP Gate Screen */}
            <div className="text-center mb-6">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white mx-auto mb-3 ${logoBg} shadow-lg`}>
                {selectedBank.short.substring(0, 2).toUpperCase()}
              </div>
              <h2 className="font-cormorant text-2xl font-light tracking-wide text-white">
                Authorize {selectedBank.short}
              </h2>
              <p className="text-white/40 text-xs font-light mt-1.5 leading-relaxed px-4">
                Secure open finance login mandate sent. An SMS OTP code was dispatched by your bank to your registered mobile (+63 917 **** 201).
              </p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-6 flex flex-col items-center">
              {/* Code boxes display */}
              <div className="flex gap-2 justify-center">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i}
                    className={`h-11 w-9 rounded-xl border flex items-center justify-center font-mono text-lg font-bold transition-all ${
                      otpCode.length === i 
                        ? 'border-[#D4AF37] bg-[#D4AF37]/5 ring-1 ring-[#D4AF37]/25' 
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    {otpCode[i] || ''}
                  </div>
                ))}
              </div>

              {/* Digital Keypad */}
              <div className="w-full max-w-xs grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    disabled={loading}
                    onClick={() => handleKeypadPress(String(num))}
                    className="py-3 bg-[#0a0a0c] hover:bg-[#161618] border border-[#2C2C2C] active:border-gold-metallic/50 rounded-xl font-bold font-mono text-base hover:text-gold-metallic transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {num}
                  </button>
                ))}
                <button
                  disabled={loading}
                  onClick={handleKeypadDelete}
                  className="py-3 bg-[#0a0a0c] hover:bg-[#161618] border border-[#2C2C2C] rounded-xl flex items-center justify-center text-red-400 hover:text-red-300 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Delete className="w-5 h-5" />
                </button>
                <button
                  disabled={loading}
                  onClick={() => handleKeypadPress('0')}
                  className="py-3 bg-[#0a0a0c] hover:bg-[#161618] border border-[#2C2C2C] rounded-xl font-bold font-mono text-base hover:text-gold-metallic transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  0
                </button>
                <button
                  onClick={handleConnect}
                  disabled={otpCode.length < 6 || loading}
                  className={`py-3 rounded-xl flex items-center justify-center font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer ${
                    otpCode.length === 6 && !loading
                      ? 'bg-gold-metallic hover:bg-gold-metallic/90 text-black shadow-lg shadow-gold-metallic/15'
                      : 'bg-[#161618] border border-[#2C2C2C] text-white/20 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Linking...' : 'Connect'}
                </button>
              </div>
              
              <span className="text-[9px] text-white/30 font-light flex items-center gap-1.5 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-metallic" />
                Secured by 256-bit open finance credential tokenization.
              </span>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
